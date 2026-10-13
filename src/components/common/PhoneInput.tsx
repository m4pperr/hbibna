'use client';

import React, { useState, useEffect, useId } from 'react';
import { ChevronDown, Phone } from 'lucide-react';
import {
  SUPPORTED_COUNTRIES,
  DEFAULT_COUNTRY,
  type CountryCodeOption,
  normalizePhoneNumber,
  parsePhoneParts,
} from '@/lib/phone';

export interface PhoneInputProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (normalizedE164: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function PhoneInput({
  id,
  name = 'phone',
  value: controlledValue,
  defaultValue,
  onChange,
  required = false,
  disabled = false,
  placeholder = '550 12 34 56',
  className = '',
  autoFocus = false,
}: PhoneInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;

  // Initialize selected country & local digits
  const initialParts = parsePhoneParts(controlledValue ?? defaultValue ?? '');
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeOption>(() => {
    const found = SUPPORTED_COUNTRIES.find((c) => c.code === initialParts.countryCode);
    return found || DEFAULT_COUNTRY;
  });

  const [localNumber, setLocalNumber] = useState<string>(() => {
    return formatLocalDigits(initialParts.nationalNumber);
  });

  const [isOpen, setIsOpen] = useState(false);

  // Sync with controlled value if provided
  useEffect(() => {
    if (controlledValue !== undefined) {
      const parts = parsePhoneParts(controlledValue);
      const found = SUPPORTED_COUNTRIES.find((c) => c.code === parts.countryCode);
      if (found) setSelectedCountry(found);
      setLocalNumber(formatLocalDigits(parts.nationalNumber));
    }
  }, [controlledValue]);

  // Format local digits with friendly spaces: XXX XX XX XX
  function formatLocalDigits(raw: string): string {
    const digits = raw.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
  }

  // Handle user typing
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;

    // Check if user pasted an international number starting with +
    if (inputVal.startsWith('+')) {
      const parts = parsePhoneParts(inputVal);
      const match = SUPPORTED_COUNTRIES.find((c) => c.code === parts.countryCode);
      if (match) setSelectedCountry(match);
      inputVal = parts.nationalNumber;
    } else if (inputVal.startsWith('00213')) {
      setSelectedCountry(DEFAULT_COUNTRY);
      inputVal = inputVal.slice(5);
    } else if (inputVal.startsWith('213') && inputVal.length > 9) {
      setSelectedCountry(DEFAULT_COUNTRY);
      inputVal = inputVal.slice(3);
    }

    // Automatically strip leading '0' for local Algerian numbers (e.g. user typing 0550...)
    if (inputVal.startsWith('0')) {
      inputVal = inputVal.slice(1);
    }

    const cleanDigits = inputVal.replace(/\D/g, '').slice(0, 9);
    const formatted = formatLocalDigits(cleanDigits);
    setLocalNumber(formatted);

    // Compute canonical E.164
    const e164 = cleanDigits ? `${selectedCountry.code}${cleanDigits}` : '';
    onChange?.(e164);
  };

  const handleCountrySelect = (country: CountryCodeOption) => {
    setSelectedCountry(country);
    setIsOpen(false);
    const cleanDigits = localNumber.replace(/\D/g, '');
    const e164 = cleanDigits ? `${country.code}${cleanDigits}` : '';
    onChange?.(e164);
  };

  // Full canonical E.164 value for hidden input
  const cleanDigits = localNumber.replace(/\D/g, '');
  const normalizedValue = cleanDigits ? `${selectedCountry.code}${cleanDigits}` : '';

  return (
    <div className={`relative ${className}`}>
      {/* Hidden canonical input for native Form submission */}
      <input type="hidden" name={name} value={normalizedValue} />

      <div className="flex items-center rounded-2xl border-2 border-black bg-[#FFF9D2] focus-within:bg-white focus-within:ring-2 focus-within:ring-black shadow-[0_3px_0_#000] transition-all overflow-visible">
        {/* Country Code Dropdown Trigger */}
        <div className="relative shrink-0">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-3 rounded-l-2xl border-r-2 border-black/20 hover:bg-black/5 text-sm font-black text-black cursor-pointer select-none transition-colors"
            title={`${selectedCountry.name} (${selectedCountry.code})`}
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="font-mono text-xs">{selectedCountry.code}</span>
            <ChevronDown className="w-3.5 h-3.5 text-black/60 shrink-0" />
          </button>

          {/* Country Selector Dropdown Menu */}
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 z-50 w-48 bg-white border-2 border-black rounded-2xl shadow-[0_6px_0_#000] py-1 max-h-56 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-black uppercase text-black/50 border-b border-black/10">
                  Indicatif Pays
                </div>
                {SUPPORTED_COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold hover:bg-[#FFE600] transition-colors cursor-pointer text-left ${
                      selectedCountry.code === country.code
                        ? 'bg-[#FFF9D2] font-black'
                        : ''
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{country.flag}</span>
                      <span className="text-black">{country.name}</span>
                    </span>
                    <span className="font-mono text-black/70 text-[11px]">
                      {country.code}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Local Number Input Field */}
        <div className="relative flex-1 flex items-center">
          <input
            id={inputId}
            type="tel"
            inputMode="tel"
            required={required}
            disabled={disabled}
            autoFocus={autoFocus}
            value={localNumber}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full px-3.5 py-3 bg-transparent text-sm font-bold text-black placeholder-black/40 focus:outline-none font-mono tracking-wide"
          />
        </div>
      </div>
    </div>
  );
}
