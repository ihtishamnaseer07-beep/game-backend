import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { firebaseAuth } from '../../firebase';
import {
  getConfiguredAdminEmail,
  getConfiguredAdminPhone,
  getOrCreateAdminDeviceId,
  matchesSuperAdminIdentity,
  normalizeEmail,
  normalizePhone,
} from '../../security/adminSecurity';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { firebaseUser, setAdminSession, clearAdminSession } = useAuth();
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const confirmationResultRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);
  const adminEmail = getConfiguredAdminEmail();
  const adminPhone = getConfiguredAdminPhone();

  useEffect(() => {
    if (!adminEmail && !adminPhone) {
      setError('Admin identity is not configured.');
    }

    if (!phoneInput && adminPhone) {
      setPhoneInput(adminPhone);
    }
  }, [adminEmail, adminPhone]);

  useEffect(() => () => {
    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
  }, []);

  const toExactPhone = (value = '') => {
    const normalized = normalizePhone(value || '');
    return normalized.startsWith('+') ? normalized : `+${normalized}`;
  };

  const getRecaptchaVerifier = async () => {
    if (!recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
        size: 'invisible',
      });
      await recaptchaVerifierRef.current.render();
    }

    return recaptchaVerifierRef.current;
  };

  const establishSession = ({ email = '', phone = '', provider = '' }) => {
    setAdminSession({
      verified: true,
      email: normalizeEmail(email),
      phone: normalizePhone(phone),
      verifiedAt: new Date().toISOString(),
      deviceId: getOrCreateAdminDeviceId(),
      userAgent: navigator.userAgent,
      provider,
    });

    setStatus('Super-admin verified. Redirecting to dashboard...');
    navigate('/admin', { replace: true });
  };

  const blockUnauthorized = async (message = 'Access Denied') => {
    clearAdminSession();
    await signOut(firebaseAuth).catch(() => {});
    setError(message);
  };

  const loginWithGoogle = async () => {
    setError('');
    setStatus('');
    setLoadingGoogle(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(firebaseAuth, provider);
      const email = normalizeEmail(result?.user?.email || '');
      const phone = normalizePhone(result?.user?.phoneNumber || '');
      const matched = matchesSuperAdminIdentity({ email, phone });

      if (!matched) {
        await blockUnauthorized('Access Denied: unauthorized Google account.');
        return;
      }

      establishSession({ email, phone, provider: 'google' });
    } catch (authError) {
      setError(authError.message || 'Google sign-in failed.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const sendOtp = async () => {
    setError('');
    setStatus('');

    if (!adminPhone) {
      setError('Admin phone configuration is missing.');
      return;
    }

    const normalizedPhone = toExactPhone(phoneInput || adminPhone);
    if (normalizedPhone !== adminPhone) {
      setError('Access Denied: only authorized owner phone is allowed.');
      return;
    }

    setLoadingOtp(true);

    try {
      const verifier = await getRecaptchaVerifier();
      confirmationResultRef.current = await signInWithPhoneNumber(firebaseAuth, normalizedPhone, verifier);
      setOtpSent(true);
      setStatus(`OTP sent to ${normalizedPhone}. Enter 6-digit code.`);
    } catch (otpError) {
      setError(otpError.message || 'Failed to send OTP.');
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setLoadingOtp(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    setStatus('');

    if (!confirmationResultRef.current) {
      setError('Send OTP first.');
      return;
    }

    if (!/^\d{6}$/.test(otpCode.trim())) {
      setError('Enter a valid 6-digit OTP code.');
      return;
    }

    setLoadingOtp(true);

    try {
      const credential = await confirmationResultRef.current.confirm(otpCode.trim());
      const verifiedUser = credential?.user;
      const normalizedPhone = toExactPhone(verifiedUser?.phoneNumber || phoneInput || '');
      const normalizedEmail = normalizeEmail(verifiedUser?.email || firebaseUser?.email || '');
      const matched = matchesSuperAdminIdentity({
        phone: normalizedPhone,
        email: normalizedEmail,
      });

      if (!matched) {
        await blockUnauthorized('Access Denied: unauthorized phone account.');
        return;
      }

      establishSession({
        email: normalizedEmail,
        phone: normalizedPhone,
        provider: 'phone-otp',
      });
    } catch (verifyError) {
      setError(verifyError.message || 'OTP verification failed.');
    } finally {
      setLoadingOtp(false);
    }
  };

  const resetOtp = () => {
    setOtpSent(false);
    setOtpCode('');
    setStatus('');
    setError('');
    confirmationResultRef.current = null;

    if (recaptchaVerifierRef.current) {
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),_transparent_30%),_rgb(15,23,42)] px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-[32px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-black/30 ring-1 ring-slate-700 sm:p-8">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">WIN TOON 786</p>
            <h1 className="mt-2 text-2xl font-black text-white">Admin Secure Login</h1>
            <p className="mt-2 text-sm text-slate-400">Only the authorized owner can unlock /admin using Google or Phone OTP.</p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Security checks enabled</p>
              <p className="mt-1">1) Firebase auth is required.</p>
              <p>2) Identity must match the authorized owner exactly.</p>
              <p>3) Unauthorized access is blocked with Access Denied.</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300">
              <p>Authorized Email: <span className="font-semibold text-cyan-300">{adminEmail || 'Not set'}</span></p>
              <p className="mt-1">Authorized Phone: <span className="font-semibold text-cyan-300">{adminPhone || 'Not set'}</span></p>
            </div>

            {status && <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{status}</div>}

            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

            <button
              type="button"
              onClick={loginWithGoogle}
              disabled={loadingGoogle}
              className="w-full rounded-2xl border border-slate-600 bg-slate-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-700 disabled:opacity-60"
            >
              {loadingGoogle ? 'Signing in with Google...' : 'Continue with Google'}
            </button>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-sm font-semibold text-white">Phone OTP Login</p>
              <div className="mt-3">
                <input
                  value={phoneInput}
                  onChange={(event) => setPhoneInput(event.target.value)}
                  placeholder="+966593686007"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
                />
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={loadingOtp}
                  className="mt-3 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-60"
                >
                  {loadingOtp ? 'Sending OTP...' : 'Send OTP'}
                </button>
              ) : (
                <>
                  <div className="mt-3">
                    <input
                      value={otpCode}
                      onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
                    />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={loadingOtp}
                      className="w-full rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
                    >
                      {loadingOtp ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={resetOtp}
                      className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200"
                    >
                      Reset
                    </button>
                  </div>
                </>
              )}
              <div id="recaptcha-container" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}