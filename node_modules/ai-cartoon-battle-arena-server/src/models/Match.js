import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  message: { type: String, required: true },
  team: { type: String, required: true }
});

const matchSchema = new mongoose.Schema({
  title: { type: String, required: true },
  teamA: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  teamB: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  scoreA: { type: Number, default: 0 },
  scoreB: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'live', 'paused', 'finished'], default: 'pending' },
  winnerProbability: { type: Object, default: {} },
  events: { type: [eventSchema], default: [] },
  startedAt: { type: Date },
  endedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Match = mongoose.model('Match', matchSchema);
export default Match;
