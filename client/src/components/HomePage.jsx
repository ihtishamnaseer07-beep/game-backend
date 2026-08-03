import { useEffect, useState } from 'react';

const teams = [
  { id: 'teamA', name: 'Team A', color: 'bg-cyan-500', score: 0 },
  { id: 'teamB', name: 'Team B', color: 'bg-rose-500', score: 0 }
];

const actions = ['Attack', 'Defend', 'Power Strike', 'Heal', 'Speed Burst'];

function getRandomAction() {
  return actions[Math.floor(Math.random() * actions.length)];
}

function HomePage() {
  const [liveTeams, setLiveTeams] = useState(teams);
  const [timer, setTimer] = useState(180);
  const [matchStatus, setMatchStatus] = useState('Live');

  useEffect(() => {
    if (timer <= 0) {
      setMatchStatus('Finished');
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
      setLiveTeams((prevTeams) => {
        return prevTeams.map((team) => ({
          ...team,
          score: team.score + Math.floor(Math.random() * 3)
        }));
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-8 rounded-3xl bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">AI Cartoon Battle Arena</p>
            <h1 className="mt-4 text-4xl font-semibold text-white">Live Match Simulator</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              دیکھیں خودکار گیم میچ جہاں دونوں ٹیمیں AI کے ذریعے لڑتی ہیں۔
            </p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-center ring-1 ring-slate-700">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Match Timer</p>
            <p className="mt-4 text-5xl font-bold text-white">{Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}</p>
            <p className="mt-2 text-slate-400">Status: {matchStatus}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {liveTeams.map((team) => (
          <div key={team.id} className="rounded-3xl bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
            <div className={`flex items-center justify-between rounded-3xl p-5 ${team.color}`}>
              <div>
                <p className="text-xl font-semibold text-white">{team.name}</p>
                <p className="mt-1 text-sm text-slate-200">Cartoon Team</p>
              </div>
              <p className="text-3xl font-bold text-white">{team.score}</p>
            </div>
            <div className="mt-6 space-y-3 text-slate-300">
              <p>Latest Action: {getRandomAction()}</p>
              <p>Best Supporters: Top Fans</p>
              <p>Team Avatar: Cartoon Hero</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

export default HomePage;
