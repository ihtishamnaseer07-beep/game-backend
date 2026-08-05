export const DEPOSIT_REQUESTS_STORAGE_KEY = 'wt786_admin_deposit_requests';
export const WITHDRAWAL_REQUESTS_STORAGE_KEY = 'wt786_admin_withdrawal_requests';
export const REQUESTS_UPDATED_EVENT = 'wt786:payment-requests-updated';

function readJsonStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function notifyRequestsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(REQUESTS_UPDATED_EVENT));
  }
}

export function readStoredRequests(key) {
  return readJsonStorage(key, []);
}

export function persistStoredRequests(key, requests) {
  writeJsonStorage(key, requests);
  notifyRequestsUpdated();
}

export function appendStoredRequest(key, request) {
  const next = [request, ...readStoredRequests(key)];
  persistStoredRequests(key, next);
  return next;
}

export function updateStoredRequests(key, updater) {
  const current = readStoredRequests(key);
  const next = typeof updater === 'function' ? updater(current) : updater;
  persistStoredRequests(key, next);
  return next;
}