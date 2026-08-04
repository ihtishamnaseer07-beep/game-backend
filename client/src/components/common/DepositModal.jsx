import { useState } from 'react';

const METHODS = [
  {
    key: 'easypaisa',
    label: 'EasyPaisa',
    emoji: '🟢',
    account: '0300-1234567',
    title: 'WIN TOON 786 (EP)',
  },
  {
    key: 'jazzcash',
    label: 'JazzCash',
    emoji: '🔴',
    account: '0301-7654321',
    title: 'WIN TOON 786 (JC)',
  },
  {
    key: 'bank',
    label: 'Bank Transfer',
    emoji: '🏦',
    account: 'PK36 MEZN 0001 0103 0101 23',
    title: 'WIN TOON 786 Pvt Ltd — Meezan Bank',
  },
];

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

export default function DepositModal({ onClose }) {
  const [method, setMethod] = useState('easypaisa');
  const [amount, setAmount] = useState('');
  const [tid, setTid] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const selected = METHODS.find((m) => m.key === method);

  const handleConfirm = (e) => {
    e.preventDefault();
    setError('');
    if (!amount || Number(amount) < 100) {
      setError('Minimum deposit amount is Rs 100.');
      return;
    }
    if (!tid.trim()) {
      setError('Please enter the Transaction ID (TID).');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl max-h-[92vh] overflow-y-auto">

        {/* header */}
        <div className="sticky top-0 bg-slate-900 flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-800 z-10">
          <div>
            <h2 className="text-base font-bold text-white">💰 Deposit Funds</h2>
            <p className="text-xs text-slate-500">Transfer & submit TID to confirm</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-lg"
          >
            ×
          </button>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
            <span className="text-5xl">✅</span>
            <h3 className="text-lg font-bold text-green-400">Request Submitted!</h3>
            <p className="text-sm text-slate-400">
              Your deposit of <span className="text-white font-semibold">Rs {amount}</span> via{' '}
              <span className="text-white font-semibold">{selected.label}</span> has been received.
              <br />TID: <span className="text-yellow-400 font-mono">{tid}</span>
            </p>
            <p className="text-xs text-slate-500">Funds will be credited within 5–15 minutes after verification.</p>
            <button onClick={onClose} className="mt-2 rounded-xl bg-green-500 hover:bg-green-400 px-8 py-2.5 text-sm font-bold text-white transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="flex flex-col gap-5 p-5">

            {/* payment method selection */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Select Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {METHODS.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMethod(m.key)}
                    className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-semibold transition-all ${
                      method === m.key
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* account details */}
            <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4">
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wide font-semibold">Send funds to this account</p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Account Title</span>
                  <span className="text-xs font-semibold text-white">{selected.title}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">Number / IBAN</span>
                  <span className="text-xs font-mono font-bold text-yellow-400 select-all">{selected.account}</span>
                </div>
              </div>
            </div>

            {/* quick amounts */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Quick Amount</p>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAmount(String(a))}
                    className={`rounded-xl border py-2 text-xs font-bold transition-all ${
                      amount === String(a)
                        ? 'border-green-500 bg-green-500/15 text-green-400'
                        : 'border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    Rs {a}
                  </button>
                ))}
              </div>
            </div>

            {/* custom amount */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Custom Amount (Rs)</label>
              <input
                type="number"
                min="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-green-500 focus:ring-1 focus:ring-green-500/40 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* TID input */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Transaction ID (TID)</label>
              <input
                type="text"
                value={tid}
                onChange={(e) => setTid(e.target.value)}
                placeholder="e.g. EP2024081512345"
                className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-green-500 focus:ring-1 focus:ring-green-500/40 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
              />
              <p className="mt-1 text-[10px] text-slate-500">Found in your payment app's transaction history</p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-green-500 hover:bg-green-400 active:scale-95 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition-all"
            >
              ✅ Confirm Deposit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
