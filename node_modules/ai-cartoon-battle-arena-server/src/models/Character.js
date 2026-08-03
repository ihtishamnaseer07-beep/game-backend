import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  avatar: { type: String, default: '' },
  power: { type: Number, default: 50 },
  createdAt: { type: Date, default: Date.now }
});

const Character = mongoose.model('Character', characterSchema);
export default Character;
