import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentEntity } from '@sudobility/entity_client';

function EntityRedirect() {
  const navigate = useNavigate();
  const { currentEntity, isLoading, isInitialized } = useCurrentEntity();

  useEffect(() => {
    if (isLoading || !isInitialized) return;

    if (!currentEntity) {
      navigate('/tos', { replace: true });
      return;
    }

    navigate(`/dashboard/${currentEntity.entitySlug}`, { replace: true });
  }, [currentEntity, isLoading, isInitialized, navigate]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <p className="text-gray-500">Loading...</p>
    </div>
  );
}

export default EntityRedirect;
