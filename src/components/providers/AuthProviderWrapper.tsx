import { type ReactNode, useMemo } from 'react';
import { AuthProvider } from '@sudobility/auth-components';
import {
  getFirebaseAuth,
  getFirebaseErrorMessage,
  initializeFirebaseAuth,
} from '@sudobility/auth_lib';
import { createAuthTexts, createAuthErrorTexts } from '../../config/auth-config';

interface AuthProviderWrapperProps {
  children: ReactNode;
}

export function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  initializeFirebaseAuth();

  const texts = useMemo(() => createAuthTexts(), []);
  const errorTexts = useMemo(() => createAuthErrorTexts(), []);

  const auth = getFirebaseAuth();

  if (!auth) {
    console.warn('[AuthProviderWrapper] No auth instance - Firebase not configured');
    return <>{children}</>;
  }

  return (
    <AuthProvider
      firebaseConfig={{ type: 'instance', auth }}
      providerConfig={{
        providers: ['google', 'email'],
        enableAnonymous: false,
      }}
      texts={texts}
      errorTexts={errorTexts}
      resolveErrorMessage={getFirebaseErrorMessage}
    >
      {children}
    </AuthProvider>
  );
}
