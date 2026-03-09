import { useMemo } from 'react';
import { EntityClient } from '@sudobility/entity_client';
import { MembersManagementPage } from '@sudobility/entity_pages';
import { useAuth } from '../../context/useAuth';
import { useCurrentEntity } from '@sudobility/entity_client';

export function MembersPage() {
  const { networkClient, baseUrl, user } = useAuth();
  const { currentEntity } = useCurrentEntity();

  const entityClient = useMemo(
    () => new EntityClient({ baseUrl: `${baseUrl}/api/v1`, networkClient }),
    [baseUrl, networkClient],
  );

  if (!currentEntity) {
    return <div className="text-gray-500">No organization selected</div>;
  }

  return (
    <MembersManagementPage
      client={entityClient}
      entity={currentEntity}
      currentUserId={user?.uid ?? ''}
    />
  );
}
