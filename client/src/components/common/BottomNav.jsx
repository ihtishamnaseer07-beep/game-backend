const TABS = [
  { key: "more", label: "More", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" /></svg>) },
  { key: "promo", label: "Promo", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>) },
  { key: "home", label: "Home", center: true, icon: (<svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>) },
  { key: "support", label: "Support", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>) },
  { key: "profile", label: "Profile", icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>) },
];

export default function BottomNav({ activeTab = "home", onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-end justify-around border-t border-slate-700/60 bg-slate-900 px-2 pb-1 [-webkit-overflow-scrolling:touch]">
      {TABS.map((tab) =>
        tab.center ? (
          <button
            key={tab.key}
            onClick={() => onTabChange?.(tab.key)}
            className={`-mt-4 flex h-14 w-14 flex-col items-center justify-center rounded-full shadow-lg transition-all duration-150 ease-in-out touch-manipulation active:scale-95 active:opacity-70 ${activeTab === tab.key ? "bg-green-500 text-white shadow-green-500/40" : "bg-green-600 text-white hover:bg-green-500 shadow-green-600/30"}`}
          >
            {tab.icon}
          </button>
        ) : (
          <button
            key={tab.key}
            onClick={() => onTabChange?.(tab.key)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-all duration-150 ease-in-out touch-manipulation active:scale-95 active:opacity-70 ${activeTab === tab.key ? "text-green-400" : "text-slate-400 hover:text-slate-200"}`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        )
      )}
    </nav>
  );
}
