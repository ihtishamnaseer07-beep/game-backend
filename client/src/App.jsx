import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import TeamSelectionPage from './components/pages/TeamSelectionPage';
import CharacterSelectionPage from './components/pages/CharacterSelectionPage';
import SupportCoinPage from './components/pages/SupportCoinPage';
import LeaderboardPage from './components/pages/LeaderboardPage';
import UserProfilePage from './components/pages/UserProfilePage';
import MatchArenaPage from './components/pages/MatchArenaPage';
import AdminControlPanelPage from './components/pages/AdminControlPanelPage';
import AdminLoginPage from './components/pages/AdminLoginPage';
import AuthPage from './components/Auth/AuthPage';
import FloatingSupportButton from './components/common/FloatingSupportButton';
import { SoundProvider } from './context/SoundContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppSettingsProvider, useAppSettings } from './context/AppSettingsContext';
import MobileGuard from './components/common/MobileGuard';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/auth" replace />;
}

function AdminProtectedRoute({ children }) {
  const { firebaseUser, isSuperAdmin } = useAuth();

  if (!firebaseUser) {
    return <AdminLoginPage />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace state={{ accessDenied: '404 - Access Denied' }} />;
  }

  return children;
}

function LaunchSplash() {
  const { settings } = useAppSettings();
  const [visible, setVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const hasSeenSplash = localStorage.getItem('wt786_splash_seen') === 'true';
    if (hasSeenSplash) {
      return undefined;
    }

    setVisible(true);
    localStorage.setItem('wt786_splash_seen', 'true');

    const showTimer = setTimeout(() => setIsFading(true), 2000);
    const hideTimer = setTimeout(() => setVisible(false), 2400);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-slate-950 transition-opacity duration-400 ease-out ${
        isFading ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <img
        src={settings?.splashScreenUrl || settings?.gameLogoUrl || '/assets/branding/game-logo.png'}
        alt="Game Logo"
        className="h-auto w-[min(82vw,420px)] object-contain"
        onError={(event) => {
          event.currentTarget.style.display = 'none';
          const fallback = event.currentTarget.nextElementSibling;
          if (fallback) fallback.classList.remove('hidden');
        }}
      />
      <div className="hidden text-center">
        <h1 className="text-4xl font-extrabold tracking-wide text-white">WIN TOON 786</h1>
        <p className="mt-2 text-sm text-slate-300">Dragon vs Lion</p>
      </div>
    </div>
  );
}

function RouteAwareMobileGuard({ children }) {
  const location = useLocation();
  const allowDesktop = location.pathname === '/admin' || location.pathname.startsWith('/admin/');

  return <MobileGuard allowDesktop={allowDesktop}>{children}</MobileGuard>;
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppSettingsProvider>
        <SoundProvider>
          <Router>
            <RouteAwareMobileGuard>
            <LaunchSplash />
            <main className="min-h-screen w-full flex flex-col overflow-y-auto pb-24 bg-slate-950 text-slate-100 overflow-x-hidden scroll-smooth [-webkit-overflow-scrolling:touch]">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin-login" element={<Navigate to="/admin" replace />} />
                <Route path="/teams" element={<ProtectedRoute><TeamSelectionPage /></ProtectedRoute>} />
                <Route path="/characters" element={<ProtectedRoute><CharacterSelectionPage /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><SupportCoinPage /></ProtectedRoute>} />
                <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
                <Route path="/match" element={<ProtectedRoute><MatchArenaPage /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminProtectedRoute><AdminControlPanelPage /></AdminProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
              </Routes>
            </main>
            <FloatingSupportButton />
            </RouteAwareMobileGuard>
          </Router>
        </SoundProvider>
        </AppSettingsProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
