import mongoose from 'mongoose';

const coinPackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  coins: { type: Number, required: true },
  pricePKR: { type: Number, required: true },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const CoinPackage = mongoose.model('CoinPackage', coinPackageSchema);
export default CoinPackage;
