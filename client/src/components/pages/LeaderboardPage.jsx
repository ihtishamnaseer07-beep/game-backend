import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import NavBar from '../common/NavBar';
import SectionHeading from '../common/SectionHeading';
import { API_URL } from '../../config';

function LeaderboardPage() {
  const [records, setRecords] = useState([]);
  const [match, setMatch] = useState(null);
  const [activeTab, setActiveTab] = useState('weekly');

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const res = await fetch(`${API_URL}/api/leaderboard?period=weekly`);
        const data = await res.json();
        if (res.ok) setRecords(data.records || []);
      } catch {
        // ignore
      }
    };

    loadLeaderboard();

    const socket = io(API_URL, { transports: ['websocket'] });
    socket.on('match:update', (payload) => setMatch(payload));
    socket.on('support:update', () => loadLeaderboard());

    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.12),_transparent_20%),_rgb(15,23,42)] text-slate-100">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading title="Leaderboard" description="Top teams and supporters" />

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Top Teams</p>
            <div className="mt-6 space-y-4">
              {records.map((record, index) => (
                <div key={record._id || index} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white">{record.team?.name || 'Team'}</p>
                      <p className="text-sm text-slate-400">Support: {record.teamSupportScore || 0} coins</p>
                    </div>
                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">Rank {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live Match Pulse</p>
            <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              {match ? (
                <>
                  <p className="text-lg font-semibold text-white">Live Score</p>
                  <p className="mt-2 text-sm text-slate-400">{match.scoreA} : {match.scoreB}</p>
                  <p className="mt-4 text-sm text-cyan-300">{match.latestEvent?.message || 'Match is live'}</p>
                </>
              ) : (
                <p className="text-sm text-slate-400">Waiting for a live match update...</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Rankings</p>
              <h3 className="mt-2 text-3xl font-semibold text-white">Weekly and Monthly Leaders</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('weekly')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'weekly' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  activeTab === 'monthly' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {records.map((record, index) => (
              <div key={record._id || index} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-white">{record.team?.name || 'Team'}</p>
                    <p className="text-sm text-slate-400">Support Score: {record.teamSupportScore || 0}</p>
                  </div>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-400">#{index + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default LeaderboardPage;
