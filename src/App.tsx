import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SEOHeadProvider } from '@sudobility/seo_lib';
import { LanguageValidator, LanguageRedirect } from '@sudobility/components';
import ScreenContainer from './components/layout/ScreenContainer';
import { SudobilityAppWithFirebaseAuthAndEntities } from '@sudobility/building_blocks/firebase';
import { CONSTANTS } from './config/constants';
import { seoHeadConfig } from './config/seo';
import i18n, { isLanguageSupported } from './i18n';
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
const OfferingPricingTiersPage = lazy(() => import('./pages/dashboard/OfferingPricingTiersPage'));
const OfferingSchedulePage = lazy(() => import('./pages/dashboard/OfferingSchedulePage'));
const InstallationDetailPage = lazy(() => import('./pages/dashboard/InstallationDetailPage'));
const OrdersPage = lazy(() => import('./pages/dashboard/OrdersPage'));
const OrganizationsPage = lazy(() => import('./pages/organizations/OrganizationsPage'));
const OrganizationsListPage = lazy(() => import('./pages/organizations/OrganizationsListPage'));
const MembersPage = lazy(() => import('./pages/organizations/MembersPage'));
const InvitationsPage = lazy(() => import('./pages/organizations/InvitationsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

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
        {/* Root: detect preferred language and redirect to /<lang> */}
        <Route
          path="/"
          element={
            <LanguageRedirect
              isLanguageSupported={isLanguageSupported}
              defaultLanguage="en"
              storageKey="language"
            />
          }
        />

        {/* All app routes are language-prefixed under /:lang */}
        <Route
          path="/:lang"
          element={
            <LanguageValidator
              isLanguageSupported={isLanguageSupported}
              defaultLanguage="en"
              storageKey="language"
            />
          }
        >
          {/* Login has its own full-screen layout (outside ScreenContainer) */}
          <Route path="login" element={<LoginPage />} />

          <Route element={<ScreenContainerLayout />}>
            {/* Public pages */}
            <Route index element={<HomePage />} />
            <Route path="vendor" element={<VendorPage />} />
            <Route path="docs" element={<DocsPage />} />
            <Route path="docs/:section" element={<DocsPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Protected pages */}
            <Route
              path="tos"
              element={
                <ProtectedRoute>
                  <TosPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <EntityRedirect />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard/:entitySlug"
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
                path="locations/:locationId/offerings/:offeringId/pricing"
                element={<OfferingPricingTiersPage />}
              />
              <Route
                path="locations/:locationId/offerings/:offeringId/schedule"
                element={<OfferingSchedulePage />}
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
                path="models/:modelId/offerings/:offeringId/pricing"
                element={<OfferingPricingTiersPage />}
              />
              <Route
                path="models/:modelId/offerings/:offeringId/schedule"
                element={<OfferingSchedulePage />}
              />
              <Route
                path="models/:modelId/offerings/:offeringId/installs/:wallet"
                element={<InstallationDetailPage />}
              />
              <Route path="orders" element={<OrdersPage />} />
            </Route>

            {/* Organization management (split out of the dashboard) */}
            <Route
              path="organizations"
              element={
                <ProtectedRoute>
                  <OrganizationsPage />
                </ProtectedRoute>
              }
            >
              <Route index element={<OrganizationsListPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="invitations" element={<InvitationsPage />} />
            </Route>

            {/* Catch-all within a language → that language's home */}
            <Route path="*" element={<Navigate to="." replace />} />
          </Route>
        </Route>

        {/* Catch-all without a language prefix → detect + redirect to /<lang>/... */}
        <Route
          path="*"
          element={
            <LanguageRedirect
              isLanguageSupported={isLanguageSupported}
              defaultLanguage="en"
              storageKey="language"
            />
          }
        />
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
