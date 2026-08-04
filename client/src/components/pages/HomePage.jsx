import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import BannerSlider from '../common/BannerSlider';
import CategoryNav from '../common/CategoryNav';
import GameCard from '../common/GameCard';
import BottomNav from '../common/BottomNav';
import AuthModal from '../common/AuthModal';
import DepositModal from '../common/DepositModal';
import WithdrawModal from '../common/WithdrawModal';
import GamePlayerModal from '../common/GamePlayerModal';
import InviteModal from '../common/InviteModal';
import PromoView from '../common/PromoView';

const HOT_GAMES = [
  { id: 1, title: 'Aviator', provider: 'Spribe', emoji: '✈️', color: 'from-blue-700 to-indigo-900' },
  { id: 2, title: 'Chicken Road 2.0', provider: 'BGaming', emoji: '🐔', color: 'from-yellow-600 to-orange-800' },
  { id: 3, title: 'Mega Slots', provider: 'WG', emoji: '🎰', color: 'from-purple-700 to-pink-900' },
  { id: 4, title: 'Dragon Tiger', provider: 'Evolution', emoji: '🐉', color: 'from-red-700 to-rose-900' },
  { id: 5, title: 'Crash Gold', provider: 'Spribe', emoji: '💥', color: 'from-yellow-500 to-amber-800' },
  { id: 6, title: 'Fish Prawn Crab', provider: 'WG', emoji: '🦀', color: 'from-teal-700 to-cyan-900' },
];

