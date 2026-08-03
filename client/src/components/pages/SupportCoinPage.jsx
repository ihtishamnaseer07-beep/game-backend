import { useEffect, useMemo, useState } from 'react';
import NavBar from '../common/NavBar';
import SectionHeading from '../common/SectionHeading';
import { useLanguage } from '../../context/LanguageContext';
import { useSound } from '../../context/SoundContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function SupportCoinPage() {
  const [availableCoins, setAvailableCoins] = useState(0);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [supportLog, setSupportLog] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const token = localStorage.getItem('authToken');

  const loadProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAvailableCoins(data.user?.coins || 0);
      }
    } catch {
      // ignore
    }
  };

  const loadHistory = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/support/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSupportLog(data.history || []);
      }
    } catch {
      // ignore
    }
  };

  const loadTeams = async () => {
    try {
      const res = await fetch(`${API_URL}/api/teams`);
      const data = await res.json();
      if (res.ok && data.teams?.length) {
        setTeams(data.teams);
        setSelectedTeam(data.teams[0]);
      }
    } catch {
      // ignore
    }
  };

  const { playSound } = useSound();

  useEffect(() => {
    loadProfile();
    loadHistory();
    loadTeams();
  }, [token]);

  const handleDailyCoins = async () => {
    if (!token) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/support/claim`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Unable to claim daily coins');
      setAvailableCoins(data.coins || 0);
      setMessage(data.message || 'Daily coins claimed!');
      playSound('claim');
    } catch (error) {
      setMessage(error.message || 'Failed to claim coins');
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = async () => {
    if (!token || availableCoins < 10 || !selectedTeam) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/api/support/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamId: selectedTeam._id, coins: 10 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Support failed');
      setAvailableCoins(data.user?.coins || 0);
      setMessage(data.message || 'Support sent successfully');
      playSound('support');
      await loadHistory();
    } catch (error) {
      setMessage(error.message || 'Support failed');
    } finally {
      setLoading(false);
    }
  };

  const totalGiven = useMemo(() => supportLog.reduce((sum, item) => sum + (item.coins || 0), 0), [supportLog]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_25%),_rgb(15,23,42)] text-slate-100">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading title={t('support.heading')} description={t('support.description')} />

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
            <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{t('support.availableCoins')}</p>
                <h3 className="mt-3 text-5xl font-semibold text-white">{availableCoins}</h3>
              </div>
              <div className="rounded-3xl bg-slate-950/80 p-4 text-center ring-1 ring-slate-700">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t('support.pulse')}</p>
                <p className="mt-3 text-3xl font-bold text-emerald-400">+10</p>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-800 bg-slate-950/80 p-6 shadow-inner ring-1 ring-slate-700">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t('support.selectTeam')}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {teams.map((team) => (
                  <button
                    key={team._id}
                    onClick={() => {
                      playSound('move');
                      setSelectedTeam(team);
                    }}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                      selectedTeam?._id === team._id ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-400">{t('support.selectTeamDesc')}</p>
                <p className="mt-2 text-xl font-semibold text-white">{t('support.givingTo')} {selectedTeam?.name || 'Team'}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDailyCoins}
                  disabled={loading}
                  className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Working...' : t('support.claim')}
                </button>
                <button
                  onClick={() => {
                    playSound('click');
                    handleSupport();
                  }}
                  disabled={loading}
                  className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('support.supportNow')}
                </button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-inner ring-1 ring-slate-700">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t('support.totalCoins')}</p>
                <p className="mt-4 text-3xl font-bold text-white">{totalGiven}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-inner ring-1 ring-slate-700">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t('support.history')}</p>
                <ul className="mt-4 space-y-3 text-slate-300">
                  {supportLog.slice(0, 3).map((log) => (
                    <li key={log._id || log.id} className="rounded-2xl bg-slate-900/80 p-3">
                      <p className="font-semibold text-white">{log.team?.name || log.team || 'Team'}</p>
                      <p className="text-sm text-slate-400">{log.coins} coins • {new Date(log.createdAt).toLocaleString()}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
            <div className="mt-6 rounded-[24px] border border-cyan-500/20 bg-slate-950/70 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{t('support.pkrtitle')}</p>
              <p className="mt-2 text-sm text-slate-400">{t('support.pkrDesc')}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { amount: '500', price: '1,500' },
                  { amount: '1,000', price: '3,000' },
                  { amount: '2,500', price: '7,500' },
                ].map((pkg) => (
                  <div key={pkg.amount} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-xl font-semibold text-white">{pkg.amount} coins</p>
                    <p className="mt-2 text-sm text-cyan-300">{t('support.priceLabel')} {pkg.price}</p>
                    <button className="mt-3 rounded-full bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950">{t('support.buy')}</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 rounded-[24px] border border-slate-800 bg-slate-950/70 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t('support.gatewayTitle')}</p>
              <p className="mt-2 text-sm text-slate-400">{t('support.gatewayText')}</p>
            </div>
            <p className="mt-6 text-sm uppercase tracking-[0.3em] text-slate-500">Coin Animation</p>
            <div className="mt-8 flex items-center justify-center">
              <div className="relative h-52 w-full overflow-hidden rounded-[32px] bg-gradient-to-br from-cyan-500/10 via-slate-950 to-slate-900/80 p-6">
                <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/20 shadow-2xl shadow-emerald-400/20"></div>
                <div className="absolute left-10 top-8 h-14 w-14 rounded-full bg-cyan-500 text-center leading-[56px] text-3xl text-slate-950 animate-bounce">💰</div>
                <div className="absolute right-12 top-16 h-12 w-12 rounded-full bg-emerald-400 text-center leading-[48px] text-3xl text-slate-950 animate-pulse">⭐</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SupportCoinPage;
