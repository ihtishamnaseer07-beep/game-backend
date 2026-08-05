export const COUNTRY_PHONE_OPTIONS = [
  {
    code: '+966',
    flag: '🇸🇦',
    label: 'Saudi Arabia',
    startsWith: '5',
    digits: 9,
    sample: '5XXXXXXXX',
  },
  {
    code: '+92',
    flag: '🇵🇰',
    label: 'Pakistan',
    startsWith: '3',
    digits: 10,
    sample: '3XXXXXXXXX',
  },
];

export function sanitizePhoneDigits(value = '') {
  return String(value).replace(/\D/g, '');
}

export function getCountryByCode(code = '+92') {
  return COUNTRY_PHONE_OPTIONS.find((option) => option.code === code) || COUNTRY_PHONE_OPTIONS[1];
}

export function getPhonePlaceholder(countryCode = '+92') {
  return getCountryByCode(countryCode).sample;
}

export function assembleInternationalPhone(countryCode = '+92', nationalNumber = '') {
  const digits = sanitizePhoneDigits(nationalNumber);
  return `${countryCode}${digits}`;
}

export function parseInternationalPhone(phone = '', fallbackCountryCode = '+92') {
  const raw = String(phone).trim();

  if (raw.startsWith('+966')) {
    return {
      countryCode: '+966',
      nationalNumber: sanitizePhoneDigits(raw.slice(4)),
      fullPhone: raw,
    };
  }

  if (raw.startsWith('+92')) {
    return {
      countryCode: '+92',
      nationalNumber: sanitizePhoneDigits(raw.slice(3)),
      fullPhone: raw,
    };
  }

  const digits = sanitizePhoneDigits(raw);
  return {
    countryCode: fallbackCountryCode,
    nationalNumber: digits,
    fullPhone: assembleInternationalPhone(fallbackCountryCode, digits),
  };
}

export function validatePhoneByCountry(countryCode = '+92', nationalNumber = '') {
  const country = getCountryByCode(countryCode);
  const digits = sanitizePhoneDigits(nationalNumber);

  if (!digits) {
    return {
      valid: false,
      message: 'Mobile number is required.',
    };
  }

  if (!digits.startsWith(country.startsWith)) {
    return {
      valid: false,
      message: `${country.label} number must start with ${country.startsWith}.`,
    };
  }

  if (digits.length !== country.digits) {
    return {
      valid: false,
      message: `${country.label} number must be exactly ${country.digits} digits after ${country.code}.`,
    };
  }

  return {
    valid: true,
    message: '',
  };
}

export function formatPhoneWithCountry(phone = '') {
  const parsed = parseInternationalPhone(phone);
  const country = getCountryByCode(parsed.countryCode);
  return `${country.flag} ${parsed.countryCode} ${parsed.nationalNumber}`.trim();
}