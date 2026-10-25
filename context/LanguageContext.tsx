'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, Currency, translations } from '@/lib/i18n';
import { formatRupiah } from '@/lib/utils';

interface LanguageContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: typeof translations.en;
  formatMoney: (amountIdr: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'aura_bakery_lang_v1';
const CURRENCY_STORAGE_KEY = 'aura_bakery_curr_v1';

// Exchange rate conversion: 1 USD ≈ 16,000 IDR
export function convertIdrToUsd(amountIdr: number): number {
  return Number((amountIdr / 16000).toFixed(2));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default to 'en' (English) as requested by user
  const [language, setLanguageState] = useState<Language>('en');
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      const savedCurr = localStorage.getItem(CURRENCY_STORAGE_KEY) as Currency;
      if (savedLang === 'en' || savedLang === 'id') {
        setLanguageState(savedLang);
      }
      if (savedCurr === 'USD' || savedCurr === 'IDR') {
        setCurrencyState(savedCurr);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    // Auto-align default currency: en -> USD, id -> IDR
    const newCurr = lang === 'en' ? 'USD' : 'IDR';
    setCurrencyState(newCurr);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
      localStorage.setItem(CURRENCY_STORAGE_KEY, newCurr);
    } catch {
      // Ignore
    }
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, curr);
    } catch {
      // Ignore
    }
  };

  const t = translations[language] || translations.en;

  const formatMoney = (amountIdr: number): string => {
    if (currency === 'USD') {
      const usd = convertIdrToUsd(amountIdr);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(usd);
    }
    return formatRupiah(amountIdr);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        currency,
        setLanguage,
        setCurrency,
        t,
        formatMoney,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
