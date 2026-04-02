import { useState, type ReactNode } from 'react';
import type { AppPageProps } from '@sudobility/building_blocks';
import { PageConfigContext } from './pageConfigContextDef';

export { PageConfigContext } from './pageConfigContextDef';

export function PageConfigProvider({ children }: { children: ReactNode }) {
  const [pageConfig, setPageConfig] = useState<Partial<AppPageProps>>({});
  return (
    <PageConfigContext.Provider value={{ pageConfig, setPageConfig }}>
      {children}
    </PageConfigContext.Provider>
  );
}
