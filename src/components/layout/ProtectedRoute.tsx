import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { ProtectedRoute as SharedProtectedRoute } from '@sudobility/components';
import { useAuthStatus } from '@sudobility/auth-components';
import { ui } from '@sudobility/design';
import { isLanguageSupported } from '../../i18n';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthStatus();
  // Routes are language-prefixed (/:lang/...); redirect to the login page in
  // the active language so the prefix is preserved.
  const { lang } = useParams<{ lang: string }>();
  const activeLang = lang && isLanguageSupported(lang) ? lang : 'en';

  return (
    <SharedProtectedRoute
      isAuthenticated={!!user}
      isLoading={loading}
      redirectPath={`/${activeLang}/login`}
      loadingComponent={
        <div className="min-h-screen flex items-center justify-center">
          <p className={ui.text.muted}>Loading...</p>
        </div>
      }
    >
      {children}
    </SharedProtectedRoute>
  );
}

export default ProtectedRoute;
