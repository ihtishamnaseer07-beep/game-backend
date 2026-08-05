import { useEffect, useMemo, useRef, useState } from 'react';
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db } from './firebase';

const AUTHORIZED_EMAIL = 'ihtishamnaseer07@gmail.com';
const AUTHORIZED_PHONE = '+966593686007';

const defaultSettings = {
  appTheme: {
    key: 'adminManaged',
    name: 'Admin Managed',
    primary: '#19c37d',
    secondary: '#e8a23a',
    border: '#27324c',
    background: 'radial-gradient(circle at top, rgba(25,195,125,0.12), transparent 40%), #050816',
    fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
    buttonRadius: 10,
  },
  gameLogoUrl: '',
  splashScreenUrl: '',
  announcementText: '',
  dynamicRules: '',
  bannerImages: [],
  gameCatalog: [
    {
      id: 'default',
      title: 'Dragon vs Tiger',
      gameType: '2d',
      renderMode: 'iframe',
      thumbnailUrl: '',
      sourceUrl: '',
      isActive: true,
    },
  ],
  easypaisaDetails: { accountTitle: '', accountNumber: '' },
  jazzcashDetails: { accountTitle: '', accountNumber: '' },
  bankDetails: { accountTitle: '', accountNumber: '' },
};

function normalizeEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function normalizePhone(value = '') {
  const stripped = String(value || '').replace(/[\s\-()]/g, '');
  return stripped.startsWith('+') ? stripped : `+${stripped}`;
}

function isAuthorizedOwner(user) {
  if (!user) return false;
  const emailMatch = normalizeEmail(user.email) === AUTHORIZED_EMAIL;
  const phoneMatch = normalizePhone(user.phoneNumber || '') === AUTHORIZED_PHONE;
  return emailMatch || phoneMatch;
}

function ensureOneActiveGame(catalog = []) {
  const list = Array.isArray(catalog) ? catalog : [];
  if (!list.length) return defaultSettings.gameCatalog;

  let found = false;
  const normalized = list.map((item, index) => {
    const active = Boolean(item?.isActive) && !found;
    if (active) found = true;

    return {
      id: String(item?.id || `game-${index + 1}`),
      title: String(item?.title || `Game ${index + 1}`),
      gameType: item?.gameType === '3d-webgl' ? '3d-webgl' : '2d',
      renderMode: item?.renderMode === 'webgl-path' ? 'webgl-path' : 'iframe',
      thumbnailUrl: String(item?.thumbnailUrl || ''),
      sourceUrl: String(item?.sourceUrl || ''),
      isActive: active,
    };
  });

  if (!found && normalized.length) {
    normalized[0].isActive = true;
  }

  return normalized;
}

function mapSettings(docData = {}) {
  return {
    ...defaultSettings,
    ...(docData || {}),
    appTheme: {
      ...defaultSettings.appTheme,
      ...(docData.appTheme || {}),
    },
    easypaisaDetails: {
      ...defaultSettings.easypaisaDetails,
      ...(docData.easypaisaDetails || {}),
    },
    jazzcashDetails: {
      ...defaultSettings.jazzcashDetails,
      ...(docData.jazzcashDetails || {}),
    },
    bankDetails: {
      ...defaultSettings.bankDetails,
      ...(docData.bankDetails || {}),
    },
    bannerImages: Array.isArray(docData.bannerImages) ? docData.bannerImages : [],
    gameCatalog: ensureOneActiveGame(docData.gameCatalog),
  };
}

