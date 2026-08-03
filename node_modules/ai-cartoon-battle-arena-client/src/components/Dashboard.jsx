function Dashboard() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="rounded-3xl bg-slate-900/80 p-6 shadow-xl ring-1 ring-slate-700">
        <h1 className="text-4xl font-semibold text-white">Admin Dashboard</h1>
        <p className="mt-3 text-slate-400">Manage users, matches, teams, coins, and analytics.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {['Total Users', 'Active Users', 'Total Matches', 'Total Coins', 'Live Control', 'Match History'].map((item) => (
            <div key={item} className="rounded-3xl bg-slate-950 p-6 shadow-xl ring-1 ring-slate-700">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500">{item}</p>
              <p className="mt-4 text-3xl font-bold text-white">--</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
