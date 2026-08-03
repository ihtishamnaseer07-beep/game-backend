import mongoose from 'mongoose';

const coinSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, default: 0 },
  lastClaimedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

const Coin = mongoose.model('Coin', coinSchema);
export default Coin;
