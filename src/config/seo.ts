import type { SEOHeadConfig } from '@sudobility/seo_lib';
import { CONSTANTS } from './constants';
import { SUPPORTED_LANGUAGES } from '../i18n';

export const seoHeadConfig: SEOHeadConfig = {
  appName: CONSTANTS.APP_NAME,
  baseUrl: `https://${CONSTANTS.APP_DOMAIN}`,
  defaultOgImage: `https://${CONSTANTS.APP_DOMAIN}/logo.png`,
  twitterHandle: CONSTANTS.TWITTER_HANDLE || undefined,
  supportedLanguages: [...SUPPORTED_LANGUAGES] as string[],
  defaultLanguage: 'en',
  applicationCategory: ['BusinessApplication'],
  applicationSubCategory: 'Vendor Management',
};
