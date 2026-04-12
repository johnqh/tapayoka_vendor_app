import { useEffect, useMemo } from 'react';
import { EntityClient } from '@sudobility/entity_client';
import { MembersManagementPage } from '@sudobility/entity_pages';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useAuthStatus } from '@sudobility/auth-components';
import { useCurrentEntity } from '@sudobility/entity_client';
import { ui } from '@sudobility/design';
import { analyticsService } from '../../config/analytics';

export function MembersPage() {
  const { networkClient, baseUrl } = useApi();
  const { user } = useAuthStatus();
  const { currentEntity } = useCurrentEntity();

  useEffect(() => {
    analyticsService.trackPageView('/dashboard/members', 'Members');
  }, []);

  const entityClient = useMemo(
    () => new EntityClient({ baseUrl: `${baseUrl}/api/v1`, networkClient }),
    [baseUrl, networkClient]
  );

  if (!currentEntity) {
    return <div className={ui.text.muted}>No organization selected</div>;
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
