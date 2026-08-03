import mongoose from 'mongoose';

const supportHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  coins: { type: Number, required: true },
  note: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const SupportHistory = mongoose.model('SupportHistory', supportHistorySchema);
export default SupportHistory;
