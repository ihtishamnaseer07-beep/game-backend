import { useState } from 'react';

export default function GameCard({ title, provider, color = 'from-slate-700 to-slate-800', emoji, onPlay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
    >
      {/* poster */}
      <div className={`bg-gradient-to-br ${color} flex items-center justify-center h-36 sm:h-40 text-5xl`}>
        {emoji}
      </div>

      {/* hover overlay with play button */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 transition-opacity duration-200 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={onPlay}
          className="rounded-full bg-green-500 hover:bg-green-400 active:scale-95 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-green-500/40 transition-all"
        >
          ▶ Play
        </button>
      </div>

      {/* provider badge */}
      <div className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-slate-300 backdrop-blur-sm">
        {provider}
      </div>

      {/* title */}
      <div className="bg-slate-900/90 px-2 py-1.5">
        <p className="truncate text-xs font-semibold text-white">{title}</p>
      </div>
    </div>
  );
}
