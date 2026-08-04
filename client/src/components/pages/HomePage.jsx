import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
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
import SupportView from '../common/SupportView';
import ProfileView from '../common/ProfileView';

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
  const { muted, toggleMute, playSound } = useSound();
  const balance = user?.coins ?? 0;

  const handlePlay = (game) => {
    if (!user) { playSound('cancel'); setModal('login'); return; }
    playSound('gameLaunch');
    setActiveGame(game);
  };

  const handleTabChange = (tab) => {
    playSound('click');
    if (tab === 'more') { playSound('modalOpen'); setShowInvite(true); return; }
    setActiveTab(tab);
  };

  const openModal = (m) => { playSound('modalOpen'); setModal(m); };
  const openWallet = (w) => { playSound('modalOpen'); setWalletModal(w); };
  const closeModal = () => { playSound('modalClose'); setModal(null); };
  const closeWallet = () => { playSound('modalClose'); setWalletModal(null); };

  const games = activeCategory === 'slot' ? SLOT_GAMES : HOT_GAMES;
  const sectionLabel = activeCategory === 'slot' ? '🎰 Slots' : '🔥 Hot';

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 pb-24">
      {modal && <AuthModal mode={modal} onClose={closeModal} />}
      {walletModal === 'deposit' && <DepositModal onClose={closeWallet} />}
      {walletModal === 'withdraw' && <WithdrawModal balance={balance} onClose={closeWallet} />}
      {activeGame && (
        <GamePlayerModal
          game={activeGame}
          balance={balance}
          onClose={() => setActiveGame(null)}
          onDeposit={() => { setActiveGame(null); setWalletModal('deposit'); }}
        />
      )}
      {showInvite && <InviteModal onClose={() => { playSound('modalClose'); setShowInvite(false); }} />}
      <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="flex items-center justify-between px-3 py-2 max-w-full">
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
          <div className="flex items-center gap-2">
            {/* global mute toggle */}
            <button
              onClick={() => { toggleMute(); }}
              title={muted ? 'Unmute' : 'Mute'}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-base transition-colors"
            >
              {muted ? '🔇' : '🔊'}
            </button>
          {user ? (
            <div className="flex items-center gap-2">
              {/* avatar */}
              <div className="flex items-center gap-1.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-xs font-bold text-white shadow">
                  {user.name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
              </div>
              {/* balance chip */}
              <span className="rounded-full bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 text-xs font-bold text-yellow-400">
                Rs {balance.toFixed(2)}
              </span>
              {/* deposit button */}
              <button
                onClick={() => { playSound('deposit'); openWallet('deposit'); }}
                className="rounded-lg bg-green-500 hover:bg-green-400 px-3 py-1.5 text-xs font-bold text-white transition-colors shadow-lg shadow-green-500/30"
              >
                + Deposit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => openModal('register')} className="rounded-lg bg-green-500 hover:bg-green-400 px-3 py-1.5 text-xs font-bold text-white transition-colors shadow-lg shadow-green-500/30">Register</button>
              <button onClick={() => openModal('login')} className="rounded-lg border border-slate-600 hover:border-slate-400 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors">Login</button>
            </div>
          )}
          </div>
        </div>
      </header>
      <div className="max-w-xl mx-auto">
        <BannerSlider />
        <CategoryNav active={activeCategory} onChange={(c) => { playSound('select'); setActiveCategory(c); }} />
        <section className="px-3 mt-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">{sectionLabel}</h2>
            <button onClick={() => playSound('click')} className="text-xs text-green-400 hover:text-green-300 font-semibold transition-colors">View All →</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
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
        <section className="px-3 mt-4">
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: 'Deposit', emoji: '💰', color: 'from-green-600 to-emerald-800', action: () => setWalletModal('deposit') },
              { label: 'Withdraw', emoji: '🏧', color: 'from-blue-600 to-indigo-800', action: () => setWalletModal('withdraw') },
              { label: 'Invite', emoji: '🎁', color: 'from-orange-600 to-amber-800', action: () => setShowInvite(true) },
              { label: 'VIP', emoji: '👑', color: 'from-yellow-600 to-yellow-900', action: () => {} },
            ].map((action) => (
              <button key={action.label} onClick={action.action} className={`flex flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-b ${action.color} p-2.5 active:scale-95 transition-transform`}>
                <span className="text-lg">{action.emoji}</span>
                <span className="text-[9px] font-semibold text-white/90 leading-none">{action.label}</span>
              </button>
            ))}
          </div>
        </section>
        <div className="mx-3 mt-3 mb-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-3 py-2 flex items-center gap-2">
          <span className="text-sm">📢</span>
          <p className="text-xs text-yellow-300 font-medium truncate">Welcome to WIN TOON 786 — Pakistan's #1 online gaming portal!</p>
        </div>
      </div>

      {/* ── Promo Tab View ── */}
      {activeTab === 'promo' && (
        <div className="w-full overflow-x-hidden"><PromoView /></div>
      )}

      {/* ── Support Tab View ── */}
      {activeTab === 'support' && (
        <div className="w-full overflow-x-hidden"><SupportView /></div>
      )}

      {/* ── Profile Tab View ── */}
      {activeTab === 'profile' && (
        <div className="w-full overflow-x-hidden">
          <ProfileView
            user={user}
            balance={balance}
            onDeposit={() => setWalletModal('deposit')}
            onWithdraw={() => setWalletModal('withdraw')}
            onInvite={() => setShowInvite(true)}
            onLogout={() => { logout(); setActiveTab('home'); }}
            onLogin={() => setModal('login')}
          />
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
