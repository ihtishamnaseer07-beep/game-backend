import { useState } from 'react';
import AvatarPicker from './AvatarPicker';
import UserAvatar from './UserAvatar';

const WA_LINK = 'https://wa.me/966593686007?text=Hello%20WIN%20TOON%20786%20Support,%20I%20need%20help%20with%20my%20account.';

const TX_HISTORY = [
  { id: 1, type: 'Deposit', amount: '+Rs 1000', method: 'EasyPaisa', status: 'Success', date: '2026-08-04' },
  { id: 2, type: 'Withdraw', amount: '-Rs 500', method: 'JazzCash', status: 'Pending', date: '2026-08-03' },
  { id: 3, type: 'Bonus', amount: '+Rs 200', method: 'Referral', status: 'Success', date: '2026-08-02' },
];

const GAME_HISTORY = [
  { id: 1, game: 'Aviator ✈️', result: 'Win', amount: '+Rs 450', mult: '2.25×', date: '2026-08-04' },
  { id: 2, game: 'Mega Slots 🎰', result: 'Loss', amount: '-Rs 200', mult: '0×', date: '2026-08-04' },
  { id: 3, game: 'Dragon Tiger 🐉', result: 'Win', amount: '+Rs 300', mult: '1.50×', date: '2026-08-03' },
];

