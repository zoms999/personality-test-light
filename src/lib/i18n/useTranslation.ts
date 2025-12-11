import { useLocaleStore } from '@/stores/localeStore';
import { type Locale } from './i18n';

// 번역 데이터 import
import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import vi from './locales/vi.json';

const translations: Record<Locale, typeof ko> = {
  ko,
  en,
  ja,
  vi,
};

type TranslationKeys = typeof ko;
type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<TranslationKeys>;

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key} for locale: ${locale}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`);
      return key;
    }

    // 파라미터 치환
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return paramKey in params ? String(params[paramKey]) : match;
      });
    }

    return value;
  };

  return { t, locale };
}
