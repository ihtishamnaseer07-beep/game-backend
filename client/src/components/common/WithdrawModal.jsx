import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SmsOtpModal from './SmsOtpModal';
import { appendStoredRequest, WITHDRAWAL_REQUESTS_STORAGE_KEY } from '../../utils/requestQueue';

const GATEWAYS = [
  { key: 'easypaisa', label: 'EasyPaisa', emoji: '🟢' },
  { key: 'jazzcash', label: 'JazzCash', emoji: '🔴' },
  { key: 'bank', label: 'Bank Transfer', emoji: '🏦' },
];

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

export default function WithdrawModal({ balance = 0, onClose }) {
  const { user, updateUser } = useAuth();
  const [gateway, setGateway] = useState('easypaisa');
  const [form, setForm] = useState({ title: '', account: '', amount: '' });
  const [phone, setPhone] = useState(user?.phone || '');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);

  const otpStorageKey = `wt786_withdraw_otp_verified_${user?._id || user?.email || 'guest'}`;

  useEffect(() => {
    setPhone(user?.phone || '');
    setOtpVerified(localStorage.getItem(otpStorageKey) === 'true');
  }, [otpStorageKey, user?.phone]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!user?._id) {
      setError('Please login before requesting a withdrawal.');
      return;
    }

    if (!form.title.trim()) { setError('Account title is required.'); return; }
    if (!form.account.trim()) { setError('Account number is required.'); return; }
    if (!form.amount || Number(form.amount) < 500) {
      setError('Minimum withdrawal amount is Rs 500.');
      return;
    }
    if (Number(form.amount) > balance) {
      setError(`Insufficient balance. Your balance is Rs ${balance.toFixed(2)}.`);
      return;
    }

    const request = {
      title: form.title.trim(),
      account: form.account.trim(),
      amount: Number(form.amount),
    };

    if (!otpVerified) {
      setPendingRequest(request);
      setShowOtpModal(true);
      return;
    }

    finalizeWithdrawal(request);
  };

  const finalizeWithdrawal = (request) => {
    updateUser((prev) => ({ coins: Math.max(0, Number(prev?.coins || 0) - Number(request.amount || 0)) }));

    appendStoredRequest(WITHDRAWAL_REQUESTS_STORAGE_KEY, {
      id: `wd-${Math.random().toString(36).slice(2, 10)}`,
      userId: user._id,
      userName: user.name,
      phone,
      method: gateway,
      title: request.title,
      account: request.account,
      accountDetails: `${GATEWAYS.find((item) => item.key === gateway)?.label} • ${request.account}`,
      amount: request.amount,
      deducted: true,
      otpVerified: true,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    setSubmitted(true);
  };

  const handleOtpVerified = ({ phone: verifiedPhone }) => {
    localStorage.setItem(otpStorageKey, 'true');
    setOtpVerified(true);
    setShowOtpModal(false);
    if (verifiedPhone) setPhone(verifiedPhone);
    if (pendingRequest) {
      finalizeWithdrawal(pendingRequest);
      setPendingRequest(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm [-webkit-overflow-scrolling:touch]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {showOtpModal && (
        <SmsOtpModal
          title="Withdraw Mobile Verification"
          subtitle="Send the demo OTP to verify your mobile number before submitting a withdrawal."
          phone={phone}
          confirmLabel="Verify & Submit"
          onClose={() => setShowOtpModal(false)}
          onVerified={handleOtpVerified}
        />
      )}
      <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-700/60 shadow-2xl max-h-[90vh] overflow-y-auto scroll-smooth [-webkit-overflow-scrolling:touch] overscroll-contain">

        {/* header */}
        <div className="sticky top-0 bg-slate-900 flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-800 z-10">
          <div>
            <h2 className="text-base font-bold text-white">🏧 Withdraw Funds</h2>
            <p className="text-xs text-slate-500">Available: <span className="text-yellow-400 font-semibold">Rs {balance.toFixed(2)}</span></p>
            <p className="mt-1 text-[10px] text-slate-500">OTP status: {otpVerified ? 'Verified' : 'Required for first withdrawal'}</p>
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
            <span className="text-5xl">🎉</span>
            <h3 className="text-lg font-bold text-green-400">Withdrawal Requested!</h3>
            <p className="text-sm text-slate-400">
              <span className="text-white font-semibold">Rs {form.amount}</span> withdrawal to{' '}
              <span className="inline-flex items-center gap-2 text-white font-semibold">
                <PaymentLogo method={gateway} />
                <span>{form.account}</span>
              </span>
              <br />via <span className="inline-flex items-center gap-2 text-white font-semibold"><PaymentLogo method={gateway} /><span>{GATEWAYS.find((g) => g.key === gateway)?.label}</span></span> has been submitted.
            </p>
            <p className="text-xs text-cyan-300">Status: Pending Withdrawal</p>
            <p className="text-xs text-slate-500">Processing time: 30 minutes to 24 hours.</p>
            <button onClick={onClose} className="mt-2 rounded-xl bg-green-500 hover:bg-green-400 px-8 py-2.5 text-sm font-bold text-white transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">

            {/* gateway selection */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Withdrawal Gateway</p>
              <div className="grid grid-cols-3 gap-2">
                {GATEWAYS.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => setGateway(g.key)}
                    className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-semibold transition-all duration-150 ease-in-out active:scale-95 active:opacity-70 ${
                      gateway === g.key
                        ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                        : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-xl">{g.emoji}</span>
                    <PaymentText method={g.key} label={g.label} />
                  </button>
                ))}
              </div>
            </div>

            {/* account title */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Account Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Ali Hassan"
                className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* account number */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {gateway === 'bank' ? 'IBAN / Account Number' : 'Mobile / Account Number'}
              </label>
              <input
                name="account"
                value={form.account}
                onChange={handleChange}
                placeholder={gateway === 'bank' ? 'PK36MEZN...' : '03XX-XXXXXXX'}
                className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none font-mono transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Mobile Number for OTP</label>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+92 3001234567"
                className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* amount */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Withdrawal Amount (Rs)</label>
              <input
                name="amount"
                type="number"
                min="500"
                value={form.amount}
                onChange={handleChange}
                placeholder="Min Rs 500"
                className="mt-1 w-full rounded-xl bg-slate-800 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* notice */}
            <div className="rounded-xl bg-slate-800/60 border border-slate-700/60 px-4 py-3 text-xs text-slate-400">
              ⚠️ Ensure account details are correct. Incorrect info may cause permanent loss of funds.
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2 text-xs text-red-400">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 active:opacity-70 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-150 ease-in-out"
            >
              {otpVerified ? '🏧 Submit Withdrawal Request' : '🔐 Verify OTP & Submit'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
