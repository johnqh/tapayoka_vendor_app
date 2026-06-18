import { useState, useCallback, type ReactNode } from 'react';
import {
  PageConfigContext,
  DEFAULT_PAGE_CONFIG,
  type PageConfig,
  type BreadcrumbCrumb,
} from '../hooks/usePageConfig';

export function PageConfigProvider({ children }: { children: ReactNode }) {
  const [pageConfig, setPageConfigState] = useState<PageConfig>(DEFAULT_PAGE_CONFIG);
  const [breadcrumbs, setBreadcrumbsState] = useState<BreadcrumbCrumb[]>([]);

  const setPageConfig = useCallback((config: PageConfig) => {
    setPageConfigState({ ...DEFAULT_PAGE_CONFIG, ...config });
  }, []);

  const resetPageConfig = useCallback(() => {
    setPageConfigState(DEFAULT_PAGE_CONFIG);
  }, []);

  const setBreadcrumbs = useCallback((items: BreadcrumbCrumb[]) => {
    setBreadcrumbsState(items);
  }, []);

  return (
    <PageConfigContext.Provider
      value={{ pageConfig, setPageConfig, resetPageConfig, breadcrumbs, setBreadcrumbs }}
    >
      {children}
    </PageConfigContext.Provider>
  );
}
