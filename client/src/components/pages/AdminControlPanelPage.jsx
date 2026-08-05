import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { THEME_PRESETS } from '../../constants/appSettings';
import { API_URL } from '../../config';

const TABS = [
  { key: 'branding', label: 'App Design & Branding' },
  { key: 'payments', label: 'Payment Setup' },
  { key: 'users', label: 'User Balances & Requests' },
];

function formatMoney(value = 0) {
  return `Rs ${Number(value || 0).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function normalizePhone(value = '') {
  return String(value || '').replace(/\s+/g, '');
}

export default function AdminControlPanelPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { settings, loading, saveSettings } = useAppSettings();
  const [activeTab, setActiveTab] = useState('branding');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [brandingForm, setBrandingForm] = useState({
    themeKey: 'darkCasino',
    gameLogoUrl: '',
    splashScreenUrl: '',
    announcementText: '',
    dynamicRules: '',
    bannerImagesText: '',
    adminAuthorizedEmailsText: '',
    adminAuthorizedPhonesText: '',
    primary: '#22c55e',
    secondary: '#eab308',
    border: '#334155',
    fontFamily: 'Segoe UI, sans-serif',
  });

  const [paymentForm, setPaymentForm] = useState({
    easypaisaTitle: '',
    easypaisaNumber: '',
    jazzcashTitle: '',
    jazzcashNumber: '',
    bankTitle: '',
    bankNumber: '',
  });

  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [balanceDrafts, setBalanceDrafts] = useState({});

  const authorized = useMemo(() => {
    const allowedEmails = (settings?.adminAuthorizedEmails || []).map((value) => String(value).trim().toLowerCase());
    const allowedPhones = (settings?.adminAuthorizedPhones || []).map((value) => normalizePhone(value));
    const userEmail = String(user?.email || '').trim().toLowerCase();
    const userPhone = normalizePhone(user?.phone || '');

    if (!allowedEmails.length && !allowedPhones.length) {
      return user?.role === 'admin' || user?.role === 'superadmin';
    }

    return allowedEmails.includes(userEmail) || allowedPhones.includes(userPhone);
  }, [settings, user]);

  const pendingDeposits = useMemo(() => requests.filter((request) => request.type === 'deposit' && request.status === 'pending'), [requests]);
  const pendingWithdrawals = useMemo(() => requests.filter((request) => request.type === 'withdrawal' && request.status === 'pending'), [requests]);

  useEffect(() => {
    if (!settings) return;

    setBrandingForm({
      themeKey: settings.appTheme?.key || 'darkCasino',
      gameLogoUrl: settings.gameLogoUrl || '',
      splashScreenUrl: settings.splashScreenUrl || '',
      announcementText: settings.announcementText || '',
      dynamicRules: settings.dynamicRules || '',
      bannerImagesText: (settings.bannerImages || []).join('\n'),
      adminAuthorizedEmailsText: (settings.adminAuthorizedEmails || []).join('\n'),
      adminAuthorizedPhonesText: (settings.adminAuthorizedPhones || []).join('\n'),
      primary: settings.appTheme?.primary || '#22c55e',
      secondary: settings.appTheme?.secondary || '#eab308',
      border: settings.appTheme?.border || '#334155',
      fontFamily: settings.appTheme?.fontFamily || 'Segoe UI, sans-serif',
    });

    setPaymentForm({
      easypaisaTitle: settings.easypaisaDetails?.accountTitle || '',
      easypaisaNumber: settings.easypaisaDetails?.accountNumber || '',
      jazzcashTitle: settings.jazzcashDetails?.accountTitle || '',
      jazzcashNumber: settings.jazzcashDetails?.accountNumber || '',
      bankTitle: settings.bankDetails?.accountTitle || '',
      bankNumber: settings.bankDetails?.accountNumber || '',
    });
  }, [settings]);

  useEffect(() => {
    if (!token || !authorized) return;

    loadUsersAndRequests();
  }, [token, authorized]);

  const loadUsersAndRequests = async () => {
    try {
      const [usersRes, requestsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin-panel/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/payments/admin/requests`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const usersData = await usersRes.json();
      const requestsData = await requestsRes.json();

      if (!usersRes.ok) throw new Error(usersData.message || 'Unable to load users.');
      if (!requestsRes.ok) throw new Error(requestsData.message || 'Unable to load payment requests.');

      setUsers(usersData.users || []);
      setRequests(requestsData.requests || []);
      setMessage('Data synchronized.');
    } catch (error) {
      setMessage(error.message || 'Failed to load admin data.');
    }
  };

  const saveBranding = async () => {
    setSaving(true);

    try {
      const preset = THEME_PRESETS[brandingForm.themeKey] || THEME_PRESETS.darkCasino;
      await saveSettings({
        appTheme: {
          ...preset,
          primary: brandingForm.primary,
          secondary: brandingForm.secondary,
          border: brandingForm.border,
          fontFamily: brandingForm.fontFamily,
        },
        gameLogoUrl: brandingForm.gameLogoUrl.trim(),
        splashScreenUrl: brandingForm.splashScreenUrl.trim(),
        announcementText: brandingForm.announcementText.trim(),
        dynamicRules: brandingForm.dynamicRules.trim(),
        bannerImages: brandingForm.bannerImagesText.split('\n').map((value) => value.trim()).filter(Boolean),
        adminAuthorizedEmails: brandingForm.adminAuthorizedEmailsText.split('\n').map((value) => value.trim().toLowerCase()).filter(Boolean),
        adminAuthorizedPhones: brandingForm.adminAuthorizedPhonesText.split('\n').map((value) => value.trim()).filter(Boolean),
      }, user?.email || user?.phone || 'admin');

      setMessage('Branding settings saved to Firestore.');
    } catch (error) {
      setMessage(error.message || 'Failed to save branding settings.');
    } finally {
      setSaving(false);
    }
  };

  const savePaymentDetails = async () => {
    setSaving(true);

    try {
      await saveSettings({
        easypaisaDetails: {
          accountTitle: paymentForm.easypaisaTitle.trim(),
          accountNumber: paymentForm.easypaisaNumber.trim(),
        },
        jazzcashDetails: {
          accountTitle: paymentForm.jazzcashTitle.trim(),
          accountNumber: paymentForm.jazzcashNumber.trim(),
        },
        bankDetails: {
          accountTitle: paymentForm.bankTitle.trim(),
          accountNumber: paymentForm.bankNumber.trim(),
        },
      }, user?.email || user?.phone || 'admin');

      setMessage('Payment setup updated in Firestore.');
    } catch (error) {
      setMessage(error.message || 'Failed to save payment settings.');
    } finally {
      setSaving(false);
    }
  };

  const updateUserBalance = async (userId) => {
    const draft = Number(balanceDrafts[userId]);
    const currentBalance = Number(users.find((item) => item._id === userId)?.coins || 0);
    const delta = draft - currentBalance;

    if (Number.isNaN(draft)) {
      setMessage('Enter a valid balance value.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/admin-panel/users/${userId}/coins`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: delta }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to update user balance.');

      setMessage('User balance updated successfully.');
      setBalanceDrafts((prev) => ({ ...prev, [userId]: '' }));
      await loadUsersAndRequests();
    } catch (error) {
      setMessage(error.message || 'Failed to update balance.');
    }
  };

  const reviewRequest = async (requestId, action) => {
    try {
      const response = await fetch(`${API_URL}/api/payments/admin/requests/${requestId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `Unable to ${action} request.`);

      setMessage(`Request ${action}d successfully.`);
      await loadUsersAndRequests();
    } catch (error) {
      setMessage(error.message || `Failed to ${action} request.`);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 p-10 text-white">Loading Firestore settings...</div>;
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 p-10 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6">
          <h1 className="text-2xl font-black text-rose-300">Access Denied</h1>
          <p className="mt-3 text-sm text-slate-300">
            Your account is not listed in authorized admin email/phone settings.
          </p>
          <button onClick={() => navigate('/')} className="mt-5 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">WIN TOON 786 Admin Control Panel</h1>
            <p className="mt-2 text-sm text-slate-400">No-code Firestore control for design, payments, and user operations.</p>
          </div>
          <button onClick={loadUsersAndRequests} className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950">Refresh</button>
        </div>

        {message && <div className="mb-5 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">{message}</div>}

        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${activeTab === tab.key ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'branding' && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-bold text-white">App Design & Branding</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-300">Theme Preset
                <select value={brandingForm.themeKey} onChange={(event) => setBrandingForm((prev) => ({ ...prev, themeKey: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2">
                  {Object.values(THEME_PRESETS).map((theme) => <option key={theme.key} value={theme.key}>{theme.name}</option>)}
                </select>
              </label>

              <label className="text-sm text-slate-300">Game Logo URL
                <input value={brandingForm.gameLogoUrl} onChange={(event) => setBrandingForm((prev) => ({ ...prev, gameLogoUrl: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>

              <label className="text-sm text-slate-300">Splash Screen URL
                <input value={brandingForm.splashScreenUrl} onChange={(event) => setBrandingForm((prev) => ({ ...prev, splashScreenUrl: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>

              <label className="text-sm text-slate-300">Font Family
                <input value={brandingForm.fontFamily} onChange={(event) => setBrandingForm((prev) => ({ ...prev, fontFamily: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>

              <label className="text-sm text-slate-300">Primary Color
                <input type="color" value={brandingForm.primary} onChange={(event) => setBrandingForm((prev) => ({ ...prev, primary: event.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-2" />
              </label>

              <label className="text-sm text-slate-300">Secondary Color
                <input type="color" value={brandingForm.secondary} onChange={(event) => setBrandingForm((prev) => ({ ...prev, secondary: event.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-2" />
              </label>

              <label className="text-sm text-slate-300">Border Color
                <input type="color" value={brandingForm.border} onChange={(event) => setBrandingForm((prev) => ({ ...prev, border: event.target.value }))} className="mt-1 h-11 w-full rounded-xl border border-slate-700 bg-slate-950 px-2" />
              </label>

              <label className="text-sm text-slate-300 md:col-span-2">Announcement Text
                <textarea value={brandingForm.announcementText} onChange={(event) => setBrandingForm((prev) => ({ ...prev, announcementText: event.target.value }))} rows={3} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>

              <label className="text-sm text-slate-300 md:col-span-2">Dynamic Rules
                <textarea value={brandingForm.dynamicRules} onChange={(event) => setBrandingForm((prev) => ({ ...prev, dynamicRules: event.target.value }))} rows={3} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>

              <label className="text-sm text-slate-300 md:col-span-2">Homepage Banner Image URLs (one per line)
                <textarea value={brandingForm.bannerImagesText} onChange={(event) => setBrandingForm((prev) => ({ ...prev, bannerImagesText: event.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>

              <label className="text-sm text-slate-300">Authorized Admin Emails (one per line)
                <textarea value={brandingForm.adminAuthorizedEmailsText} onChange={(event) => setBrandingForm((prev) => ({ ...prev, adminAuthorizedEmailsText: event.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>

              <label className="text-sm text-slate-300">Authorized Admin Phones (one per line)
                <textarea value={brandingForm.adminAuthorizedPhonesText} onChange={(event) => setBrandingForm((prev) => ({ ...prev, adminAuthorizedPhonesText: event.target.value }))} rows={4} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>
            </div>

            <button onClick={saveBranding} disabled={saving} className="mt-5 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-bold text-slate-950 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Branding to Firestore'}
            </button>
          </section>
        )}

        {activeTab === 'payments' && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-bold text-white">Payment Setup</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-300">EasyPaisa Account Title
                <input value={paymentForm.easypaisaTitle} onChange={(event) => setPaymentForm((prev) => ({ ...prev, easypaisaTitle: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-300">EasyPaisa Account Number
                <input value={paymentForm.easypaisaNumber} onChange={(event) => setPaymentForm((prev) => ({ ...prev, easypaisaNumber: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>

              <label className="text-sm text-slate-300">JazzCash Account Title
                <input value={paymentForm.jazzcashTitle} onChange={(event) => setPaymentForm((prev) => ({ ...prev, jazzcashTitle: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-300">JazzCash Account Number
                <input value={paymentForm.jazzcashNumber} onChange={(event) => setPaymentForm((prev) => ({ ...prev, jazzcashNumber: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>

              <label className="text-sm text-slate-300">Bank Account Title
                <input value={paymentForm.bankTitle} onChange={(event) => setPaymentForm((prev) => ({ ...prev, bankTitle: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>
              <label className="text-sm text-slate-300">Bank Account Number / IBAN
                <input value={paymentForm.bankNumber} onChange={(event) => setPaymentForm((prev) => ({ ...prev, bankNumber: event.target.value }))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" />
              </label>
            </div>

            <button onClick={savePaymentDetails} disabled={saving} className="mt-5 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-bold text-slate-950 disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Payment Details'}
            </button>
          </section>
        )}

        {activeTab === 'users' && (
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-bold text-white">User Balances & Requests</h2>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-sm font-semibold text-white">Pending Deposits</p>
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                  {pendingDeposits.length ? pendingDeposits.map((request) => (
                    <div key={request.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm">
                      <p className="font-semibold text-white">{request.userName} • {formatMoney(request.amount)}</p>
                      <p className="text-xs text-slate-400">{request.gateway} • {request.transactionId}</p>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => reviewRequest(request.id, 'approve')} className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950">Approve</button>
                        <button onClick={() => reviewRequest(request.id, 'reject')} className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white">Reject</button>
                      </div>
                    </div>
                  )) : <p className="text-xs text-slate-500">No pending deposit requests.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-sm font-semibold text-white">Pending Withdrawals</p>
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                  {pendingWithdrawals.length ? pendingWithdrawals.map((request) => (
                    <div key={request.id} className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm">
                      <p className="font-semibold text-white">{request.userName} • {formatMoney(request.amount)}</p>
                      <p className="text-xs text-slate-400">{request.accountDetails}</p>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => reviewRequest(request.id, 'approve')} className="rounded-lg bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950">Approve</button>
                        <button onClick={() => reviewRequest(request.id, 'reject')} className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-semibold text-white">Reject</button>
                      </div>
                    </div>
                  )) : <p className="text-xs text-slate-500">No pending withdrawal requests.</p>}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm font-semibold text-white">Adjust User Coins</p>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-left text-slate-400">
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Current Coins</th>
                      <th className="px-3 py-2">Target Coins</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item._id} className="border-b border-slate-800/60">
                        <td className="px-3 py-2 text-white">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.email || item.phone}</p>
                        </td>
                        <td className="px-3 py-2 text-slate-300">{formatMoney(item.coins)}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={balanceDrafts[item._id] ?? ''}
                            onChange={(event) => setBalanceDrafts((prev) => ({ ...prev, [item._id]: event.target.value }))}
                            placeholder="Set target"
                            className="w-28 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <button onClick={() => updateUserBalance(item._id)} className="rounded-lg bg-cyan-500 px-3 py-1 text-xs font-semibold text-slate-950">Update</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
