import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import SmsOtpModal from './SmsOtpModal';
import CountryPhoneInput from './CountryPhoneInput';
import { clearStoredReferralCode, getStoredReferralCode } from '../../utils/referral';
import {
  assembleInternationalPhone,
  validatePhoneByCountry,
} from '../../utils/phoneUtils';

function InputField({ label, name, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="rounded-xl bg-slate-800 border border-slate-700 focus:border-green-500 focus:ring-1 focus:ring-green-500/40 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
      />
    </div>
  );
}

export default function AuthModal({ mode: initialMode, onClose }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [form, setForm] = useState({
    name: '',
    email: '',
    identifier: '',
    password: '',
    confirmPassword: '',
    referral: '',
    registerCountryCode: '+92',
    registerPhoneNumber: '',
    loginCountryCode: '+966',
    loginPhoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const { login, setPhoneVerification } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const storedReferral = getStoredReferralCode();
    if (!storedReferral) return;
    setForm((prev) => ({ ...prev, referral: prev.referral || storedReferral }));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const switchMode = (m) => {
    setMode(m);
    setError('');
    setSuccess('');
    setForm({
      name: '',
      email: '',
      identifier: '',
      password: '',
      confirmPassword: '',
      referral: getStoredReferralCode(),
      registerCountryCode: '+92',
      registerPhoneNumber: '',
      loginCountryCode: '+966',
      loginPhoneNumber: '',
    });
    setOtpVerified(false);
    setShowOtpModal(false);
  };

  const submitAuth = async () => {
    setError('');
    setSuccess('');

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const registerPhone = assembleInternationalPhone(form.registerCountryCode, form.registerPhoneNumber);
    const loginPhoneDigits = form.loginPhoneNumber.trim();
    const loginPhone = loginPhoneDigits
      ? assembleInternationalPhone(form.loginCountryCode, form.loginPhoneNumber)
      : '';
    const loginIdentifier = loginPhone || form.identifier;
    const payload =
      mode === 'register'
        ? { name: form.name, email: form.email, phone: registerPhone, password: form.password, referral: form.referral }
        : { identifier: loginIdentifier, password: form.password };

    if (mode === 'login') {
      if (loginPhoneDigits) {
        const loginPhoneValidation = validatePhoneByCountry(form.loginCountryCode, form.loginPhoneNumber);
        if (!loginPhoneValidation.valid) {
          throw new Error(loginPhoneValidation.message);
        }
      }
      if (!loginIdentifier?.trim()) {
        throw new Error('Please enter email or mobile number.');
      }
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get('content-type') || '';
    const data = contentType.includes('application/json')
      ? await res.json()
      : { message: `Server error (${res.status})` };

    if (!res.ok) throw new Error(data.message || 'Something went wrong.');

    if (data.token) {
      login(data.token, data.user);
      if (mode === 'register' && form.referral) clearStoredReferralCode();
      setSuccess(mode === 'register' ? '✅ Account created! Redirecting…' : '✅ Welcome back!');
      setTimeout(() => {
        onClose();
        navigate('/profile');
      }, 1200);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'register') {
      const phoneValidation = validatePhoneByCountry(form.registerCountryCode, form.registerPhoneNumber);
      if (!phoneValidation.valid) {
        setError(phoneValidation.message);
        return;
      }
      if (form.password !== form.confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (form.password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      if (!otpVerified) {
        setShowOtpModal(true);
        return;
      }
    }

    setLoading(true);
    try {
      await submitAuth();
      setForm({
        name: '',
        email: '',
        identifier: '',
        password: '',
        confirmPassword: '',
        referral: getStoredReferralCode(),
        registerCountryCode: '+92',
        registerPhoneNumber: '',
        loginCountryCode: '+966',
        loginPhoneNumber: '',
      });
      setOtpVerified(false);
      setShowOtpModal(false);
    } catch (err) {
      setError(err.message || 'Request failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = async ({ phone, countryCode, nationalNumber, firebaseUid, phoneVerified }) => {
    setShowOtpModal(false);
    setOtpVerified(true);
    setPhoneVerification({
      verified: !!phoneVerified,
      phone,
      countryCode,
      nationalNumber,
      firebaseUid: firebaseUid || '',
      verifiedAt: new Date().toISOString(),
    });
    setForm((prev) => ({
      ...prev,
      registerCountryCode: countryCode || prev.registerCountryCode,
      registerPhoneNumber: nationalNumber || prev.registerPhoneNumber,
    }));
    setLoading(true);
    try {
      await submitAuth();
      setForm({
        name: '',
        email: '',
        identifier: '',
        password: '',
        confirmPassword: '',
        referral: getStoredReferralCode(),
        registerCountryCode: '+92',
        registerPhoneNumber: '',
        loginCountryCode: '+966',
        loginPhoneNumber: '',
      });
      setOtpVerified(false);
    } catch (err) {
      setError(err.message || 'Request failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // backdrop
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm [-webkit-overflow-scrolling:touch]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl p-5 max-h-[92vh] overflow-y-auto scroll-smooth [-webkit-overflow-scrolling:touch] overscroll-contain">

        {/* close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-150 ease-in-out text-lg leading-none active:scale-95 active:opacity-70"
        >
          ×
        </button>

        {/* logo + title */}
        <div className="flex flex-col items-center gap-1 mb-6">
          <span className="text-lg font-extrabold">
            <span className="text-yellow-400">WIN</span>
            <span className="text-white"> TOON </span>
            <span className="text-green-400">786</span>
          </span>
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Welcome Back 👋' : 'Create Account 🎮'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login' ? 'Login to your gaming account' : 'Join and start playing today'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {showOtpModal && mode === 'register' && (
            <SmsOtpModal
              title="Register Mobile Verification"
              subtitle="Send the demo OTP to verify the mobile number before creating your account."
              phone={assembleInternationalPhone(form.registerCountryCode, form.registerPhoneNumber)}
              defaultCountryCode={form.registerCountryCode}
              confirmLabel="Verify & Continue"
              onClose={() => setShowOtpModal(false)}
              onVerified={handleOtpVerified}
            />
          )}
          <InputField
            label={mode === 'login' ? 'Email' : 'Full Name'}
            name={mode === 'login' ? 'identifier' : 'name'}
            value={mode === 'login' ? form.identifier : form.name}
            onChange={handleChange}
            placeholder={mode === 'login' ? 'e.g. player786@example.com' : 'e.g. Ali Hassan'}
            required={!form.loginPhoneNumber}
          />

          {mode === 'register' && (
            <InputField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. player786@example.com"
              required
            />
          )}

          {mode === 'register' ? (
            <CountryPhoneInput
              label="Mobile Number"
              countryCode={form.registerCountryCode}
              onCountryCodeChange={(value) => setForm((prev) => ({ ...prev, registerCountryCode: value }))}
              phoneNumber={form.registerPhoneNumber}
              onPhoneNumberChange={(value) => setForm((prev) => ({ ...prev, registerPhoneNumber: value }))}
              required
              helperText="Saudi: +966 5XXXXXXXX • Pakistan: +92 3XXXXXXXXX"
            />
          ) : (
            <CountryPhoneInput
              label="Mobile Number (Optional)"
              countryCode={form.loginCountryCode}
              onCountryCodeChange={(value) => setForm((prev) => ({ ...prev, loginCountryCode: value }))}
              phoneNumber={form.loginPhoneNumber}
              onPhoneNumberChange={(value) => setForm((prev) => ({ ...prev, loginPhoneNumber: value }))}
              helperText="Use mobile or email; login sends a single identifier field."
            />
          )}

          <InputField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          {mode === 'register' && (
            <>
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              <InputField
                label="Referral Code (Optional)"
                name="referral"
                value={form.referral}
                onChange={handleChange}
                placeholder="Enter code if you have one"
              />
            </>
          )}

          {/* forgot password */}
          {mode === 'login' && (
            <button type="button" className="text-xs text-green-400 hover:text-green-300 text-right -mt-2 transition-all duration-150 ease-in-out active:scale-95 active:opacity-70">
              Forgot Password?
            </button>
          )}

          {/* feedback messages */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 px-3 py-2 text-xs text-green-400">
              {success}
            </div>
          )}

          {/* submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full rounded-xl bg-green-500 hover:bg-green-400 active:scale-95 active:opacity-70 disabled:opacity-60 disabled:cursor-not-allowed py-3 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition-all duration-150 ease-in-out"
          >
            {loading ? '⏳ Please wait…' : mode === 'login' ? '🔑 Login' : '🚀 Create Account'}
          </button>
        </form>

        {/* mode switch */}
        <p className="mt-4 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button onClick={() => switchMode('register')} className="text-green-400 hover:text-green-300 font-semibold transition-all duration-150 ease-in-out active:scale-95 active:opacity-70">
                Register
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => switchMode('login')} className="text-green-400 hover:text-green-300 font-semibold transition-all duration-150 ease-in-out active:scale-95 active:opacity-70">
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
