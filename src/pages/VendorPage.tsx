import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useAuthStatus } from '@sudobility/auth-components';
import { ui, buttonVariant } from '@sudobility/design';
import { CONSTANTS } from '../config/constants';

const sectionKeys = [
  'sections.deviceManagement',
  'sections.payment',
  'sections.multiLocation',
  'sections.analytics',
] as const;

function VendorPage() {
  const navigate = useNavigate();
  const { user } = useAuthStatus();
  const { t } = useTranslation('vendorPage');

  return (
    <>
      <Helmet>
        <title>{t('seo.title', { appName: CONSTANTS.APP_NAME })}</title>
        <meta
          name="description"
          content={t('seo.description', { appName: CONSTANTS.APP_NAME })}
        />
        <meta
          name="keywords"
          content={(t('seo.keywords', { returnObjects: true }) as string[]).join(', ')}
        />
      </Helmet>

      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('hero.title')}</h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            {t('hero.description')}
          </p>
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
                <h2 className={`${ui.text.h3} mb-4`}>{t(`${key}.title`)}</h2>
                <p className={`${ui.text.body} mb-6`}>{t(`${key}.description`)}</p>
                <ul className="space-y-3">
                  {(t(`${key}.items`, { returnObjects: true }) as string[]).map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
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
                      <span className={ui.text.body}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 bg-gray-100 rounded-xl p-8 flex items-center justify-center min-h-[200px]">
                <span className={`text-sm ${ui.text.muted}`}>
                  {t(`${key}.title`)} illustration
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={`${ui.section.subtle} py-16`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className={`${ui.text.h2} mb-4`}>{t('cta.title')}</h2>
          <p className={`${ui.text.bodyLarge} mb-8`}>{t('cta.description')}</p>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className={`px-8 py-3 rounded-lg font-semibold ${buttonVariant('primary')}`}
          >
            {user ? t('cta.ctaDashboard') : t('cta.ctaGetStarted')}
          </button>
        </div>
      </section>
    </>
  );
}

export default VendorPage;
