import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityClient } from '@sudobility/entity_client';
import { EntityListPage } from '@sudobility/entity_pages';
import { useAuth } from '../../context/useAuth';

export function WorkspacesPage() {
  const navigate = useNavigate();
  const { networkClient, baseUrl } = useAuth();

  const entityClient = useMemo(
    () => new EntityClient({ baseUrl, networkClient }),
    [baseUrl, networkClient],
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
