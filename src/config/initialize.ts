import { initializeWebApp } from '@sudobility/di_web';
import { configureTheme } from '@sudobility/design';
import { defaultTheme } from '@sudobility/design/themes';
import { FIREBASE_CONFIG } from './constants';
import { initializeI18n } from '../i18n';

// Activate the design-system theme so `@sudobility/components` render theme-aware
// semantic classes (bg-primary, ...) that resolve via the :root/.dark CSS
// variables in index.css + createTailwindPreset() in tailwind.config.js —
// matching the RN apps and making all design styles + light/dark work.
configureTheme(defaultTheme);

export async function initializeApp(): Promise<void> {
  await initializeWebApp({
    firebaseConfig: FIREBASE_CONFIG,
    initializeI18n,
    registerServiceWorker: false,
  });
}
