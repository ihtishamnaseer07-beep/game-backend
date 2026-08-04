import { useState, useRef, useEffect } from 'react';

/* Inline mini-games rendered on canvas — no external URL needed */
const GAME_ENGINES = {
  aviator: AviatorGame,
  slots:   SlotsGame,
  default: PlaceholderGame,
};

function resolveEngine(title = '') {
  const t = title.toLowerCase();
  if (t.includes('aviator')) return 'aviator';
  if (t.includes('slot') || t.includes('bonanza') || t.includes('olympus') || t.includes('fortune') || t.includes('mahjong')) return 'slots';
  return 'default';
}

/* ── Aviator mini-game ── */
function AviatorGame() {
  const canvasRef = useRef(null);
  const state = useRef({ mult: 1, speed: 0.012, crashed: false, animId: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const { width: W, height: H } = canvas;
      const s = state.current;

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);

      if (!s.crashed) {
        s.mult += s.speed;
        s.speed += 0.0002;
        if (Math.random() < 0.002 * s.mult) s.crashed = true;
      }

      // grid lines
      ctx.strokeStyle = 'rgba(99,102,241,0.15)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // curve
      const progress = Math.min((s.mult - 1) / 20, 1);
      const ex = W * 0.1 + progress * W * 0.75;
      const ey = H * 0.85 - progress * H * 0.7;

      ctx.beginPath();
      ctx.moveTo(W * 0.05, H * 0.88);
      ctx.quadraticCurveTo(W * 0.3, H * 0.88, ex, ey);
      ctx.strokeStyle = s.crashed ? '#ef4444' : '#22c55e';
      ctx.lineWidth = 3;
      ctx.shadowColor = s.crashed ? '#ef4444' : '#22c55e';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // plane emoji
      if (!s.crashed) {
        ctx.font = `${Math.min(W, H) * 0.07}px serif`;
        ctx.fillText('✈️', ex - 16, ey - 10);
      }

      // multiplier text
      ctx.font = `bold ${Math.min(W * 0.13, 60)}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillStyle = s.crashed ? '#ef4444' : '#ffffff';
      ctx.fillText(s.crashed ? 'CRASHED!' : `${s.mult.toFixed(2)}×`, W / 2, H / 2);

      if (s.crashed) {
        ctx.font = `${Math.min(W * 0.05, 18)}px sans-serif`;
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Tap Restart to play again', W / 2, H / 2 + 40);
      }

      ctx.textAlign = 'left';
      state.current.animId = requestAnimationFrame(draw);
    };

    state.current.animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(state.current.animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const restart = () => { state.current = { mult: 1, speed: 0.012, crashed: false, animId: null }; };

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <button
        onClick={restart}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-green-500 hover:bg-green-400 px-6 py-2 text-sm font-bold text-white shadow-lg shadow-green-500/40 transition-all active:scale-95"
      >
        🚀 Restart
      </button>
    </div>
  );
}

/* ── Slots mini-game ── */
const REEL_SYMBOLS = ['🍒', '🍋', '⭐', '💎', '7️⃣', '🔔', '🍇', '🎰'];
function SlotsGame() {
  const [reels, setReels]     = useState(['🎰', '🎰', '🎰']);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult]   = useState('');

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult('');
    let count = 0;
    const iv = setInterval(() => {
      setReels([
        REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)],
        REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)],
        REEL_SYMBOLS[Math.floor(Math.random() * REEL_SYMBOLS.length)],
      ]);
      count++;
      if (count >= 14) {
        clearInterval(iv);
        setSpinning(false);
        setReels((prev) => {
          const final = prev;
          if (final[0] === final[1] && final[1] === final[2]) setResult('🎉 JACKPOT!');
          else if (final[0] === final[1] || final[1] === final[2] || final[0] === final[2]) setResult('✅ Small Win!');
          else setResult('😔 Try Again');
          return final;
        });
      }
    }, 80);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 bg-slate-950 select-none">
      <div className="flex gap-4">
        {reels.map((sym, i) => (
          <div key={i} className={`flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-slate-800 border-2 text-5xl sm:text-6xl shadow-xl transition-all duration-75 ${spinning ? 'border-yellow-400 scale-105' : 'border-slate-600'}`}>
            {sym}
          </div>
        ))}
      </div>
      {result && (
        <p className={`text-xl font-extrabold ${result.includes('JACKPOT') ? 'text-yellow-400' : result.includes('Win') ? 'text-green-400' : 'text-slate-400'}`}>
          {result}
        </p>
      )}
      <button
        onClick={spin}
        disabled={spinning}
        className="rounded-full bg-green-500 hover:bg-green-400 disabled:opacity-60 disabled:cursor-not-allowed px-10 py-3 text-base font-bold text-white shadow-lg shadow-green-500/40 transition-all active:scale-95"
      >
        {spinning ? '⏳ Spinning…' : '🎰 SPIN'}
      </button>
    </div>
  );
}

/* ── Placeholder for other games ── */
function PlaceholderGame({ title, emoji }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 bg-slate-950 text-center px-6">
      <span className="text-7xl">{emoji}</span>
      <h3 className="text-2xl font-extrabold text-white">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs">Full game integration coming soon. This is a live preview placeholder.</p>
      <div className="flex gap-2 flex-wrap justify-center">
        {['BET Rs 100', 'BET Rs 500', 'BET Rs 1000'].map((b) => (
          <button key={b} className="rounded-xl bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 px-4 py-2 text-xs font-bold text-green-400 transition-colors">
            {b}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Main Modal ── */
export default function GamePlayerModal({ game, balance = 0, onClose, onDeposit }) {
  const [muted, setMuted]       = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef(null);

  const engineKey = resolveEngine(game.title);
  const Engine    = GAME_ENGINES[engineKey];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  };

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4">
      <div
        ref={containerRef}
        className="relative flex flex-col w-full max-w-2xl bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60"
        style={{ height: 'min(92vh, 640px)' }}
      >
        {/* ── Header Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{game.emoji}</span>
            <div>
              <p className="text-sm font-bold text-white leading-none">{game.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{game.provider}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] text-slate-500 uppercase tracking-wide">Balance</span>
              <span className="text-sm font-bold text-yellow-400">Rs {Number(balance).toFixed(2)}</span>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-400 hover:text-red-300 text-base font-bold transition-all"
              title="Exit Game"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Game Canvas Area ── */}
        <div className="flex-1 overflow-hidden">
          <Engine title={game.title} emoji={game.emoji} />
        </div>

        {/* ── Bottom Control Bar ── */}
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 border-t border-slate-800 shrink-0">
          <button
            onClick={onDeposit}
            className="flex items-center gap-1.5 rounded-xl bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 px-3 py-2 text-xs font-bold text-green-400 transition-colors"
          >
            💰 Deposit More
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted((m) => !m)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-base transition-colors"
              title={muted ? 'Unmute' : 'Mute'}
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-base transition-colors"
              title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {fullscreen ? '⊡' : '⛶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
