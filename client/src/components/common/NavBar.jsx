import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useSound } from '../../context/SoundContext';
import UserAvatar from './UserAvatar';

const links = [
  { path: '/', key: 'nav.home' },
  { path: '/teams', key: 'nav.teams' },
  { path: '/characters', key: 'nav.characters' },
  { path: '/support', key: 'nav.support' },
  { path: '/leaderboard', key: 'nav.leaderboard' },
  { path: '/match', key: 'nav.match' },
  { path: '/profile', key: 'nav.profile' }
];

function NavBar() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { muted, toggleMute, playSound } = useSound();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 border-b border-slate-800 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-3 transition hover:opacity-90" onClick={() => playSound('click')}>
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-900 p-1 shadow-lg shadow-cyan-500/10">
            <img src="/logo.png" alt="AI Cartoon Battle Arena logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="text-xl font-semibold text-cyan-400">AI Cartoon Battle Arena</div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Live AI battle simulator</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-4 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => playSound('click')}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              {t(link.key)}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => {
              playSound('select');
              setLanguage(language === 'en' ? 'ur' : 'en');
            }}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          >
            {t('nav.language')}: {language === 'en' ? 'EN' : 'UR'}
          </button>
          <button
            type="button"
            onClick={() => {
              playSound('click');
              toggleMute();
            }}
            className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          >
            {muted ? t('nav.unmute') : t('nav.mute')}
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <UserAvatar user={user} sizeClassName="h-10 w-10" />
              <button
                type="button"
                onClick={() => {
                  playSound('exit');
                  logout();
                }}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <NavLink to="/auth" className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400">
              {t('nav.login')}
            </NavLink>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/80 p-3 text-slate-300 transition hover:border-cyan-400 hover:text-white md:hidden"
        >
          <span className="sr-only">Toggle navigation</span>
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-800 bg-slate-950/95 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => {
                  playSound('click');
                  setIsOpen(false);
                }}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-cyan-500 text-slate-950' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                {t(link.key)}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => {
                playSound('select');
                setLanguage(language === 'en' ? 'ur' : 'en');
                setIsOpen(false);
              }}
              className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-sm text-slate-200"
            >
              {t('nav.language')}: {language === 'en' ? 'EN' : 'UR'}
            </button>
            <button
              type="button"
              onClick={() => {
                playSound('click');
                toggleMute();
                setIsOpen(false);
              }}
              className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-left text-sm text-slate-200"
            >
              {muted ? t('nav.unmute') : t('nav.mute')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default NavBar;
