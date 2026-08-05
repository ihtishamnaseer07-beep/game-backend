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

  if (isMobile === null) return null;

  if (!isMobile && !allowDesktop) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-950 px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent_60%)] pointer-events-none" />

        <div className="relative mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400 to-green-500 shadow-2xl shadow-green-500/40">
          <img src="/logo.png" alt="WIN TOON 786" className="h-full w-full object-cover" />
        </div>

        <h1 className="mb-1 text-2xl font-extrabold">
          <span className="text-yellow-400">WIN</span>
          <span className="text-white"> TOON </span>
          <span className="text-green-400">786</span>
        </h1>
        <p className="mb-8 text-sm text-slate-400">Pakistan's #1 Online Gaming Portal</p>

        <div className="mb-6 rounded-3xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
          <img
            src={QR_URL}
            alt="QR Code"
            className="h-44 w-44 rounded-2xl"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
              const fallback = event.currentTarget.nextElementSibling;
              if (fallback) fallback.classList.remove('hidden');
            }}
          />
          <div className="hidden h-44 w-44 items-center justify-center rounded-2xl bg-slate-800 p-4 text-center">
            <p className="text-xs text-slate-400">Open on your mobile browser:</p>
            <p className="mt-2 break-all font-mono text-xs text-green-400">game-client.onrender.com</p>
          </div>
        </div>

        <div className="max-w-sm">
          <h2 className="mb-2 text-lg font-bold text-white">Mobile Experience Only</h2>
          <p className="text-sm leading-relaxed text-slate-400">
            WIN TOON 786 is designed exclusively for mobile devices.
            <br />
            Please scan the QR code or open <span className="font-semibold text-green-400">game-client.onrender.com</span> on your mobile phone.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
