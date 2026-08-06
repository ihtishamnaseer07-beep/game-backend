import { useEffect, useMemo, useRef, useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import CountryPhoneInput from './CountryPhoneInput';
import {
  assembleInternationalPhone,
  parseInternationalPhone,
  validatePhoneByCountry,
} from '../../utils/phoneUtils';
import { firebaseAuth } from '../../firebase';

function maskPhone(phone = '') {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone || 'your mobile number';
  return `${digits.slice(0, 4)}••••${digits.slice(-3)}`;
}

export default function SmsOtpModal({
  title = 'SMS Verification',
  subtitle = 'Enter your mobile number, send the OTP, then verify it to continue.',
  phone: initialPhone = '',
  defaultCountryCode = '+92',
  onClose,
  onVerified,
  confirmLabel = 'Verify OTP',
}) {
  const [countryCode, setCountryCode] = useState(defaultCountryCode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const recaptchaVerifierRef = useRef(null);

  useEffect(() => {
    const parsed = parseInternationalPhone(initialPhone, defaultCountryCode);
    setCountryCode(parsed.countryCode);
    setPhoneNumber(parsed.nationalNumber);
    setOtp('');
    setSent(false);
    setSending(false);
    setVerifying(false);
    setConfirmationResult(null);
    setMessage('');
    setError('');
  }, [initialPhone, defaultCountryCode]);

  useEffect(() => () => {
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
  }, []);

  const fullPhone = useMemo(() => assembleInternationalPhone(countryCode, phoneNumber), [countryCode, phoneNumber]);
  const maskedPhone = useMemo(() => maskPhone(fullPhone), [fullPhone]);

  const isResendBlocked = sent && sending;

  const getRecaptchaVerifier = async () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(firebaseAuth, 'firebase-otp-recaptcha', {
        size: 'invisible',
      });
      await recaptchaVerifierRef.current.render();
    }
    return recaptchaVerifierRef.current;
  };

  const handleSendOtp = async () => {
    const validation = validatePhoneByCountry(countryCode, phoneNumber);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    setSending(true);
    setError('');
    setMessage('');

    try {
      const e164PhoneNumber = fullPhone.startsWith('+') ? fullPhone : `+${fullPhone}`;
      const appVerifier = await getRecaptchaVerifier();
      const result = await signInWithPhoneNumber(firebaseAuth, e164PhoneNumber, appVerifier);
      setConfirmationResult(result);
      setSent(true);
      setOtp('');
      setMessage(`Real SMS OTP sent to ${maskedPhone}. Please enter the 6-digit code from Firebase.`);
    } catch (sendError) {
      setError(sendError.message || 'Unable to send OTP. Please try again.');
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async () => {
    const validation = validatePhoneByCountry(countryCode, phoneNumber);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    if (!confirmationResult) {
      setError('Please send OTP first.');
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError('Enter a valid 6-digit OTP code.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const credential = await confirmationResult.confirm(otp.trim());
      setMessage('Phone verified successfully with Firebase Auth.');
      onVerified?.({
        phone: fullPhone,
        countryCode,
        nationalNumber: phoneNumber,
        otp: otp.trim(),
        firebaseUid: credential?.user?.uid,
        phoneVerified: true,
      });
    } catch (verifyError) {
      setError(verifyError.message || 'OTP verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-700/60 bg-slate-950 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300">Secure Step</p>
            <h3 className="mt-1 text-lg font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition active:scale-95 active:opacity-70"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-sm text-slate-400">{subtitle}</p>

          <CountryPhoneInput
            label="Mobile Number"
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            phoneNumber={phoneNumber}
            onPhoneNumberChange={setPhoneNumber}
            required
            helperText="Saudi: +966 5XXXXXXXX • Pakistan: +92 3XXXXXXXXX"
          />

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">OTP Status</p>
              <p className="mt-1 text-sm font-semibold text-white">{sent ? `Sent to ${maskedPhone}` : 'Waiting for mobile verification'}</p>
            </div>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isResendBlocked}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? 'Sending...' : sent ? 'Resend OTP' : 'Send OTP'}
            </button>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">6-Digit OTP</label>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-center text-lg font-black tracking-[0.35em] text-white outline-none transition focus:border-cyan-500"
            />
            <p className="mt-2 text-[11px] text-slate-500">Enter the 6-digit SMS code delivered by Firebase Auth.</p>
          </div>

          {message && <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-xs text-cyan-200">{message}</div>}
          {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">{error}</div>}

          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:from-cyan-400 hover:to-emerald-400 active:scale-[0.99] active:opacity-90"
          >
            {verifying ? 'Verifying...' : confirmLabel}
          </button>

          <div id="firebase-otp-recaptcha" className="min-h-[1px]" />
        </div>
      </div>
    </div>
  );
}