export const CONSTANTS = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Tapayoka Vendor',
  APP_DOMAIN: import.meta.env.VITE_APP_DOMAIN || 'tapayoka.com',
  COMPANY_NAME: import.meta.env.VITE_COMPANY_NAME || 'Sudobility',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
} as const;

export const APP_NAME = CONSTANTS.APP_NAME;
export const API_BASE_URL = CONSTANTS.API_BASE_URL;
