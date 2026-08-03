function LoadingCard() {
  return (
    <div className="animate-pulse rounded-3xl bg-slate-900/80 p-6 shadow-inner ring-1 ring-slate-700">
      <div className="h-6 w-3/5 rounded-full bg-slate-700"></div>
      <div className="mt-4 grid gap-3">
        <div className="h-32 rounded-3xl bg-slate-700"></div>
        <div className="h-4 rounded-full bg-slate-700"></div>
        <div className="h-4 rounded-full bg-slate-700"></div>
      </div>
    </div>
  );
}

export default LoadingCard;
