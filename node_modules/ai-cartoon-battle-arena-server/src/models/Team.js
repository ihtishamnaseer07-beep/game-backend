import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String, default: '' },
  description: { type: String, default: '' },
  supportScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Team = mongoose.model('Team', teamSchema);
export default Team;
