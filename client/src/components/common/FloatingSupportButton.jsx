const WA_LINK = 'https://wa.me/966593686007?text=Hello%20WIN%20TOON%20786%20Support,%20I%20need%20help%20with%20my%20account.';

export default function FloatingSupportButton() {
  return (
    <a
      href={WA_LINK}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with WhatsApp support"
      className="fixed bottom-24 right-4 z-[70] flex h-14 w-14 items-center justify-center rounded-full border border-[#25D366]/40 bg-[#25D366] text-slate-950 shadow-2xl shadow-[#25D366]/30 transition hover:scale-105 hover:shadow-[#25D366]/45 sm:bottom-6 sm:right-6"
    >
      <span className="text-2xl">💬</span>
    </a>
  );
}
