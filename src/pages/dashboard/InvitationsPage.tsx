import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { EntityClient } from '@sudobility/entity_client';
import { InvitationsPage as InvitationsPageComponent } from '@sudobility/entity_pages';
import { useApi } from '../../context/apiContextDef';
import { analyticsService } from '../../config/analytics';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { dashboardTrail } from '../../lib/breadcrumbs';

export function InvitationsPage() {
  const { networkClient, baseUrl } = useApi();
  const { entitySlug } = useParams<{ entitySlug: string }>();

  useEffect(() => {
    analyticsService.trackPageView('/dashboard/invitations', 'Invitations');
  }, []);

  usePageBreadcrumbs(dashboardTrail(entitySlug ?? '', { label: 'Invitations', current: true }));

  const entityClient = useMemo(
    () => new EntityClient({ baseUrl: `${baseUrl}/api/v1`, networkClient }),
    [baseUrl, networkClient]
  );

  return <InvitationsPageComponent client={entityClient} />;
}

export default InvitationsPage;
