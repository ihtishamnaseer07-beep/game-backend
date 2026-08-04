import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    title: '🎁 Invite a Friend',
    subtitle: 'Earn up to PKR 5,000 per referral',
    badge: 'BONUS',
    gradient: 'from-green-600 via-emerald-700 to-slate-900',
    accent: 'text-green-300',
  },
  {
    id: 2,
    title: '🔥 First Deposit Bonus',
    subtitle: 'Get 100% match bonus on your first deposit!',
    badge: '100% BONUS',
    gradient: 'from-yellow-600 via-orange-700 to-slate-900',
    accent: 'text-yellow-300',
  },
  {
    id: 3,
    title: '⚡ Daily Cashback',
    subtitle: 'Up to 10% cashback every day — no wagering!',
    badge: 'CASHBACK',
    gradient: 'from-purple-600 via-violet-800 to-slate-900',
    accent: 'text-purple-300',
  },
];

export default function BannerSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % slides.length), 3500);
    return () => clearInterval(t);
  }, []);

  const slide = slides[active];

  return (
    <div className="relative overflow-hidden rounded-2xl mx-4 mt-3 h-36">
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} transition-all duration-700`} />
      <div className="relative z-10 flex h-full flex-col justify-center px-6 gap-1">
        <span className={`text-xs font-bold tracking-widest uppercase ${slide.accent} bg-black/30 w-fit px-2 py-0.5 rounded-full`}>
          {slide.badge}
        </span>
        <h2 className="text-xl font-extrabold text-white leading-tight">{slide.title}</h2>
        <p className="text-sm text-slate-300">{slide.subtitle}</p>
      </div>

      {/* dots */}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-white' : 'w-1.5 bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}
