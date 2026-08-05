import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appendStoredRequest, DEPOSIT_REQUESTS_STORAGE_KEY } from '../../utils/requestQueue';

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

function PaymentLogo({ method }) {
  if (method === 'easypaisa') {
    return (
      <svg viewBox="0 0 120 32" className="h-6 max-h-6 w-auto shrink-0" aria-hidden="true" role="img">
        <rect x="1" y="1" width="118" height="30" rx="8" fill="#0b5f3a" />
        <path d="M18 8h10c3 0 5 2 5 5s-2 5-5 5h-6v6h-4V8zm4 8h5c1 0 2-1 2-3s-1-3-2-3h-5v6z" fill="#ffffff" />
        <path d="M42 8h14v3H46v4h8v3h-8v4h10v3H42V8z" fill="#c7ffd7" />
        <path d="M62 8h4l5 8 5-8h4v18h-4V14l-5 8-5-8v12h-4V8z" fill="#ffffff" />
        <path d="M96 8h4l8 18h-4.4l-1.6-3.8H94l-1.6 3.8H88L96 8zm4.7 11.8L98 13l-2.7 6.8h5.4z" fill="#8af0b0" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 32" className="h-6 max-h-6 w-auto shrink-0" aria-hidden="true" role="img">
      <rect x="1" y="1" width="118" height="30" rx="8" fill="#7a1531" />
      <path d="M14 8h5.8c4.9 0 8.2 2.7 8.2 6.9 0 4.3-3.4 7.1-8.2 7.1H18v4h-4V8zm4 11h1.4c2.7 0 4.4-1.3 4.4-4s-1.7-4-4.4-4H18v8z" fill="#ffffff" />
      <path d="M41 8h4l5 14 5-14h4l-7 18h-4.1L41 8z" fill="#ffdce5" />
      <path d="M64 8h12v3h-8v3h7v3h-7v6h-4V8z" fill="#ffffff" />
      <path d="M81 8h4v18h-4V8zm7 0h4l7 10V8h4v18h-4l-7-10v10h-4V8z" fill="#ffdce5" />
      <path d="M108 11h-4V8h10v3h-4v15h-4V11z" fill="#ffffff" />
    </svg>
  );
}

function PaymentText({ method, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <PaymentLogo method={method} />
      <span>{label}</span>
    </span>
  );
}

export default function DepositModal({ onClose }) {
  const { user } = useAuth();
  const [method, setMethod] = useState('easypaisa');
  const [amount, setAmount] = useState('');
  const [tid, setTid] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const selected = METHODS.find((m) => m.key === method);
  const instructions = useMemo(() => [
    '1. Transfer money to the official account above via EasyPaisa or JazzCash.',
    '2. Enter the 12-digit Transaction ID (TID / Trx ID) from your SMS receipt.',
    '3. Upload a screenshot so the admin can verify your payment faster.',
  ], []);

  const handleCopy = async (text, label) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1800);
  };

  const handleReceiptChange = (event) => {
    const file = event.target.files?.[0] || null;
    setReceipt(file);
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    setError('');
    if (!user?._id) {
      setError('Please login before submitting a deposit request.');
      return;
    }
    if (!amount || Number(amount) < 100) {
      setError('Minimum deposit amount is Rs 100.');
      return;
    }
    if (!/^\d{12}$/.test(tid.trim())) {
      setError('Please enter a valid 12-digit Transaction ID (TID).');
      return;
    }

    const proofReader = receipt
      ? new FileReader()
      : null;

    const finalizeDeposit = (receiptData = '') => {
      appendStoredRequest(DEPOSIT_REQUESTS_STORAGE_KEY, {
        id: `dep-${Math.random().toString(36).slice(2, 10)}`,
        userId: user._id,
        userName: user.name,
        phone: user.phone || '',
        amount: Number(amount),
        gateway: selected.label,
        accountTitle: selected.title,
        accountNumber: selected.account,
        tid: tid.trim(),
        receiptName: receipt?.name || '',
        receiptData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      setSubmitted(true);
    };

    if (!proofReader) {
      finalizeDeposit('');
      return;
    }

    proofReader.onload = () => finalizeDeposit(String(proofReader.result || ''));
    proofReader.readAsDataURL(receipt);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm [-webkit-overflow-scrolling:touch]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl max-h-[92vh] overflow-y-auto scroll-smooth [-webkit-overflow-scrolling:touch] overscroll-contain">

        {/* header */}
        <div className="sticky top-0 bg-slate-900 flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-800 z-10">
          <div>
            <h2 className="text-base font-bold text-white">💰 Deposit Funds</h2>
            <p className="text-xs text-slate-500">Transfer & submit TID to confirm</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-150 ease-in-out text-lg active:scale-95 active:opacity-70"
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
              <br />Status: <span className="text-cyan-300 font-semibold">Pending Deposit</span>
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
                    className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-semibold transition-all duration-150 ease-in-out active:scale-95 active:opacity-70 ${
                      method === m.key
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <PaymentText method={m.key} label={m.label} />
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
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <span className="inline-flex items-center gap-2">
                      <PaymentLogo method={selected.key} />
                      <span>{selected.title}</span>
                    </span>
                    <button type="button" onClick={() => handleCopy(selected.title, 'title')} className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] font-bold text-slate-300">
                      {copied === 'title' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">Number / IBAN</span>
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-yellow-400 select-all">
                    <span className="inline-flex items-center gap-2">
                      <PaymentLogo method={selected.key} />
                      <span>{selected.account}</span>
                    </span>
                    <button type="button" onClick={() => handleCopy(selected.account, 'account')} className="rounded-full border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] font-bold text-slate-300">
                      {copied === 'account' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-xs text-cyan-200">
              <p className="font-bold text-cyan-300">Deposit Steps</p>
              <ul className="mt-2 space-y-1 leading-relaxed">
                {instructions.map((step) => <li key={step}>{step}</li>)}
              </ul>
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
                    className={`rounded-xl border py-2 text-xs font-bold transition-all duration-150 ease-in-out active:scale-95 active:opacity-70 ${
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
                placeholder="12-digit Transaction ID"
                className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-green-500 focus:ring-1 focus:ring-green-500/40 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
              />
              <p className="mt-1 text-[10px] text-slate-500">Found in your payment app's transaction history.</p>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Upload Screenshot / Receipt</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleReceiptChange}
                className="mt-1 w-full rounded-xl border border-dashed border-slate-700 bg-slate-800/60 px-4 py-3 text-xs text-slate-300 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:text-xs file:font-bold file:text-slate-950"
              />
              <p className="mt-1 text-[10px] text-slate-500">Optional, but recommended for faster approval.</p>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-green-500 hover:bg-green-400 active:scale-95 active:opacity-70 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition-all duration-150 ease-in-out"
            >
              ✅ Confirm Deposit
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
