import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useAuthStatus } from '@sudobility/auth-components';
import { ui, buttonVariant } from '@sudobility/design';
import { CONSTANTS } from '../config/constants';

const featureIcons = [
  // Device Management
  <svg
    className="w-8 h-8 text-blue-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>,
  // QR Payments
  <svg
    className="w-8 h-8 text-blue-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
    />
  </svg>,
  // Order Tracking
  <svg
    className="w-8 h-8 text-blue-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
    />
  </svg>,
  // Real-time Monitoring
  <svg
    className="w-8 h-8 text-blue-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
    />
  </svg>,
];

const featureKeys = [
  'features.deviceManagement',
  'features.qrPayments',
  'features.orderTracking',
  'features.monitoring',
] as const;

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStatus();
  const { t } = useTranslation('homePage');

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

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t('hero.title', { appName: CONSTANTS.APP_NAME })}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            {t('hero.description', { appName: CONSTANTS.APP_NAME })}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 ${ui.transition.fast}`}
              >
                {t('hero.ctaDashboard')}
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className={`px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 ${ui.transition.fast}`}
                >
                  {t('hero.ctaGetStarted')}
                </button>
                <button
                  onClick={() => navigate('/vendor')}
                  className={`px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 ${ui.transition.fast}`}
                >
                  {t('hero.ctaLearnMore')}
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={ui.section.default + ' py-20'}>
        <div className={ui.layout.container}>
          <div className="text-center mb-16">
            <h2 className={`${ui.text.h2} mb-4`}>
              {t('features.title', { appName: CONSTANTS.APP_NAME })}
            </h2>
            <p className={`${ui.text.bodyLarge} max-w-2xl mx-auto`}>
              {t('features.subtitle', { appName: CONSTANTS.APP_NAME })}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featureKeys.map((key, index) => (
              <div key={key} className={`${ui.card.feature}`}>
                <div className="mb-4">{featureIcons[index]}</div>
                <h3 className={`${ui.text.h5} mb-2`}>{t(`${key}.title`)}</h3>
                <p className={ui.text.bodySmall}>{t(`${key}.description`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={ui.section.subtle + ' py-16'}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className={`${ui.text.h2} mb-4`}>{t('cta.title')}</h2>
          <p className={`${ui.text.bodyLarge} mb-8`}>{t('cta.description')}</p>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className={`px-8 py-3 rounded-lg font-semibold ${buttonVariant('primary')}`}
          >
            {user ? t('cta.ctaDashboard') : t('cta.ctaCreate')}
          </button>
        </div>
      </section>
    </>
  );
}

export default HomePage;
