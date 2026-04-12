import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useAuthStatus } from '@sudobility/auth-components';
import { getFirebaseAuth } from '@sudobility/auth_lib';
import { variants, ui } from '@sudobility/design';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { LoginPage as LoginPageComponent } from '@sudobility/building_blocks';
import { CONSTANTS } from '../config/constants';
import { analyticsService } from '../config/analytics';

export default function LoginPage() {
  const { user, loading } = useAuthStatus();
  const navigate = useNavigate();
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
        <div
          role="status"
          aria-label="Loading authentication"
          className={variants.loading.spinner.default()}
        />
      </div>
    );
  }

  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg-primary">
        <p role="alert" className={ui.text.error}>
          Firebase not configured
        </p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('seo.title', { appName: CONSTANTS.APP_NAME })}</title>
        <meta name="description" content={t('seo.description', { appName: CONSTANTS.APP_NAME })} />
      </Helmet>
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
