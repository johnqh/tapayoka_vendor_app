import { Outlet, NavLink, useParams } from 'react-router-dom';
import { AppFooter } from '@sudobility/building_blocks';
import { CONSTANTS } from '../../config/constants';
import { useCurrentEntity } from '@sudobility/entity_client';

export function DashboardLayout() {
  const { entitySlug } = useParams<{ entitySlug: string }>();
  const { currentEntity } = useCurrentEntity();

  const base = `/dashboard/${encodeURIComponent(entitySlug ?? '')}`;

  const navItems = [
    { to: base, label: 'Dashboard', end: true },
    { to: `${base}/devices`, label: 'Devices' },
    { to: `${base}/installations`, label: 'Installations' },
    { to: `${base}/orders`, label: 'Orders' },
    { to: `${base}/workspaces`, label: 'Organizations' },
    { to: `${base}/members`, label: 'Members' },
    { to: `${base}/invitations`, label: 'Invitations' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <span className="text-xl font-bold text-gray-900">Tapayoka</span>
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `px-3 py-2 text-sm font-medium rounded-md ${
                      isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
            {currentEntity && (
              <div className="flex items-center">
                <span className="text-sm text-gray-500">
                  {currentEntity.displayName}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <AppFooter
        companyName={CONSTANTS.COMPANY_NAME}
        companyUrl={`https://${CONSTANTS.APP_DOMAIN}`}
        sticky
      />
    </div>
  );
}
