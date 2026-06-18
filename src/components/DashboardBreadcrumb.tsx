import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from '@sudobility/components';

export interface Crumb {
  label: string;
  /** Target path; omit for the current (last) crumb. */
  to?: string;
}

export function DashboardBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const navigate = useNavigate();
  return (
    <Breadcrumb
      items={crumbs.map((c, i) => ({
        label: c.label,
        isCurrent: i === crumbs.length - 1,
        onClick: c.to ? () => navigate(c.to as string) : undefined,
      }))}
    />
  );
}

export default DashboardBreadcrumb;
