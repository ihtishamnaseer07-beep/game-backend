export const ADMIN_EMAIL = 'ihtishamnaseer07@gmail.com';
export const ADMIN_PHONE_NUMBER = '+966593686007';

export const ADMIN_SESSION_STORAGE_KEY = 'wt786_super_admin_session';
const ADMIN_DEVICE_ID_STORAGE_KEY = 'wt786_super_admin_device';
const ADMIN_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function normalizePhone(value = '') {
  return String(value || '').replace(/[\s\-()]/g, '');
}

export function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizeExactPhone(value = '') {
  const normalized = normalizePhone(value);
  if (!normalized) return '';
  return normalized.startsWith('+') ? normalized : `+${normalized}`;
}

export function getConfiguredAdminEmail() {
  return normalizeEmail(ADMIN_EMAIL);
}

export function getConfiguredAdminPhone() {
  return normalizeExactPhone(ADMIN_PHONE_NUMBER);
}

export function isAdminConfigReady() {
  return Boolean(getConfiguredAdminPhone() || getConfiguredAdminEmail());
}

export function matchesSuperAdminIdentity({ phone = '', email = '' } = {}) {
  const configuredEmail = getConfiguredAdminEmail();
  const configuredPhone = getConfiguredAdminPhone();
  const normalizedEmail = normalizeEmail(email);
  const normalizedPhone = normalizeExactPhone(phone);

  const emailMatch = configuredEmail && normalizedEmail && configuredEmail === normalizedEmail;
  const phoneMatch = configuredPhone && normalizedPhone && configuredPhone === normalizedPhone;

  return Boolean(emailMatch || phoneMatch);
}

function randomDeviceId() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function getOrCreateAdminDeviceId() {
  if (typeof window === 'undefined') return 'server';

  const existing = window.localStorage.getItem(ADMIN_DEVICE_ID_STORAGE_KEY);
  if (existing) return existing;

  const created = randomDeviceId();
  window.localStorage.setItem(ADMIN_DEVICE_ID_STORAGE_KEY, created);
  return created;
}

export function isAdminSessionValid(session, { phone = '', email = '' } = {}) {
  if (!session || typeof session !== 'object') return false;

  const verifiedAtMs = Number(new Date(session.verifiedAt).getTime());
  if (!Number.isFinite(verifiedAtMs)) return false;

  if (Date.now() - verifiedAtMs > ADMIN_SESSION_MAX_AGE_MS) return false;

  const expectedDeviceId = getOrCreateAdminDeviceId();
  if (!session.deviceId || session.deviceId !== expectedDeviceId) return false;

  const sessionPhone = normalizeExactPhone(session.phone || phone);
  const sessionEmail = normalizeEmail(session.email || email);
  return matchesSuperAdminIdentity({ phone: sessionPhone, email: sessionEmail });
}
