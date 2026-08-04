import { useState, useRef, useEffect } from 'react';

const WA_LINK = 'https://wa.me/966593686007?text=Hello%20WIN%20TOON%20786%20Support,%20I%20need%20help%20with%20my%20account.';

const BOT_REPLIES = [
  'Hello! Welcome to WIN TOON 786 support. How can I help you today? 😊',
  'I understand your concern. Let me check that for you right away!',
  'For deposit issues, please send your TID screenshot to our WhatsApp: +966593686007.',
  'Withdrawals are processed within 30 minutes during business hours.',
  'Your account security is our top priority. Please never share your password.',
  'Is there anything else I can help you with?',
  'Thank you for contacting WIN TOON 786 support. Have a great day! 🎮',
];

export default function LiveChatModal({ onClose }) {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! Welcome to WIN TOON 786 24/7 Support 🎮\nHow can we help you today?', time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [botIdx, setBotIdx] = useState(0);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    const now = new Date();
    setMessages((prev) => [...prev, { from: 'user', text, time: now }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const reply = BOT_REPLIES[botIdx % BOT_REPLIES.length];
      setMessages((prev) => [...prev, { from: 'bot', text: reply, time: new Date() }]);
      setBotIdx((i) => i + 1);
    }, 1200 + Math.random() * 600);
  };

  const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden" style={{ height: 'min(85vh, 520px)' }}>

        {/* header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border-b border-slate-700 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-sm font-bold text-white">
            W
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">WIN TOON Support Agent</p>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[10px] text-green-400">Online — replies instantly</span>
            </div>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white text-base transition-colors">×</button>
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${msg.from === 'user' ? 'bg-green-600 text-white rounded-br-sm' : 'bg-slate-800 text-slate-100 rounded-bl-sm'}`}>
                {msg.text}
                <p className="text-[9px] mt-1 opacity-60 text-right">{fmt(msg.time)}</p>
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* quick replies */}
        <div className="flex gap-2 overflow-x-auto px-4 py-2 border-t border-slate-800 scrollbar-none shrink-0">
          {['Deposit Help', 'Withdrawal', 'Account Issue', 'Game Rules'].map((q) => (
            <button key={q} onClick={() => { setInput(q); }} className="shrink-0 rounded-full border border-slate-600 bg-slate-800/60 px-3 py-1 text-xs text-slate-300 hover:border-green-500/60 hover:text-green-400 transition-colors">
              {q}
            </button>
          ))}
        </div>

        {/* input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-800 shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message…"
            className="flex-1 rounded-xl bg-slate-800 border border-slate-700 focus:border-green-500 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-all"
          />
          <button
            onClick={sendMessage}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500 hover:bg-green-400 text-white text-base transition-colors active:scale-95"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
