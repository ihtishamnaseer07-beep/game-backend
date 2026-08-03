import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  teamSupportScore: { type: Number, default: 0 },
  topSupporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  period: { type: String, enum: ['weekly', 'monthly', 'alltime'], default: 'weekly' },
  updatedAt: { type: Date, default: Date.now }
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
export default Leaderboard;
