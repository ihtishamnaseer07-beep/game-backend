import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (mode === 'register' && form.password !== form.confirmPassword) {
      setMessage(t('auth.passwordMismatch'));
      setLoading(false);
      return;
    }

    if (mode === 'register' && !/^\+92\s?3\d{2}\s?\d{7}$/.test(form.phone.trim())) {
      setMessage(t('auth.invalidPhone'));
      setLoading(false);
      return;
    }

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = mode === 'register'
      ? { name: form.name, email: form.email, phone: form.phone, password: form.password }
      : { email: form.email, password: form.password };

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.token) {
        login(data.token, data.user);
      }

      setMessage(mode === 'register' ? 'Registration successful!' : 'Login successful!');
      navigate('/profile');
      setForm({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
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

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
            />
          </div>
          {mode === 'register' && (
            <div>
              <label className="mb-2 block text-sm text-slate-300">{t('auth.phone')}</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder={t('auth.phoneHint')}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-500"
              />
            </div>
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
