import { useContext, useLayoutEffect } from 'react';
import type { AppPageProps } from '@sudobility/building_blocks';
import { PageConfigContext } from '../context/pageConfigContextDef';

/**
 * Hook for pages to override page-level config (e.g., scrollable: false for master-detail layouts).
 * Uses useLayoutEffect to set config before the browser paints, avoiding a flash of wrong layout.
 */
export function useSetPageConfig(config: Partial<AppPageProps>) {
  const { setPageConfig } = useContext(PageConfigContext);
  const configKey = JSON.stringify(config);
  useLayoutEffect(() => {
    setPageConfig(config);
    return () => setPageConfig({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configKey, setPageConfig]);
}

export function usePageConfig(): Partial<AppPageProps> {
  return useContext(PageConfigContext).pageConfig;
}
