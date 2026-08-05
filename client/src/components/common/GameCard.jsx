import { useState } from 'react';

export default function GameCard({ title, provider, color = 'from-slate-700 to-slate-800', emoji, onPlay }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-2xl cursor-pointer select-none touch-manipulation transition-all duration-150 ease-in-out active:scale-[0.99] active:opacity-95"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
    >
      {/* poster — taller on 2-col grid */}
      <div className={`bg-gradient-to-br ${color} flex items-center justify-center h-28 sm:h-36 text-4xl sm:text-5xl`}>
        {emoji}
      </div>

      {/* hover overlay with play button */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 transition-opacity duration-150 ease-in-out ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          onClick={onPlay}
          className="rounded-full bg-green-500 hover:bg-green-400 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-green-500/40 transition-all duration-150 ease-in-out active:scale-95 active:opacity-70"
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
