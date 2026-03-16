import type { ReactNode } from "react";
import { ProtectedRoute as SharedProtectedRoute } from "@sudobility/components";
import { useAuthStatus } from "@sudobility/auth-components";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuthStatus();

  return (
    <SharedProtectedRoute
      isAuthenticated={!!user}
      isLoading={loading}
      redirectPath="/login"
      loadingComponent={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      {children}
    </SharedProtectedRoute>
  );
}

export default ProtectedRoute;
