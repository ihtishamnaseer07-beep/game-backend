import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import NavBar from '../common/NavBar';
import SectionHeading from '../common/SectionHeading';
import { useSound } from '../../context/SoundContext';

const teams = [
  { id: 'teamA', name: 'Team A', description: 'Fast and strategic cartoon heroes with balanced offense.', badge: '⚔️' },
  { id: 'teamB', name: 'Team B', description: 'Powerful defenders with explosive attacks and strong shields.', badge: '🛡️' }
];

function TeamSelectionPage() {
  const [selectedTeam, setSelectedTeam] = useState('teamA');
  const navigate = useNavigate();
  const { playSound } = useSound();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_30%),_rgb(15,23,42)] text-slate-100">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading title="Teams" description="Choose your championship team" />

        <div className="grid gap-6 xl:grid-cols-2">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => {
                playSound('move');
                setSelectedTeam(team.id);
              }}
              className={`group rounded-[32px] border p-6 text-left transition hover:border-cyan-400/50 hover:bg-slate-900/90 ${
                selectedTeam === team.id ? 'border-cyan-400 bg-slate-900/90 shadow-xl' : 'border-slate-800 bg-slate-950/70'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500 text-3xl shadow-lg shadow-cyan-500/20">
                  {team.badge}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{team.name}</p>
                  <h3 className="mt-3 text-3xl font-semibold text-white">{team.name}</h3>
                </div>
              </div>
              <p className="mt-5 text-slate-300">{team.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Selected Team</p>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xl font-semibold text-white">{teams.find((team) => team.id === selectedTeam).name}</p>
              <p className="mt-2 max-w-2xl text-slate-300">{teams.find((team) => team.id === selectedTeam).description}</p>
            </div>
            <button
              onClick={() => {
                playSound('confirm');
                navigate('/characters');
              }}
              className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              Confirm Team
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TeamSelectionPage;
