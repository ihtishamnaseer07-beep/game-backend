function formatBalance(value = 0) {
  return Number(value || 0).toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

const SUPPORT_LINK = 'https://wa.me/966593686007?text=Hello%20WIN%20TOON%20786%20Support,%20I%20need%20help%20with%20my%20account.';

export default function DynamicGameContainer({ game, balance = 0 }) {
  if (!game) {
    return (
      <section className="mx-3 mt-3 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-bold text-white">Active Game</h2>
        <p className="mt-2 text-xs text-slate-400">No game is active. Ask admin to activate a game in Manage Games tab.</p>
      </section>
    );
  }

  const isWebgl = game.gameType === '3d-webgl';
  const modeLabel = game.renderMode === 'webgl-path' ? 'WebGL Path' : 'iFrame URL';

  return (
    <section className="mx-3 mt-3 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      <div className="relative aspect-video w-full bg-slate-950">
        {game.thumbnailUrl && (
          <img
            src={game.thumbnailUrl}
            alt={`${game.title} preview`}
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
        )}
        {game.sourceUrl ? (
          <iframe
            src={game.sourceUrl}
            title={game.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-center">
            <div>
              <p className="text-base font-bold text-white">{game.title}</p>
              <p className="mt-1 text-xs text-slate-400">Game source URL is not configured yet.</p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/55" />

        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded-full border border-cyan-300/50 bg-cyan-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-200">
            {isWebgl ? '3D WebGL' : '2D Game'}
          </span>
          <span className="rounded-full border border-emerald-300/50 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
            Active
          </span>
        </div>

        <div className="absolute right-3 top-3 rounded-full border border-yellow-500/50 bg-yellow-500/15 px-3 py-1 text-xs font-bold text-yellow-300">
          Coins: Rs {formatBalance(balance)}
        </div>

        <div className="absolute bottom-3 left-3 right-16">
          <h2 className="truncate text-sm font-black text-white sm:text-base">{game.title}</h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-200/90">
            {isWebgl ? 'WebGL immersive mode' : 'Fast 2D mode'} • {modeLabel}
          </p>
        </div>

        <a
          href={SUPPORT_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open support"
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#25D366]/40 bg-[#25D366] text-slate-950 shadow-xl shadow-[#25D366]/30 transition hover:scale-105"
        >
          <span className="text-lg">?</span>
        </a>
      </div>
    </section>
  );
}
