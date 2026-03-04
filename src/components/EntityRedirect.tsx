import { Navigate } from 'react-router-dom';
import { useCurrentEntity } from '@sudobility/entity_client';

export function EntityRedirect() {
  const { currentEntitySlug, isLoading, isInitialized } = useCurrentEntity();

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!currentEntitySlug) {
    return <Navigate to="/tos" replace />;
  }

  return <Navigate to={`/dashboard/${encodeURIComponent(currentEntitySlug)}`} replace />;
}
