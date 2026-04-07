import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'zh'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const isLanguageSupported = (lang: string): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};

let initialized = false;

export async function initializeI18n(): Promise<typeof i18next> {
  if (initialized) return i18next;
  initialized = true;

  await i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      lng: 'en',
      fallbackLng: 'en',
      defaultNS: 'common',
      ns: ['common'],
      resources: {
        en: {
          common: {
            'navigation.home': 'Home',
            'navigation.vendor': 'Vendor',
            'navigation.docs': 'Docs',
            'navigation.dashboard': 'Dashboard',
            'navigation.login': 'Login',
            'footer.privacyPolicy': 'Privacy Policy',
            'footer.termsOfService': 'Terms of Service',
          },
        },
      },
      detection: {
        order: ['localStorage', 'navigator'],
        lookupLocalStorage: 'language',
      },
      interpolation: { escapeValue: false },
    });

  return i18next;
}

export default i18next;
