import User from '../models/User.js';

export async function generateUniqueReferralCode(name = '') {
  const seed = String(name || 'WIN786').replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 4) || 'WIN7';

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const candidate = `${seed}${suffix}`;
    const existing = await User.exists({ referralCode: candidate });
    if (!existing) return candidate;
  }

  return `WT${Date.now().toString(36).slice(-6).toUpperCase()}`;
}

export async function ensureUserReferralCode(user) {
  if (!user) return user;
  if (user.referralCode) return user;

  user.referralCode = await generateUniqueReferralCode(user.name);
  await user.save();
  return user;
}