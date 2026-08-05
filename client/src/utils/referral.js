export const REFERRAL_STORAGE_KEY = 'wt786_referral_code';

export function extractReferralCode(search = '') {
  const params = new URLSearchParams(search || '');
  return String(params.get('ref') || params.get('referral') || '').trim().toUpperCase();
}

export function getStoredReferralCode() {
  if (typeof window === 'undefined') return '';
  return String(window.localStorage.getItem(REFERRAL_STORAGE_KEY) || '').trim().toUpperCase();
}

export function storeReferralCode(referralCode = '') {
  if (typeof window === 'undefined') return;
  const value = String(referralCode || '').trim().toUpperCase();
  if (!value) return;
  window.localStorage.setItem(REFERRAL_STORAGE_KEY, value);
}

export function clearStoredReferralCode() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(REFERRAL_STORAGE_KEY);
}
