import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: { type: String, lowercase: true, trim: true, required: true, unique: true },
  phone: { type: String, trim: true, default: '' },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
  coins: { type: Number, default: 100 },
  team: { type: String, enum: ['Team A', 'Team B'], default: 'Team A' },
  avatar: { type: String, default: 'Ninja' },
  isBanned: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  lastClaimedAt: { type: Date },
  lastLoginBonus: { type: Date },
  currency: { type: String, default: 'PKR' },
  preferredPaymentMethod: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
export default User;