function LoginView({ onGoogle, onStartOtp, otpOpen, otpState, onOtpChange, onSendOtp, onVerifyOtp, onCloseOtp, busy, error }) {
  return (
    <div className="login-wrap">
      <div className="card login-card">
        <h1 className="title">WIN TOON 786 Admin</h1>
        <p className="subtle">Root route / is restricted to owner login only.</p>
        <div className="notice">
          <div>Authorized Email: {AUTHORIZED_EMAIL}</div>
          <div>Authorized Phone: {AUTHORIZED_PHONE}</div>
        </div>

        {error && <div className="notice" style={{ borderColor: '#f87171' }}>{error}</div>}

        <div className="form-row">
          <button className="btn" onClick={onGoogle} disabled={busy}>Continue with Google</button>
          <button className="btn ghost" onClick={onStartOtp} disabled={busy}>Continue with Phone OTP</button>
        </div>

        {otpOpen && (
          <div className="notice">
            <div className="form-row">
              <label>Phone Number</label>
              <input className="input" value={otpState.phone} onChange={(e) => onOtpChange('phone', e.target.value)} placeholder="+966593686007" />
            </div>
            <div className="toolbar" style={{ marginTop: 10 }}>
              <button className="btn" onClick={onSendOtp} disabled={busy}>Send OTP</button>
              <button className="btn ghost" onClick={onCloseOtp} disabled={busy}>Cancel</button>
            </div>
            {otpState.sent && (
              <>
                <div className="form-row" style={{ marginTop: 10 }}>
                  <label>6-digit OTP</label>
                  <input className="input" value={otpState.code} onChange={(e) => onOtpChange('code', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" />
                </div>
                <button className="btn" style={{ marginTop: 10 }} onClick={onVerifyOtp} disabled={busy}>Verify OTP</button>
              </>
            )}
            <div id="admin-otp-recaptcha" />
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardView({
  owner,
  sidebarCollapsed,
  onToggleSidebar,
  tab,
  setTab,
  settings,
  patch,
  saveSettings,
  users,
  requests,
  loading,
  saving,
  onBalanceChange,
  onApprove,
  onReject,
  onSignOut,
}) {
  const bannerText = (settings.bannerImages || []).join('\n');
  const depositRequests = requests.filter((item) => item.type === 'deposit');
  const withdrawalRequests = requests.filter((item) => item.type === 'withdrawal');

  return (
    <div className={`panel-wrap ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <aside className="card side">
        <div className="sidebar-top">
          <h3>Admin</h3>
          <button className="btn ghost collapse-btn" onClick={onToggleSidebar}>{sidebarCollapsed ? '>>' : '<<'}</button>
        </div>
        <div style={{ fontSize: 13, marginBottom: 12 }}>{owner?.email || owner?.phoneNumber || 'Owner'}</div>
        <button className={`tab-btn ${tab === 'branding' ? 'active' : ''}`} onClick={() => setTab('branding')}>Branding and Theme</button>
        <button className={`tab-btn ${tab === 'games' ? 'active' : ''}`} onClick={() => setTab('games')}>Games (2D/3D)</button>
        <button className={`tab-btn ${tab === 'payments' ? 'active' : ''}`} onClick={() => setTab('payments')}>Payment Accounts</button>
        <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>User Balances and Requests</button>
        <button className={`tab-btn ${tab === 'announcements' ? 'active' : ''}`} onClick={() => setTab('announcements')}>Announcements</button>
        <button className="tab-btn" onClick={onSignOut}>Sign out</button>
      </aside>

      <section className="card content">
        {tab === 'branding' && (
          <>
            <h2 className="title" style={{ fontSize: 22 }}>Branding and Theme</h2>
            <p className="subtle">Real-time updates for visuals, announcements, and active 2D/3D game URLs.</p>
            <div className="grid-2">
              <div className="form-row"><label>Primary Color</label><input type="color" className="input color-input" value={settings.appTheme.primary} onChange={(e) => patch(['appTheme', 'primary'], e.target.value)} /></div>
              <div className="form-row"><label>Secondary Color</label><input type="color" className="input color-input" value={settings.appTheme.secondary} onChange={(e) => patch(['appTheme', 'secondary'], e.target.value)} /></div>
              <div className="form-row"><label>Border Color</label><input type="color" className="input color-input" value={settings.appTheme.border} onChange={(e) => patch(['appTheme', 'border'], e.target.value)} /></div>
              <div className="form-row"><label>Background</label><input className="input" value={settings.appTheme.background} onChange={(e) => patch(['appTheme', 'background'], e.target.value)} /></div>
              <div className="form-row"><label>Logo URL</label><input className="input" value={settings.gameLogoUrl} onChange={(e) => patch(['gameLogoUrl'], e.target.value)} /></div>
              <div className="form-row"><label>Splash URL</label><input className="input" value={settings.splashScreenUrl} onChange={(e) => patch(['splashScreenUrl'], e.target.value)} /></div>
            </div>
            <button className="btn" onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save Branding'}</button>
          </>
        )}

        {tab === 'games' && (
          <>
            <h3 style={{ marginTop: 16 }}>Active Game URLs (2D/3D)</h3>
            {(settings.gameCatalog || []).map((game, index) => (
              <div key={game.id} className="notice" style={{ marginTop: 8 }}>
                <div className="grid-3">
                  <div className="form-row"><label>Title</label><input className="input" value={game.title} onChange={(e) => {
                    const next = [...settings.gameCatalog];
                    next[index] = { ...game, title: e.target.value };
                    patch(['gameCatalog'], ensureOneActiveGame(next));
                  }} /></div>
                  <div className="form-row"><label>Type</label><select className="select" value={game.gameType} onChange={(e) => {
                    const next = [...settings.gameCatalog];
                    next[index] = { ...game, gameType: e.target.value };
                    patch(['gameCatalog'], ensureOneActiveGame(next));
                  }}><option value="2d">2D</option><option value="3d-webgl">3D WebGL</option></select></div>
                  <div className="form-row"><label>Mode</label><select className="select" value={game.renderMode} onChange={(e) => {
                    const next = [...settings.gameCatalog];
                    next[index] = { ...game, renderMode: e.target.value };
                    patch(['gameCatalog'], ensureOneActiveGame(next));
                  }}><option value="iframe">iFrame URL</option><option value="webgl-path">WebGL Path</option></select></div>
                </div>
                <div className="form-row"><label>Source URL / Path</label><input className="input" value={game.sourceUrl} onChange={(e) => {
                  const next = [...settings.gameCatalog];
                  next[index] = { ...game, sourceUrl: e.target.value };
                  patch(['gameCatalog'], ensureOneActiveGame(next));
                }} /></div>
                <div className="form-row"><label>Thumbnail URL</label><input className="input" value={game.thumbnailUrl || ''} onChange={(e) => {
                  const next = [...settings.gameCatalog];
                  next[index] = { ...game, thumbnailUrl: e.target.value };
                  patch(['gameCatalog'], ensureOneActiveGame(next));
                }} /></div>
                <div className="toolbar" style={{ marginTop: 10 }}>
                  <button className="btn ghost" onClick={() => {
                    const next = settings.gameCatalog.map((entry, entryIndex) => ({ ...entry, isActive: entryIndex === index }));
                    patch(['gameCatalog'], ensureOneActiveGame(next));
                  }}>{game.isActive ? 'Active' : 'Set Active'}</button>
                  <button className="btn danger" onClick={() => {
                    const next = settings.gameCatalog.filter((_, entryIndex) => entryIndex !== index);
                    patch(['gameCatalog'], ensureOneActiveGame(next));
                  }}>Remove</button>
                </div>
              </div>
            ))}

            <div className="toolbar" style={{ marginTop: 12 }}>
              <button className="btn ghost" onClick={() => patch(['gameCatalog'], ensureOneActiveGame([
                ...(settings.gameCatalog || []),
                {
                  id: `game-${Date.now()}`,
                  title: '',
                  gameType: '2d',
                  renderMode: 'iframe',
                  thumbnailUrl: '',
                  sourceUrl: '',
                  isActive: false,
                },
              ]))}>Add Game</button>
              <button className="btn" onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save Games'}</button>
            </div>
          </>
        )}

        {tab === 'payments' && (
          <>
            <h2 className="title" style={{ fontSize: 22 }}>Payment Accounts</h2>
            <p className="subtle">Instant editing for EasyPaisa, JazzCash, and Bank accounts.</p>
            <div className="grid-3">
              <div className="notice">
                <h4>EasyPaisa</h4>
                <div className="form-row"><label>Account Title</label><input className="input" value={settings.easypaisaDetails.accountTitle} onChange={(e) => patch(['easypaisaDetails', 'accountTitle'], e.target.value)} /></div>
                <div className="form-row"><label>Account Number</label><input className="input" value={settings.easypaisaDetails.accountNumber} onChange={(e) => patch(['easypaisaDetails', 'accountNumber'], e.target.value)} /></div>
              </div>
              <div className="notice">
                <h4>JazzCash</h4>
                <div className="form-row"><label>Account Title</label><input className="input" value={settings.jazzcashDetails.accountTitle} onChange={(e) => patch(['jazzcashDetails', 'accountTitle'], e.target.value)} /></div>
                <div className="form-row"><label>Account Number</label><input className="input" value={settings.jazzcashDetails.accountNumber} onChange={(e) => patch(['jazzcashDetails', 'accountNumber'], e.target.value)} /></div>
              </div>
              <div className="notice">
                <h4>Bank</h4>
                <div className="form-row"><label>Account Title</label><input className="input" value={settings.bankDetails.accountTitle} onChange={(e) => patch(['bankDetails', 'accountTitle'], e.target.value)} /></div>
                <div className="form-row"><label>Account Number / IBAN</label><input className="input" value={settings.bankDetails.accountNumber} onChange={(e) => patch(['bankDetails', 'accountNumber'], e.target.value)} /></div>
              </div>
            </div>
            <button className="btn" style={{ marginTop: 12 }} onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save Payments'}</button>
          </>
        )}

        {tab === 'users' && (
          <>
            <h2 className="title" style={{ fontSize: 22 }}>User Balances and Requests</h2>
            <p className="subtle">Approve/reject deposit and withdrawal requests and adjust user coins.</p>

            <h3 style={{ marginTop: 12 }}>Deposit Requests</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>User</th>
                    <th>Gateway</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {depositRequests.map((item) => (
                    <tr key={item.id}>
                      <td>{item.type || '-'}</td>
                      <td>{item.userName || item.userEmail || item.userId || '-'}</td>
                      <td>{item.gateway || '-'}</td>
                      <td>{Number(item.amount || 0).toLocaleString('en-PK')}</td>
                      <td>{item.status || '-'}</td>
                      <td>
                        {item.status === 'pending' ? (
                          <div className="toolbar">
                            <button className="btn" onClick={() => onApprove(item.id)}>Approve</button>
                            <button className="btn danger" onClick={() => onReject(item.id)}>Reject</button>
                          </div>
                        ) : (
                          'Processed'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ marginTop: 16 }}>Withdrawal Requests</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>User</th>
                    <th>Gateway</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalRequests.map((item) => (
                    <tr key={item.id}>
                      <td>{item.type || '-'}</td>
                      <td>{item.userName || item.userEmail || item.userId || '-'}</td>
                      <td>{item.gateway || '-'}</td>
                      <td>{Number(item.amount || 0).toLocaleString('en-PK')}</td>
                      <td>{item.status || '-'}</td>
                      <td>
                        {item.status === 'pending' ? (
                          <div className="toolbar">
                            <button className="btn" onClick={() => onApprove(item.id)}>Approve</button>
                            <button className="btn danger" onClick={() => onReject(item.id)}>Reject</button>
                          </div>
                        ) : (
                          'Processed'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ marginTop: 16 }}>Users</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Coins</th>
                    <th>Adjust</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name || '-'}</td>
                      <td>{item.email || '-'}</td>
                      <td>{item.phone || '-'}</td>
                      <td>{Number(item.coins || 0).toLocaleString('en-PK')}</td>
                      <td>
                        <div className="toolbar">
                          <button className="btn" disabled={loading[item.id]} onClick={() => onBalanceChange(item.id, 100)}>{loading[item.id] ? '...' : '+100'}</button>
                          <button className="btn warn" disabled={loading[item.id]} onClick={() => onBalanceChange(item.id, -100)}>{loading[item.id] ? '...' : '-100'}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'announcements' && (
          <>
            <h2 className="title" style={{ fontSize: 22 }}>Announcements</h2>
            <p className="subtle">Manage dynamic notices and rule text shown in the player app.</p>
            <div className="form-row"><label>Announcement</label><textarea className="textarea" value={settings.announcementText} onChange={(e) => patch(['announcementText'], e.target.value)} /></div>
            <div className="form-row"><label>Dynamic Rules</label><textarea className="textarea" value={settings.dynamicRules} onChange={(e) => patch(['dynamicRules'], e.target.value)} /></div>
            <div className="form-row"><label>Banner Images (one URL per line)</label><textarea className="textarea" value={bannerText} onChange={(e) => patch(['bannerImages'], e.target.value.split('\n').map((v) => v.trim()).filter(Boolean))} /></div>
            <button className="btn" onClick={saveSettings} disabled={saving}>{saving ? 'Saving...' : 'Save Announcements'}</button>
          </>
        )}
      </section>
    </div>
  );
}

export default function App() {
  const recaptchaRef = useRef(null);
  const confirmationRef = useRef(null);

  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const [busy, setBusy] = useState(false);

  const [otpOpen, setOtpOpen] = useState(false);
  const [otpState, setOtpState] = useState({ phone: AUTHORIZED_PHONE, sent: false, code: '' });

  const [settings, setSettings] = useState(defaultSettings);
  const [settingsDraft, setSettingsDraft] = useState(defaultSettings);
  const [savingSettings, setSavingSettings] = useState(false);

  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState('branding');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rowLoading, setRowLoading] = useState({});

  const authorized = useMemo(() => isAuthorizedOwner(firebaseUser), [firebaseUser]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setFirebaseUser(nextUser);
      setAuthReady(true);

      if (nextUser && !isAuthorizedOwner(nextUser)) {
        await signOut(auth).catch(() => {});
        setAuthError('Access denied. This dashboard is restricted to the authorized owner only.');
      } else {
        setAuthError('');
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authorized) return undefined;

    const docRef = doc(db, 'settings', 'app');
    const unsub = onSnapshot(docRef, async (snap) => {
      if (!snap.exists()) {
        await setDoc(docRef, {
          ...defaultSettings,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        setSettings(defaultSettings);
        setSettingsDraft(defaultSettings);
        return;
      }

      const mapped = mapSettings(snap.data());
      setSettings(mapped);
      setSettingsDraft(mapped);
    });

    return () => unsub();
  }, [authorized]);

  useEffect(() => {
    if (!authorized) return undefined;

    const usersQ = collection(db, 'users');
    const requestsQ = collection(db, 'paymentRequests');

    const unsubUsers = onSnapshot(usersQ, (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubRequests = onSnapshot(requestsQ, (snap) => {
      setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubUsers();
      unsubRequests();
    };
  }, [authorized]);

  const patchDraft = (path, value) => {
    setSettingsDraft((prev) => {
      const next = structuredClone(prev);
      if (path.length === 1) {
        next[path[0]] = value;
      } else {
        next[path[0]] = { ...next[path[0]], [path[1]]: value };
      }
      return next;
    });
  };

  const saveSettings = async () => {
    if (!authorized) return;

    setSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'app'), {
        ...settingsDraft,
        gameCatalog: ensureOneActiveGame(settingsDraft.gameCatalog),
        updatedAt: serverTimestamp(),
        updatedBy: AUTHORIZED_EMAIL,
      }, { merge: true });
    } finally {
      setSavingSettings(false);
    }
  };

  const loginGoogle = async () => {
    setBusy(true);
    setAuthError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);

      if (!isAuthorizedOwner(result.user)) {
        await signOut(auth).catch(() => {});
        setAuthError('Access denied. Please use the authorized owner Google account.');
      }
    } catch (error) {
      setAuthError(error.message || 'Google login failed.');
    } finally {
      setBusy(false);
    }
  };

  const startOtp = () => {
    setOtpOpen(true);
    setOtpState({ phone: AUTHORIZED_PHONE, sent: false, code: '' });
    setAuthError('');
  };

  const setOtpField = (key, value) => {
    setOtpState((prev) => ({ ...prev, [key]: value }));
  };

  const getRecaptcha = async () => {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, 'admin-otp-recaptcha', {
        size: 'invisible',
      });
      await recaptchaRef.current.render();
    }
    return recaptchaRef.current;
  };

  const sendOtp = async () => {
    setBusy(true);
    setAuthError('');

    try {
      const phone = normalizePhone(otpState.phone);
      if (phone !== AUTHORIZED_PHONE) {
        throw new Error('Only the authorized owner phone number is allowed.');
      }

      const verifier = await getRecaptcha();
      confirmationRef.current = await signInWithPhoneNumber(auth, phone, verifier);
      setOtpState((prev) => ({ ...prev, sent: true }));
    } catch (error) {
      setAuthError(error.message || 'OTP send failed.');
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setBusy(true);
    setAuthError('');
    try {
      if (!confirmationRef.current) {
        throw new Error('Send OTP first.');
      }

      const result = await confirmationRef.current.confirm(otpState.code);
      if (!isAuthorizedOwner(result.user)) {
        await signOut(auth).catch(() => {});
        throw new Error('Access denied. Unauthorized phone account.');
      }

      setOtpOpen(false);
    } catch (error) {
      setAuthError(error.message || 'OTP verification failed.');
    } finally {
      setBusy(false);
    }
  };

  const signOutOwner = async () => {
    await signOut(auth).catch(() => {});
  };

  const updateBalance = async (userId, delta) => {
    setRowLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await updateDoc(doc(db, 'users', userId), {
        coins: increment(delta),
        updatedAt: serverTimestamp(),
      });
    } finally {
      setRowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const approveRequest = async (requestId) => {
    const requestRef = doc(db, 'paymentRequests', requestId);
    const snap = await getDoc(requestRef);
    if (!snap.exists()) return;

    const data = snap.data();
    if (data.status !== 'pending') return;

    const batch = writeBatch(db);
    batch.update(requestRef, {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      reviewedBy: AUTHORIZED_EMAIL,
    });

    if (data.userId && data.amount) {
      const userRef = doc(db, 'users', data.userId);
      const amount = Number(data.amount) || 0;
      const delta = data.type === 'withdrawal' ? -Math.abs(amount) : Math.abs(amount);
      batch.update(userRef, {
        coins: increment(delta),
        updatedAt: serverTimestamp(),
      });
    }

    await batch.commit();
  };

  const rejectRequest = async (requestId) => {
    await updateDoc(doc(db, 'paymentRequests', requestId), {
      status: 'rejected',
      reviewedAt: serverTimestamp(),
      reviewedBy: AUTHORIZED_EMAIL,
    });
  };

  if (!authReady) {
    return <div className="app-shell">Loading...</div>;
  }

  return (
    <div className="app-shell">
      {!authorized ? (
        <LoginView
          onGoogle={loginGoogle}
          onStartOtp={startOtp}
          otpOpen={otpOpen}
          otpState={otpState}
          onOtpChange={setOtpField}
          onSendOtp={sendOtp}
          onVerifyOtp={verifyOtp}
          onCloseOtp={() => setOtpOpen(false)}
          busy={busy}
          error={authError}
        />
      ) : (
        <DashboardView
          owner={firebaseUser}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
          tab={tab}
          setTab={setTab}
          settings={settingsDraft}
          patch={patchDraft}
          saveSettings={saveSettings}
          users={users}
          requests={requests}
          loading={rowLoading}
          saving={savingSettings}
          onBalanceChange={updateBalance}
          onApprove={approveRequest}
          onReject={rejectRequest}
          onSignOut={signOutOwner}
        />
      )}
    </div>
  );
}
