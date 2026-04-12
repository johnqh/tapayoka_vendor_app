import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityClient } from '@sudobility/entity_client';
import { EntityListPage } from '@sudobility/entity_pages';
import { useApi } from '@sudobility/building_blocks/firebase';
import { analyticsService } from '../../config/analytics';

export function WorkspacesPage() {
  const navigate = useNavigate();
  const { networkClient, baseUrl } = useApi();

  useEffect(() => {
    analyticsService.trackPageView('/dashboard/workspaces', 'Workspaces');
  }, []);

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
