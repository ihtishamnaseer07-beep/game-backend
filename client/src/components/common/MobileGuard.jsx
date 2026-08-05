import { useEffect, useState } from 'react';

const QR_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://game-client.onrender.com&bgcolor=0f172a&color=22c55e&qzone=2';

function useIsMobile() {
  const [mobile, setMobile] = useState(null);

  useEffect(() => {
    const check = () => {
      const ua = navigator.userAgent || '';
      const isMobileUA = /android|iphone|ipad|ipod|mobile|blackberry|windows phone/i.test(ua);
      const isNarrow = window.innerWidth <= 768;
      setMobile(isMobileUA || isNarrow);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return mobile;
}

export default function MobileGuard({ children, allowDesktop = false }) {
  const isMobile = useIsMobile();
  const isAdminPath = typeof window !== 'undefined' && (
    window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')
  );

  // null = still detecting — render nothing to avoid flash
  if (isMobile === null) return null;

  if (isAdminPath) {
    return children;
  }

  if (!isMobile && !allowDesktop) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-950 px-6 text-center">
        {/* glow bg */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent_60%)] pointer-events-none" />

        {/* logo */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-yellow-400 to-green-500 shadow-2xl shadow-green-500/40 mb-6 overflow-hidden">
          <img src="/logo.png" alt="WIN TOON 786" className="h-full w-full object-cover" />
        </div>

        <h1 className="text-2xl font-extrabold mb-1">
          <span className="text-yellow-400">WIN</span>
          <span className="text-white"> TOON </span>
          <span className="text-green-400">786</span>
        </h1>
        <p className="text-sm text-slate-400 mb-8">Pakistan's #1 Online Gaming Portal</p>

        {/* QR Code */}
        <div className="rounded-3xl bg-slate-900 border border-slate-700 p-4 shadow-xl mb-6">
          <img
            src={QR_URL}
            alt="QR Code"
            className="w-44 h-44 rounded-2xl"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* fallback if QR service fails */}
          <div className="w-44 h-44 rounded-2xl bg-slate-800 items-center justify-center text-center p-4 hidden">
            <p className="text-xs text-slate-400">Open on your mobile browser:</p>
            <p className="text-xs text-green-400 font-mono mt-2 break-all">game-client.onrender.com</p>
          </div>
        </div>

        {/* message */}
        <div className="max-w-sm">
          <h2 className="text-lg font-bold text-white mb-2">📱 Mobile Experience Only</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            WIN TOON 786 is designed exclusively for mobile devices.
            <br />
            Please scan the QR code or open{' '}
            <span className="text-green-400 font-semibold">game-client.onrender.com</span>{' '}
            on your <strong className="text-white">Android</strong> or{' '}
            <strong className="text-white">iPhone</strong> to play.
          </p>
        </div>

        {/* device icons */}
        <div className="flex gap-6 mt-8 text-slate-500">
          <div className="flex flex-col items-center gap-1 text-xs">
            <span className="text-3xl">🤖</span>
            <span>Android</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-xs">
            <span className="text-3xl">🍎</span>
            <span>iPhone</span>
          </div>
        </div>

        <p className="mt-8 text-[10px] text-slate-600">© 2026 WIN TOON 786. All rights reserved.</p>
      </div>
    );
  }

  return children;
}
