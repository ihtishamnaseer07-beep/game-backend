export const THEME_PRESETS = {
  luxuryGold: {
    key: 'luxuryGold',
    name: 'Luxury Gold',
    background: 'radial-gradient(circle at top, rgba(250,204,21,0.18), transparent 32%), #0f172a',
    primary: '#f59e0b',
    secondary: '#facc15',
    border: '#a16207',
    fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
    buttonRadius: 14,
  },
  neonBlue: {
    key: 'neonBlue',
    name: 'Neon Blue',
    background: 'radial-gradient(circle at top, rgba(56,189,248,0.2), transparent 32%), #020617',
    primary: '#06b6d4',
    secondary: '#3b82f6',
    border: '#0284c7',
    fontFamily: 'Verdana, Segoe UI, sans-serif',
    buttonRadius: 12,
  },
  darkCasino: {
    key: 'darkCasino',
    name: 'Dark Casino',
    background: 'radial-gradient(circle at top, rgba(34,197,94,0.16), transparent 32%), #020617',
    primary: '#22c55e',
    secondary: '#eab308',
    border: '#334155',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    buttonRadius: 12,
  },
};

export const DEFAULT_APP_SETTINGS = {
  appTheme: THEME_PRESETS.darkCasino,
  gameLogoUrl: '/logo.png',
  splashScreenUrl: '/assets/branding/game-logo.png',
  announcementText: "Welcome to WIN TOON 786 — Pakistan's #1 online gaming portal!",
  dynamicRules: 'Play responsibly. Deposits and withdrawals are manually reviewed by admin.',
  easypaisaDetails: {
    accountTitle: 'WIN TOON 786 (EP)',
    accountNumber: '0300-1234567',
  },
  jazzcashDetails: {
    accountTitle: 'WIN TOON 786 (JC)',
    accountNumber: '0301-7654321',
  },
  bankDetails: {
    accountTitle: 'WIN TOON 786 Pvt Ltd — Meezan Bank',
    accountNumber: 'PK36 MEZN 0001 0103 0101 23',
  },
  bannerImages: [],
  adminAuthorizedEmails: [],
  adminAuthorizedPhones: [],
};
