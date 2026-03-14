import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { EntityRedirect } from './components/EntityRedirect';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { LocationsPage } from './pages/dashboard/LocationsPage';
import { LocationDetailPage } from './pages/dashboard/LocationDetailPage';
import { ModelsPage } from './pages/dashboard/ModelsPage';
import { ModelDetailPage } from './pages/dashboard/ModelDetailPage';
import { OrdersPage } from './pages/dashboard/OrdersPage';
import { WorkspacesPage } from './pages/dashboard/WorkspacesPage';
import { MembersPage } from './pages/dashboard/MembersPage';
import { InvitationsPage } from './pages/dashboard/InvitationsPage';
import { LoginPage } from './pages/LoginPage';
import { TosPage } from './pages/TosPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/tos" element={<TosPage />} />
      <Route path="/dashboard" element={<EntityRedirect />} />
      <Route path="/dashboard/:entitySlug" element={<DashboardLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="locations/:locationId" element={<LocationDetailPage />} />
        <Route path="models" element={<ModelsPage />} />
        <Route path="models/:modelId" element={<ModelDetailPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="workspaces" element={<WorkspacesPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="invitations" element={<InvitationsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
