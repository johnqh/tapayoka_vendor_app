import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AppPageLayout } from '@sudobility/building_blocks';
import { useTopBarConfig } from './TopBar';
import { useFooterConfig } from './Footer';
import { PageConfigProvider } from '../../context/PageConfigProvider';
import { usePageConfig } from '../../hooks/usePageConfig';

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
  const { pageConfig } = usePageConfig();

  const isPublicPage = ['/', '/vendor', '/docs'].some(
    (p) => location.pathname === p || location.pathname.startsWith('/docs/')
  );
  const footerConfig = useFooterConfig(isPublicPage ? 'full' : 'compact');

  return (
    <AppPageLayout
      topBar={topBarConfig}
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
