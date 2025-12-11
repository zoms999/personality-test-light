'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, AlertCircle } from 'lucide-react';
import { useLocaleStore } from '@/stores/localeStore';
import { localeNames, type Locale } from '@/lib/i18n/i18n';

interface LanguageSelectorProps {
  disabled?: boolean;
  onDisabledClick?: () => void;
}

export default function LanguageSelector({ disabled = false, onDisabledClick }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { locale, setLocale } = useLocaleStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleButtonClick = () => {
    if (disabled && onDisabledClick) {
      onDisabledClick();
      return;
    }
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleLocaleChange = (newLocale: Locale) => {
    if (!disabled) {
      setLocale(newLocale);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleButtonClick}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
          ${disabled 
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-slate-300 shadow-sm'
          }
        `}
        disabled={disabled}
      >
        {disabled ? (
          <AlertCircle size={16} className="text-slate-400" />
        ) : (
          <Globe size={16} />
        )}
        <span>{localeNames[locale]}</span>
        {!disabled && (
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && !disabled && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50">
          {Object.entries(localeNames).map(([code, name]) => (
            <button
              key={code}
              type="button"
              onClick={() => handleLocaleChange(code as Locale)}
              className={`
                w-full text-left px-4 py-2 text-sm transition-colors duration-150
                ${locale === code 
                  ? 'bg-blue-50 text-blue-700 font-semibold' 
                  : 'text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
