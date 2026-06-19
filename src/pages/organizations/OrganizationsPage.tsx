import { useState, useRef, useEffect, type ReactNode } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { MasterDetailLayout } from '@sudobility/components';
import { ui } from '@sudobility/design';
import { SEOHead } from '@sudobility/seo_lib';
import { CONSTANTS } from '../../config/constants';
import { useSetPageConfig } from '../../hooks/usePageConfig';
import { analyticsService } from '../../config/analytics';

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
    />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
    />
  </svg>
);

const EnvelopeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
    />
  </svg>
);

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
}

function OrganizationsMasterList({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();

  const items: NavItem[] = [
    { id: 'organizations', label: 'Organizations', path: '/organizations', icon: <BuildingIcon /> },
    { id: 'members', label: 'Members', path: '/organizations/members', icon: <UsersIcon /> },
    {
      id: 'invitations',
      label: 'Invitations',
      path: '/organizations/invitations',
      icon: <EnvelopeIcon />,
    },
  ];

  const isActive = (item: NavItem) => {
    if (item.id === 'organizations') return location.pathname === '/organizations';
    return location.pathname.startsWith(item.path);
  };

  const renderItem = (item: NavItem) => (
    <Link
      key={item.id}
      to={item.path}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${ui.transition.default} ${
        isActive(item)
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
    >
      <span className={isActive(item) ? 'text-blue-600' : 'text-gray-400'}>{item.icon}</span>
      {item.label}
    </Link>
  );

  return <nav className="p-2 space-y-1">{items.map(renderItem)}</nav>;
}

function OrganizationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  useSetPageConfig({ scrollable: false, contentPadding: 'none', maxWidth: '7xl' });

  useEffect(() => {
    analyticsService.trackPageView('/organizations', 'Organizations');
  }, []);

  const [mobileView, setMobileView] = useState<'navigation' | 'content'>('navigation');

  const animationRef = useRef<{
    triggerTransition: (onContentChange: () => void) => void;
  } | null>(null);

  const getDetailTitle = () => {
    const pathname = location.pathname;
    if (pathname.includes('/members')) return 'Members';
    if (pathname.includes('/invitations')) return 'Invitations';
    return 'Organizations';
  };

  // Auto-switch to content view when navigating on mobile.
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && location.pathname !== '/organizations') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMobileView('content');
    }
  }, [location.pathname]);

  const handleBackToNavigation = () => {
    setMobileView('navigation');
    navigate('/organizations');
  };

  const handleNavigate = () => {
    setMobileView('content');
  };

  const masterContent = <OrganizationsMasterList onNavigate={handleNavigate} />;

  const detailContent = (
    <div className="min-h-[400px]">
      <Outlet />
    </div>
  );

  return (
    <>
      <SEOHead title={`${getDetailTitle()} | ${CONSTANTS.APP_NAME}`} description="" noIndex />
      <div className="w-full min-w-0 overflow-x-hidden flex-1 flex flex-col min-h-0">
        <MasterDetailLayout
          backButtonText="Back"
          masterContent={masterContent}
          detailContent={detailContent}
          mobileView={mobileView}
          onBackToNavigation={handleBackToNavigation}
          animationRef={animationRef}
          enableAnimations={true}
          animationDuration={150}
          masterWidth={260}
          stickyTopOffset={80}
        />
      </div>
    </>
  );
}

export default OrganizationsPage;
