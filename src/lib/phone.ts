/**
 * Phone number normalization, validation, and international formatting utilities.
 * Enforces E.164 standard (+213XXXXXXXXX) and user-friendly international spacing (+213 5XX XX XX XX).
 */

export interface CountryCodeOption {
  code: string;
  iso: string;
  name: string;
  flag: string;
  dialCode: string;
}

export const SUPPORTED_COUNTRIES: CountryCodeOption[] = [
  { code: '+213', iso: 'DZ', name: 'Algérie', flag: '🇩🇿', dialCode: '213' },
  { code: '+33', iso: 'FR', name: 'France', flag: '🇫🇷', dialCode: '33' },
  { code: '+216', iso: 'TN', name: 'Tunisie', flag: '🇹🇳', dialCode: '216' },
  { code: '+212', iso: 'MA', name: 'Maroc', flag: '🇲🇦', dialCode: '212' },
  { code: '+1', iso: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '1' },
];

export const DEFAULT_COUNTRY: CountryCodeOption = SUPPORTED_COUNTRIES[0]; // Algeria +213

/**
 * Normalizes any user-entered phone number into a canonical E.164 international format.
 * Examples:
 *   - "0550 12 34 56" -> "+213550123456"
 *   - "0550123456"    -> "+213550123456"
 *   - "550123456"     -> "+213550123456"
 *   - "00213550123456"-> "+213550123456"
 *   - "213550123456"  -> "+213550123456"
 *   - "+213 550 12 34 56" -> "+213550123456"
 */
export function normalizePhoneNumber(
  input: string | null | undefined,
  defaultPrefix = '+213'
): string {
  if (!input) return '';

  // Remove spaces, dashes, dots, parentheses, and tabs
  let cleaned = input.trim().replace(/[\s\-.()]/g, '');

  if (!cleaned) return '';

  // Handle leading 00 (international call prefix, e.g., 00213...)
  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  // If already starts with '+', validate and return clean
  if (cleaned.startsWith('+')) {
    const digitsOnly = cleaned.slice(1).replace(/\D/g, '');
    return `+${digitsOnly}`;
  }

  // Handle number starting with 213 (missing +)
  if (cleaned.startsWith('213') && cleaned.length >= 11) {
    const digitsOnly = cleaned.replace(/\D/g, '');
    return `+${digitsOnly}`;
  }

  // Handle Algerian local number starting with '0' (e.g., 0550..., 0661..., 0770..., 021...)
  if (cleaned.startsWith('0')) {
    const localDigits = cleaned.slice(1).replace(/\D/g, '');
    return `${defaultPrefix}${localDigits}`;
  }

  // Handle 9-digit Algerian number entered without leading '0' (e.g. 550123456)
  if (/^[567]\d{8}$/.test(cleaned) || /^[23489]\d{7,8}$/.test(cleaned)) {
    const digitsOnly = cleaned.replace(/\D/g, '');
    return `${defaultPrefix}${digitsOnly}`;
  }

  // Default fallback: prepend default prefix if missing plus
  const digits = cleaned.replace(/\D/g, '');
  if (!digits) return '';
  return `${defaultPrefix}${digits}`;
}

/**
 * Formats a phone number into an international readable string with spacing.
 * Examples:
 *   - "+213550123456" -> "+213 550 12 34 56"
 *   - "0550123456"    -> "+213 550 12 34 56"
 *   - "0661554433"    -> "+213 661 55 44 33"
 *   - "0770112233"    -> "+213 770 11 22 33"
 *   - "021123456"     -> "+213 21 12 34 56"
 */
export function formatPhoneNumber(input: string | null | undefined): string {
  if (!input) return '';

  const normalized = normalizePhoneNumber(input);
  if (!normalized) return input || '';

  // Algerian numbers (+213...)
  if (normalized.startsWith('+213')) {
    const rest = normalized.slice(4); // the digits after +213

    // Mobile: 9 digits starting with 5, 6, 7 (e.g. 550 12 34 56)
    if (rest.length === 9 && ['5', '6', '7'].includes(rest[0])) {
      return `+213 ${rest.slice(0, 3)} ${rest.slice(3, 5)} ${rest.slice(5, 7)} ${rest.slice(7, 9)}`;
    }

    // Landline: 8 or 9 digits (e.g. 21 12 34 56)
    if (rest.length === 8) {
      return `+213 ${rest.slice(0, 2)} ${rest.slice(2, 4)} ${rest.slice(4, 6)} ${rest.slice(6, 8)}`;
    }
    if (rest.length === 9) {
      return `+213 ${rest.slice(0, 3)} ${rest.slice(3, 5)} ${rest.slice(5, 7)} ${rest.slice(7, 9)}`;
    }

    // Partial or uneven digits
    if (rest.length > 0) {
      return `+213 ${rest}`;
    }
    return '+213';
  }

  // French numbers (+33...)
  if (normalized.startsWith('+33')) {
    const rest = normalized.slice(3);
    if (rest.length === 9) {
      return `+33 ${rest[0]} ${rest.slice(1, 3)} ${rest.slice(3, 5)} ${rest.slice(5, 7)} ${rest.slice(7, 9)}`;
    }
    return `+33 ${rest}`;
  }

  // General format: +[country] [rest with space every 2-3 digits]
  return normalized;
}

/**
 * Formats a phone number for display with country flag emoji.
 * Example: "🇩🇿 +213 550 12 34 56"
 */
export function formatPhoneWithFlag(input: string | null | undefined): string {
  if (!input) return '';
  const formatted = formatPhoneNumber(input);
  if (formatted.startsWith('+213')) {
    return `🇩🇿 ${formatted}`;
  }
  if (formatted.startsWith('+33')) {
    return `🇫🇷 ${formatted}`;
  }
  if (formatted.startsWith('+216')) {
    return `🇹🇳 ${formatted}`;
  }
  if (formatted.startsWith('+212')) {
    return `🇲🇦 ${formatted}`;
  }
  return formatted;
}

/**
 * Validates whether an input represents a valid international or Algerian mobile/fixed line.
 */
export function isValidPhoneNumber(input: string | null | undefined): boolean {
  if (!input) return false;
  const normalized = normalizePhoneNumber(input);

  // Algerian mobile: +213 followed by 9 digits starting with 5, 6, 7
  if (normalized.startsWith('+213')) {
    const digits = normalized.slice(4);
    return /^[567]\d{8}$/.test(digits) || /^[23489]\d{7,8}$/.test(digits);
  }

  // General international check: '+' followed by 8 to 15 digits
  return /^\+\d{8,15}$/.test(normalized);
}

/**
 * Splits phone into country code and local national digits for form input fields.
 */
export function parsePhoneParts(input: string | null | undefined): {
  countryCode: string;
  nationalNumber: string;
} {
  if (!input) {
    return { countryCode: '+213', nationalNumber: '' };
  }

  const normalized = normalizePhoneNumber(input);

  for (const country of SUPPORTED_COUNTRIES) {
    if (normalized.startsWith(country.code)) {
      return {
        countryCode: country.code,
        nationalNumber: normalized.slice(country.code.length),
      };
    }
  }

  if (normalized.startsWith('+')) {
    return {
      countryCode: '+213',
      nationalNumber: normalized.slice(1),
    };
  }

  return {
    countryCode: '+213',
    nationalNumber: normalized.replace(/^\+?213|^0/, ''),
  };
}
