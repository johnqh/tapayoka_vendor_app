export type OfferingParent = { parentType: 'model' | 'location'; parentId: string };

export function resolveOfferingParent(params: {
  modelId?: string;
  locationId?: string;
}): OfferingParent {
  if (params.modelId) return { parentType: 'model', parentId: params.modelId };
  if (params.locationId) return { parentType: 'location', parentId: params.locationId };
  throw new Error('resolveOfferingParent: no modelId or locationId in route params');
}

const segment = (parentType: 'model' | 'location') =>
  parentType === 'model' ? 'models' : 'locations';

export function sectionPath(entitySlug: string, parentType: 'model' | 'location'): string {
  return `/dashboard/${entitySlug}/${segment(parentType)}`;
}

export function parentDetailPath(entitySlug: string, parent: OfferingParent): string {
  return `${sectionPath(entitySlug, parent.parentType)}/${parent.parentId}`;
}

export function offeringPath(
  entitySlug: string,
  parent: OfferingParent,
  offeringId: string
): string {
  return `${parentDetailPath(entitySlug, parent)}/offerings/${offeringId}`;
}

export function installationPath(
  entitySlug: string,
  parent: OfferingParent,
  offeringId: string,
  wallet: string
): string {
  return `${offeringPath(entitySlug, parent, offeringId)}/installs/${wallet}`;
}
