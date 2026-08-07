import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function InviteModal({ onClose }) {
  const { user } = useAuth();
  const referralCode = user?.referralCode || 'WIN786';
  const referralLink = user?.referralLink || `${window.location.origin}/auth?ref=${referralCode}`;

  const [copied, setCopied] = useState(false);
  const stats = {
    invited: Number(user?.referralStats?.invitedCount || 0),
    earned: Number(user?.referralStats?.referralCoinsEarned || 0),
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const shareUrl = encodeURIComponent(referralLink);
  const shareText = encodeURIComponent('Join WIN TOON 786 — Pakistan\'s #1 gaming portal! Use my link to register and get a bonus! 🎮🔥');

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] sm:items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex w-full max-w-sm max-h-[85vh] flex-col rounded-t-3xl border border-slate-700/60 bg-slate-900 shadow-2xl sm:rounded-3xl">

        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">🎁 Invite & Earn</h2>
            <p className="text-xs text-slate-500">Earn Rs 200 when a friend signs up with your link</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-150 ease-in-out text-lg active:scale-95 active:opacity-70"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 scroll-smooth overscroll-contain [-webkit-overflow-scrolling:touch]">
          <div className="flex flex-col gap-5">

          {/* stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4 text-center">
              <p className="text-2xl font-extrabold text-white">{stats.invited}</p>
              <p className="text-xs text-slate-400 mt-0.5">Friends Invited</p>
            </div>
            <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-4 text-center">
              <p className="text-2xl font-extrabold text-green-400">Rs {stats.earned.toFixed(2)}</p>
              <p className="text-xs text-slate-400 mt-0.5">Commission Earned</p>
            </div>
          </div>

          {/* referral link */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Your Referral Link</p>
            <div className="flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-3 py-2">
              <input
                readOnly
                value={referralLink}
                className="flex-1 bg-transparent text-xs text-slate-300 font-mono outline-none truncate"
              />
              <button
                onClick={handleCopy}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-150 ease-in-out active:scale-95 active:opacity-70 ${
                  copied
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                }`}
              >
                {copied ? '✅ Copied!' : '📋 Copy'}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Referral code: <span className="font-mono text-cyan-300">{referralCode}</span></p>
          </div>

          {/* share buttons */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Share Via</p>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 py-3 text-xs font-semibold text-[#25D366] transition-all duration-150 ease-in-out active:scale-95 active:opacity-70"
              >
                <span className="text-xl">💬</span>
                WhatsApp
              </a>
              <a
                href={`https://t.me/share/url?url=${shareUrl}&text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/30 hover:bg-[#229ED9]/20 py-3 text-xs font-semibold text-[#229ED9] transition-all duration-150 ease-in-out active:scale-95 active:opacity-70"
              >
                <span className="text-xl">✈️</span>
                Telegram
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 rounded-xl bg-[#1877F2]/10 border border-[#1877F2]/30 hover:bg-[#1877F2]/20 py-3 text-xs font-semibold text-[#1877F2] transition-all duration-150 ease-in-out active:scale-95 active:opacity-70"
              >
                <span className="text-xl">👥</span>
                Facebook
              </a>
            </div>
          </div>

            {/* how it works */}
            <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/30 px-4 py-3">
              <p className="text-xs font-bold text-yellow-400 mb-2">💡 How It Works</p>
              <ol className="flex flex-col gap-1 text-xs text-slate-400 list-decimal list-inside">
                <li>Share your referral link with friends</li>
                <li>Friend registers using your link</li>
                <li>Your bonus is credited after the signup completes</li>
                <li>You earn <span className="text-green-400 font-semibold">Rs 200</span> instantly!</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-800 px-5 py-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2.5 text-sm font-bold text-rose-300 transition-all duration-150 ease-in-out hover:bg-rose-500/25 active:scale-95 active:opacity-70"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