function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ current: '', newPw: '', confirm: '' });
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (form.newPw.length < 8) { setError('New password must be at least 8 characters.'); return; }
    if (form.newPw !== form.confirm) { setError('Passwords do not match.'); return; }
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative w-full max-w-xs rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl p-6">
        <button onClick={onClose} className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 text-base">×</button>
        {done ? (
          <div className="text-center py-4">
            <span className="text-4xl">✅</span>
            <p className="mt-3 font-bold text-green-400">Password Updated!</p>
            <button onClick={onClose} className="mt-4 w-full rounded-xl bg-green-500 hover:bg-green-400 py-2.5 text-sm font-bold text-white">Done</button>
          </div>
        ) : (
          <>
            <h3 className="text-base font-bold text-white mb-4">🔒 Change Password</h3>
            <form onSubmit={submit} className="flex flex-col gap-3">
              {['current', 'newPw', 'confirm'].map((field) => (
                <input
                  key={field}
                  type="password"
                  placeholder={field === 'current' ? 'Current Password' : field === 'newPw' ? 'New Password' : 'Confirm New Password'}
                  value={form[field]}
                  onChange={(e) => { setForm((p) => ({ ...p, [field]: e.target.value })); setError(''); }}
                  className="rounded-xl bg-slate-800 border border-slate-700 focus:border-green-500 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none"
                />
              ))}
              {error && <p className="text-xs text-red-400">⚠️ {error}</p>}
              <button type="submit" className="mt-1 w-full rounded-xl bg-green-500 hover:bg-green-400 py-2.5 text-sm font-bold text-white transition-all">Update Password</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ProfileView({ user, balance, onDeposit, onWithdraw, onInvite, onLogout, onLogin, onAvatarChange }) {
  const [section, setSection] = useState(null); // 'tx' | 'games' | 'security'
  const [showPwModal, setShowPwModal] = useState(false);

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-14 px-4 text-center">
        <span className="text-6xl">👤</span>
        <p className="text-slate-400 text-sm">Login to access your profile</p>
        <button onClick={onLogin} className="rounded-xl bg-green-500 hover:bg-green-400 px-10 py-3 text-sm font-bold text-white transition-colors">🔑 Login</button>
      </div>
    );
  }

  const vipLevel = balance > 10000 ? 3 : balance > 2000 ? 2 : 1;
  const activeAvatar = user?.avatarImage
    ? {
        key: 'custom-photo',
        label: 'Custom Photo',
        emoji: '',
        image: user.avatarImage,
      }
    : {
        key: user?.avatarKey || 'royal-lion',
        label: user?.avatarLabel || 'Royal Lion',
        emoji: user?.avatarEmoji || '🦁',
      };

  const applyAvatar = (avatar) => {
    onAvatarChange?.({
      avatarKey: avatar.key,
      avatarLabel: avatar.label,
      avatarEmoji: avatar.emoji,
      avatarImage: '',
    });
  };

  const applyCustomAvatar = (avatarImage) => {
    onAvatarChange?.({
      avatarKey: 'custom-photo',
      avatarLabel: 'Custom Photo',
      avatarEmoji: '',
      avatarImage,
    });
  };

  const clearCustomAvatar = () => {
    onAvatarChange?.({
      avatarKey: 'royal-lion',
      avatarLabel: 'Royal Lion',
      avatarEmoji: '🦁',
      avatarImage: '',
    });
  };

  return (
    <div className="px-4 pb-6">
      {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}

      {/* user overview card */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <UserAvatar user={user} sizeClassName="h-16 w-16" className="ring-2 ring-emerald-400/20" />
            <span className="absolute -bottom-1 -right-1 rounded-full bg-yellow-500 border-2 border-slate-900 px-1.5 py-0.5 text-[9px] font-extrabold text-slate-900">
              VIP {vipLevel}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-sm font-extrabold text-yellow-400">Rs {Number(balance).toFixed(2)}</span>
              <span className="text-xs text-slate-500">Main Balance</span>
            </div>
          </div>
        </div>

        {/* quick wallet buttons */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <button onClick={onDeposit} className="rounded-xl bg-green-500/20 border border-green-500/40 hover:bg-green-500/30 py-2 text-xs font-bold text-green-400 transition-colors">
            💰 Deposit
          </button>
          <button onClick={onWithdraw} className="rounded-xl bg-blue-500/20 border border-blue-500/40 hover:bg-blue-500/30 py-2 text-xs font-bold text-blue-400 transition-colors">
            🏧 Withdraw
          </button>
        </div>
      </div>

      {/* action menu */}
      <div className="mt-4 flex flex-col gap-2">
        {/* transaction history */}
        <div className="rounded-2xl bg-slate-900 border border-slate-700/60 overflow-hidden">
          <button
            onClick={() => setSection(section === 'tx' ? null : 'tx')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">📋</span>
              <span className="text-sm font-semibold text-white">Transaction History</span>
            </div>
            <span className={`text-slate-500 transition-transform duration-200 ${section === 'tx' ? 'rotate-90' : ''}`}>›</span>
          </button>
          {section === 'tx' && (
            <div className="border-t border-slate-800 px-4 py-3 flex flex-col gap-2">
              {TX_HISTORY.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-slate-800/60 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-white">{tx.type} — {tx.method}</p>
                    <p className="text-[10px] text-slate-500">{tx.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${tx.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{tx.amount}</p>
                    <p className={`text-[10px] ${tx.status === 'Success' ? 'text-green-500' : 'text-yellow-500'}`}>{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* game history */}
        <div className="rounded-2xl bg-slate-900 border border-slate-700/60 overflow-hidden">
          <button
            onClick={() => setSection(section === 'games' ? null : 'games')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🎮</span>
              <span className="text-sm font-semibold text-white">Game History</span>
            </div>
            <span className={`text-slate-500 transition-transform duration-200 ${section === 'games' ? 'rotate-90' : ''}`}>›</span>
          </button>
          {section === 'games' && (
            <div className="border-t border-slate-800 px-4 py-3 flex flex-col gap-2">
              {GAME_HISTORY.map((g) => (
                <div key={g.id} className="flex items-center justify-between py-1.5 border-b border-slate-800/60 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-white">{g.game}</p>
                    <p className="text-[10px] text-slate-500">{g.date} · {g.mult}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${g.result === 'Win' ? 'text-green-400' : 'text-red-400'}`}>{g.amount}</p>
                    <p className={`text-[10px] ${g.result === 'Win' ? 'text-green-500' : 'text-red-500'}`}>{g.result}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* avatar studio */}
        <div className="rounded-2xl bg-slate-900 border border-slate-700/60 overflow-hidden">
          <button
            onClick={() => setSection(section === 'avatar' ? null : 'avatar')}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-800/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🖼️</span>
              <span className="text-sm font-semibold text-white">Avatar Studio</span>
            </div>
            <span className={`text-slate-500 transition-transform duration-200 ${section === 'avatar' ? 'rotate-90' : ''}`}>›</span>
          </button>
          {section === 'avatar' && (
            <div className="border-t border-slate-800 px-4 py-4">
              <AvatarPicker
                currentAvatarKey={activeAvatar.key}
                currentImage={user?.avatarImage || ''}
                onSelectAvatar={applyAvatar}
                onUploadImage={applyCustomAvatar}
                onClearImage={clearCustomAvatar}
              />
            </div>
          )}
        </div>

        {/* security settings */}
        <button
          onClick={() => setShowPwModal(true)}
          className="flex items-center justify-between rounded-2xl bg-slate-900 border border-slate-700/60 px-4 py-3.5 hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🔒</span>
            <span className="text-sm font-semibold text-white">Security Settings</span>
          </div>
          <span className="text-slate-500">›</span>
        </button>

        {/* invite */}
        <button
          onClick={onInvite}
          className="flex items-center justify-between rounded-2xl bg-orange-500/10 border border-orange-500/30 px-4 py-3.5 hover:bg-orange-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🎁</span>
            <span className="text-sm font-semibold text-white">Invite Friends & Earn Rs 200</span>
          </div>
          <span className="text-slate-500">›</span>
        </button>

        {/* whatsapp support */}
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 px-4 py-3.5 hover:bg-[#25D366]/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📱</span>
            <span className="text-sm font-semibold text-white">WhatsApp Support</span>
          </div>
          <span className="text-[#25D366] text-xs font-semibold">+966 593 686 007 →</span>
        </a>

        {/* logout */}
        <button
          onClick={onLogout}
          className="flex items-center justify-between rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3.5 hover:bg-red-500/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🚪</span>
            <span className="text-sm font-bold text-red-400">Logout</span>
          </div>
          <span className="text-slate-500">›</span>
        </button>
      </div>
    </div>
  );
}
