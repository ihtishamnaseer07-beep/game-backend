function getFrontendBaseUrl() {
  return (process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');
}

export function buildReferralLink(referralCode = '') {
  if (!referralCode) return '';
  return `${getFrontendBaseUrl()}/auth?ref=${encodeURIComponent(referralCode)}`;
}

export function serializeUser(user) {
  if (!user) return null;

  const id = String(user._id || user.id || '');

  return {
    _id: id,
    id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    currency: user.currency,
    coins: user.coins,
    team: user.team,
    avatar: user.avatar,
    preferredPaymentMethod: user.preferredPaymentMethod || '',
    referralCode: user.referralCode || '',
    referralLink: buildReferralLink(user.referralCode || ''),
    referredBy: user.referredBy || null,
    referralStats: {
      invitedCount: Number(user.invitedCount || 0),
      referralCoinsEarned: Number(user.referralCoinsEarned || 0),
    },
    dailyRewards: {
      lastLoginBonus: user.lastLoginBonus || null,
      lastSpinAt: user.lastSpinAt || null,
    },
    createdAt: user.createdAt || null,
    isBanned: !!user.isBanned,
  };
}