import { useEffect, useMemo, useState } from 'react';
import NavBar from '../common/NavBar';
import SectionHeading from '../common/SectionHeading';
import LoadingCard from '../common/LoadingCard';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const recentMatches = [
  { id: 1, matchup: 'Team A vs Team B', result: 'Team B won', time: '2 minutes ago' },
  { id: 2, matchup: 'Team B vs Team A', result: 'Draw', time: '10 minutes ago' },
  { id: 3, matchup: 'Team A vs Team B', result: 'Team A won', time: '30 minutes ago' }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function HomePage() {
  const [scoreA, setScoreA] = useState(24);
  const [scoreB, setScoreB] = useState(27);
  const [timer, setTimer] = useState(314);
  const [loading, setLoading] = useState(true);
  const [supporting, setSupporting] = useState('Team B');
  const [claimingBonus, setClaimingBonus] = useState(false);
  const [bonusMessage, setBonusMessage] = useState('');
  const { t } = useLanguage();
  const { user, token, updateUser } = useAuth();

  useEffect(() => {
    const fakeLoad = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(fakeLoad);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => Math.max(prev - 1, 0));
      setScoreA((prev) => prev + Math.floor(Math.random() * 2));
      setScoreB((prev) => prev + Math.floor(Math.random() * 2));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const matchStatus = useMemo(() => {
    if (timer === 0) return t('home.finished');
    return t('home.live');
  }, [timer]);

  const handleClaimDailyBonus = async () => {
    if (!token) {
      setBonusMessage('Please log in to claim your daily bonus.');
      return;
    }

    setClaimingBonus(true);
    setBonusMessage('');

    try {
      const res = await fetch(`${API_URL}/api/coins/daily-bonus`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Unable to claim daily bonus.');
      }

      updateUser({ coins: data.coins, lastLoginBonus: data.lastLoginBonus });
      setBonusMessage(data.message || 'Daily bonus claimed successfully.');
    } catch (error) {
      setBonusMessage(error.message || 'Unable to claim daily bonus.');
    } finally {
      setClaimingBonus(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_35%),_radial-gradient(circle_at_bottom_left,_rgba(249,115,22,0.15),_transparent_30%),_rgb(15,23,42)] text-slate-100">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading title={t('home.heading')} description={t('home.description')} />
        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <LoadingCard />
            <LoadingCard />
          </div>
        ) : (
          <>
            <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-500/30 bg-slate-950/80 p-2 shadow-lg shadow-cyan-500/10">
                      <img src="/logo.png" alt="AI Cartoon Battle Arena logo" className="h-full w-full object-contain" />
                    </div>
                    <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{t('home.liveMatch')}</p>
                    <h3 className="mt-4 text-3xl font-semibold text-white">Team A vs Team B</h3>
                    <p className="mt-2 text-slate-400">{t('home.liveMatchDesc')}</p>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-950/80 px-5 py-4 text-center ring-1 ring-slate-700">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t('home.matchTimer')}</p>
                    <p className="mt-3 text-4xl font-bold text-cyan-400">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>
                    <span className="mt-2 inline-block rounded-full bg-cyan-500/15 px-3 py-1 text-xs text-cyan-200">{matchStatus}</span>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-cyan-500/20 bg-slate-950/80 p-5 shadow-inner ring-1 ring-slate-700">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{t('home.teamA')}</p>
                    <h4 className="mt-4 text-5xl font-bold text-white">{scoreA}</h4>
                    <p className="mt-2 text-sm text-slate-400">{t('home.aiScore')}</p>
                  </div>
                  <div className="rounded-3xl border border-rose-500/20 bg-slate-950/80 p-5 shadow-inner ring-1 ring-slate-700">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{t('home.teamB')}</p>
                    <h4 className="mt-4 text-5xl font-bold text-white">{scoreB}</h4>
                    <p className="mt-2 text-sm text-slate-400">{t('home.aiScore')}</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{t('home.supportingTeam')}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{supporting}</p>
                    <p className="mt-2 text-sm text-emerald-300">Coins: {user?.coins ?? 0}</p>
                    {bonusMessage ? <p className="mt-2 text-sm text-cyan-300">{bonusMessage}</p> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleClaimDailyBonus}
                      disabled={claimingBonus}
                      className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {claimingBonus ? 'Claiming...' : 'Claim Daily Bonus'}
                    </button>
                    <button className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
                      {t('home.supportButton')} {supporting}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6 rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
                <div className="rounded-[28px] bg-slate-950/80 p-5 shadow-inner ring-1 ring-slate-700">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t('home.recentMatches')}</p>
                  <div className="mt-5 space-y-4">
                    {recentMatches.map((match) => (
                      <div key={match.id} className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4 transition hover:border-cyan-500/40">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{match.matchup}</p>
                            <p className="text-sm text-slate-400">{match.time}</p>
                          </div>
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-400">{match.result}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-inner ring-1 ring-slate-700">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t('home.liveUpdates')}</p>
                    <p className="mt-4 text-lg text-slate-300">{t('home.liveUpdatesText')}</p>
                  </div>
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-inner ring-1 ring-slate-700">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{t('home.highlight')}</p>
                    <p className="mt-4 text-lg text-slate-300">{t('home.highlightText')}</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default HomePage;
