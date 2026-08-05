import { useState } from 'react';

const PROMOS = [
  {
    id: 1,
    emoji: '🎉',
    title: 'Welcome Bonus 100%',
    desc: 'Get 100% match bonus on your very first deposit. Minimum deposit Rs 500.',
    badge: '100% BONUS',
    badgeColor: 'bg-green-500/20 text-green-400 border-green-500/40',
    gradient: 'from-green-900/40 to-slate-800/60',
    border: 'border-green-500/20',
    btnColor: 'bg-green-500 hover:bg-green-400 shadow-green-500/30',
    expiry: 'New users only',
  },
  {
    id: 2,
    emoji: '📅',
    title: 'Daily Check-in Reward',
    desc: 'Log in every day and claim Rs 50 free bonus. Streak bonuses up to Rs 500!',
    badge: 'DAILY',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    gradient: 'from-blue-900/40 to-slate-800/60',
    border: 'border-blue-500/20',
    btnColor: 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/30',
    expiry: 'Resets midnight daily',
  },
  {
    id: 3,
    emoji: '🤝',
    title: 'Invite Friend & Earn',
    desc: 'Refer a friend who signs up and earn Rs 200 cash commission — no limit!',
    badge: 'Rs 200 / FRIEND',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    gradient: 'from-orange-900/40 to-slate-800/60',
    border: 'border-orange-500/20',
    btnColor: 'bg-orange-500 hover:bg-orange-400 shadow-orange-500/30',
    expiry: 'Ongoing offer',
  },
  {
    id: 4,
    emoji: '⚡',
    title: 'Reload Bonus 20%',
    desc: 'Every Monday get 20% bonus on your deposit. Keep playing every week!',
    badge: '20% EVERY MON',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    gradient: 'from-purple-900/40 to-slate-800/60',
    border: 'border-purple-500/20',
    btnColor: 'bg-purple-500 hover:bg-purple-400 shadow-purple-500/30',
    expiry: 'Every Monday only',
  },
  {
    id: 5,
    emoji: '💎',
    title: 'VIP Cashback 10%',
    desc: 'Reach VIP status and enjoy 10% weekly cashback on all losses automatically.',
    badge: 'VIP ONLY',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    gradient: 'from-yellow-900/40 to-slate-800/60',
    border: 'border-yellow-500/20',
    btnColor: 'bg-yellow-500 hover:bg-yellow-400 shadow-yellow-500/30',
    expiry: 'VIP members only',
  },
];

function ClaimModal({ promo, onClose }) {
  const [claimed, setClaimed] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-xs rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl p-6 text-center">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 text-base"
        >×</button>

        {claimed ? (
          <>
            <span className="text-5xl">✅</span>
            <h3 className="mt-3 text-lg font-bold text-green-400">Bonus Claimed!</h3>
            <p className="mt-1 text-sm text-slate-400">Your bonus has been submitted for review. Funds will reflect within 5 minutes.</p>
            <button onClick={onClose} className="mt-4 w-full rounded-xl bg-green-500 hover:bg-green-400 py-2.5 text-sm font-bold text-white transition-colors">
              Done
            </button>
          </>
        ) : (
          <>
            <span className="text-5xl">{promo.emoji}</span>
            <h3 className="mt-3 text-base font-bold text-white">{promo.title}</h3>
            <p className="mt-1 text-xs text-slate-400">{promo.desc}</p>
            <p className="mt-2 text-[10px] text-slate-500">📌 {promo.expiry}</p>
            <button
              onClick={() => setClaimed(true)}
              className={`mt-4 w-full rounded-xl py-2.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${promo.btnColor}`}
            >
              🎁 Claim Bonus
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function PromoView() {
  const [claiming, setClaiming] = useState(null);

  return (
    <div className="px-4 pb-4">
      {claiming && <ClaimModal promo={claiming} onClose={() => setClaiming(null)} />}

      <div className="flex items-center justify-between py-4">
        <h2 className="text-base font-bold text-white">🎁 Active Promotions</h2>
        <span className="rounded-full bg-green-500/20 border border-green-500/40 px-2 py-0.5 text-xs font-bold text-green-400">
          {PROMOS.length} Offers
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {PROMOS.map((promo) => (
          <div
            key={promo.id}
            className={`rounded-2xl bg-gradient-to-br ${promo.gradient} border ${promo.border} p-4`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl shrink-0">{promo.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-white">{promo.title}</h3>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${promo.badgeColor}`}>
                    {promo.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{promo.desc}</p>
                <p className="text-[10px] text-slate-500 mt-1">📌 {promo.expiry}</p>
              </div>
            </div>
            <button
              onClick={() => setClaiming(promo)}
              className={`mt-3 w-full rounded-xl py-2 text-xs font-bold text-white shadow-lg transition-all active:scale-95 ${promo.btnColor}`}
            >
              🎁 Claim Bonus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
