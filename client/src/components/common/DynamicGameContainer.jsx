export default function DynamicGameContainer({ game }) {
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
          <span className="rounded-full border border-emerald-300/50 bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-200">
            Active
          </span>
          <span className="rounded-full border border-cyan-300/50 bg-cyan-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-200">
            {isWebgl ? '3D WebGL' : 'Live'}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-16">
          <h2 className="truncate text-sm font-black text-white sm:text-base">{game.title}</h2>
          <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-200/90">
            {isWebgl ? 'WebGL immersive mode' : 'Fast game mode'} • {modeLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
