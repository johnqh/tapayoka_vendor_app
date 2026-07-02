import { useEffect } from 'react';
import { useLocalizedNavigate } from '@sudobility/components';
import { isLanguageSupported } from '../i18n';
import { useTranslation } from 'react-i18next';
import { useAuthStatus } from '@sudobility/auth-components';
import { ui } from '@sudobility/design';
import { Button, Heading, Text } from '@sudobility/components';
import { SEOHead } from '@sudobility/seo_lib';
import { CONSTANTS } from '../config/constants';
import { analyticsService } from '../config/analytics';
import { usePageBreadcrumbs } from '../hooks/usePageConfig';
import { publicTrail } from '../lib/breadcrumbs';

const sectionKeys = [
  'sections.deviceManagement',
  'sections.payment',
  'sections.multiLocation',
  'sections.analytics',
] as const;

function VendorPage() {
  const { navigate } = useLocalizedNavigate({ isLanguageSupported });
  const { user } = useAuthStatus();
  const { t } = useTranslation('vendorPage');

  useEffect(() => {
    analyticsService.trackPageView('/vendor', 'Vendor Page');
  }, []);

  usePageBreadcrumbs(publicTrail({ label: 'For Vendors', current: true }));

  const seoTitle = t('seo.title', { appName: CONSTANTS.APP_NAME });
  const seoDescription = t('seo.description', { appName: CONSTANTS.APP_NAME });
  const rawKeywords = t('seo.keywords', { returnObjects: true });
  const seoKeywords = Array.isArray(rawKeywords) ? rawKeywords : undefined;

  return (
    <>
      <SEOHead title={seoTitle} description={seoDescription} keywords={seoKeywords} />

      {/* Header */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heading
            level={1}
            size="4xl"
            weight="bold"
            className="md:text-5xl mb-6 text-primary-foreground"
          >
            {t('hero.title')}
          </Heading>
          <Text size="lg" className="md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            {t('hero.description')}
          </Text>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {sectionKeys.map((key, index) => (
            <div
              key={key}
              className={`flex flex-col lg:flex-row gap-8 items-start ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className="flex-1">
                <Heading level={2} size="2xl" className="mb-4">
                  {t(`${key}.title`)}
                </Heading>
                <Text className="mb-6">{t(`${key}.description`)}</Text>
                <ul className="space-y-3">
                  {(Array.isArray(t(`${key}.items`, { returnObjects: true }))
                    ? (t(`${key}.items`, { returnObjects: true }) as string[])
                    : []
                  ).map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-primary mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m4.5 12.75 6 6 9-13.5"
                        />
                      </svg>
                      <Text as="span">{item}</Text>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 bg-theme-bg-secondary rounded-xl p-8 flex items-center justify-center min-h-[200px]">
                <Text as="span" size="sm" color="muted">
                  {t(`${key}.title`)} illustration
                </Text>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={`${ui.section.subtle} py-16`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Heading level={2} size="3xl" className="mb-4">
            {t('cta.title')}
          </Heading>
          <Text size="lg" color="muted" className="mb-8">
            {t('cta.description')}
          </Text>
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              analyticsService.trackButtonClick('vendor_cta', {
                target: user ? 'dashboard' : 'login',
              });
              navigate(user ? '/dashboard' : '/login');
            }}
          >
            {user ? t('cta.ctaDashboard') : t('cta.ctaGetStarted')}
          </Button>
        </div>
      </section>
    </>
  );
}

export default VendorPage;
