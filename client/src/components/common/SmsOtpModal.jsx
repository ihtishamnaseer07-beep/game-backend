import { useEffect, useMemo, useState } from 'react';

const DEMO_OTP = '7860';

function maskPhone(phone = '') {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone || 'your mobile number';
  return `${digits.slice(0, 4)}••••${digits.slice(-3)}`;
}

export default function SmsOtpModal({
  title = 'SMS Verification',
  subtitle = 'Enter your mobile number, send the OTP, then verify it to continue.',
  phone: initialPhone = '',
  onClose,
  onVerified,
  confirmLabel = 'Verify OTP',
}) {
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setPhone(initialPhone);
    setOtp('');
    setTimer(0);
    setSent(false);
    setMessage('');
    setError('');
  }, [initialPhone]);

  useEffect(() => {
    if (!sent || timer <= 0) return undefined;

    const intervalId = window.setInterval(() => {
      setTimer((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [sent, timer]);

  useEffect(() => {
    if (timer === 0 && sent) {
      setMessage('OTP expired. Tap Send OTP to try again.');
    }
  }, [sent, timer]);

  const maskedPhone = useMemo(() => maskPhone(phone), [phone]);

  const handleSendOtp = () => {
    if (!phone.trim()) {
      setError('Mobile number is required.');
      return;
    }

    setError('');
    setSent(true);
    setTimer(30);
    setOtp('');
    setMessage(`Demo OTP sent to ${maskedPhone}. Use ${DEMO_OTP} for testing.`);
  };

  const handleVerify = () => {
    if (otp.trim() !== DEMO_OTP) {
      setError('Invalid OTP. Use 7860 for the mock verification flow.');
      return;
    }

    setError('');
    setMessage('OTP verified successfully.');
    onVerified?.({ phone: phone.trim(), otp: otp.trim() });
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

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">Mobile Number</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+92 3001234567"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">OTP Status</p>
              <p className="mt-1 text-sm font-semibold text-white">{sent ? `Sent to ${maskedPhone}` : 'Waiting for mobile verification'}</p>
            </div>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={timer > 0 && sent}
              className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {timer > 0 && sent ? `Resend in ${timer}s` : 'Send OTP'}
            </button>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">4-Digit OTP</label>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
              maxLength={4}
              placeholder="7860"
              className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-center text-lg font-black tracking-[0.5em] text-white outline-none transition focus:border-cyan-500"
            />
            <p className="mt-2 text-[11px] text-slate-500">Testing code: <span className="font-semibold text-cyan-300">{DEMO_OTP}</span></p>
          </div>

          {message && <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-xs text-cyan-200">{message}</div>}
          {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-300">{error}</div>}

          <button
            type="button"
            onClick={handleVerify}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:from-cyan-400 hover:to-emerald-400 active:scale-[0.99] active:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}