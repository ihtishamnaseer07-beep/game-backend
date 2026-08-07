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

const SUPPORT_LINK = 'https://wa.me/966593686007?text=Hello%20WIN%20TOON%20786%20Support,%20I%20need%20help%20with%20my%20account.';

const HOT_GAMES = [
  { id: 1, title: 'Dragon vs Tiger', provider: 'WT786 Live', emoji: '🐉', color: 'from-rose-600 to-amber-700' },
  { id: 2, title: 'Aviator', provider: 'Spribe', emoji: '✈️', color: 'from-blue-700 to-indigo-900' },
  { id: 3, title: 'Lion Arena', provider: 'WT786 Live', emoji: '🦁', color: 'from-yellow-600 to-orange-800' },
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
  { id: 1, title: 'Dragon vs Tiger', provider: 'WT786 Live', emoji: '🐉', color: 'from-rose-600 to-amber-700' },
  { id: 2, title: 'Turbo Crash', provider: 'Spribe', emoji: '🚀', color: 'from-cyan-600 to-blue-800' },
  { id: 3, title: 'Speed Dice', provider: 'BGaming', emoji: '🎲', color: 'from-emerald-600 to-teal-800' },
  { id: 4, title: 'Lucky Flip', provider: 'WT786 Live', emoji: '🪙', color: 'from-yellow-600 to-orange-800' },
];

