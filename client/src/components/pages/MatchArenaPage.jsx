import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import NavBar from '../common/NavBar';
import SectionHeading from '../common/SectionHeading';
import ConfirmModal from '../common/ConfirmModal';
import { useSound } from '../../context/SoundContext';
import { API_URL } from '../../config';
const CARTOON_AVATARS = {
  'Team A': '🦸',
  'Team B': '🦹',
};
const QUICK_EMOJIS = ['👏', '🔥', '🎉', '🚀'];

function MatchArenaPage() {
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(45);
  const [supportProgress, setSupportProgress] = useState({
    teamA: { id: null, name: 'Team A', supportScore: 0 },
    teamB: { id: null, name: 'Team B', supportScore: 0 },
  });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [reactionTotals, setReactionTotals] = useState({
    '👏': 0,
    '🔥': 0,
    '🎉': 0,
    '🚀': 0,
  });
  const [reactionFeed, setReactionFeed] = useState([]);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const previousMatchRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const { playSound } = useSound();

  const currentMatchId = useMemo(() => match?._id || match?.matchId || null, [match]);

  useEffect(() => {
    const loadMatch = async () => {
      try {
        const res = await fetch(`${API_URL}/api/matches`);
        const data = await res.json();
        if (res.ok && data.matches?.length) {
          const liveMatch = data.matches[0];
          setMatch(liveMatch);
          setEvents(liveMatch.events || []);
          setSupportProgress({
            teamA: {
              id: liveMatch.teamA?._id || null,
              name: liveMatch.teamA?.name || 'Team A',
              supportScore: liveMatch.teamA?.supportScore || 0,
            },
            teamB: {
              id: liveMatch.teamB?._id || null,
              name: liveMatch.teamB?.name || 'Team B',
              supportScore: liveMatch.teamB?.supportScore || 0,
            },
          });
          previousMatchRef.current = liveMatch;
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    loadMatch();

    const socket = io(API_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('match:update', (payload) => {
      setMatch((prev) => {
        const previousMatch = prev || previousMatchRef.current;
        const nextMatch = prev ? { ...prev, ...payload } : { ...payload };

        if (previousMatch) {
          const scoreIncreased =
            payload.scoreA > previousMatch.scoreA || payload.scoreB > previousMatch.scoreB;
          const matchStarted = previousMatch.status !== 'live' && payload.status === 'live';
          const matchEnded = previousMatch.status !== 'finished' && payload.status === 'finished';
          const actionText = String(payload.latestEvent?.message || '').toLowerCase();
          const hitOccurred = /attack|defend|power strike|heal|counter|rush/.test(actionText);

          if (matchStarted) playSound('matchStart');
          if (scoreIncreased) playSound('goal');
          if (hitOccurred) playSound('hit');
          if (matchEnded) playSound('matchEnd');
        }

        previousMatchRef.current = nextMatch;
        return nextMatch;
      });

      if (payload.latestEvent) {
        setEvents((prev) => [payload.latestEvent, ...prev].slice(0, 8));
      }
    });

    socket.on('support:update', ({ teamId, supportScore }) => {
      setSupportProgress((prev) => {
        if (!teamId) return prev;
        if (String(prev.teamA.id) === String(teamId)) {
          return {
            ...prev,
            teamA: { ...prev.teamA, supportScore: supportScore ?? prev.teamA.supportScore },
          };
        }
        if (String(prev.teamB.id) === String(teamId)) {
          return {
            ...prev,
            teamB: { ...prev.teamB, supportScore: supportScore ?? prev.teamB.supportScore },
          };
        }
        return prev;
      });
    });

    socket.on('match:chat:new', (chatEvent) => {
      setChatMessages((prev) => [chatEvent, ...prev].slice(0, 40));
    });

    socket.on('match:reaction:new', (reactionEvent) => {
      setReactionFeed((prev) => [reactionEvent, ...prev].slice(0, 18));
      if (reactionEvent?.emoji && QUICK_EMOJIS.includes(reactionEvent.emoji)) {
        setReactionTotals((prev) => ({
          ...prev,
          [reactionEvent.emoji]: (prev[reactionEvent.emoji] || 0) + 1,
        }));
      }
    });

    socket.on('match:finished', () => playSound('matchEnd'));

    return () => {
      socketRef.current = null;
      socket.disconnect();
    };
  }, [playSound]);

  useEffect(() => {
    if (!socketRef.current || !currentMatchId) return;
    socketRef.current.emit('match:join', { matchId: currentMatchId });
  }, [currentMatchId]);

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 45)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = useMemo(() => {
    const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const secs = String(secondsLeft % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }, [secondsLeft]);

  const supportStats = useMemo(() => {
    const teamASupport = supportProgress.teamA.supportScore || 0;
    const teamBSupport = supportProgress.teamB.supportScore || 0;
    const totalSupport = teamASupport + teamBSupport;

    if (totalSupport <= 0) {
      return {
        teamA: 50,
        teamB: 50,
        teamASupport,
        teamBSupport,
        totalSupport,
      };
    }

    const teamA = Math.round((teamASupport / totalSupport) * 100);
    return {
      teamA,
      teamB: 100 - teamA,
      teamASupport,
      teamBSupport,
      totalSupport,
    };
  }, [supportProgress]);

  const sendReaction = (emoji) => {
    if (!socketRef.current || !currentMatchId || !QUICK_EMOJIS.includes(emoji)) return;
    const viewer = (() => {
      try {
        const saved = localStorage.getItem('authUser');
        const parsed = saved ? JSON.parse(saved) : null;
        return parsed?.name || 'Viewer';
      } catch {
        return 'Viewer';
      }
    })();

    socketRef.current.emit('match:reaction:send', {
      matchId: currentMatchId,
      user: viewer,
      emoji,
    });
  };

  const sendChatMessage = (event) => {
    event.preventDefault();
    const trimmed = chatInput.trim();
    if (!socketRef.current || !currentMatchId || !trimmed) return;
    playSound('click');
    const viewer = (() => {
      try {
        const saved = localStorage.getItem('authUser');
        const parsed = saved ? JSON.parse(saved) : null;
        return parsed?.name || 'Viewer';
      } catch {
        return 'Viewer';
      }
    })();

    socketRef.current.emit('match:chat:send', {
      matchId: currentMatchId,
      user: viewer,
      message: trimmed,
    });
    setChatInput('');
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 p-10 text-white">Loading match arena...</div>;
  }

  const handleOpenExit = () => {
    playSound('click');
    setExitConfirmOpen(true);
  };

  const handleCloseExit = () => {
    playSound('cancel');
    setExitConfirmOpen(false);
  };

  const handleConfirmExit = () => {
    playSound('exit');
    setExitConfirmOpen(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_28%),_rgb(15,23,42)] text-slate-100">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading title="Live Match Arena" description="Watch the AI battle unfold in real time" />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Live Status</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">{match?.title || 'AI Cartoon Battle'}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-300">
                  {match?.status || 'pending'}
                </span>
                <button
                  type="button"
                  onClick={handleOpenExit}
                  className="rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:border-rose-400 hover:bg-rose-500/20"
                >
                  Exit
                </button>
              </div>
            </div>

            <div className="mt-8 rounded-[28px] border border-slate-800 bg-slate-950/80 p-6">
              <div className="flex items-center justify-between text-xl font-semibold text-slate-300">
                <div className="text-center">
                  <div className="mb-3 text-5xl">{CARTOON_AVATARS['Team A']}</div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Team A</p>
                  <p className="mt-2 text-4xl text-white">{match?.scoreA ?? 0}</p>
                </div>
                <div className="text-center text-cyan-300">
                  <p className="text-3xl font-bold animate-pulse">VS</p>
                  <p className="mt-2 text-sm text-slate-400">Live</p>
                </div>
                <div className="text-center">
                  <div className="mb-3 text-5xl">{CARTOON_AVATARS['Team B']}</div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Team B</p>
                  <p className="mt-2 text-4xl text-white">{match?.scoreB ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Match Timer</p>
                <p className="mt-3 text-3xl font-bold text-cyan-300">{formattedTime}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Win Probability</p>
                <p className="mt-3 text-3xl font-bold text-emerald-300">{match?.winnerProbability?.teamA || 50}%</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Support Progress</p>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                  {match?.status === 'live' ? 'Live Support' : 'Waiting For Live Match'}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">{supportProgress.teamA.name}</p>
                  <p className="mt-2 text-3xl font-bold text-white">{supportStats.teamA}%</p>
                  <p className="mt-1 text-xs text-slate-400">{supportStats.teamASupport} coins supported</p>
                </div>
                <div className="rounded-2xl border border-rose-500/20 bg-slate-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-rose-300">{supportProgress.teamB.name}</p>
                  <p className="mt-2 text-3xl font-bold text-white">{supportStats.teamB}%</p>
                  <p className="mt-1 text-xs text-slate-400">{supportStats.teamBSupport} coins supported</p>
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-full bg-slate-800">
                <div className="flex h-4 w-full">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-cyan-300 transition-all duration-500"
                    style={{ width: `${supportStats.teamA}%` }}
                    aria-label="Team A support percentage"
                  />
                  <div
                    className="bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500"
                    style={{ width: `${supportStats.teamB}%` }}
                    aria-label="Team B support percentage"
                  />
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">Total support this match: {supportStats.totalSupport} coins</p>
            </div>
          </div>

          <div className="space-y-6 rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live Match Log</p>
              <div className="mt-6 space-y-3">
                {events.length ? events.map((event, index) => (
                  <div key={index} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{event.team === 'Team B' ? '🦹' : '🦸'}</div>
                      <div>
                        <p className="text-sm font-semibold text-white">{event.message || 'Match update'}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">{event.team || 'Arena'}</p>
                      </div>
                    </div>
                  </div>
                )) : <p className="text-sm text-slate-400">No events yet.</p>}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Quick Reactions</p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      playSound('jump');
                      sendReaction(emoji);
                    }}
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-xl transition hover:border-cyan-400 hover:bg-slate-800"
                  >
                    {emoji}
                    <span className="ml-2 text-xs text-slate-400">{reactionTotals[emoji] || 0}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 max-h-24 space-y-2 overflow-y-auto pr-1">
                {reactionFeed.length ? reactionFeed.slice(0, 6).map((item) => (
                  <p key={item.id} className="text-xs text-slate-300">
                    <span className="font-semibold text-white">{item.user}</span> reacted {item.emoji}
                  </p>
                )) : <p className="text-xs text-slate-500">No reactions yet.</p>}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live Fan Chat</p>
              <form onSubmit={sendChatMessage} className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  maxLength={280}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  Send
                </button>
              </form>

              <div className="mt-4 max-h-56 space-y-2 overflow-y-auto pr-1">
                {chatMessages.length ? chatMessages.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{item.user}</p>
                    <p className="mt-1 text-sm text-slate-100">{item.message}</p>
                  </div>
                )) : <p className="text-sm text-slate-500">No chat yet. Be the first to cheer!</p>}
              </div>
            </div>
          </div>
        </div>
      </main>
      <ConfirmModal
        open={exitConfirmOpen}
        title="Exit the game?"
        description="Choose Yes to leave the arena and return home, or No to continue watching the match."
        confirmLabel="Yes"
        cancelLabel="No"
        onConfirm={handleConfirmExit}
        onCancel={handleCloseExit}
      />
    </div>
  );
}

export default MatchArenaPage;
