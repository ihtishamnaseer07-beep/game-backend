import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../common/NavBar';
import SectionHeading from '../common/SectionHeading';
import AvatarPicker from '../common/AvatarPicker';
import UserAvatar from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';

function UserProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(authUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/auth');
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const fetchedProfile = data.user || data;
          setProfile((current) => ({
            ...fetchedProfile,
            avatarKey: current?.avatarKey || authUser?.avatarKey || fetchedProfile?.avatarKey,
            avatarLabel: current?.avatarLabel || authUser?.avatarLabel || fetchedProfile?.avatarLabel,
            avatarEmoji: current?.avatarEmoji || authUser?.avatarEmoji || fetchedProfile?.avatarEmoji,
            avatarImage: current?.avatarImage || authUser?.avatarImage || fetchedProfile?.avatarImage,
          }));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleAvatarChange = (updates) => {
    updateUser(updates);
    setProfile((current) => (current ? { ...current, ...updates } : current));
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 p-10 text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.12),_transparent_25%),_rgb(15,23,42)] text-slate-100">
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading title="Profile" description="Your gamer dashboard" />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
            <div className="flex flex-col gap-6 rounded-[32px] border border-slate-800 bg-slate-950/80 p-6 shadow-inner ring-1 ring-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <UserAvatar user={profile} sizeClassName="h-20 w-20" className="ring-2 ring-cyan-400/20" />
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Username</p>
                  <h3 className="mt-2 text-3xl font-semibold text-white">{profile?.name || 'Player'}</h3>
                </div>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Coins</p>
                <p className="mt-2 text-4xl font-bold text-emerald-300">{profile?.coins ?? 0}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Favorite Team</p>
                <p className="mt-3 text-2xl font-semibold text-white">{profile?.team || 'Team A'}</p>
              </div>
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Current Avatar</p>
                <p className="mt-3 text-2xl font-semibold text-white">{profile?.avatarLabel || profile?.avatarKey || profile?.avatar || 'Royal Lion'}</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <AvatarPicker
                currentAvatarKey={profile?.avatarKey || 'royal-lion'}
                currentImage={profile?.avatarImage || ''}
                onSelectAvatar={(avatar) => handleAvatarChange({ avatarKey: avatar.key, avatarLabel: avatar.label, avatarEmoji: avatar.emoji, avatarImage: '' })}
                onUploadImage={(avatarImage) => handleAvatarChange({ avatarKey: 'custom-photo', avatarLabel: 'Custom Photo', avatarEmoji: '', avatarImage })}
                onClearImage={() => handleAvatarChange({ avatarKey: 'royal-lion', avatarLabel: 'Royal Lion', avatarEmoji: '🦁', avatarImage: '' })}
              />
            </div>

            <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Match History</p>
              <div className="mt-4 space-y-3">
                {[
                  { id: 1, match: 'Team B vs Team A', result: 'Win', coins: 20 },
                  { id: 2, match: 'Team A vs Team B', result: 'Loss', coins: 10 },
                  { id: 3, match: 'Team B vs Team A', result: 'Win', coins: 15 }
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.match}</p>
                      <p className="text-xs text-slate-400">Coins awarded: {item.coins}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm ${item.result === 'Win' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                      {item.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="rounded-[32px] border border-slate-800 bg-slate-950/90 p-6 shadow-xl ring-1 ring-slate-700">
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Player Summary</p>
            <button
              onClick={handleLogout}
              className="mt-4 w-full rounded-2xl bg-rose-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
            >
              Logout
            </button>
            <div className="mt-6 space-y-4">
              {[
                { label: 'Joined', value: '3 months ago' },
                { label: 'Support Level', value: 'Champion' },
                { label: 'Active Streak', value: '7 days' }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default UserProfilePage;
