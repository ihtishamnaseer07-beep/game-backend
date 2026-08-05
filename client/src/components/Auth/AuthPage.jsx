import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { API_URL } from '../../config';
import SmsOtpModal from '../common/SmsOtpModal';
import CountryPhoneInput from '../common/CountryPhoneInput';
import {
  assembleInternationalPhone,
  validatePhoneByCountry,
} from '../../utils/phoneUtils';

function AuthPage() {
  const navigate = useNavigate();
  const { login, setPhoneVerification } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    registerCountryCode: '+92',
    registerPhoneNumber: '',
    loginCountryCode: '+966',
    loginPhoneNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setMessage(t('auth.passwordMismatch'));
      return;
    }

    if (mode === 'register' && !otpVerified) {
      const phoneValidation = validatePhoneByCountry(form.registerCountryCode, form.registerPhoneNumber);
      if (!phoneValidation.valid) {
        setMessage(phoneValidation.message);
        return;
      }
      setShowOtpModal(true);
      return;
    }

    setLoading(true);

    const submitAuth = async () => {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const assembledRegisterPhone = assembleInternationalPhone(form.registerCountryCode, form.registerPhoneNumber);
      const loginPhoneDigits = form.loginPhoneNumber.trim();
      const loginPhone = loginPhoneDigits
        ? assembleInternationalPhone(form.loginCountryCode, form.loginPhoneNumber)
        : '';
      const loginIdentifier = loginPhone || form.email.trim();
      const payload = mode === 'register'
        ? { name: form.name, email: form.email, phone: assembledRegisterPhone, password: form.password }
        : { identifier: loginIdentifier, password: form.password };

      if (mode === 'login') {
        if (loginPhoneDigits) {
          const loginPhoneValidation = validatePhoneByCountry(form.loginCountryCode, form.loginPhoneNumber);
          if (!loginPhoneValidation.valid) {
            throw new Error(loginPhoneValidation.message);
          }
        }
        if (!loginIdentifier) {
          throw new Error('Please enter email or mobile number for login.');
        }
      }

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type') || '';
      let data = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        const hint = text.slice(0, 80) || 'empty body';
        throw new Error(`Backend unreachable (${res.status}). URL: ${API_URL} — ${hint}`);
      }

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.token) {
        login(data.token, data.user);
      }

      setMessage(mode === 'register' ? 'Registration successful!' : 'Login successful!');
      navigate('/profile');
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        registerCountryCode: '+92',
        registerPhoneNumber: '',
        loginCountryCode: '+966',
        loginPhoneNumber: '',
      });
      setOtpVerified(false);
      setShowOtpModal(false);
    };

    try {
      await submitAuth();
    } catch (error) {
      setMessage(error.message || 'Something went wrong. Check your connection.');
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
    setMessage('Mobile number verified. Completing registration...');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, phone: phone, password: form.password }),
      });

      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await res.json() : {};

      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      if (data.token) login(data.token, data.user);

      setMessage('Registration successful!');
      navigate('/profile');
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        registerCountryCode: '+92',
        registerPhoneNumber: '',
        loginCountryCode: '+966',
        loginPhoneNumber: '',
      });
      setOtpVerified(false);
    } catch (error) {
      setMessage(error.message || 'Something went wrong. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900/90 p-8 shadow-2xl ring-1 ring-slate-700">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-950 p-2 shadow-lg shadow-cyan-500/10">
              <img src="/logo.png" alt="AI Cartoon Battle Arena logo" className="h-full w-full object-contain" />
            </div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">AI Cartoon Battle Arena</p>
            <h2 className="text-3xl font-semibold text-white">{mode === 'login' ? t('auth.titleLogin') : t('auth.titleRegister')}</h2>
            <p className="text-slate-400">{t('auth.subtitle')}</p>
          </div>
          <div className="flex items-center justify-end">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate('/admin-login')}
                className="rounded-full border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-500 hover:text-white"
              >
                Admin Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setMessage('');
                }}
                className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                {mode === 'login' ? t('auth.switchRegister') : t('auth.switchLogin')}
              </button>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {showOtpModal && mode === 'register' && (
            <SmsOtpModal
              title="Register Mobile Verification"
              subtitle="Send a demo SMS OTP to verify the mobile number before creating your account."
              phone={assembleInternationalPhone(form.registerCountryCode, form.registerPhoneNumber)}
              defaultCountryCode={form.registerCountryCode}
              confirmLabel="Verify & Continue"
              onClose={() => setShowOtpModal(false)}
              onVerified={handleOtpVerified}
            />
          )}
          {mode === 'register' && (
            <div>
              <label className="mb-2 block text-sm text-slate-300">{t('auth.fullName')}</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>
          )}
          <div>
            <label className="mb-2 block text-sm text-slate-300">{t('auth.email')}</label>
            <input
              name="email"
              type="text"
              value={form.email}
              onChange={handleChange}
              placeholder={mode === 'login' ? 'Email (optional if mobile is used)' : 'Email'}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>
          {mode === 'register' ? (
            <CountryPhoneInput
              label={t('auth.phone')}
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
          <div>
            <label className="mb-2 block text-sm text-slate-300">{t('auth.password')}</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="mb-2 block text-sm text-slate-300">{t('auth.confirmPassword')}</label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-500 px-5 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Please wait...' : mode === 'login' ? t('auth.login') : t('auth.register')}
          </button>
          {message && <p className="text-center text-sm text-cyan-300">{message}</p>}
          <div className="text-center text-sm text-slate-500">
            {mode === 'login' ? 'Forgot password? Reset it from the backend.' : 'Already registered? Login now.'}
          </div>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
