import { useEffect, useMemo } from 'react';
import { EntityClient } from '@sudobility/entity_client';
import { InvitationsPage as InvitationsPageComponent } from '@sudobility/entity_pages';
import { useApi } from '../../context/apiContextDef';
import { analyticsService } from '../../config/analytics';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';

export function InvitationsPage() {
  const { networkClient, baseUrl } = useApi();

  useEffect(() => {
    analyticsService.trackPageView('/dashboard/invitations', 'Invitations');
  }, []);

  usePageBreadcrumbs([{ label: 'Invitations', current: true }]);

  const entityClient = useMemo(
    () => new EntityClient({ baseUrl: `${baseUrl}/api/v1`, networkClient }),
    [baseUrl, networkClient]
  );

  return <InvitationsPageComponent client={entityClient} />;
}

export default InvitationsPage;
