import type { BreadcrumbCrumb } from '../hooks/usePageConfig';
import { dashboardHomePath } from './dashboardPaths';

/**
 * Shared breadcrumb trail builders.
 *
 * Every page declares a full trail (with clickable parent links), mirroring
 * sudojo_app: public pages start at Home, dashboard pages at Home > Dashboard.
 * The layout (AppPageLayout's `breadcrumbs` prop) renders the trail.
 */

/** Root crumb linking to the marketing home, shared by every page. */
export const HOME_CRUMB: BreadcrumbCrumb = { label: 'Home', href: '/' };

/** Trail for public/marketing pages: `Home > ...rest`. */
export function publicTrail(...rest: BreadcrumbCrumb[]): BreadcrumbCrumb[] {
  return [HOME_CRUMB, ...rest];
}

/** Trail for dashboard pages: `Home > Dashboard > ...rest`. */
export function dashboardTrail(
  entitySlug: string,
  ...rest: BreadcrumbCrumb[]
): BreadcrumbCrumb[] {
  return [HOME_CRUMB, { label: 'Dashboard', href: dashboardHomePath(entitySlug) }, ...rest];
}
