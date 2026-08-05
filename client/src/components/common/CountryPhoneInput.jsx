import { COUNTRY_PHONE_OPTIONS, getPhonePlaceholder, sanitizePhoneDigits } from '../../utils/phoneUtils';

export default function CountryPhoneInput({
  label = 'Mobile Number',
  countryCode,
  onCountryCodeChange,
  phoneNumber,
  onPhoneNumberChange,
  required = false,
  helperText = '',
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
      <div className="flex gap-2">
        <select
          value={countryCode}
          onChange={(event) => onCountryCodeChange?.(event.target.value)}
          className="w-36 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 px-3 py-2.5 text-sm text-white outline-none transition-all"
        >
          {COUNTRY_PHONE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.flag} {option.code}
            </option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="numeric"
          value={phoneNumber}
          onChange={(event) => onPhoneNumberChange?.(sanitizePhoneDigits(event.target.value))}
          placeholder={getPhonePlaceholder(countryCode)}
          required={required}
          className="flex-1 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
        />
      </div>
      {helperText && <p className="text-[10px] text-slate-500">{helperText}</p>}
    </div>
  );
}