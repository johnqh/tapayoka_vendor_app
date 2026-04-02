import { createContext } from 'react';
import type { AppPageProps } from '@sudobility/building_blocks';

export interface PageConfigContextValue {
  pageConfig: Partial<AppPageProps>;
  setPageConfig: (config: Partial<AppPageProps>) => void;
}

export const PageConfigContext = createContext<PageConfigContextValue>({
  pageConfig: {},
  setPageConfig: () => {},
});
