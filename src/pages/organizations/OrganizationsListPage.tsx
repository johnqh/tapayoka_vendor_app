import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityClient, useCurrentEntity } from '@sudobility/entity_client';
import { EntityListPage } from '@sudobility/entity_pages';
import { useApi } from '../../context/apiContextDef';
import { analyticsService } from '../../config/analytics';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { organizationsTrail } from '../../lib/breadcrumbs';

export function OrganizationsListPage() {
  const navigate = useNavigate();
  const { networkClient, baseUrl } = useApi();
  const { selectEntity } = useCurrentEntity();

  useEffect(() => {
    analyticsService.trackPageView('/organizations', 'Organizations');
  }, []);

  usePageBreadcrumbs(organizationsTrail({ label: 'Organizations', current: true }));

  const entityClient = useMemo(
    () => new EntityClient({ baseUrl: `${baseUrl}/api/v1`, networkClient }),
    [baseUrl, networkClient]
  );

  return (
    <EntityListPage
      client={entityClient}
      onSelectEntity={(entity) => {
        // Set the picked workspace as current so Members/Invitations reflect it.
        selectEntity(entity.entitySlug);
        navigate('/organizations/members');
      }}
    />
  );
}

export default OrganizationsListPage;
