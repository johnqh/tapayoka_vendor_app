import packageJson from '../../package.json';

export const CONSTANTS = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Tapayoka Vendor',
  APP_DOMAIN: import.meta.env.VITE_APP_DOMAIN || 'tapayoka.com',
  COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME || 'Sudobility',
  APP_VERSION: packageJson.version,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8025',

  SOCIAL_LINKS: {
    twitterUrl: import.meta.env.VITE_TWITTER_URL || '',
    githubUrl: import.meta.env.VITE_GITHUB_URL || '',
    linkedinUrl: import.meta.env.VITE_LINKEDIN_URL || '',
    discordUrl: import.meta.env.VITE_DISCORD_URL || '',
  },

  STATUS_PAGE_URL: import.meta.env.VITE_STATUS_PAGE_URL || '',
  STATUS_PAGE_API_URL: import.meta.env.VITE_STATUS_PAGE_URL
    ? `${import.meta.env.VITE_STATUS_PAGE_URL}/api/v2/status.json`
    : '',
} as const;

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const APP_NAME = CONSTANTS.APP_NAME;
export const API_BASE_URL = CONSTANTS.API_BASE_URL;
