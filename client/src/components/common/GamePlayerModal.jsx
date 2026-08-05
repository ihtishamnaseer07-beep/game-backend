import { useEffect, useRef, useState } from 'react';
import { useSound } from '../../context/SoundContext';

const GAME_ENGINES = {
  dragonLion: DragonLionGame,
  fast: FastRoundGame,
};

function resolveEngine(title = '') {
  const t = title.toLowerCase();
  if (t.includes('dragon') && t.includes('lion')) return 'dragonLion';
  return 'fast';
}

function getPhaseLabel(secondsLeft) {
  if (secondsLeft > 6) return 'Betting';
  if (secondsLeft > 2) return 'Card Reveal';
  return 'Result';
}

function createDragonRound() {
  const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  const dragon = values[Math.floor(Math.random() * values.length)];
  const lion = Math.random() < 0.12 ? dragon : values[Math.floor(Math.random() * values.length)];

  return {
    dragon: { value: dragon, face: toCardFace(dragon) },
    lion: { value: lion, face: toCardFace(lion) },
  };
}

function toCardFace(value) {
  if (value === 14) return 'A';
  if (value === 13) return 'K';
  if (value === 12) return 'Q';
  if (value === 11) return 'J';
  return String(value);
}

function FastRoundGame({ game, balance = 0, onRoundComplete, playSound }) {
  const [betAmount, setBetAmount] = useState(100);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [roundState, setRoundState] = useState('idle');
  const [result, setResult] = useState(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const resolvedRef = useRef(false);

  const betOptions = [50, 100, 250, 500];

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (roundState !== 'running') return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((current) => (current > 1 ? current - 1 : 0));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [roundState]);

  useEffect(() => {
    if (roundState !== 'running' || secondsLeft !== 0 || resolvedRef.current) return;

    resolvedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);

    const won = Math.random() > 0.48;
    const delta = won ? betAmount : -betAmount;
    const payload = {
      game: game.title,
      result: won ? 'WIN' : 'LOSE',
      betAmount,
      multiplier: won ? 2 : 0,
      delta,
    };

    setResult(payload);
    setRoundState('result');
    playSound?.(won ? 'score' : 'hit');
    onRoundComplete?.(payload);

    timeoutRef.current = setTimeout(() => {
      setResult(null);
      setSecondsLeft(0);
      setRoundState('idle');
      resolvedRef.current = false;
    }, 1800);
  }, [secondsLeft, roundState, betAmount, game.title, onRoundComplete, playSound]);

  const startRound = () => {
    if (roundState === 'running' || betAmount <= 0 || betAmount > balance) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setResult(null);
    setSecondsLeft(5);
    setRoundState('running');
    resolvedRef.current = false;
    playSound?.('confirm');
  };

  const progress = roundState === 'running' ? Math.max((secondsLeft / 5) * 100, 0) : 0;

  return (
    <div className="flex h-full flex-col gap-4 bg-slate-950 px-4 py-4 text-center">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
          <span>{game.title}</span>
          <span>{roundState === 'running' ? `${secondsLeft}s` : '5s Fast Round'}</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-3xl font-black text-white">{roundState === 'running' ? secondsLeft : 'Ready'}</p>
        <p className="text-xs text-slate-400">Tap start and the game auto-reveals a win or loss after 5 seconds.</p>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {betOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setBetAmount(option)}
            disabled={roundState === 'running'}
            className={`rounded-2xl border px-3 py-3 text-xs font-bold transition-all ${
              betAmount === option
                ? 'border-green-400 bg-green-500/20 text-green-300'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600'
            } ${roundState === 'running' ? 'opacity-60' : ''}`}
          >
            Rs {option}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-left">
          <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">Selected Bet</p>
          <p className="mt-1 text-lg font-black text-white">Rs {betAmount}</p>
          <p className="text-xs text-slate-400">{betAmount > balance ? 'Balance too low for this stake' : 'Balanced for a quick win/lose round'}</p>
        </div>
        <button
          type="button"
          onClick={startRound}
          disabled={roundState === 'running' || betAmount > balance}
          className="rounded-2xl bg-green-500 px-6 py-4 text-sm font-black text-white shadow-lg shadow-green-500/30 transition-all hover:bg-green-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {roundState === 'running' ? '⏳ Running…' : '⚡ Start 5s Round'}
        </button>
      </div>

      <div className="flex-1 rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <span className="text-6xl sm:text-7xl">{game.emoji}</span>
          <div className="w-full max-w-xs rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Round Result</p>
            <p className={`mt-2 text-2xl font-black ${result?.result === 'WIN' ? 'text-green-400' : result?.result === 'LOSE' ? 'text-rose-400' : 'text-white'}`}>
              {result ? result.result : 'Awaiting start'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {result ? `${result.result === 'WIN' ? '+' : '-'}Rs ${Math.abs(result.delta).toFixed(2)} balance change` : 'Win result appears automatically after the countdown.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DragonLionGame({ balance = 0, onRoundComplete, playSound }) {
  const [betSide, setBetSide] = useState('dragon');
  const [betAmount, setBetAmount] = useState(100);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [phase, setPhase] = useState('Betting');
  const [round, setRound] = useState(() => createDragonRound());
  const [result, setResult] = useState(null);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const resolvedRef = useRef(false);

  const betOptions = [50, 100, 250, 500];

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setSecondsLeft(10);
    setPhase('Betting');
    setResult(null);
    setRound(createDragonRound());
    resolvedRef.current = false;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((current) => (current > 1 ? current - 1 : 0));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setPhase(getPhaseLabel(secondsLeft));
  }, [secondsLeft]);

  useEffect(() => {
    if (secondsLeft !== 0 || resolvedRef.current) return;

    resolvedRef.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);

    const winner = round.dragon.value === round.lion.value ? 'tie' : round.dragon.value > round.lion.value ? 'dragon' : 'lion';
    const won = betSide === winner;
    const multiplier = winner === 'tie' ? 8 : 2;
    const delta = won ? Math.round(betAmount * (multiplier - 1)) : -betAmount;
    const payload = {
      game: 'Dragon vs Lion',
      result: won ? 'WIN' : 'LOSE',
      winner,
      betSide,
      betAmount,
      multiplier: won ? multiplier : 0,
      delta,
    };

    setResult(payload);
    playSound?.(won ? 'score' : 'hit');
    onRoundComplete?.(payload);

    timeoutRef.current = setTimeout(() => {
      setRound(createDragonRound());
      setSecondsLeft(10);
      setResult(null);
      setPhase('Betting');
      resolvedRef.current = false;
    }, 1800);
  }, [secondsLeft, round, betSide, betAmount, onRoundComplete, playSound]);

  const dragonIsWinning = round.dragon.value > round.lion.value;
  const lionIsWinning = round.lion.value > round.dragon.value;
  const revealActive = secondsLeft <= 6;

  return (
    <div className="flex h-full flex-col gap-4 bg-slate-950 px-4 py-4 text-center">
      <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4 shadow-2xl shadow-rose-950/20">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
          <span>{phase}</span>
          <span>{secondsLeft}s</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-yellow-400 transition-all duration-300" style={{ width: `${(secondsLeft / 10) * 100}%` }} />
        </div>
        <p className="mt-3 text-3xl font-black text-white">Dragon vs Lion</p>
        <p className="text-xs text-slate-400">Highest card wins. Dragon, Lion, or Tie can payout before the timer ends.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'dragon', label: 'Dragon', mult: '2x', color: 'from-rose-500 to-orange-600', emoji: '🐉' },
          { key: 'lion', label: 'Lion', mult: '2x', color: 'from-amber-500 to-yellow-600', emoji: '🦁' },
          { key: 'tie', label: 'Tie', mult: '8x', color: 'from-violet-500 to-fuchsia-700', emoji: '🤝' },
        ].map((option) => {
          const active = betSide === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setBetSide(option.key)}
              disabled={secondsLeft < 3}
              className={`rounded-2xl border px-2 py-3 text-xs font-bold transition-all ${
                active
                  ? 'border-white/40 bg-white/10 text-white ring-2 ring-white/20'
                  : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600'
              } ${secondsLeft < 3 ? 'opacity-70' : ''}`}
            >
              <span className={`mb-1 flex h-10 items-center justify-center rounded-xl bg-gradient-to-br ${option.color} text-xl shadow-lg`}>
                {option.emoji}
              </span>
              <span className="block leading-tight">{option.label}</span>
              <span className="block text-[10px] text-slate-400">{option.mult}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {betOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setBetAmount(option)}
            className={`rounded-2xl border px-3 py-3 text-xs font-bold transition-all ${
              betAmount === option
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-300'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600'
            }`}
          >
            Rs {option}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { key: 'dragon', label: 'Dragon', card: round.dragon, edge: 'from-rose-500 to-red-700', active: dragonIsWinning },
          { key: 'lion', label: 'Lion', card: round.lion, edge: 'from-amber-500 to-yellow-700', active: lionIsWinning },
        ].map((card) => (
          <div
            key={card.key}
            className={`relative overflow-hidden rounded-[28px] border p-4 transition-all duration-300 ${
              revealActive ? 'bg-slate-900' : 'bg-slate-900/70'
            } ${card.active ? 'border-emerald-400/60 shadow-lg shadow-emerald-500/20' : 'border-slate-800'}`}
          >
            <div className={`mx-auto flex h-36 w-full items-center justify-center rounded-[24px] bg-gradient-to-br ${card.edge} ${revealActive ? 'scale-100 opacity-100' : 'scale-95 opacity-90'} transition-all duration-300`}>
              <div className="flex flex-col items-center gap-2 text-white">
                <div className="text-4xl">{card.key === 'dragon' ? '🐉' : '🦁'}</div>
                <div className="rounded-2xl bg-black/20 px-4 py-2 text-4xl font-black shadow-inner backdrop-blur-sm">
                  {revealActive ? card.card.face : '??'}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="font-bold text-white">{card.label}</span>
              <span className="text-slate-400">{revealActive ? card.card.value : 'Hidden'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 text-left">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Selected Bet</p>
            <p className="mt-1 text-lg font-black text-white">{betSide.toUpperCase()} • Rs {betAmount}</p>
          </div>
          <button
            type="button"
            onClick={() => playSound?.('select')}
            className="rounded-full border border-slate-700 bg-slate-950 px-3 py-2 text-[11px] font-bold text-slate-200 transition hover:border-cyan-400 hover:text-white"
          >
            Preview
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">{betAmount > balance ? 'Increase balance before joining the round.' : 'The round settles automatically when the timer hits zero.'}</p>
        {result && (
          <div className={`mt-3 rounded-2xl border px-4 py-3 ${result.result === 'WIN' ? 'border-emerald-400/30 bg-emerald-500/10' : 'border-rose-400/30 bg-rose-500/10'}`}>
            <p className={`text-sm font-black ${result.result === 'WIN' ? 'text-emerald-300' : 'text-rose-300'}`}>
              {result.result} {result.result === 'WIN' ? `+Rs ${Math.abs(result.delta).toFixed(2)}` : `-Rs ${Math.abs(result.delta).toFixed(2)}`}
            </p>
            <p className="text-[11px] text-slate-300">{result.winner === 'tie' ? 'The cards matched for a tie round.' : `Winner: ${result.winner.toUpperCase()}`}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.25em] text-slate-500">
        <span className={`h-2 w-2 rounded-full ${phase === 'Betting' ? 'bg-cyan-400' : 'bg-slate-700'}`} />
        <span className={`h-2 w-2 rounded-full ${phase === 'Card Reveal' ? 'bg-amber-400' : 'bg-slate-700'}`} />
        <span className={`h-2 w-2 rounded-full ${phase === 'Result' ? 'bg-rose-400' : 'bg-slate-700'}`} />
      </div>
    </div>
  );
}

export default function GamePlayerModal({ game, balance = 0, onClose, onDeposit, onRoundComplete }) {
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef(null);
  const { playSound } = useSound();

  const engineKey = resolveEngine(game.title);
  const Engine = GAME_ENGINES[engineKey];

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

        <div className="flex-1 overflow-hidden">
          <Engine game={game} balance={balance} onRoundComplete={onRoundComplete} playSound={playSound} />
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 border-t border-slate-800 shrink-0">
          <button
            onClick={onDeposit}
            className="flex items-center gap-1.5 rounded-xl bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 px-3 py-2 text-xs font-bold text-green-400 transition-colors"
          >
            💰 Deposit More
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMuted((current) => !current)}
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
