import { useState } from 'react';
import LiveChatModal from './LiveChatModal';

const WA_LINK = 'https://wa.me/966593686007?text=Hello%20WIN%20TOON%20786%20Support,%20I%20need%20help%20with%20my%20account.';
const TG_LINK = 'https://t.me/wintoon786';

const FAQS = [
  {
    q: 'How do I deposit funds?',
    a: 'Go to your Profile → Deposit. Choose EasyPaisa, JazzCash, or Bank Transfer. Send the amount, enter your TID, and confirm. Funds reflect within 5–15 minutes.',
  },
  {
    q: 'How long do withdrawals take?',
    a: 'Withdrawals are processed within 30 minutes during business hours (9 AM–11 PM PKT). Bank transfers may take up to 24 hours.',
  },
  {
    q: 'What are the game rules for Aviator?',
    a: 'In Aviator, a plane takes off and a multiplier increases. Cash out before the plane flies away to win. If you don\'t cash out in time, you lose your bet.',
  },
  {
    q: 'How do I keep my account secure?',
    a: 'Never share your password or OTP with anyone. Enable a strong password from Security Settings. Contact support if you suspect unauthorized access.',
  },
  {
    q: 'Minimum deposit and withdrawal amounts?',
    a: 'Minimum deposit: Rs 100. Minimum withdrawal: Rs 500. Maximum single withdrawal: Rs 50,000.',
  },
  {
    q: 'How does the referral system work?',
    a: 'Share your unique referral link. When a friend registers through it, you earn Rs 200 commission automatically credited to your balance.',
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-700/60 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left bg-slate-800/60 hover:bg-slate-800 transition-colors"
      >
        <span className="text-sm font-semibold text-white">{q}</span>
        <span className={`text-slate-400 text-lg transition-transform duration-200 shrink-0 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-4 py-3 bg-slate-900 text-xs text-slate-400 leading-relaxed border-t border-slate-700/60">
          {a}
        </div>
      )}
    </div>
  );
}

export default function SupportView() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="px-4 pb-6">
      {showChat && <LiveChatModal onClose={() => setShowChat(false)} />}

      {/* header */}
      <div className="py-4">
        <h2 className="text-base font-bold text-white">🎧 Customer Service</h2>
        <p className="text-xs text-slate-500 mt-0.5">WIN TOON 786 — 24/7 Support</p>
      </div>

      {/* support channels */}
      <div className="flex flex-col gap-3 mb-6">

        {/* live chat */}
        <button
          onClick={() => setShowChat(true)}
          className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-green-900/40 to-slate-800/60 border border-green-500/20 p-4 hover:border-green-500/40 transition-all text-left w-full active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/20 border border-green-500/30 text-2xl shrink-0">
            💬
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Live Chat Support</p>
            <p className="text-xs text-slate-400 mt-0.5">Chat with our agent instantly</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400 font-semibold">Online Now</span>
            </div>
          </div>
          <span className="text-slate-500 text-lg">›</span>
        </button>

        {/* whatsapp */}
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#25D366]/10 to-slate-800/60 border border-[#25D366]/20 p-4 hover:border-[#25D366]/40 transition-all active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366]/20 border border-[#25D366]/30 text-2xl shrink-0">
            📱
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">WhatsApp Support</p>
            <p className="text-xs text-slate-400 mt-0.5">+966 593 686 007</p>
            <p className="text-[10px] text-[#25D366] font-semibold mt-1">Tap to open WhatsApp →</p>
          </div>
          <span className="text-slate-500 text-lg">›</span>
        </a>

        {/* telegram */}
        <a
          href={TG_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#229ED9]/10 to-slate-800/60 border border-[#229ED9]/20 p-4 hover:border-[#229ED9]/40 transition-all active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#229ED9]/20 border border-[#229ED9]/30 text-2xl shrink-0">
            ✈️
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Telegram Channel</p>
            <p className="text-xs text-slate-400 mt-0.5">Official community & announcements</p>
            <p className="text-[10px] text-[#229ED9] font-semibold mt-1">@wintoon786 →</p>
          </div>
          <span className="text-slate-500 text-lg">›</span>
        </a>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="text-sm font-bold text-white mb-3">❓ Frequently Asked Questions</h3>
        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </div>
    </div>
  );
}
