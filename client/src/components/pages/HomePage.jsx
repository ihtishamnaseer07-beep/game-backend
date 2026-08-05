import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSound } from '../../context/SoundContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { API_URL } from '../../config';
import BannerSlider from '../common/BannerSlider';
import DynamicGameContainer from '../common/DynamicGameContainer';
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
import UserAvatar from '../common/UserAvatar';
import DailyRewardsModal from '../common/DailyRewardsModal';

const HOT_GAMES = [
  { id: 1, title: 'Dragon vs Lion', provider: 'WT786 Live', emoji: '🐉🦁', color: 'from-rose-600 to-amber-700' },
  { id: 2, title: 'Aviator', provider: 'Spribe', emoji: '✈️', color: 'from-blue-700 to-indigo-900' },
  { id: 3, title: 'Chicken Road 2.0', provider: 'BGaming', emoji: '🐔', color: 'from-yellow-600 to-orange-800' },
  { id: 4, title: 'Mega Slots', provider: 'WG', emoji: '🎰', color: 'from-purple-700 to-pink-900' },
  { id: 5, title: 'Crash Gold', provider: 'Spribe', emoji: '💥', color: 'from-yellow-500 to-amber-800' },
  { id: 6, title: 'Fish Prawn Crab', provider: 'WG', emoji: '🦀', color: 'from-teal-700 to-cyan-900' },
];

const SLOT_GAMES = [
  { id: 1, title: 'Fortune Ox', provider: 'PG Soft', emoji: '🐂', color: 'from-amber-600 to-yellow-900' },
  { id: 2, title: 'Mahjong Ways', provider: 'PG Soft', emoji: '🀄', color: 'from-green-700 to-emerald-900' },
  { id: 3, title: 'Sweet Bonanza', provider: 'Pragmatic', emoji: '🍭', color: 'from-pink-600 to-rose-900' },
  { id: 4, title: 'Gates of Olympus', provider: 'Pragmatic', emoji: '⚡', color: 'from-violet-700 to-purple-900' },
];

const MINI_GAMES = [
  { id: 1, title: 'Dragon vs Lion', provider: 'WT786 Live', emoji: '🐉🦁', color: 'from-rose-600 to-amber-700' },
  { id: 2, title: 'Turbo Crash', provider: 'Spribe', emoji: '🚀', color: 'from-cyan-600 to-blue-800' },
  { id: 3, title: 'Speed Dice', provider: 'BGaming', emoji: '🎲', color: 'from-emerald-600 to-teal-800' },
  { id: 4, title: 'Lucky Flip', provider: 'WT786 Live', emoji: '🪙', color: 'from-yellow-600 to-orange-800' },
];

const CARD_GAMES = [
  { id: 1, title: 'Dragon vs Lion', provider: 'WIN TOON 786', emoji: '🃏', color: 'from-rose-600 to-orange-700' },
  { id: 2, title: 'Royal Blackjack', provider: 'Evolution', emoji: '♠️', color: 'from-slate-700 to-slate-900' },
  { id: 3, title: 'Card Clash', provider: 'WIN TOON 786', emoji: '🎴', color: 'from-indigo-700 to-violet-900' },
  { id: 4, title: 'Lucky Pair', provider: 'BGaming', emoji: '💎', color: 'from-cyan-700 to-blue-900' },
];

const FISHING_GAMES = [
  { id: 1, title: 'Fish Prawn Crab', provider: 'WG', emoji: '🦀', color: 'from-teal-700 to-cyan-900' },
  { id: 2, title: 'Ocean Hunter', provider: 'WIN TOON 786', emoji: '🐟', color: 'from-blue-700 to-sky-900' },
];

const GAMES_BY_CATEGORY = {
  hot: HOT_GAMES,
  slot: SLOT_GAMES,
  mini: MINI_GAMES,
  cards: CARD_GAMES,
  fishing: FISHING_GAMES,
};

