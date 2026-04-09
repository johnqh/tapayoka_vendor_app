import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentEntity } from '@sudobility/entity_client';
import { ui } from '@sudobility/design';

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
      <p className={ui.text.muted}>Loading...</p>
    </div>
  );
}

export default EntityRedirect;
