import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import NavBar from '../common/NavBar';
import SectionHeading from '../common/SectionHeading';
import { API_URL } from '../../config';

const ADMIN_KEY = 'admin786';
const ADMIN_ACCESS_STORAGE_KEY = 'wt786_admin_access';
const ADMIN_SETTINGS_STORAGE_KEY = 'wt786_admin_game_settings';
const DEPOSIT_REQUESTS_STORAGE_KEY = 'wt786_admin_deposit_requests';
const WITHDRAWAL_REQUESTS_STORAGE_KEY = 'wt786_admin_withdrawal_requests';

const GAME_NAMES = ['Aviator', 'Dragon vs Lion', 'Slots'];
const PAYMENT_GATEWAYS = ['EasyPaisa', 'JazzCash'];
const BET_LEVELS = [50, 100, 250, 500, 1000];

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

function formatMoney(value = 0) {
  return `Rs ${Number(value || 0).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString();
}

function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildInitialDepositRequests(users = []) {
  const seedUsers = users.slice(0, 4);
  const requests = seedUsers.map((user, index) => ({
    id: makeId('dep'),
    userId: user._id,
    userName: user.name,
    amount: [1500, 2500, 3200, 1800][index] || 1200,
    gateway: PAYMENT_GATEWAYS[index % PAYMENT_GATEWAYS.length],
    tid: `TID-${Math.floor(100000 + Math.random() * 900000)}`,
    proof: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=240&q=80`,
    status: index === 0 ? 'approved' : 'pending',
    createdAt: new Date(Date.now() - index * 86400000).toISOString(),
  }));

  if (!requests.length) {
    requests.push({
      id: makeId('dep'),
      userId: '',
      userName: 'Pending Player',
      amount: 1500,
      gateway: 'EasyPaisa',
      tid: 'TID-000000',
      proof: '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  return requests;
}

function buildInitialWithdrawalRequests(users = []) {
  const seedUsers = users.slice(1, 4);
  const requests = seedUsers.map((user, index) => ({
    id: makeId('wd'),
    userId: user._id,
    userName: user.name,
    amount: [900, 1200, 750][index] || 800,
    accountDetails: index % 2 === 0 ? 'EasyPaisa • 0300 1234567' : 'JazzCash • 0301 7654321',
    status: 'pending',
    createdAt: new Date(Date.now() - index * 43200000).toISOString(),
  }));

  if (!requests.length) {
    requests.push({
      id: makeId('wd'),
      userId: '',
      userName: 'Pending Player',
      amount: 1000,
      accountDetails: 'JazzCash • 0300 0000000',
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  return requests;
}

function StatCard({ label, value, hint, tone = 'cyan' }) {
  const toneClass =
    tone === 'emerald'
      ? 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20 text-emerald-300'
      : tone === 'amber'
        ? 'from-amber-500/15 to-amber-500/5 border-amber-500/20 text-amber-300'
        : tone === 'rose'
          ? 'from-rose-500/15 to-rose-500/5 border-rose-500/20 text-rose-300'
          : 'from-cyan-500/15 to-cyan-500/5 border-cyan-500/20 text-cyan-300';

  return (
    <div className={`rounded-[28px] border bg-gradient-to-br p-5 shadow-xl ${toneClass}`}>
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-300/90">{hint}</p>
    </div>
  );
}

function SectionCard({ title, description, children, action }) {
  return (
    <section className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function AccessGate({ onUnlock, onRoleUnlock, loadingRole }) {
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(true);

  const submit = (event) => {
    event.preventDefault();
    if (adminKey.trim() !== ADMIN_KEY) {
      setError('Invalid admin key.');
      return;
    }
    onUnlock(remember);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(250,204,21,0.14),_transparent_30%),_rgb(15,23,42)] text-slate-100">
      <NavBar />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-14 sm:px-6 lg:px-8">
        <div className="w-full rounded-[32px] border border-slate-800 bg-slate-950/90 p-6 shadow-2xl shadow-black/30 ring-1 ring-slate-700 sm:p-8">
          <SectionHeading title="Hidden Access" description="WIN TOON 786 Admin Dashboard" />
          <p className="mb-6 text-sm text-slate-400">
            Enter the admin key or sign in with an account whose role is already set to admin.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Admin Key</span>
              <input
                type="password"
                value={adminKey}
                onChange={(event) => {
                  setAdminKey(event.target.value);
                  setError('');
                }}
                placeholder="Enter admin786"
                className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-cyan-500"
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500"
              />
              Remember this device
            </label>

            {error && <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div>}

            <button
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:from-cyan-400 hover:to-emerald-400"
            >
              Open Admin Dashboard
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-400">
            <p className="font-semibold text-white">Role-based access</p>
            <p className="mt-1">
              If your logged-in account already has the <span className="text-cyan-300">admin</span> or <span className="text-cyan-300">superadmin</span> role,
              the dashboard opens automatically.
            </p>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Current role check: {loadingRole ? 'Checking...' : 'Ready'}
          </div>
        </div>
      </main>
    </div>
  );
}

function HistoryModal({ user, onClose, coinsHistory, supportHistory, gameHistory }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="w-full max-w-4xl rounded-[32px] border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">User History</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{user.name}</h3>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>
          <button onClick={onClose} className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm font-semibold text-white">Wallet / Transactions</p>
            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-2">
              {coinsHistory.length ? coinsHistory.map((entry) => (
                <div key={entry._id || entry.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
                  <p className="font-semibold text-white">{formatMoney(entry.amount)}</p>
                  <p className="text-xs text-slate-400">{formatDate(entry.createdAt)}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No coin activity found.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm font-semibold text-white">Support / Team Activity</p>
            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-2">
              {supportHistory.length ? supportHistory.map((entry) => (
                <div key={entry._id || entry.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
                  <p className="font-semibold text-white">{entry.team?.name || 'Team'}</p>
                  <p className="text-xs text-slate-400">Coins: {entry.coins}</p>
                  <p className="text-xs text-slate-500">{formatDate(entry.createdAt)}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No support activity found.</p>}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-sm font-semibold text-white">Game History</p>
            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto pr-2">
              {gameHistory.length ? gameHistory.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm">
                  <p className="font-semibold text-white">{entry.game}</p>
                  <p className={`text-xs ${entry.outcome === 'Win' ? 'text-emerald-300' : 'text-rose-300'}`}>{entry.outcome} • {formatMoney(entry.delta)}</p>
                  <p className="text-xs text-slate-500">{formatDate(entry.createdAt)}</p>
                </div>
              )) : <p className="text-sm text-slate-400">No game activity found.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RequestTable({ title, columns, rows, emptyText, onApprove, onReject }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{rows.length} items</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-slate-400">
              {columns.map((column) => (
                <th key={column} className="px-3 py-2 font-medium">{column}</th>
              ))}
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-800/60 last:border-0">
                {row.cells.map((cell, index) => (
                  <td key={`${row.id}-${index}`} className="px-3 py-3 text-slate-200">{cell}</td>
                ))}
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => onApprove(row.id)} className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950">Approve</button>
                    <button onClick={() => onReject(row.id)} className="rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white">Reject</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-6 text-center text-sm text-slate-500">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GameMonitorCard({ game, mode, winRate, liveBets }) {
  const recent = liveBets.filter((bet) => bet.game === game).slice(0, 3);
  const wins = liveBets.filter((bet) => bet.game === game && bet.outcome === 'Win').length;
  const losses = liveBets.filter((bet) => bet.game === game && bet.outcome === 'Lose').length;
  const total = wins + losses;
  const ratio = total ? Math.round((wins / total) * 100) : winRate;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">{game}</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{mode === 'auto' ? 'Automated' : 'Manual'} outcome mode</h3>
        </div>
        <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">{ratio}% Win Rate</div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500" style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }} />
      </div>
      <div className="mt-4 space-y-3">
        {recent.length ? recent.map((bet) => (
          <div key={bet.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm">
            <div>
              <p className="font-semibold text-white">{bet.userName}</p>
              <p className="text-xs text-slate-500">Bet {formatMoney(bet.amount)} • {formatDate(bet.createdAt)}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${bet.outcome === 'Win' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
              {bet.outcome}
            </span>
          </div>
        )) : <p className="text-sm text-slate-500">No live bets tracked yet.</p>}
      </div>
    </div>
  );
}

function DashboardContent({ onLogout }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { playSound } = useSound();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [packages, setPackages] = useState([]);
  const [supportHistory, setSupportHistory] = useState([]);
  const [coinHistory, setCoinHistory] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceDrafts, setBalanceDrafts] = useState({});
  const [depositRequests, setDepositRequests] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [gameSettings, setGameSettings] = useState(() => readJsonStorage(ADMIN_SETTINGS_STORAGE_KEY, { mode: 'auto', winRate: 56 }));
  const [liveBets, setLiveBets] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const betsTickRef = useRef(null);
  const token = localStorage.getItem('authToken');

  const sendAdminRequest = async (path, method = 'POST', body) => {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : {};
    if (!response.ok) throw new Error(data.message || 'Request failed.');
    return data;
  };

  const loadData = async () => {
    if (!token) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const [usersRes, matchesRes, teamsRes, packagesRes, supportRes, coinsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin-panel/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin-panel/matches`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin-panel/teams`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin-panel/coin-packages`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/support-history`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/coins`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const [usersData, matchesData, teamsData, packagesData, supportData, coinsData] = await Promise.all([
        usersRes.json(),
        matchesRes.json(),
        teamsRes.json(),
        packagesRes.json(),
        supportRes.json(),
        coinsRes.json(),
      ]);

      if (usersRes.ok) setUsers(usersData.users || []);
      if (matchesRes.ok) setMatches(matchesData.matches || []);
      if (teamsRes.ok) setTeams(teamsData.teams || []);
      if (packagesRes.ok) setPackages(packagesData.packages || []);
      if (supportRes.ok) setSupportHistory(supportData.history || []);
      if (coinsRes.ok) setCoinHistory(coinsData.coins || []);
    } catch (error) {
      setMessage(error.message || 'Could not load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  useEffect(() => {
    if (!users.length) return;

    const savedDeposits = readJsonStorage(DEPOSIT_REQUESTS_STORAGE_KEY, null);
    const savedWithdrawals = readJsonStorage(WITHDRAWAL_REQUESTS_STORAGE_KEY, null);

    if (!savedDeposits) {
      const depositSeeds = buildInitialDepositRequests(users);
      setDepositRequests(depositSeeds);
      writeJsonStorage(DEPOSIT_REQUESTS_STORAGE_KEY, depositSeeds);
    } else {
      setDepositRequests(savedDeposits);
    }

    if (!savedWithdrawals) {
      const withdrawalSeeds = buildInitialWithdrawalRequests(users);
      setWithdrawalRequests(withdrawalSeeds);
      writeJsonStorage(WITHDRAWAL_REQUESTS_STORAGE_KEY, withdrawalSeeds);
    } else {
      setWithdrawalRequests(savedWithdrawals);
    }
  }, [users]);

  useEffect(() => {
    writeJsonStorage(ADMIN_SETTINGS_STORAGE_KEY, gameSettings);
  }, [gameSettings]);

  useEffect(() => {
    const generateBet = () => {
      if (!users.length || loadingFeed) return;
      const user = users[Math.floor(Math.random() * users.length)];
      const game = GAME_NAMES[Math.floor(Math.random() * GAME_NAMES.length)];
      const amount = BET_LEVELS[Math.floor(Math.random() * BET_LEVELS.length)];
      const winChance = gameSettings.mode === 'auto' ? gameSettings.winRate : 50;
      const won = Math.random() * 100 < winChance;
      const multiplier = game === 'Slots' ? 3 : game === 'Dragon vs Lion' ? 2 : 2.25;
      const delta = won ? Math.round(amount * (multiplier - 1)) : -amount;

      const bet = {
        id: makeId('bet'),
        userId: user._id,
        userName: user.name,
        game,
        amount,
        outcome: won ? 'Win' : 'Lose',
        delta,
        createdAt: new Date().toISOString(),
      };

      setLiveBets((prev) => [bet, ...prev].slice(0, 12));
    };

    generateBet();
    betsTickRef.current = setInterval(generateBet, 3200);

    return () => {
      if (betsTickRef.current) clearInterval(betsTickRef.current);
    };
  }, [users, gameSettings, loadingFeed]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => [user.name, user.email, user.phone].filter(Boolean).some((field) => field.toLowerCase().includes(query)));
  }, [users, userSearch]);

  const gameHistoryForUser = useMemo(() => {
    if (!selectedUser) return [];
    return liveBets.filter((bet) => bet.userId === selectedUser._id);
  }, [selectedUser, liveBets]);

  const totalDepositPending = useMemo(
    () => depositRequests.filter((request) => request.status === 'pending').reduce((sum, request) => sum + Number(request.amount || 0), 0),
    [depositRequests],
  );

  const totalDepositApproved = useMemo(
    () => depositRequests.filter((request) => request.status === 'approved').reduce((sum, request) => sum + Number(request.amount || 0), 0),
    [depositRequests],
  );

  const totalWithdrawalPending = useMemo(
    () => withdrawalRequests.filter((request) => request.status === 'pending').reduce((sum, request) => sum + Number(request.amount || 0), 0),
    [withdrawalRequests],
  );

  const totalWithdrawalApproved = useMemo(
    () => withdrawalRequests.filter((request) => request.status === 'approved').reduce((sum, request) => sum + Number(request.amount || 0), 0),
    [withdrawalRequests],
  );

  const totalGameExposure = useMemo(
    () => liveBets.reduce((sum, bet) => sum + Math.abs(Number(bet.delta || 0)) * 0.08, 0),
    [liveBets],
  );

  const netPlatformProfitLoss = totalDepositApproved - totalWithdrawalApproved - totalGameExposure;

  const saveRequests = (nextDeposits, nextWithdrawals) => {
    setDepositRequests(nextDeposits);
    setWithdrawalRequests(nextWithdrawals);
    writeJsonStorage(DEPOSIT_REQUESTS_STORAGE_KEY, nextDeposits);
    writeJsonStorage(WITHDRAWAL_REQUESTS_STORAGE_KEY, nextWithdrawals);
  };

  const updateUserBalance = async (userId, amount) => {
    if (!userId || Number.isNaN(Number(amount)) || Number(amount) === 0) {
      setMessage('Enter a valid balance adjustment.');
      return false;
    }

    try {
      await sendAdminRequest(`/api/admin-panel/users/${userId}/coins`, 'PUT', { amount: Number(amount) });
      await loadData();
      setMessage('User balance updated.');
      return true;
    } catch (error) {
      setMessage(error.message || 'Unable to update balance.');
      return false;
    }
  };

  const handleApproveDeposit = async (requestId) => {
    const request = depositRequests.find((item) => item.id === requestId);
    if (!request) return;

    const applied = await updateUserBalance(request.userId, Number(request.amount));
    if (!applied) return;

    const nextDeposits = depositRequests.map((item) => (item.id === requestId ? { ...item, status: 'approved', reviewedAt: new Date().toISOString() } : item));
    saveRequests(nextDeposits, withdrawalRequests);
    setMessage(`Deposit approved for ${request.userName}.`);
    playSound('confirm');
  };

  const handleRejectDeposit = (requestId) => {
    const nextDeposits = depositRequests.map((item) => (item.id === requestId ? { ...item, status: 'rejected', reviewedAt: new Date().toISOString() } : item));
    saveRequests(nextDeposits, withdrawalRequests);
    setMessage('Deposit request rejected.');
  };

  const handleApproveWithdrawal = async (requestId) => {
    const request = withdrawalRequests.find((item) => item.id === requestId);
    if (!request) return;

    const applied = await updateUserBalance(request.userId, -Number(request.amount));
    if (!applied) return;

    const nextWithdrawals = withdrawalRequests.map((item) => (item.id === requestId ? { ...item, status: 'approved', reviewedAt: new Date().toISOString() } : item));
    saveRequests(depositRequests, nextWithdrawals);
    setMessage(`Withdrawal approved for ${request.userName}.`);
    playSound('confirm');
  };

  const handleRejectWithdrawal = (requestId) => {
    const nextWithdrawals = withdrawalRequests.map((item) => (item.id === requestId ? { ...item, status: 'rejected', reviewedAt: new Date().toISOString() } : item));
    saveRequests(depositRequests, nextWithdrawals);
    setMessage('Withdrawal request rejected.');
  };

  const handleSaveTargetBalance = async (userId) => {
    const draft = Number(balanceDrafts[userId]);
    const current = Number(users.find((user) => user._id === userId)?.coins || 0);
    const delta = draft - current;
    await updateUserBalance(userId, delta);
    setBalanceDrafts((prev) => ({ ...prev, [userId]: '' }));
  };

  const toggleUserBan = async (userId) => {
    try {
      await sendAdminRequest(`/api/admin-panel/users/${userId}/ban`, 'POST');
      await loadData();
      setMessage('User status updated.');
    } catch (error) {
      setMessage(error.message || 'Unable to update user status.');
    }
  };

  const updateMatchScore = async (matchId, scoreA, scoreB) => {
    try {
      await sendAdminRequest(`/api/admin-panel/matches/${matchId}/score`, 'PUT', { scoreA, scoreB });
      await loadData();
      setMessage('Match score updated.');
    } catch (error) {
      setMessage(error.message || 'Unable to update match score.');
    }
  };

  const updateTeam = async (teamId, payload) => {
    try {
      await sendAdminRequest(`/api/admin-panel/teams/${teamId}`, 'PUT', payload);
      await loadData();
      setMessage('Team updated.');
    } catch (error) {
      setMessage(error.message || 'Unable to update team.');
    }
  };

  const updatePackage = async (packageId, payload) => {
    try {
      await sendAdminRequest(`/api/admin-panel/coin-packages/${packageId}`, 'PUT', payload);
      await loadData();
      setMessage('Coin package updated.');
    } catch (error) {
      setMessage(error.message || 'Unable to update coin package.');
    }
  };

  const recentActivity = [
    ...depositRequests.slice(0, 3).map((request) => ({
      id: request.id,
      label: `Deposit ${request.status}`,
      detail: `${request.userName} • ${formatMoney(request.amount)} • ${request.gateway}`,
      tone: request.status === 'approved' ? 'emerald' : request.status === 'rejected' ? 'rose' : 'amber',
    })),
    ...withdrawalRequests.slice(0, 3).map((request) => ({
      id: request.id,
      label: `Withdrawal ${request.status}`,
      detail: `${request.userName} • ${formatMoney(request.amount)}`,
      tone: request.status === 'approved' ? 'emerald' : request.status === 'rejected' ? 'rose' : 'amber',
    })),
    ...liveBets.slice(0, 4).map((bet) => ({
      id: bet.id,
      label: `Game ${bet.outcome}`,
      detail: `${bet.game} • ${bet.userName} • ${formatMoney(bet.amount)}`,
      tone: bet.outcome === 'Win' ? 'emerald' : 'rose',
    })),
  ].slice(0, 8);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 p-10 text-white">Loading admin panel...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.12),_transparent_25%),_rgb(15,23,42)] text-slate-100">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <SectionHeading title="Admin Dashboard" description="Monitor users, requests, and live platform activity." />
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                localStorage.removeItem(ADMIN_ACCESS_STORAGE_KEY);
                onLogout?.();
              }}
              className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-200"
            >
              Lock Admin
            </button>
            <button
              onClick={() => {
                setMessage('Dashboard refreshed.');
                loadData();
              }}
              className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {message && <div className="mb-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-cyan-300">{message}</div>}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Registered Users" value={users.length} hint="All active and banned player accounts" tone="cyan" />
          <StatCard label="Deposits Pending / Approved" value={`${formatMoney(totalDepositPending)} / ${formatMoney(totalDepositApproved)}`} hint="Pending and approved deposit pipeline" tone="emerald" />
          <StatCard label="Withdrawals Pending" value={formatMoney(totalWithdrawalPending)} hint="Queue awaiting manual review" tone="amber" />
          <StatCard label="Net Platform Profit/Loss" value={formatMoney(netPlatformProfitLoss)} hint="Deposits minus withdrawals and game exposure" tone={netPlatformProfitLoss >= 0 ? 'emerald' : 'rose'} />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionCard title="User Management" description="Search, edit balance, ban or unban, and inspect user histories." action={<input value={userSearch} onChange={(event) => setUserSearch(event.target.value)} placeholder="Search username, phone, or email" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none lg:w-80" />}>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800 text-left text-slate-400">
                    <th className="px-3 py-3 font-medium">Username / Phone</th>
                    <th className="px-3 py-3 font-medium">Current Balance</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">Registration Date</th>
                    <th className="px-3 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length ? filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-slate-800/60 last:border-0 align-top">
                      <td className="px-3 py-4">
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.phone || user.email}</p>
                      </td>
                      <td className="px-3 py-4">
                        <div className="space-y-2">
                          <p className="text-white">{formatMoney(user.coins)}</p>
                          <input
                            type="number"
                            value={balanceDrafts[user._id] ?? ''}
                            onChange={(event) => setBalanceDrafts((prev) => ({ ...prev, [user._id]: event.target.value }))}
                            placeholder="Set target balance"
                            className="w-40 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none"
                          />
                          <button
                            onClick={() => handleSaveTargetBalance(user._id)}
                            className="rounded-full bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950"
                          >
                            Save Balance
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isBanned ? 'bg-rose-500/15 text-rose-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
                          {user.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-slate-300">{formatDate(user.createdAt)}</td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => setSelectedUser(user)} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200">View History</button>
                          <button onClick={() => toggleUserBan(user._id)} className={`rounded-full px-3 py-2 text-xs font-semibold ${user.isBanned ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                            {user.isBanned ? 'Unban' : 'Ban'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-slate-500">No users match your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="Platform Activity" description="Live event stream from approvals, withdrawals, and game actions.">
            <div className="space-y-3 max-h-[36rem] overflow-y-auto pr-1">
              {recentActivity.length ? recentActivity.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-slate-400">{item.detail}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.tone === 'emerald' ? 'bg-emerald-500/15 text-emerald-300' : item.tone === 'rose' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-500/15 text-amber-300'}`}>
                      {item.tone}
                    </span>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-500">No activity yet.</p>}
            </div>
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <SectionCard title="Deposit Requests" description="Approve or reject incoming deposit proofs. Approve credits the user balance automatically.">
            <RequestTable
              title="Pending Deposits"
              columns={["User", "Amount", "Gateway", "TID", "Proof"]}
              rows={depositRequests.filter((request) => request.status === 'pending').map((request) => ({
                id: request.id,
                cells: [
                  `${request.userName}\n${request.userId || 'No user id'}`,
                  formatMoney(request.amount),
                  request.gateway,
                  request.tid,
                  request.proof ? 'Submitted' : 'Missing',
                ],
              }))}
              emptyText="No pending deposit requests."
              onApprove={handleApproveDeposit}
              onReject={handleRejectDeposit}
            />

            <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm font-semibold text-white">Processed Deposits</p>
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                {depositRequests.filter((request) => request.status !== 'pending').map((request) => (
                  <div key={request.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm">
                    <div>
                      <p className="font-semibold text-white">{request.userName}</p>
                      <p className="text-xs text-slate-500">{request.gateway} • {request.tid}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.status === 'approved' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Withdrawal Requests" description="Approve or reject payout requests. Approving deducts the amount from the user's balance.">
            <RequestTable
              title="Pending Withdrawals"
              columns={["User", "Amount", "Account Details", "Requested"]}
              rows={withdrawalRequests.filter((request) => request.status === 'pending').map((request) => ({
                id: request.id,
                cells: [request.userName, formatMoney(request.amount), request.accountDetails, formatDate(request.createdAt)],
              }))}
              emptyText="No pending withdrawal requests."
              onApprove={handleApproveWithdrawal}
              onReject={handleRejectWithdrawal}
            />

            <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm font-semibold text-white">Processed Withdrawals</p>
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                {withdrawalRequests.filter((request) => request.status !== 'pending').map((request) => (
                  <div key={request.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm">
                    <div>
                      <p className="font-semibold text-white">{request.userName}</p>
                      <p className="text-xs text-slate-500">{request.accountDetails}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.status === 'approved' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <SectionCard title="Game Control & Monitoring" description="Track live bets across Aviator, Dragon vs Lion, and Slots. Adjust the global outcome mode below.">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {GAME_NAMES.map((game) => (
                <GameMonitorCard key={game} game={game} mode={gameSettings.mode} winRate={gameSettings.winRate} liveBets={liveBets} />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Global Outcome Settings" description="Switch between manual and automatic result handling for the game feed.">
            <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setGameSettings((prev) => ({ ...prev, mode: 'auto' }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${gameSettings.mode === 'auto' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  Auto Outcome
                </button>
                <button
                  onClick={() => setGameSettings((prev) => ({ ...prev, mode: 'manual' }))}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${gameSettings.mode === 'manual' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  Manual Outcome
                </button>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                  <span>Global Win Rate</span>
                  <span>{gameSettings.winRate}%</span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="80"
                  value={gameSettings.winRate}
                  onChange={(event) => setGameSettings((prev) => ({ ...prev, winRate: Number(event.target.value) }))}
                  className="w-full"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Manual / Auto Toggle</p>
                  <p className="mt-2 text-lg font-semibold text-white">{gameSettings.mode === 'auto' ? 'Automated payout distribution' : 'Manual review mode'}</p>
                  <p className="mt-1 text-sm text-slate-400">Use this to review how the platform should resolve active bet rounds.</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live Ratio Snapshot</p>
                  <p className="mt-2 text-lg font-semibold text-white">Win {gameSettings.winRate}% / Loss {100 - gameSettings.winRate}%</p>
                  <p className="mt-1 text-sm text-slate-400">Settings are stored locally so the dashboard keeps the selected control state.</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Recent History" description="Snapshot of the latest admin actions and platform signals.">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{item.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </main>

      {selectedUser && (
        <HistoryModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          coinsHistory={coinHistory.filter((entry) => String(entry.user?._id || entry.user) === String(selectedUser._id))}
          supportHistory={supportHistory.filter((entry) => String(entry.user?._id || entry.user) === String(selectedUser._id))}
          gameHistory={liveBets.filter((entry) => String(entry.userId) === String(selectedUser._id))}
        />
      )}
    </div>
  );
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [unlocked, setUnlocked] = useState(() => localStorage.getItem(ADMIN_ACCESS_STORAGE_KEY) === 'true');
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    const isAdminRole = authUser?.role === 'admin' || authUser?.role === 'superadmin';
    if (isAdminRole) {
      localStorage.setItem(ADMIN_ACCESS_STORAGE_KEY, 'true');
      setUnlocked(true);
    }
    setRoleChecked(true);
  }, [authUser?.role]);

  const unlock = (remember) => {
    if (remember) {
      localStorage.setItem(ADMIN_ACCESS_STORAGE_KEY, 'true');
    } else {
      sessionStorage.setItem(ADMIN_ACCESS_STORAGE_KEY, 'true');
    }
    setUnlocked(true);
  };

  const isSessionUnlocked = unlocked || sessionStorage.getItem(ADMIN_ACCESS_STORAGE_KEY) === 'true';

  if (!isSessionUnlocked) {
    return <AccessGate onUnlock={unlock} loadingRole={!roleChecked} />;
  }

  return <DashboardContent onLogout={() => navigate('/')} />;
}

export default AdminDashboardPage;
