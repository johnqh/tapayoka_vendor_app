import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, useParams, useNavigate, Link } from "react-router-dom";
import { MasterDetailLayout } from "@sudobility/components";
import { useApi } from "@sudobility/building_blocks/firebase";
import { useCurrentEntity } from "@sudobility/entity_client";
import ScreenContainer from "../../components/layout/ScreenContainer";
import { useSetPageConfig } from "../../hooks/usePageConfig";

// Sidebar icons
const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
  </svg>
);

const ClipboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

const EnvelopeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  section?: string;
}

function DashboardMasterList({ onNavigate }: { onNavigate?: () => void }) {
  const { entitySlug = "" } = useParams<{ entitySlug: string }>();
  const location = useLocation();
  const base = `/dashboard/${entitySlug}`;

  const mainItems: NavItem[] = [
    { id: "locations", label: "Locations", path: `${base}/locations`, icon: <MapPinIcon /> },
    { id: "models", label: "Models", path: `${base}/models`, icon: <TagIcon /> },
    { id: "orders", label: "Orders", path: `${base}/orders`, icon: <ClipboardIcon /> },
  ];

  const settingsItems: NavItem[] = [
    { id: "workspaces", label: "Organizations", path: `${base}/workspaces`, icon: <BuildingIcon />, section: "settings" },
    { id: "members", label: "Members", path: `${base}/members`, icon: <UsersIcon />, section: "settings" },
    { id: "invitations", label: "Invitations", path: `${base}/invitations`, icon: <EnvelopeIcon />, section: "settings" },
  ];

  const isActive = (item: NavItem) => {
    if (item.id === "locations") {
      return location.pathname === base || location.pathname.startsWith(`${base}/locations`);
    }
    return location.pathname.startsWith(item.path);
  };

  const renderItem = (item: NavItem) => (
    <Link
      key={item.id}
      to={item.path}
      onClick={onNavigate}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
        isActive(item)
          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
    >
      <span className={isActive(item) ? "text-blue-600" : "text-gray-400"}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );

  return (
    <nav className="p-4 space-y-6">
      <div className="space-y-1">
        {mainItems.map(renderItem)}
      </div>
      <div>
        <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Settings
        </p>
        <div className="space-y-1">
          {settingsItems.map(renderItem)}
        </div>
      </div>
    </nav>
  );
}

function DashboardPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { entitySlug = "" } = useParams<{ entitySlug: string }>();
  const { isReady } = useApi();
  const { selectEntity } = useCurrentEntity();
  useSetPageConfig({ scrollable: false, contentPadding: "sm" });

  // Sync URL entity slug with context
  useEffect(() => {
    if (entitySlug) {
      selectEntity(entitySlug);
    }
  }, [entitySlug, selectEntity]);

  // Mobile view state
  const [mobileView, setMobileView] = useState<"navigation" | "content">("navigation");

  // Animation ref
  const animationRef = useRef<{
    triggerTransition: (onContentChange: () => void) => void;
  } | null>(null);

  // Suppress unused variable warning
  void isReady;

  // Determine detail title based on current route
  const getDetailTitle = () => {
    const pathname = location.pathname;
    if (pathname.includes("/locations/")) return "Location Detail";
    if (pathname.includes("/locations")) return "Locations";
    if (pathname.includes("/models/")) return "Model Detail";
    if (pathname.includes("/models")) return "Models";
    if (pathname.includes("/orders")) return "Orders";
    if (pathname.includes("/workspaces")) return "Organizations";
    if (pathname.includes("/members")) return "Members";
    if (pathname.includes("/invitations")) return "Invitations";
    return "Locations";
  };

  // Auto-switch to content view when navigating on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      const pathname = location.pathname;
      const base = `/dashboard/${entitySlug}`;
      const hasSpecificContent = pathname !== base && pathname !== `${base}/`;
      if (hasSpecificContent) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMobileView("content");
      }
    }
  }, [location.pathname, entitySlug]);

  const handleBackToNavigation = () => {
    setMobileView("navigation");
    navigate(`/dashboard/${entitySlug}`);
  };

  const handleNavigate = () => {
    setMobileView("content");
  };

  const masterContent = <DashboardMasterList onNavigate={handleNavigate} />;

  const detailContent = (
    <div className="min-h-[400px]">
      <Outlet />
    </div>
  );

  return (
    <ScreenContainer showBreadcrumbs={false}>
      <div className="w-full min-w-0 overflow-x-hidden flex-1 flex flex-col min-h-0 [&>div]:w-full [&>div]:min-w-0">
        <MasterDetailLayout
          masterTitle="Dashboard"
          backButtonText="Dashboard"
          masterContent={masterContent}
          detailContent={detailContent}
          detailTitle={getDetailTitle()}
          mobileView={mobileView}
          onBackToNavigation={handleBackToNavigation}
          animationRef={animationRef}
          enableAnimations={true}
          animationDuration={150}
          masterWidth={260}
          stickyTopOffset={80}
        />
      </div>
    </ScreenContainer>
  );
}

export default DashboardPage;
