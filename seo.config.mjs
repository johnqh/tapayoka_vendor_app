/**
 * SEO configuration for Tapayoka Vendor.
 *
 * Used by generate-seo-assets.mjs from @johnqh/workflows to produce
 * per-route localized index.html files, sitemap.xml, and robots.txt.
 */

const APP_NAME = process.env.VITE_APP_NAME || 'Tapayoka Vendor';

export default {
  supportedLanguages: ['en'],

  languageHreflangMap: {
    en: 'en',
  },

  primaryDomain: 'tapayoka.com',
  appName: APP_NAME,
  appDomain: process.env.VITE_APP_DOMAIN || 'tapayoka.com',
  // Canonical URLs have NO trailing slash (source of truth). v2 defaults to
  // true; pin false so canonicals, hreflang alternates, sitemap, LocalizedLink
  // hrefs, and the functions/_middleware.js 301 all agree — see sudobility/docs/SEO.md.
  trailingSlashUrls: false,
  envPlaceholderPattern: /%([A-Z_]+)%/g,
  robotsDisallowPaths: ['/tos', '/login', '/dashboard/'],

  routes: [
    {
      key: 'home',
      path: '',
      namespace: 'homePage',
      priority: '1.0',
      changefreq: 'weekly',
      indexable: true,
      meta: locale => ({
        title: locale.homePage.seo.title,
        description: locale.homePage.seo.description,
        keywords: locale.homePage.seo.keywords,
      }),
    },
    {
      key: 'vendor',
      path: '/vendor',
      namespace: 'vendorPage',
      priority: '0.8',
      changefreq: 'monthly',
      indexable: true,
      meta: locale => ({
        title: locale.vendorPage.seo.title,
        description: locale.vendorPage.seo.description,
        keywords: locale.vendorPage.seo.keywords,
      }),
    },
    {
      key: 'docs',
      path: '/docs',
      namespace: 'docsPage',
      priority: '0.8',
      changefreq: 'monthly',
      indexable: true,
      canonicalPath: '/docs/getting-started',
      meta: locale => ({
        title: locale.docsPage.seo.title,
        description: locale.docsPage.seo.description,
        keywords: locale.docsPage.seo.keywords,
      }),
    },
    {
      key: 'docs-getting-started',
      path: '/docs/getting-started',
      namespace: 'docsPage',
      priority: '0.8',
      changefreq: 'monthly',
      indexable: true,
      meta: locale => ({
        title: locale.docsPage.seo.title,
        description: locale.docsPage.seo.sections['getting-started'],
        keywords: locale.docsPage.seo.keywords,
      }),
    },
    {
      key: 'docs-device-setup',
      path: '/docs/device-setup',
      namespace: 'docsPage',
      priority: '0.7',
      changefreq: 'monthly',
      indexable: true,
      meta: locale => ({
        title: locale.docsPage.seo.title,
        description: locale.docsPage.seo.sections['device-setup'],
        keywords: locale.docsPage.seo.keywords,
      }),
    },
    {
      key: 'docs-api-reference',
      path: '/docs/api-reference',
      namespace: 'docsPage',
      priority: '0.7',
      changefreq: 'monthly',
      indexable: true,
      meta: locale => ({
        title: locale.docsPage.seo.title,
        description: locale.docsPage.seo.sections['api-reference'],
        keywords: locale.docsPage.seo.keywords,
      }),
    },
    {
      key: 'login',
      path: '/login',
      namespace: 'loginPage',
      priority: '0.1',
      changefreq: 'monthly',
      indexable: false,
      meta: locale => ({
        title: locale.loginPage.seo.title,
        description: locale.loginPage.seo.description,
        keywords: [],
      }),
    },
  ],
};
