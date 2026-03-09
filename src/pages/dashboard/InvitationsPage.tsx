import { useMemo } from 'react';
import { EntityClient } from '@sudobility/entity_client';
import { InvitationsPage as InvitationsPageComponent } from '@sudobility/entity_pages';
import { useAuth } from '../../context/useAuth';

export function InvitationsPage() {
  const { networkClient, baseUrl } = useAuth();

  const entityClient = useMemo(
    () => new EntityClient({ baseUrl: `${baseUrl}/api/v1`, networkClient }),
    [baseUrl, networkClient],
  );

  return <InvitationsPageComponent client={entityClient} />;
}
