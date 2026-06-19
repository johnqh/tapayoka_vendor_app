import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EntityClient } from '@sudobility/entity_client';
import { EntityListPage } from '@sudobility/entity_pages';
import { useApi } from '../../context/apiContextDef';
import { analyticsService } from '../../config/analytics';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { dashboardTrail } from '../../lib/breadcrumbs';

export function WorkspacesPage() {
  const navigate = useNavigate();
  const { networkClient, baseUrl } = useApi();
  const { entitySlug } = useParams<{ entitySlug: string }>();

  useEffect(() => {
    analyticsService.trackPageView('/dashboard/workspaces', 'Workspaces');
  }, []);

  usePageBreadcrumbs(dashboardTrail(entitySlug ?? '', { label: 'Organizations', current: true }));

  const entityClient = useMemo(
    () => new EntityClient({ baseUrl: `${baseUrl}/api/v1`, networkClient }),
    [baseUrl, networkClient]
  );

  return (
    <EntityListPage
      client={entityClient}
      onSelectEntity={(entity) => {
        navigate(`/dashboard/${encodeURIComponent(entity.entitySlug)}/members`);
      }}
    />
  );
}

export default WorkspacesPage;
