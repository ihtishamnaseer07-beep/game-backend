import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import TeamSelectionPage from './components/pages/TeamSelectionPage';
import CharacterSelectionPage from './components/pages/CharacterSelectionPage';
import SupportCoinPage from './components/pages/SupportCoinPage';
import LeaderboardPage from './components/pages/LeaderboardPage';
import UserProfilePage from './components/pages/UserProfilePage';
import MatchArenaPage from './components/pages/MatchArenaPage';
import AdminDashboardPage from './components/pages/AdminDashboardPage';
import AuthPage from './components/Auth/AuthPage';
import { SoundProvider } from './context/SoundContext';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('authToken');
  return token ? children : <Navigate to="/auth" replace />;
}

function App() {
  return (
    <SoundProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/teams" element={<ProtectedRoute><TeamSelectionPage /></ProtectedRoute>} />
            <Route path="/characters" element={<ProtectedRoute><CharacterSelectionPage /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportCoinPage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/match" element={<ProtectedRoute><MatchArenaPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </SoundProvider>
  );
}

export default App;
