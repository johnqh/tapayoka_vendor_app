import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import ScreenContainer from './components/layout/ScreenContainer';
import { SudobilityAppWithFirebaseAuthAndEntities } from '@sudobility/building_blocks/firebase';
import { CONSTANTS } from './config/constants';
import i18n from './i18n';
import { AuthProviderWrapper } from './components/providers/AuthProviderWrapper';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const VendorPage = lazy(() => import('./pages/VendorPage'));
const DocsPage = lazy(() => import('./pages/DocsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const TosPage = lazy(() => import('./pages/TosPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const LocationsPage = lazy(() => import('./pages/dashboard/LocationsPage'));
const LocationDetailPage = lazy(() => import('./pages/dashboard/LocationDetailPage'));
const ModelsPage = lazy(() => import('./pages/dashboard/ModelsPage'));
const ModelDetailPage = lazy(() => import('./pages/dashboard/ModelDetailPage'));
const OrdersPage = lazy(() => import('./pages/dashboard/OrdersPage'));
const WorkspacesPage = lazy(() => import('./pages/dashboard/WorkspacesPage'));
const MembersPage = lazy(() => import('./pages/dashboard/MembersPage'));
const InvitationsPage = lazy(() => import('./pages/dashboard/InvitationsPage'));

// Layout components
const ProtectedRoute = lazy(() => import('./components/layout/ProtectedRoute'));
const EntityRedirect = lazy(() => import('./components/EntityRedirect'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <p className="text-gray-500">Loading...</p>
  </div>
);

function ScreenContainerLayout() {
  return (
    <ScreenContainer>
      <Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </Suspense>
    </ScreenContainer>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route element={<ScreenContainerLayout />}>
          {/* Public pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/vendor" element={<VendorPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/docs/:section" element={<DocsPage />} />

          {/* Protected pages */}
          <Route
            path="/tos"
            element={
              <ProtectedRoute>
                <TosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <EntityRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:entitySlug"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<LocationsPage />} />
            <Route path="locations" element={<LocationsPage />} />
            <Route path="locations/:locationId" element={<LocationDetailPage />} />
            <Route path="models" element={<ModelsPage />} />
            <Route path="models/:modelId" element={<ModelDetailPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="workspaces" element={<WorkspacesPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="invitations" element={<InvitationsPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Login has its own full-screen layout */}
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <SudobilityAppWithFirebaseAuthAndEntities
      i18n={i18n}
      apiUrl={CONSTANTS.API_BASE_URL}
      testMode={false}
      AuthProviderWrapper={AuthProviderWrapper}
    >
      <AppRoutes />
    </SudobilityAppWithFirebaseAuthAndEntities>
  );
}

export default App;
