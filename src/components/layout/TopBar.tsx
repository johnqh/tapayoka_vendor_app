/* eslint-disable react-refresh/only-export-components */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import type { ComponentType } from 'react';
import {
  type MenuItemConfig,
  type AuthMenuItem,
  type AuthActionProps,
  type TopBarConfig,
} from '@sudobility/building_blocks';
import { AuthAction, useAuthStatus } from '@sudobility/auth-components';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useCurrentEntityOptional } from '@sudobility/entity_client';
import { CONSTANTS } from '../../config/constants';
import { SUPPORTED_LANGUAGES, isLanguageSupported } from '../../i18n';

const LANGUAGE_INFO: Record<string, { name: string; flag: string }> = {
  en: { name: 'English', flag: '\u{1F1FA}\u{1F1F8}' },
  es: { name: 'Espa\u00F1ol', flag: '\u{1F1EA}\u{1F1F8}' },
  fr: { name: 'Fran\u00E7ais', flag: '\u{1F1EB}\u{1F1F7}' },
  de: { name: 'Deutsch', flag: '\u{1F1E9}\u{1F1EA}' },
  ja: { name: '\u65E5\u672C\u8A9E', flag: '\u{1F1EF}\u{1F1F5}' },
  ko: { name: '\uD55C\uAD6D\uC5B4', flag: '\u{1F1F0}\u{1F1F7}' },
  pt: { name: 'Portugu\u00EAs', flag: '\u{1F1E7}\u{1F1F7}' },
  zh: { name: '\u7B80\u4F53\u4E2D\u6587', flag: '\u{1F1E8}\u{1F1F3}' },
};

// Icon components
const HomeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
    />
  </svg>
);

const BuildingStorefrontIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
    />
  </svg>
);

const DocumentTextIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />
  </svg>
);

const Squares2X2Icon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
    />
  </svg>
);

// Dropdown menu icons
const MenuMapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
    />
  </svg>
);

const MenuTagIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
  </svg>
);

const MenuClipboardIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
    />
  </svg>
);

const MenuBuildingIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
    />
  </svg>
);

const MenuUsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
    />
  </svg>
);

const MenuEnvelopeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
    />
  </svg>
);

// Link wrapper
const linkWrapper = ({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Link to={href} className={className}>
    {children}
  </Link>
);

export function useTopBarConfig(): TopBarConfig {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStatus();
  const { networkClient, baseUrl, token } = useApi();

  const entityContext = useCurrentEntityOptional();
  const entitySlug = entityContext?.currentEntitySlug ?? null;

  const isAuthenticated = !!user;
  const currentLanguage = i18n.language || 'en';

  // Suppress unused variable warnings - these are available for future use
  void networkClient;
  void baseUrl;
  void token;

  const languages = useMemo(
    () =>
      SUPPORTED_LANGUAGES.map((code) => ({
        code,
        name: LANGUAGE_INFO[code]?.name || code.toUpperCase(),
        flag: LANGUAGE_INFO[code]?.flag || '\u{1F310}',
      })),
    []
  );

  const handleLanguageChange = (newLang: string) => {
    if (isLanguageSupported(newLang)) {
      i18n.changeLanguage(newLang);
      localStorage.setItem('language', newLang);
    }
  };

  const authenticatedMenuItems: AuthMenuItem[] = useMemo(
    () =>
      isAuthenticated
        ? [
            {
              id: 'locations',
              label: 'Locations',
              icon: <MenuMapPinIcon />,
              onClick: () =>
                navigate(entitySlug ? `/dashboard/${entitySlug}/locations` : '/dashboard'),
            },
            {
              id: 'models',
              label: 'Models',
              icon: <MenuTagIcon />,
              onClick: () =>
                navigate(entitySlug ? `/dashboard/${entitySlug}/models` : '/dashboard'),
            },
            {
              id: 'orders',
              label: 'Orders',
              icon: <MenuClipboardIcon />,
              onClick: () =>
                navigate(entitySlug ? `/dashboard/${entitySlug}/orders` : '/dashboard'),
            },
            {
              id: 'workspaces',
              label: 'Organizations',
              icon: <MenuBuildingIcon />,
              onClick: () =>
                navigate(entitySlug ? `/dashboard/${entitySlug}/workspaces` : '/dashboard'),
            },
            {
              id: 'members',
              label: 'Members',
              icon: <MenuUsersIcon />,
              onClick: () =>
                navigate(entitySlug ? `/dashboard/${entitySlug}/members` : '/dashboard'),
            },
            {
              id: 'invitations',
              label: 'Invitations',
              icon: <MenuEnvelopeIcon />,
              onClick: () =>
                navigate(entitySlug ? `/dashboard/${entitySlug}/invitations` : '/dashboard'),
              dividerAfter: true,
            },
          ]
        : [],
    [isAuthenticated, navigate, entitySlug]
  );

  const menuItems: MenuItemConfig[] = useMemo(() => {
    const items: MenuItemConfig[] = [
      { id: 'home', label: 'Home', icon: HomeIcon, href: '/' },
      { id: 'vendor', label: 'Vendor', icon: BuildingStorefrontIcon, href: '/vendor' },
      { id: 'docs', label: 'Docs', icon: DocumentTextIcon, href: '/docs' },
    ];

    if (isAuthenticated) {
      items.push({
        id: 'dashboard',
        label: 'Dashboard',
        icon: Squares2X2Icon,
        href: '/dashboard',
        className:
          '!text-blue-600 dark:!text-blue-400 hover:!text-blue-700 dark:hover:!text-blue-300',
      });
    }

    return items;
  }, [isAuthenticated]);

  return {
    variant: 'firebase',
    logo: {
      src: '/logo.png',
      appName: CONSTANTS.APP_NAME,
      onClick: () => navigate('/'),
    },
    menuItems,
    languages,
    currentLanguage,
    onLanguageChange: handleLanguageChange,
    LinkComponent: linkWrapper,
    AuthActionComponent: AuthAction as ComponentType<AuthActionProps>,
    onLoginClick: () => navigate('/login'),
    authenticatedMenuItems,
    sticky: true,
  };
}
