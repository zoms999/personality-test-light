import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Locale, defaultLocale, isValidLocale, detectBrowserLocale } from '@/lib/i18n/i18n';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  initLocale: () => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: defaultLocale,
      
      setLocale: (locale: Locale) => {
        set({ locale });
      },
      
      initLocale: () => {
        // localStorage에서 저장된 언어 확인
        const stored = localStorage.getItem('locale-storage');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed.state?.locale && isValidLocale(parsed.state.locale)) {
              set({ locale: parsed.state.locale });
              return;
            }
          } catch (e) {
            console.error('Failed to parse stored locale:', e);
          }
        }
        
        // 저장된 언어가 없으면 브라우저 언어 감지
        const browserLocale = detectBrowserLocale();
        set({ locale: browserLocale });
      },
    }),
    {
      name: 'locale-storage',
    }
  )
);
