import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin786';
const ADMIN_ACCESS_STORAGE_KEY = 'wt786_admin_access';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.username.trim() !== ADMIN_USERNAME || form.password.trim() !== ADMIN_PASSWORD) {
      setError('Invalid admin credentials.');
      return;
    }

    localStorage.setItem(ADMIN_ACCESS_STORAGE_KEY, 'true');
    navigate('/admin', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),_transparent_30%),_rgb(15,23,42)] px-4 py-10 text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-[32px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-black/30 ring-1 ring-slate-700 sm:p-8">
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">WIN TOON 786</p>
            <h1 className="mt-2 text-2xl font-black text-white">Admin Login</h1>
            <p className="mt-2 text-sm text-slate-400">Use the demo admin credentials to open the dashboard.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="admin"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="admin786"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
              />
            </div>

            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:from-cyan-400 hover:to-emerald-400"
            >
              Open Admin Dashboard
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
            <p className="font-semibold text-white">Demo credentials</p>
            <p className="mt-1">Username: <span className="text-cyan-300">admin</span></p>
            <p>Password: <span className="text-cyan-300">admin786</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}