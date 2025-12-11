// 지원 언어 목록
export const locales = ['ko', 'en', 'ja', 'vi'] as const;
export type Locale = typeof locales[number];

// 기본 언어
export const defaultLocale: Locale = 'ko';

// 언어 표시명
export const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  vi: 'Tiếng Việt',
};

// 언어 코드 유효성 검사
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

// 브라우저 언어 감지
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const browserLang = navigator.language.toLowerCase();
  
  // 정확한 매칭 (예: 'ko-KR' -> 'ko')
  const langCode = browserLang.split('-')[0];
  
  if (isValidLocale(langCode)) {
    return langCode;
  }
  
  return defaultLocale;
}