const LABEL_BY_CATEGORY = {
  hot: '🔥 Hot',
  slot: '🎰 Slots',
  mini: '⚡ Mini Games',
  cards: '🃏 Cards',
  fishing: '🎣 Fishing',
};

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('hot');
  const [modal, setModal]             = useState(null);   // 'login' | 'register'
  const [walletModal, setWalletModal]   = useState(null);   // 'deposit' | 'withdraw'
  const [activeGame, setActiveGame]     = useState(null);   // game object
  const [activeTab, setActiveTab]       = useState('home'); // bottom nav tab
  const [showInvite, setShowInvite]     = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [rewardStatus, setRewardStatus] = useState(null);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [spinReward, setSpinReward] = useState(null);
  const [accessNotice, setAccessNotice] = useState('');
  const { settings } = useAppSettings();
  const { user, token, logout, updateUser } = useAuth();
  const { muted, toggleMute, playSound } = useSound();
  const balance = user?.coins ?? 0;
  const logoUrl = settings?.gameLogoUrl || '/logo.png';
  const announcementText = settings?.announcementText || "Welcome to WIN TOON 786 — Pakistan's #1 online gaming portal!";
  const appTheme = settings?.appTheme || {};
  const activeConfiguredGame = useMemo(() => {
    const catalog = Array.isArray(settings?.gameCatalog) ? settings.gameCatalog : [];
    if (!catalog.length) return null;
    return catalog.find((game) => game?.isActive) || catalog[0];
  }, [settings]);

  const loadRewardStatus = async () => {
    if (!token || !user?._id) return;

    try {
      const response = await fetch(`${API_URL}/api/coins/daily-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load daily rewards.');
      setRewardStatus(data);

      const modalKey = `wt786_daily_modal_seen_${user._id}`;
      const cycleKey = data.dailyBonus?.lastClaimAt
        ? String(new Date(data.dailyBonus.lastClaimAt).getTime() + 86400000)
        : 'initial';

      if (data.dailyBonus?.available && localStorage.getItem(modalKey) !== cycleKey) {
        localStorage.setItem(modalKey, cycleKey);
        setShowRewardsModal(true);
      }
    } catch {
      setRewardStatus(null);
    }
  };

  useEffect(() => {
    loadRewardStatus();
  }, [token, user?._id]);

  useEffect(() => {
    if (!location.state?.accessDenied) return;
    setAccessNotice(String(location.state.accessDenied));
    navigate(location.pathname, { replace: true });
  }, [location.pathname, location.state, navigate]);

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
  const adjustBalance = (delta) => {
    updateUser((prev) => ({ coins: Math.max(0, Number(prev?.coins || 0) + Number(delta || 0)) }));
  };

  const claimDailyBonus = async () => {
    if (!token) return;
    setRewardLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/coins/daily-bonus`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to claim daily bonus.');
      updateUser({ coins: data.coins, dailyRewards: { ...(user?.dailyRewards || {}), lastLoginBonus: data.lastLoginBonus } });
      await loadRewardStatus();
    } finally {
      setRewardLoading(false);
    }
  };

  const spinLuckyWheel = async () => {
    if (!token) return;
    setRewardLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/coins/daily-spin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to spin the wheel.');
      setSpinReward(data.reward);
      updateUser({ coins: data.coins, dailyRewards: { ...(user?.dailyRewards || {}), lastSpinAt: data.lastSpinAt } });
      await loadRewardStatus();
    } finally {
      setRewardLoading(false);
    }
  };

  const games = GAMES_BY_CATEGORY[activeCategory] || HOT_GAMES;
  const sectionLabel = LABEL_BY_CATEGORY[activeCategory] || '🔥 Hot';

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden text-slate-100 scroll-smooth [-webkit-overflow-scrolling:touch]" style={{ background: appTheme.background, fontFamily: appTheme.fontFamily }}>
      {modal && <AuthModal mode={modal} onClose={closeModal} />}
      {walletModal === 'deposit' && <DepositModal onClose={closeWallet} />}
      {walletModal === 'withdraw' && <WithdrawModal balance={balance} onClose={closeWallet} />}
      {activeGame && (
        <GamePlayerModal
          game={activeGame}
          balance={balance}
          onClose={() => setActiveGame(null)}
          onDeposit={() => { setActiveGame(null); setWalletModal('deposit'); }}
          onRoundComplete={(roundResult) => adjustBalance(roundResult.delta)}
        />
      )}
      {showInvite && <InviteModal onClose={() => { playSound('modalClose'); setShowInvite(false); }} />}
      {showRewardsModal && rewardStatus && (
        <DailyRewardsModal
          status={rewardStatus}
          spinningReward={spinReward}
          loading={rewardLoading}
          onClose={() => setShowRewardsModal(false)}
          onClaimBonus={claimDailyBonus}
          onSpinWheel={spinLuckyWheel}
        />
      )}
      <header className="sticky top-0 z-40 w-full bg-slate-950/95 backdrop-blur border-b border-slate-800">
        <div className="flex items-center justify-between px-3 py-2 max-w-full">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-green-500 shadow-lg shadow-green-500/30 overflow-hidden">
              <img src={logoUrl} alt="logo" className="h-full w-full object-cover" />
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
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-base transition-all duration-150 ease-in-out active:scale-95 active:opacity-70"
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-300 transition-all duration-150 ease-in-out hover:bg-cyan-500/25 active:scale-95 active:opacity-70"
            >
              Admin
            </button>
          {user ? (
            <div className="flex items-center gap-2">
              {/* avatar */}
              <div className="flex items-center gap-1.5">
                  <UserAvatar user={user} sizeClassName="h-7 w-7" className="border-white/10" />
              </div>
              {/* balance chip */}
              <span className="rounded-full bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 text-xs font-bold text-yellow-400">
                Rs {balance.toFixed(2)}
              </span>
              {/* deposit button */}
              <button
                onClick={() => { playSound('deposit'); openWallet('deposit'); }}
                className="rounded-lg bg-green-500 hover:bg-green-400 px-3 py-1.5 text-xs font-bold text-white transition-all duration-150 ease-in-out shadow-lg shadow-green-500/30 active:scale-95 active:opacity-70"
              >
                + Deposit
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => openModal('register')} className="rounded-lg px-3 py-1.5 text-xs font-bold text-white transition-all duration-150 ease-in-out shadow-lg active:scale-95 active:opacity-70" style={{ background: `linear-gradient(135deg, ${appTheme.primary || '#22c55e'}, ${appTheme.secondary || '#eab308'})`, borderRadius: `${appTheme.buttonRadius || 10}px` }}>Register</button>
              <button onClick={() => openModal('login')} className="rounded-lg border border-slate-600 hover:border-slate-400 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-all duration-150 ease-in-out active:scale-95 active:opacity-70">Login</button>
            </div>
          )}
          </div>
        </div>
      </header>
      <div className="max-w-xl mx-auto pb-4">
        {accessNotice && (
          <div className="mx-3 mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
            {accessNotice}
          </div>
        )}
        <BannerSlider bannerImages={settings?.bannerImages || []} />
        <DynamicGameContainer game={activeConfiguredGame} balance={balance} />
        <CategoryNav active={activeCategory} onChange={(c) => { playSound('select'); setActiveCategory(c); }} />
        <section className="px-3 mt-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">{sectionLabel}</h2>
            <button onClick={() => playSound('click')} className="text-xs text-green-400 hover:text-green-300 font-semibold transition-all duration-150 ease-in-out active:scale-95 active:opacity-70">View All →</button>
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
              { label: 'Admin', emoji: '🛡️', color: 'from-slate-600 to-slate-900', action: () => navigate('/admin') },
            ].map((action) => (
              <button key={action.label} onClick={action.action} className={`flex flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-b ${action.color} p-2.5 transition-all duration-150 ease-in-out active:scale-95 active:opacity-70`}>
                <span className="text-lg">{action.emoji}</span>
                <span className="text-[9px] font-semibold text-white/90 leading-none">{action.label}</span>
              </button>
            ))}
          </div>
        </section>
        <div className="mx-3 mt-3 mb-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-3 py-2 flex items-center gap-2">
          <span className="text-sm">📢</span>
          <p className="text-xs text-yellow-300 font-medium truncate">{announcementText}</p>
        </div>
        {user && rewardStatus && (
          <div className="mx-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300">Daily Rewards</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {rewardStatus.dailyBonus?.available ? 'Daily bonus is ready to claim.' : 'Lucky spin and daily claim refresh every 24 hours.'}
                </p>
              </div>
              <button onClick={() => setShowRewardsModal(true)} className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950">
                Open
              </button>
            </div>
          </div>
        )}
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
            onAvatarChange={(updates) => updateUser(updates)}
          />
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
