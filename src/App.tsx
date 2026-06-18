import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SEOHeadProvider } from '@sudobility/seo_lib';
import ScreenContainer from './components/layout/ScreenContainer';
import { SudobilityAppWithFirebaseAuthAndEntities } from '@sudobility/building_blocks/firebase';
import { CONSTANTS } from './config/constants';
import { seoHeadConfig } from './config/seo';
import i18n from './i18n';
import { AuthProviderWrapper } from './components/providers/AuthProviderWrapper';
import { useAppearanceEffect } from './stores/appearanceStore';
import { ui } from '@sudobility/design';

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
const OfferingDetailPage = lazy(() => import('./pages/dashboard/OfferingDetailPage'));
const InstallationDetailPage = lazy(() => import('./pages/dashboard/InstallationDetailPage'));
const OrdersPage = lazy(() => import('./pages/dashboard/OrdersPage'));
const WorkspacesPage = lazy(() => import('./pages/dashboard/WorkspacesPage'));
const MembersPage = lazy(() => import('./pages/dashboard/MembersPage'));
const InvitationsPage = lazy(() => import('./pages/dashboard/InvitationsPage'));
const AppearancePage = lazy(() => import('./pages/dashboard/AppearancePage'));

// Layout components
const ProtectedRoute = lazy(() => import('./components/layout/ProtectedRoute'));
const EntityRedirect = lazy(() => import('./components/EntityRedirect'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <p className={ui.text.muted}>Loading...</p>
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
            <Route
              path="locations/:locationId/offerings/:offeringId"
              element={<OfferingDetailPage />}
            />
            <Route
              path="locations/:locationId/offerings/:offeringId/installs/:wallet"
              element={<InstallationDetailPage />}
            />
            <Route path="models" element={<ModelsPage />} />
            <Route path="models/:modelId" element={<ModelDetailPage />} />
            <Route
              path="models/:modelId/offerings/:offeringId"
              element={<OfferingDetailPage />}
            />
            <Route
              path="models/:modelId/offerings/:offeringId/installs/:wallet"
              element={<InstallationDetailPage />}
            />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="workspaces" element={<WorkspacesPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="invitations" element={<InvitationsPage />} />
            <Route path="appearance" element={<AppearancePage />} />
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
  useAppearanceEffect();
  return (
    <SudobilityAppWithFirebaseAuthAndEntities
      i18n={i18n}
      apiUrl={CONSTANTS.API_BASE_URL}
      testMode={false}
      AuthProviderWrapper={AuthProviderWrapper}
    >
      <SEOHeadProvider config={seoHeadConfig}>
        <AppRoutes />
      </SEOHeadProvider>
    </SudobilityAppWithFirebaseAuthAndEntities>
  );
}

export default App;
