import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function LoginPage() {
  const { user, loading } = useAuthStatus();
  const navigate = useNavigate();
  const auth = getFirebaseAuth();

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
    <LoginPageComponent
      appName={CONSTANTS.APP_NAME}
      onEmailSignIn={async (email, password) => {
        await signInWithEmailAndPassword(auth, email, password);
      }}
      onEmailSignUp={async (email, password) => {
        await createUserWithEmailAndPassword(auth, email, password);
      }}
      onGoogleSignIn={async () => {
        await signInWithPopup(auth, new GoogleAuthProvider());
      }}
      onSuccess={() => navigate('/dashboard', { replace: true })}
    />
  );
}
