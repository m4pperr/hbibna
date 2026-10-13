'use client';

import React, { useState, forwardRef, useId } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showLeftIcon?: boolean;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      id,
      name = 'password',
      placeholder = '••••••••',
      showLeftIcon = true,
      leftIcon,
      containerClassName = '',
      className = '',
      required = false,
      disabled = false,
      showPasswordLabel = 'Afficher le mot de passe',
      hidePasswordLabel = 'Masquer le mot de passe',
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsVisible((prev) => !prev);
    };

    return (
      <div className={`relative w-full ${containerClassName}`}>
        {showLeftIcon && (
          <div className="absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-black/60 flex items-center justify-center">
            {leftIcon || <Lock className="w-4 h-4" />}
          </div>
        )}

        <input
          {...rest}
          ref={ref}
          id={inputId}
          name={name}
          type={isVisible ? 'text' : 'password'}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full py-3 rounded-2xl border-2 border-black bg-[#FFF9D2] focus:bg-white text-sm font-bold text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-black shadow-inner transition-colors ${
            showLeftIcon ? 'ltr:pl-10 rtl:pr-10' : 'ltr:pl-4 rtl:pr-4'
          } ltr:pr-11 rtl:pl-11 ${className}`}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={toggleVisibility}
          disabled={disabled}
          aria-label={isVisible ? hidePasswordLabel : showPasswordLabel}
          title={isVisible ? hidePasswordLabel : showPasswordLabel}
          className="absolute ltr:right-3.5 rtl:left-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-black/60 hover:text-black hover:bg-black/5 active:scale-95 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-40"
        >
          {isVisible ? (
            <EyeOff className="w-4 h-4 stroke-[2.2]" />
          ) : (
            <Eye className="w-4 h-4 stroke-[2.2]" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
