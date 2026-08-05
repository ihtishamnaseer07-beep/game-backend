import { useRef } from 'react';

export const AVATAR_OPTIONS = [
  { key: 'royal-lion', label: 'Royal Lion', emoji: '🦁', bg: 'from-amber-500 to-orange-700' },
  { key: 'dragon-king', label: 'Dragon King', emoji: '🐉', bg: 'from-rose-500 to-red-700' },
  { key: 'neon-queen', label: 'Neon Queen', emoji: '👑', bg: 'from-fuchsia-500 to-pink-700' },
  { key: 'vip-gamer', label: 'VIP Gamer', emoji: '🎮', bg: 'from-cyan-500 to-blue-700' },
  { key: 'gold-tiger', label: 'Gold Tiger', emoji: '🐅', bg: 'from-yellow-400 to-amber-700' },
  { key: 'storm-knight', label: 'Storm Knight', emoji: '🛡️', bg: 'from-slate-500 to-slate-800' },
  { key: 'astro-bunny', label: 'Astro Bunny', emoji: '🐰', bg: 'from-violet-500 to-indigo-700' },
  { key: 'crystal-fox', label: 'Crystal Fox', emoji: '🦊', bg: 'from-teal-400 to-cyan-700' },
  { key: 'shadow-panther', label: 'Shadow Panther', emoji: '🐆', bg: 'from-slate-700 to-zinc-900' },
  { key: 'fortune-dragon', label: 'Fortune Dragon', emoji: '🐲', bg: 'from-emerald-500 to-green-700' },
  { key: 'royal-girl', label: 'Royal Girl', emoji: '💃', bg: 'from-pink-500 to-rose-700' },
  { key: 'tech-pilot', label: 'Tech Pilot', emoji: '🚀', bg: 'from-sky-500 to-indigo-700' },
];

function readImageAsDataUrl(file, callback) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

export default function AvatarPicker({ currentAvatarKey, currentImage, onSelectAvatar, onUploadImage, onClearImage }) {
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type?.startsWith('image/')) return;
    readImageAsDataUrl(file, (dataUrl) => {
      if (typeof dataUrl === 'string' && onUploadImage) {
        onUploadImage(dataUrl);
      }
    });
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-inner shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">Avatar Studio</p>
          <p className="text-xs text-slate-400">Pick a VIP character or upload your own photo.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white"
          >
            Gallery
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-white"
          >
            Camera
          </button>
        </div>
      </div>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          handleFile(file);
          event.target.value = '';
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          handleFile(file);
          event.target.value = '';
        }}
      />

      {currentImage && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3">
          <img src={currentImage} alt="Custom avatar preview" className="h-14 w-14 rounded-2xl object-cover border border-white/10" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Custom profile photo active</p>
            <p className="text-xs text-slate-300 truncate">Visible in the header, navbar, and profile card.</p>
          </div>
          {onClearImage && (
            <button
              type="button"
              onClick={onClearImage}
              className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] font-semibold text-red-300 transition hover:bg-red-500/20"
            >
              Remove
            </button>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {AVATAR_OPTIONS.map((avatar) => {
          const active = currentAvatarKey === avatar.key && !currentImage;

          return (
            <button
              type="button"
              key={avatar.key}
              onClick={() => onSelectAvatar?.(avatar)}
              className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-center transition-all ${
                active
                  ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-400/40'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-600 hover:bg-slate-900'
              }`}
            >
              <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${avatar.bg} text-2xl shadow-lg`}>
                {avatar.emoji}
              </span>
              <span className="text-[11px] font-semibold text-white leading-tight">{avatar.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}