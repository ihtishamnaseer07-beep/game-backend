import { useState } from 'react';

const categories = [
  {
    key: 'hot',
    label: 'Hot',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C9 7 6 8.5 6 13a6 6 0 0012 0c0-4.5-3-6-6-11zm0 17a4 4 0 01-4-4c0-2.5 1.5-4 4-7 2.5 3 4 4.5 4 7a4 4 0 01-4 4z" />
      </svg>
    ),
    color: 'text-orange-400',
    activeBg: 'bg-orange-500/20 border-orange-500/60',
  },
  {
    key: 'slot',
    label: 'Slot',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    color: 'text-purple-400',
    activeBg: 'bg-purple-500/20 border-purple-500/60',
  },
  {
    key: 'mini',
    label: 'Mini Games',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <rect x="2" y="6" width="20" height="12" rx="3" />
        <path d="M12 9v6M9 12h6" />
      </svg>
    ),
    color: 'text-cyan-400',
    activeBg: 'bg-cyan-500/20 border-cyan-500/60',
  },
  {
    key: 'cards',
    label: 'Cards',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20 5H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V7a2 2 0 00-2-2zm-9 9H7v-2h4v2zm2-4H7V8h6v2zm4 4h-2v-2h2v2zm0-4h-2V8h2v2z" />
      </svg>
    ),
    color: 'text-red-400',
    activeBg: 'bg-red-500/20 border-red-500/60',
  },
  {
    key: 'fishing',
    label: 'Fishing',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M18 5a1 1 0 100-2 1 1 0 000 2z" fill="currentColor" />
        <path d="M18 4c-6 0-10 4-10 9v1H4l4 4 4-4H8v-1c0-3.5 3-6 7-7" />
      </svg>
    ),
    color: 'text-blue-400',
    activeBg: 'bg-blue-500/20 border-blue-500/60',
  },
];

export default function CategoryNav({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
            active === cat.key
              ? `${cat.activeBg} ${cat.color}`
              : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
          }`}
        >
          <span className={active === cat.key ? cat.color : ''}>{cat.icon}</span>
          {cat.label}
        </button>
      ))}
    </div>
  );
}
