import { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppSettings } from '../../context/AppSettingsContext';
import { API_URL } from '../../config';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000];

const PAYMENT_LOGOS = {
  easypaisa: {
    src: '/assets/payments/easypaisa.png',
    alt: 'EasyPaisa',
    fallback: '🟢',
  },
  jazzcash: {
    src: '/assets/payments/jazzcash.png',
    alt: 'JazzCash',
    fallback: '🔴',
  },
  bank: {
    src: '/assets/payments/bank.png',
    alt: 'Bank Transfer',
    fallback: '🏦',
  },
};

function PaymentLogo({ method }) {
  const selectedLogo = PAYMENT_LOGOS[method] || PAYMENT_LOGOS.bank;

  return (
    <span className="inline-flex items-center justify-center">
      <img
        src={selectedLogo.src}
        alt={selectedLogo.alt}
        onError={(event) => {
          event.currentTarget.style.display = 'none';
          const fallback = event.currentTarget.nextElementSibling;
          if (fallback) fallback.classList.remove('hidden');
        }}
        className="max-h-10 w-auto object-contain"
      />
      <span className="hidden text-lg leading-none">{selectedLogo.fallback}</span>
    </span>
  );
}

function PaymentText({ method, label }) {
  return (
    <span className="mt-2 block text-center text-xs font-bold text-slate-100">
      <PaymentLogo method={method} />
      <span className="mt-1 block">{label}</span>
    </span>
  );
}

export default function DepositModal({ onClose }) {
  const { settings } = useAppSettings();
  const { user, token } = useAuth();
  const [method, setMethod] = useState('easypaisa');
  const [amount, setAmount] = useState('');
  const [tid, setTid] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const methods = useMemo(() => [
    {
      key: 'easypaisa',
      label: 'EasyPaisa',
      emoji: '🟢',
      account: settings?.easypaisaDetails?.accountNumber || '0300-1234567',
      title: settings?.easypaisaDetails?.accountTitle || 'WIN TOON 786 (EP)',
    },
    {
      key: 'jazzcash',
      label: 'JazzCash',
      emoji: '🔴',
      account: settings?.jazzcashDetails?.accountNumber || '0301-7654321',
      title: settings?.jazzcashDetails?.accountTitle || 'WIN TOON 786 (JC)',
    },
    {
      key: 'bank',
      label: 'Bank Transfer',
      emoji: '🏦',
      account: settings?.bankDetails?.accountNumber || 'PK36 MEZN 0001 0103 0101 23',
      title: settings?.bankDetails?.accountTitle || 'WIN TOON 786 Pvt Ltd — Meezan Bank',
    },
  ], [settings]);

  const selected = methods.find((m) => m.key === method) || methods[0];
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

  const handleConfirm = async (e) => {
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

    const readReceiptData = () => new Promise((resolve, reject) => {
      if (!receipt) {
        resolve('');
        return;
      }

      const proofReader = new FileReader();
      proofReader.onload = () => resolve(String(proofReader.result || ''));
      proofReader.onerror = () => reject(new Error('Unable to read screenshot.'));
      proofReader.readAsDataURL(receipt);
    });

    setLoading(true);

    try {
      const receiptData = await readReceiptData();
      const response = await fetch(`${API_URL}/api/payments/requests/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          gateway: selected.label,
          transactionId: tid.trim(),
          accountTitle: selected.title,
          accountNumber: selected.account,
          receiptName: receipt?.name || '',
          receiptData,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to submit deposit request.');
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError.message || 'Unable to submit deposit request.');
    } finally {
      setLoading(false);
    }
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
                {methods.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setMethod(m.key)}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 text-xs font-semibold transition-all duration-150 ease-in-out active:scale-95 active:opacity-70 ${
                      method === m.key
                        ? 'border-green-500 bg-green-500/10 text-green-400'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500'
                    }`}
                  >
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
              {loading ? 'Submitting...' : '✅ Confirm Deposit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
