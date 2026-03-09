import { useMemo, type ReactNode } from 'react';
import { EntityClient, CurrentEntityProvider } from '@sudobility/entity_client';
import { useAuth } from './useAuth';

export function EntityProvider({ children }: { children: ReactNode }) {
  const { user, networkClient, baseUrl } = useAuth();

  const entityClient = useMemo(
    () => new EntityClient({ baseUrl: `${baseUrl}/api/v1`, networkClient }),
    [baseUrl, networkClient],
  );

  const authUser = useMemo(
    () => (user ? { uid: user.uid, email: user.email } : null),
    [user],
  );

  return (
    <CurrentEntityProvider client={entityClient} user={authUser}>
      {children}
    </CurrentEntityProvider>
  );
}
