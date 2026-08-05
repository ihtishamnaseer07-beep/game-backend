import { useMemo, useState } from 'react';

function formatRemaining(remainingMs = 0) {
  if (!remainingMs || remainingMs <= 0) return 'Ready now';

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
}

export default function DailyRewardsModal({ status, onClose, onClaimBonus, onSpinWheel, spinningReward, loading }) {
  const [wheelRotation, setWheelRotation] = useState(0);

  const rewards = status?.luckySpin?.rewards || [25, 40, 60, 100, 150, 250];
  const wheelStyle = useMemo(() => {
    const colors = ['#f59e0b', '#22c55e', '#06b6d4', '#eab308', '#14b8a6', '#f97316'];
    const step = 360 / rewards.length;
    const segments = rewards.map((_, index) => {
      const start = Math.round(index * step);
      const end = Math.round((index + 1) * step);
      return `${colors[index % colors.length]} ${start}deg ${end}deg`;
    });

    return {
      background: `conic-gradient(${segments.join(', ')})`,
      transform: `rotate(${wheelRotation}deg)`,
    };
  }, [rewards, wheelRotation]);

  const triggerSpin = async () => {
    const baseRotation = 1440 + Math.floor(Math.random() * 720);
    setWheelRotation((prev) => prev + baseRotation);
    await onSpinWheel?.();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-[32px] border border-slate-700 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-yellow-400">Daily Claim</p>
            <h2 className="mt-2 text-2xl font-black text-white">Daily Bonus & Lucky Spin</h2>
            <p className="mt-2 text-sm text-slate-400">Claim your free coins once every 24 hours and spin the reward wheel when its timer resets.</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-slate-300">×</button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[28px] border border-emerald-500/25 bg-emerald-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Daily Login Bonus</p>
            <p className="mt-3 text-4xl font-black text-white">+{status?.dailyBonus?.amount || 50}</p>
            <p className="mt-2 text-sm text-slate-300">Free coins credited directly to your balance.</p>
            <button
              onClick={onClaimBonus}
              disabled={!status?.dailyBonus?.available || loading}
              className="mt-4 w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {status?.dailyBonus?.available ? (loading ? 'Claiming...' : 'Claim Daily Bonus') : `Unlocks in ${formatRemaining(status?.dailyBonus?.remainingMs)}`}
            </button>
          </div>

          <div className="rounded-[28px] border border-cyan-500/25 bg-cyan-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Lucky Spin Wheel</p>
            <div className="mt-4 flex justify-center">
              <div className="relative">
                <div className="absolute left-1/2 top-[-10px] z-10 h-0 w-0 -translate-x-1/2 border-l-[10px] border-r-[10px] border-b-[18px] border-l-transparent border-r-transparent border-b-yellow-400" />
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-slate-950 shadow-xl transition-transform duration-[2200ms] ease-[cubic-bezier(0.16,1,0.3,1)]" style={wheelStyle}>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white ring-2 ring-white/10">SPIN</div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-300">
              {rewards.map((reward) => <span key={reward} className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1">{reward}</span>)}
            </div>
            <button
              onClick={triggerSpin}
              disabled={!status?.luckySpin?.available || loading}
              className="mt-4 w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {status?.luckySpin?.available ? (loading ? 'Spinning...' : 'Spin Now') : `Ready in ${formatRemaining(status?.luckySpin?.remainingMs)}`}
            </button>
            {typeof spinningReward === 'number' && <p className="mt-3 text-center text-sm font-semibold text-yellow-300">You won {spinningReward} bonus coins.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
