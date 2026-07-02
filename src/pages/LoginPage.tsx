import { useEffect } from 'react';
import { useLocalizedNavigate } from '@sudobility/components';
import { isLanguageSupported } from '../i18n';
import { useTranslation } from 'react-i18next';
import { useAuthStatus } from '@sudobility/auth-components';
import { getFirebaseAuth } from '@sudobility/auth_lib';
import { Alert, Spinner } from '@sudobility/components';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { LoginPage as LoginPageComponent } from '@sudobility/building_blocks';
import { SEOHead } from '@sudobility/seo_lib';
import { CONSTANTS } from '../config/constants';
import { analyticsService } from '../config/analytics';

export default function LoginPage() {
  const { user, loading } = useAuthStatus();
  const { navigate } = useLocalizedNavigate({ isLanguageSupported });
  const { t } = useTranslation('loginPage');
  const auth = getFirebaseAuth();

  useEffect(() => {
    analyticsService.trackPageView('/login', 'Login Page');
  }, []);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary">
        <Spinner ariaLabel="Loading authentication" />
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary">
        <Alert variant="error" description="Firebase not configured" />
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={t('seo.title', { appName: CONSTANTS.APP_NAME })}
        description={t('seo.description', { appName: CONSTANTS.APP_NAME })}
        noIndex
      />
      <LoginPageComponent
        appName={CONSTANTS.APP_NAME}
        onEmailSignIn={async (email, password) => {
          analyticsService.trackButtonClick('email_sign_in');
          await signInWithEmailAndPassword(auth, email, password);
        }}
        onEmailSignUp={async (email, password) => {
          analyticsService.trackButtonClick('email_sign_up');
          await createUserWithEmailAndPassword(auth, email, password);
        }}
        onGoogleSignIn={async () => {
          analyticsService.trackButtonClick('google_sign_in');
          await signInWithPopup(auth, new GoogleAuthProvider());
        }}
        onSuccess={() => {
          analyticsService.trackEvent('login_success');
          navigate('/dashboard', { replace: true });
        }}
      />
    </>
  );
}