const SLOT_GAMES = [
  { id: 1, title: 'Fortune Ox', provider: 'PG Soft', emoji: '🐂', color: 'from-amber-600 to-yellow-900' },
  { id: 2, title: 'Mahjong Ways', provider: 'PG Soft', emoji: '🀄', color: 'from-green-700 to-emerald-900' },
  { id: 3, title: 'Sweet Bonanza', provider: 'Pragmatic', emoji: '🍭', color: 'from-pink-600 to-rose-900' },
  { id: 4, title: 'Gates of Olympus', provider: 'Pragmatic', emoji: '⚡', color: 'from-violet-700 to-purple-900' },
];

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('hot');
  const [modal, setModal]             = useState(null);   // 'login' | 'register'
  const [walletModal, setWalletModal]   = useState(null);   // 'deposit' | 'withdraw'
  const [activeGame, setActiveGame]     = useState(null);   // game object
  const [activeTab, setActiveTab]       = useState('home'); // bottom nav tab
  const [showInvite, setShowInvite]     = useState(false);
  const { user, logout } = useAuth();
  const balance = user?.coins ?? 0;

  const handlePlay = (game) => {
    if (!user) {
      setModal('login');  // auth guard — guest user ko login pe redirect
      return;
    }
    setActiveGame(game);
  };

  const handleTabChange = (tab) => {
    if (tab === 'more') { setShowInvite(true); return; }
    if (tab === 'support') { window.open('/support', '_self'); return; }
    setActiveTab(tab);
  };

  const games = activeCategory === 'slot' ? SLOT_GAMES : HOT_GAMES;
  const sectionLabel = activeCategory === 'slot' ? '🎰 Slots' : '🔥 Hot';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {modal && <AuthModal mode={modal} onClose={() => setModal(null)} />}
      {walletModal === 'deposit' && <DepositModal onClose={() => setWalletModal(null)} />}
      {walletModal === 'withdraw' && <WithdrawModal balance={balance} onClose={() => setWalletModal(null)} />}
      {activeGame && (
        <GamePlayerModal
          game={activeGame}
          balance={balance}
          onClose={() => setActiveGame(null)}
          onDeposit={() => { setActiveGame(null); setWalletModal('deposit'); }}
        />
      )}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} />}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3 max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-green-500 shadow-lg shadow-green-500/30 overflow-hidden">
              <img src="/logo.png" alt="logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-base font-extrabold tracking-wide">
              <span className="text-yellow-400">WIN</span>
              <span className="text-white"> TOON </span>
              <span className="text-green-400">786</span>
            </span>
          </div>
          {user ? (
            <div className="flex items-center gap-2">
              {/* avatar + name */}
              <div className="flex items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-xs font-bold text-white shadow">
                  {user.name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <div className="hidden sm:flex flex-col leading-none">
                  <span className="text-[11px] font-semibold text-white">{user.name?.split(' ')[0]}</span>
                  <span className="text-[10px] text-slate-500">Rs {balance.toFixed(2)}</span>
                </div>
              </div>
              {/* balance chip */}
              <span className="rounded-full bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 text-xs font-bold text-yellow-400">
                Rs {balance.toFixed(2)}
              </span>
              {/* deposit button */}
              <button
                onClick={() => setWalletModal('deposit')}
                className="rounded-lg bg-green-500 hover:bg-green-400 px-3 py-1.5 text-xs font-bold text-white transition-colors shadow-lg shadow-green-500/30"
              >
                + Deposit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => setModal('register')} className="rounded-lg bg-green-500 hover:bg-green-400 px-3 py-1.5 text-xs font-bold text-white transition-colors shadow-lg shadow-green-500/30">Register</button>
              <button onClick={() => setModal('login')} className="rounded-lg border border-slate-600 hover:border-slate-400 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors">Login</button>
            </div>
          )}
        </div>
      </header>
      <div className="max-w-xl mx-auto">
        <BannerSlider />
        <CategoryNav active={activeCategory} onChange={setActiveCategory} />
        <section className="px-4 mt-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">{sectionLabel}</h2>
            <button className="text-xs text-green-400 hover:text-green-300 font-semibold transition-colors">View All →</button>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {games.map((game) => (
              <GameCard
                key={game.id}
                title={game.title}
                provider={game.provider}
                emoji={game.emoji}
                color={game.color}
                onPlay={() => handlePlay(game)}
              />
            ))}
          </div>
        </section>
        <section className="px-4 mt-5">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Deposit', emoji: '💰', color: 'from-green-600 to-emerald-800', action: () => setWalletModal('deposit') },
              { label: 'Withdraw', emoji: '🏧', color: 'from-blue-600 to-indigo-800', action: () => setWalletModal('withdraw') },
              { label: 'Invite', emoji: '🎁', color: 'from-orange-600 to-amber-800', action: () => setShowInvite(true) },
              { label: 'VIP', emoji: '👑', color: 'from-yellow-600 to-yellow-900', action: () => {} },
            ].map((action) => (
              <button key={action.label} onClick={action.action} className={`flex flex-col items-center justify-center gap-1 rounded-2xl bg-gradient-to-b ${action.color} p-3 active:scale-95 transition-transform`}>
                <span className="text-xl">{action.emoji}</span>
                <span className="text-[10px] font-semibold text-white/90">{action.label}</span>
              </button>
            ))}
          </div>
        </section>
        <div className="mx-4 mt-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-3 py-2 flex items-center gap-2">
          <span className="text-sm">📢</span>
          <p className="text-xs text-yellow-300 font-medium truncate">Welcome to WIN TOON 786 — Pakistan's #1 online gaming portal!</p>
        </div>
      </div>

      {/* ── Promo Tab View ── */}
      {activeTab === 'promo' && (
        <div className="max-w-xl mx-auto"><PromoView /></div>
      )}

      {/* ── Profile Tab View ── */}
      {activeTab === 'profile' && (
        <div className="max-w-xl mx-auto px-4 py-6">
          {user ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl bg-slate-900 border border-slate-700 p-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-2xl font-extrabold text-white shadow-lg">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <p className="text-xs text-yellow-400 font-semibold mt-0.5">Rs {balance.toFixed(2)} balance</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setWalletModal('deposit')} className="rounded-2xl bg-green-500/10 border border-green-500/30 p-4 text-left hover:bg-green-500/20 transition-colors">
                  <p className="text-xl">💰</p><p className="text-sm font-bold text-white mt-1">Deposit</p>
                </button>
                <button onClick={() => setWalletModal('withdraw')} className="rounded-2xl bg-blue-500/10 border border-blue-500/30 p-4 text-left hover:bg-blue-500/20 transition-colors">
                  <p className="text-xl">🏧</p><p className="text-sm font-bold text-white mt-1">Withdraw</p>
                </button>
                <button onClick={() => setShowInvite(true)} className="rounded-2xl bg-orange-500/10 border border-orange-500/30 p-4 text-left hover:bg-orange-500/20 transition-colors">
                  <p className="text-xl">🎁</p><p className="text-sm font-bold text-white mt-1">Invite Friends</p>
                </button>
                <button onClick={logout} className="rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-left hover:bg-red-500/20 transition-colors">
                  <p className="text-xl">🚪</p><p className="text-sm font-bold text-red-400 mt-1">Logout</p>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <span className="text-5xl">👤</span>
              <p className="text-slate-400">Please login to view your profile</p>
              <button onClick={() => setModal('login')} className="rounded-xl bg-green-500 hover:bg-green-400 px-8 py-3 text-sm font-bold text-white transition-colors">
                🔑 Login
              </button>
            </div>
          )}
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
