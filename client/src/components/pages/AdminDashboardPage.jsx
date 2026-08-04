import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../common/NavBar';
import SectionHeading from '../common/SectionHeading';
import { API_URL } from '../../config';

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [packages, setPackages] = useState([]);
  const [userAdjustments, setUserAdjustments] = useState({});
  const [matchScoreUpdates, setMatchScoreUpdates] = useState({});
  const [teamEdits, setTeamEdits] = useState({});
  const [packageEdits, setPackageEdits] = useState({});
  const [newMatch, setNewMatch] = useState({ title: '', teamA: '', teamB: '' });

  const token = localStorage.getItem('authToken');

  const loadData = async () => {
    if (!token) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const [usersRes, matchesRes, teamsRes, packagesRes] = await Promise.all([
        fetch(`${API_URL}/api/admin-panel/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin-panel/matches`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin-panel/teams`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/admin-panel/coin-packages`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const usersData = await usersRes.json();
      const matchesData = await matchesRes.json();
      const teamsData = await teamsRes.json();
      const packagesData = await packagesRes.json();

      if (usersRes.ok) setUsers(usersData.users || []);
      if (matchesRes.ok) setMatches(matchesData.matches || []);
      if (teamsRes.ok) setTeams(teamsData.teams || []);
      if (packagesRes.ok) setPackages(packagesData.packages || []);
    } catch {
      setMessage('Could not load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const sendAdminRequest = async (path, method = 'POST', body) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: payload,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Action failed');
    return data;
  };

  const updateUserCoins = async (userId) => {
    const amount = Number(userAdjustments[userId] || 0);
    if (!amount) return setMessage('Enter a valid adjustment amount.');
    try {
      await sendAdminRequest(`/api/admin-panel/users/${userId}/coins`, 'PUT', { amount });
      setMessage('User coins updated.');
      setUserAdjustments((prev) => ({ ...prev, [userId]: '' }));
      await loadData();
    } catch (error) {
      setMessage(error.message || 'Unable to update coins.');
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await sendAdminRequest(`/api/admin-panel/users/${userId}/ban`, 'POST');
      setMessage('User status updated.');
      await loadData();
    } catch (error) {
      setMessage(error.message || 'Unable to update user status.');
    }
  };

  const createMatch = async () => {
    if (!newMatch.title || !newMatch.teamA || !newMatch.teamB) {
      return setMessage('Provide title and both teams.');
    }

    try {
      await sendAdminRequest('/api/admin-panel/matches', 'POST', newMatch);
      setMessage('Match created successfully.');
      setNewMatch({ title: '', teamA: '', teamB: '' });
      await loadData();
    } catch (error) {
      setMessage(error.message || 'Unable to create match.');
    }
  };

  const updateMatchScore = async (matchId) => {
    const scoreA = Number(matchScoreUpdates[matchId]?.scoreA ?? '');
    const scoreB = Number(matchScoreUpdates[matchId]?.scoreB ?? '');
    if (isNaN(scoreA) || isNaN(scoreB)) return setMessage('Enter valid numeric scores.');

    try {
      await sendAdminRequest(`/api/admin-panel/matches/${matchId}/score`, 'PUT', { scoreA, scoreB });
      setMessage('Match score updated.');
      await loadData();
    } catch (error) {
      setMessage(error.message || 'Unable to update score.');
    }
  };

  const updateTeam = async (teamId) => {
    const update = teamEdits[teamId];
    if (!update) return;
    try {
      await sendAdminRequest(`/api/admin-panel/teams/${teamId}`, 'PUT', update);
      setMessage('Team updated.');
      await loadData();
    } catch (error) {
      setMessage(error.message || 'Unable to update team.');
    }
  };

  const updatePackage = async (packageId) => {
    const update = packageEdits[packageId];
    if (!update) return;
    try {
      await sendAdminRequest(`/api/admin-panel/coin-packages/${packageId}`, 'PUT', update);
      setMessage('Package updated.');
      await loadData();
    } catch (error) {
      setMessage(error.message || 'Unable to update package.');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 p-10 text-white">Loading admin panel...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(250,204,21,0.12),_transparent_25%),_rgb(15,23,42)] text-slate-100">
      <NavBar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SectionHeading title="Admin Control Panel" description="Manage customers, matches, teams and coin packages." />

        {message && <div className="mb-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-cyan-300">{message}</div>}

        <section className="mb-8 rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
          <h2 className="text-xl font-semibold text-white">Customer Management</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700 text-sm text-slate-300">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-slate-400">Name</th>
                  <th className="px-4 py-3 text-left text-slate-400">Email</th>
                  <th className="px-4 py-3 text-left text-slate-400">Phone</th>
                  <th className="px-4 py-3 text-left text-slate-400">Coins</th>
                  <th className="px-4 py-3 text-left text-slate-400">Joined</th>
                  <th className="px-4 py-3 text-left text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((user) => (
                  <tr key={user._id} className={user.isBanned ? 'bg-rose-950/20' : ''}>
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.phone || '-'}</td>
                    <td className="px-4 py-3">{user.coins}</td>
                    <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{user.isBanned ? 'Banned' : 'Active'}</td>
                    <td className="px-4 py-3 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="± coins"
                          value={userAdjustments[user._id] ?? ''}
                          onChange={(e) => setUserAdjustments((prev) => ({ ...prev, [user._id]: e.target.value }))}
                          className="w-24 rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                        />
                        <button onClick={() => updateUserCoins(user._id)} className="rounded-full bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950">Adjust</button>
                      </div>
                      <button onClick={() => toggleUserStatus(user._id)} className={`rounded-full px-3 py-2 text-xs font-semibold ${user.isBanned ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
            <h2 className="text-xl font-semibold text-white">Live Match Control</h2>
            <div className="mt-4 space-y-4">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <h3 className="font-semibold text-white">Create New Match</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input value={newMatch.title} onChange={(e) => setNewMatch((prev) => ({ ...prev, title: e.target.value }))} placeholder="Match title" className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100" />
                  <select value={newMatch.teamA} onChange={(e) => setNewMatch((prev) => ({ ...prev, teamA: e.target.value }))} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100">
                    <option value="">Team A</option>
                    {teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}
                  </select>
                  <select value={newMatch.teamB} onChange={(e) => setNewMatch((prev) => ({ ...prev, teamB: e.target.value }))} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100">
                    <option value="">Team B</option>
                    {teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}
                  </select>
                  <button type="button" onClick={createMatch} className="rounded-full bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950">Create Match</button>
                </div>
              </div>

              <div className="space-y-4">
                {matches.map((match) => (
                  <div key={match._id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-white">{match.title}</p>
                        <p className="text-sm text-slate-400">{match.teamA?.name || 'Team A'} {match.scoreA} - {match.scoreB} {match.teamB?.name || 'Team B'}</p>
                        <p className="text-sm text-slate-500">{match.status}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => sendAdminRequest(`/api/admin-panel/matches/${match._id}/start`, 'POST')} className="rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950">Start</button>
                        <button onClick={() => sendAdminRequest(`/api/admin-panel/matches/${match._id}/pause`, 'POST')} className="rounded-full bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-950">Pause</button>
                        <button onClick={() => sendAdminRequest(`/api/admin-panel/matches/${match._id}/resume`, 'POST')} className="rounded-full bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950">Resume</button>
                        <button onClick={() => sendAdminRequest(`/api/admin-panel/matches/${match._1}/end`, 'POST')} className="rounded-full bg-rose-500 px-3 py-2 text-xs font-semibold text-white">End</button>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <input type="number" placeholder="Score A" value={matchScoreUpdates[match._id]?.scoreA ?? ''} onChange={(e) => setMatchScoreUpdates((prev) => ({ ...prev, [match._id]: { ...prev[match._id], scoreA: e.target.value } }))} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100" />
                      <input type="number" placeholder="Score B" value={matchScoreUpdates[match._id]?.scoreB ?? ''} onChange={(e) => setMatchScoreUpdates((prev) => ({ ...prev, [match._id]: { ...prev[match._id], scoreB: e.target.value } }))} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100" />
                      <button type="button" onClick={() => updateMatchScore(match._id)} className="rounded-full bg-slate-700 px-4 py-3 text-sm font-semibold text-white">Update Score</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
            <h2 className="text-xl font-semibold text-white">Teams & Coin Packages</h2>
            <div className="mt-4 space-y-6">
              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <h3 className="font-semibold text-white">Teams</h3>
                <div className="mt-4 space-y-4">
                  {teams.map((team) => (
                    <div key={team._id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-white">{team.name}</p>
                          <p className="text-sm text-slate-400">{team.slug}</p>
                        </div>
                        <button onClick={() => updateTeam(team._id)} className="rounded-full bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950">Save Team</button>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <input type="text" placeholder="Name" value={teamEdits[team._id]?.name ?? team.name} onChange={(e) => setTeamEdits((prev) => ({ ...prev, [team._id]: { ...prev[team._id], name: e.target.value || team.name } }))} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100" />
                        <input type="text" placeholder="Logo URL" value={teamEdits[team._id]?.logo ?? team.logo} onChange={(e) => setTeamEdits((prev) => ({ ...prev, [team._id]: { ...prev[team._id], logo: e.target.value || team.logo } }))} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100" />
                        <input type="text" placeholder="Description" value={teamEdits[team._id]?.description ?? team.description} onChange={(e) => setTeamEdits((prev) => ({ ...prev, [team._id]: { ...prev[team._id], description: e.target.value || team.description } }))} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
                <h3 className="font-semibold text-white">Coin Packages</h3>
                <div className="mt-4 space-y-4">
                  {packages.map((pkg) => (
                    <div key={pkg._id} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-white">{pkg.title}</p>
                          <p className="text-sm text-slate-400">{pkg.coins} coins</p>
                        </div>
                        <button onClick={() => updatePackage(pkg._id)} className="rounded-full bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950">Save Price</button>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <input type="number" placeholder="Price PKR" value={packageEdits[pkg._id]?.pricePKR ?? pkg.pricePKR} onChange={(e) => setPackageEdits((prev) => ({ ...prev, [pkg._id]: { ...prev[pkg._id], pricePKR: Number(e.target.value) } }))} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100" />
                        <input type="text" placeholder="Title" value={packageEdits[pkg._id]?.title ?? pkg.title} onChange={(e) => setPackageEdits((prev) => ({ ...prev, [pkg._id]: { ...prev[pkg._id], title: e.target.value } }))} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100" />
                        <input type="text" placeholder="Description" value={packageEdits[pkg._id]?.description ?? pkg.description} onChange={(e) => setPackageEdits((prev) => ({ ...prev, [pkg._id]: { ...prev[pkg._id], description: e.target.value } }))} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboardPage;
