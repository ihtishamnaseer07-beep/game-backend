import Match from '../models/Match.js';

const randomAction = () => {
  const actions = ['Attack', 'Defend', 'Power Strike', 'Heal', 'Counter', 'Rush'];
  return actions[Math.floor(Math.random() * actions.length)];
};

const randomScoreChange = () => Math.floor(Math.random() * 3);

export const calculateProbability = (scoreA, scoreB) => {
  const base = 50 + (scoreA - scoreB) * 5;
  return {
    teamA: Math.max(5, Math.min(95, base)),
    teamB: Math.max(5, Math.min(95, 100 - base)),
  };
};

let ioInstance = null;
let activeMatchId = null;
let interval = null;
const quickReactions = new Set(['👏', '🔥', '🎉', '🚀']);

const emitMatchUpdate = async (match) => {
  if (!ioInstance) return;
  ioInstance.emit('match:update', {
    matchId: match._id,
    scoreA: match.scoreA,
    scoreB: match.scoreB,
    status: match.status,
    winnerProbability: match.winnerProbability,
    latestEvent: match.events[match.events.length - 1],
  });
};

export const initializeMatchEngine = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.on('match:join', ({ matchId }) => {
      if (!matchId) return;
      socket.join(`match:${matchId}`);
    });

    socket.on('match:start', ({ matchId }) => {
      startMatchEngine(matchId);
    });
    socket.on('match:pause', () => {
      pauseMatchEngine();
    });
    socket.on('match:end', () => {
      endMatchEngine();
    });

    socket.on('match:chat:send', (payload = {}) => {
      const matchId = payload.matchId;
      const user = typeof payload.user === 'string' && payload.user.trim() ? payload.user.trim() : 'Viewer';
      const message = typeof payload.message === 'string' ? payload.message.trim() : '';
      if (!matchId || !message) return;

      const chatEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        matchId,
        user: user.slice(0, 30),
        message: message.slice(0, 280),
        createdAt: new Date().toISOString(),
      };

      io.to(`match:${matchId}`).emit('match:chat:new', chatEvent);
    });

    socket.on('match:reaction:send', (payload = {}) => {
      const matchId = payload.matchId;
      const user = typeof payload.user === 'string' && payload.user.trim() ? payload.user.trim() : 'Viewer';
      const emoji = typeof payload.emoji === 'string' ? payload.emoji.trim() : '';
      if (!matchId || !quickReactions.has(emoji)) return;

      const reactionEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        matchId,
        user: user.slice(0, 30),
        emoji,
        createdAt: new Date().toISOString(),
      };

      io.to(`match:${matchId}`).emit('match:reaction:new', reactionEvent);
    });
  });
};

export const startMatchEngine = async (matchId) => {
  if (interval) clearInterval(interval);
  activeMatchId = matchId;
  const match = await Match.findById(matchId).populate('teamA teamB');
  if (!match) return;
  match.status = 'live';
  match.startedAt = new Date();
  match.winnerProbability = calculateProbability(match.scoreA, match.scoreB);
  await match.save();
  await emitMatchUpdate(match);

  interval = setInterval(async () => {
    const currentMatch = await Match.findById(activeMatchId).populate('teamA teamB');
    if (!currentMatch || currentMatch.status !== 'live') return;

    const scoreA = currentMatch.scoreA + randomScoreChange();
    const scoreB = currentMatch.scoreB + randomScoreChange();
    const event = {
      message: `${randomAction()} by ${Math.random() > 0.5 ? currentMatch.teamA.name : currentMatch.teamB.name}`,
      team: Math.random() > 0.5 ? currentMatch.teamA.name : currentMatch.teamB.name,
    };
    currentMatch.scoreA = scoreA;
    currentMatch.scoreB = scoreB;
    currentMatch.events.push(event);
    currentMatch.winnerProbability = calculateProbability(scoreA, scoreB);
    await currentMatch.save();
    await emitMatchUpdate(currentMatch);
  }, 6000);
};

export const pauseMatchEngine = () => {
  if (interval) clearInterval(interval);
};

export const resumeMatchEngine = async (matchId) => {
  if (!matchId) return;
  await startMatchEngine(matchId);
};

export const endMatchEngine = async () => {
  if (interval) clearInterval(interval);
  if (!activeMatchId) return;
  const match = await Match.findById(activeMatchId).populate('teamA teamB');
  if (!match) return;
  match.status = 'finished';
  match.endedAt = new Date();
  await match.save();
  if (ioInstance) ioInstance.emit('match:finished', { matchId: match._id, winnerProbability: match.winnerProbability });
  activeMatchId = null;
};
