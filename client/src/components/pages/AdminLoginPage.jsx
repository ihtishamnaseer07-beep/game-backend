import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import SmsOtpModal from '../common/SmsOtpModal';
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
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const adminEmail = getConfiguredAdminEmail();
  const adminPhone = getConfiguredAdminPhone();

  useEffect(() => {
    if (!adminEmail && !adminPhone) {
      setError('Admin identity is not configured.');
    }
  }, [adminEmail, adminPhone]);

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

  const blockUnauthorized = async (message = '404 - Access Denied') => {
    clearAdminSession();
    await signOut(firebaseAuth).catch(() => {});
    navigate('/', { replace: true, state: { accessDenied: message } });
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
        setError('404 - Access Denied');
        await blockUnauthorized('404 - Access Denied');
        return;
      }

      establishSession({ email, phone, provider: 'google' });
    } catch (authError) {
      setError(authError.message || 'Google sign-in failed.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const openOtp = () => {
    setError('');
    setStatus('');

    if (!adminPhone) {
      setError('Admin phone configuration is missing.');
      return;
    }

    setShowOtpModal(true);
  };

  const handleVerified = async ({ phone }) => {
    const normalizedPhone = normalizePhone(phone || firebaseUser?.phoneNumber || '');
    const normalizedEmail = normalizeEmail(firebaseUser?.email || '');
    const matched = matchesSuperAdminIdentity({
      phone: normalizedPhone,
      email: normalizedEmail,
    });

    if (!matched) {
      setShowOtpModal(false);
      setError('404 - Access Denied');
      await blockUnauthorized('404 - Access Denied');
      return;
    }

    setShowOtpModal(false);
    establishSession({ email: normalizedEmail, phone: normalizedPhone, provider: 'phone-otp' });
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
              <p>3) Unauthorized access is blocked with 404 - Access Denied.</p>
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

            <button
              type="button"
              onClick={openOtp}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:from-cyan-400 hover:to-emerald-400"
            >
              Continue with Phone OTP
            </button>
          </div>

          {showOtpModal && (
            <SmsOtpModal
              title="Admin Phone OTP Verification"
              subtitle="Verify using the authorized owner phone number to unlock admin access."
              phone={adminPhone || firebaseUser?.phoneNumber || ''}
              defaultCountryCode={adminPhone.startsWith('+966') ? '+966' : '+92'}
              confirmLabel="Verify Super Admin"
              onClose={() => setShowOtpModal(false)}
              onVerified={handleVerified}
            />
          )}
        </div>
      </div>
    </div>
  );
}