const CARD_GAMES = [
  { id: 1, title: 'Dragon vs Tiger', provider: 'WIN TOON 786', emoji: '🐅', color: 'from-rose-600 to-orange-700' },
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
  hot: 'Hot',
  slot: 'Slot',
  mini: 'Mini Games',
  cards: 'Cards',
  fishing: 'Fishing',
};

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState('hot');
  const [modal, setModal] = useState(null);
  const [walletModal, setWalletModal] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showInvite, setShowInvite] = useState(false);
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
    if (!user) {
      playSound('cancel');
      setModal('login');
      return;
    }
    playSound('gameLaunch');
    setActiveGame(game);
  };

  const handleTabChange = (tab) => {
    playSound('click');
    if (tab === 'more') {
      playSound('modalOpen');
      setShowInvite(true);
      return;
    }
    setActiveTab(tab);
  };

  const openModal = (m) => {
    playSound('modalOpen');
    setModal(m);
  };

  const openWallet = (w) => {
    playSound('modalOpen');
    setWalletModal(w);
  };

  const closeModal = () => {
    playSound('modalClose');
    setModal(null);
  };

  const closeWallet = () => {
    playSound('modalClose');
    setWalletModal(null);
  };

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
  const sectionLabel = LABEL_BY_CATEGORY[activeCategory] || 'Hot';

  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-hidden text-slate-100 scroll-smooth [-webkit-overflow-scrolling:touch]"
      style={{ background: appTheme.background, fontFamily: appTheme.fontFamily }}
    >
      {modal && <AuthModal mode={modal} onClose={closeModal} />}
      {walletModal === 'deposit' && <DepositModal onClose={closeWallet} />}
      {walletModal === 'withdraw' && <WithdrawModal balance={balance} onClose={closeWallet} />}
      {activeGame && (
        <GamePlayerModal
          game={activeGame}
          balance={balance}
          onClose={() => setActiveGame(null)}
          onDeposit={() => {
            setActiveGame(null);
            setWalletModal('deposit');
          }}
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

      <header className="sticky top-0 z-40 w-full border-b border-emerald-400/20 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto w-full max-w-xl px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-yellow-400 to-green-500 shadow-lg shadow-green-500/30">
                <img src={logoUrl} alt="logo" className="h-full w-full object-cover" />
              </div>
              <h1 className="truncate text-base font-black tracking-[0.04em]">
                <span className="text-yellow-400">WIN</span>
                <span className="text-white"> TOON </span>
                <span className="text-emerald-400">786</span>
              </h1>
            </div>
            <button
              onClick={toggleMute}
              title={muted ? 'Unmute' : 'Mute'}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-base transition-all duration-150 ease-in-out active:scale-95 active:opacity-70"
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              onClick={() => navigate('/admin')}
              className="rounded-xl border border-cyan-400/35 bg-cyan-500/15 px-2 py-2 text-xs font-bold text-cyan-200 transition-all duration-150 ease-in-out active:scale-95 active:opacity-70"
            >
              Admin
            </button>
            <button
              onClick={() => (user ? setActiveTab('profile') : openModal('register'))}
              className="rounded-xl border border-emerald-400/35 bg-emerald-500/15 px-2 py-2 text-xs font-bold text-emerald-200 transition-all duration-150 ease-in-out active:scale-95 active:opacity-70"
            >
              {user ? 'Profile' : 'Register'}
            </button>
            <button
              onClick={() => (user ? logout() : openModal('login'))}
              className="rounded-xl border border-yellow-400/35 bg-yellow-500/15 px-2 py-2 text-xs font-bold text-yellow-200 transition-all duration-150 ease-in-out active:scale-95 active:opacity-70"
            >
              {user ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'home' && (
        <div className="mx-auto w-full max-w-xl space-y-3 px-3 pb-24 pt-3">
          {accessNotice && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
              {accessNotice}
            </div>
          )}

          <section className="rounded-2xl border border-emerald-400/35 bg-gradient-to-r from-emerald-700 via-teal-700 to-slate-900 p-4 shadow-lg shadow-emerald-900/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-200">Bonus Section</p>
                <h2 className="mt-1 text-base font-black text-white">Invite a Friend</h2>
                <p className="mt-1 text-xs text-emerald-100/90">Earn referral bonus when your friends join and play.</p>
              </div>
              <button
                onClick={() => setShowInvite(true)}
                className="shrink-0 rounded-xl border border-emerald-200/35 bg-emerald-300/20 px-3 py-2 text-xs font-bold text-white transition-all duration-150 ease-in-out active:scale-95 active:opacity-70"
              >
                Invite
              </button>
            </div>
          </section>

          <section className="grid grid-cols-[1fr_auto] gap-2 rounded-2xl border border-slate-700 bg-slate-900/70 p-3">
            <div className="flex items-center gap-2">
              {user ? (
                <UserAvatar user={user} sizeClassName="h-9 w-9" className="border-white/15" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-sm">👤</span>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Coins</p>
                <p className="text-sm font-extrabold text-yellow-300">Rs {balance.toFixed(2)}</p>
              </div>
            </div>
            <a
              href={SUPPORT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open support"
              title="Support"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#25D366]/45 bg-[#25D366] text-lg font-black text-slate-950 shadow-lg shadow-[#25D366]/30 transition active:scale-95 active:opacity-80"
            >
              ?
            </a>
          </section>

          <BannerSlider bannerImages={settings?.bannerImages || []} />
          <DynamicGameContainer game={activeConfiguredGame} />

          <section className="rounded-2xl border border-slate-700 bg-slate-900/65 py-2">
            <div className="px-3 pb-1">
              <h2 className="text-sm font-black uppercase tracking-[0.16em] text-slate-200">Game Selection</h2>
            </div>
            <CategoryNav
              active={activeCategory}
              onChange={(category) => {
                playSound('select');
                setActiveCategory(category);
              }}
            />
            <div className="px-3 pb-2">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-emerald-300">{sectionLabel}</p>
                <button
                  onClick={() => playSound('click')}
                  className="text-xs font-semibold text-emerald-400 transition-all duration-150 ease-in-out active:scale-95 active:opacity-70"
                >
                  View All
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
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
            </div>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-900/65 p-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Deposit', emoji: '💰', color: 'from-green-600 to-emerald-800', action: () => openWallet('deposit') },
                { label: 'Withdraw', emoji: '🏧', color: 'from-blue-600 to-indigo-800', action: () => openWallet('withdraw') },
                { label: 'Invite', emoji: '🎁', color: 'from-orange-600 to-amber-800', action: () => setShowInvite(true) },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={action.action}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-b ${action.color} p-2.5 transition-all duration-150 ease-in-out active:scale-95 active:opacity-70`}
                >
                  <span className="text-lg">{action.emoji}</span>
                  <span className="text-[10px] font-semibold leading-none text-white/90">{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="mb-1 flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
            <span className="text-sm">📢</span>
            <p className="truncate text-xs font-medium text-yellow-300">{announcementText}</p>
          </div>

          {user && rewardStatus && (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3">
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
      )}

      {activeTab === 'promo' && <div className="w-full overflow-x-hidden pb-24"><PromoView /></div>}
      {activeTab === 'support' && <div className="w-full overflow-x-hidden pb-24"><SupportView /></div>}
      {activeTab === 'profile' && (
        <div className="w-full overflow-x-hidden pb-24">
          <ProfileView
            user={user}
            balance={balance}
            onDeposit={() => setWalletModal('deposit')}
            onWithdraw={() => setWalletModal('withdraw')}
            onInvite={() => setShowInvite(true)}
            onLogout={() => {
              logout();
              setActiveTab('home');
            }}
            onLogin={() => setModal('login')}
            onAvatarChange={(updates) => updateUser(updates)}
          />
        </div>
      )}

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
