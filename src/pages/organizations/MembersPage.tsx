import { useEffect, useMemo } from 'react';
import { EntityClient, useCurrentEntity } from '@sudobility/entity_client';
import { MembersManagementPage } from '@sudobility/entity_pages';
import { useApi } from '../../context/apiContextDef';
import { useAuthStatus } from '@sudobility/auth-components';
import { ui } from '@sudobility/design';
import { analyticsService } from '../../config/analytics';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { organizationsTrail } from '../../lib/breadcrumbs';

export function MembersPage() {
  const { networkClient, baseUrl } = useApi();
  const { user } = useAuthStatus();
  const { currentEntity } = useCurrentEntity();

  useEffect(() => {
    analyticsService.trackPageView('/organizations/members', 'Members');
  }, []);

  usePageBreadcrumbs(organizationsTrail({ label: 'Members', current: true }));

  const entityClient = useMemo(
    () => new EntityClient({ baseUrl: `${baseUrl}/api/v1`, networkClient }),
    [baseUrl, networkClient]
  );

  if (!currentEntity) {
    return <div className={ui.text.muted}>Select an organization to manage its members.</div>;
  }

  return (
    <MembersManagementPage
      client={entityClient}
      entity={currentEntity}
      currentUserId={user?.uid ?? ''}
    />
  );
}

export default MembersPage;
