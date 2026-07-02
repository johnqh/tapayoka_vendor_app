import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AppPageLayout } from '@sudobility/building_blocks';
import { LocalizedLink, removeLanguageFromPath } from '@sudobility/components';
import { useTopBarConfig } from './TopBar';
import { useFooterConfig } from './Footer';
import { PageConfigProvider } from '../../context/PageConfigProvider';
import { usePageConfig } from '../../hooks/usePageConfig';
import { isLanguageSupported } from '../../i18n';

/** Renders breadcrumb links with the active language prefix. */
const breadcrumbLink = ({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) => (
  <LocalizedLink to={href} className={className} isLanguageSupported={isLanguageSupported}>
    {children}
  </LocalizedLink>
);

interface ScreenContainerProps {
  children: ReactNode;
}

/**
 * Page layout shell wrapping all routes at the route level.
 * Provides PageConfigProvider so child pages can use useSetPageConfig
 * for layout overrides.
 */
function ScreenContainer({ children }: ScreenContainerProps) {
  return (
    <PageConfigProvider>
      <ScreenContainerInner>{children}</ScreenContainerInner>
    </PageConfigProvider>
  );
}

function ScreenContainerInner({ children }: { children: ReactNode }) {
  const location = useLocation();
  const topBarConfig = useTopBarConfig();
  const { pageConfig, breadcrumbs } = usePageConfig();

  // Home keeps the full marketing footer; every other page uses the compact
  // footer, which sticks to the bottom of the viewport (same as the dashboard).
  // Routes are language-prefixed (/:lang), so strip the prefix before comparing.
  const isHomePage = removeLanguageFromPath(location.pathname, isLanguageSupported) === '/';
  const footerConfig = useFooterConfig(isHomePage ? 'full' : 'compact');

  return (
    <AppPageLayout
      topBar={topBarConfig}
      breadcrumbs={
        breadcrumbs.length > 0 ? { items: breadcrumbs, LinkComponent: breadcrumbLink } : undefined
      }
      footer={footerConfig}
      page={{
        maxWidth: 'full',
        contentPadding: 'none',
        contentClassName: 'w-full min-w-0',
        ...pageConfig,
      }}
    >
      {children}
    </AppPageLayout>
  );
}

export default ScreenContainer;
