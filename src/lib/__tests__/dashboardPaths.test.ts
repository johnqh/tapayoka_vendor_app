import { describe, it, expect } from 'vitest';
import {
  resolveOfferingParent,
  sectionPath,
  parentDetailPath,
  offeringPath,
  installationPath,
} from '../dashboardPaths';

describe('dashboardPaths', () => {
  it('resolves a model parent from route params', () => {
    expect(resolveOfferingParent({ modelId: 'm1' })).toEqual({
      parentType: 'model',
      parentId: 'm1',
    });
  });

  it('resolves a location parent from route params', () => {
    expect(resolveOfferingParent({ locationId: 'l1' })).toEqual({
      parentType: 'location',
      parentId: 'l1',
    });
  });

  it('throws when no parent param is present', () => {
    expect(() => resolveOfferingParent({})).toThrow();
  });

  it('builds model subtree paths', () => {
    const parent = { parentType: 'model', parentId: 'm1' } as const;
    expect(sectionPath('e1', 'model')).toBe('/dashboard/e1/models');
    expect(parentDetailPath('e1', parent)).toBe('/dashboard/e1/models/m1');
    expect(offeringPath('e1', parent, 'o1')).toBe('/dashboard/e1/models/m1/offerings/o1');
    expect(installationPath('e1', parent, 'o1', '0xAbc')).toBe(
      '/dashboard/e1/models/m1/offerings/o1/installs/0xAbc'
    );
  });

  it('builds location subtree paths', () => {
    const parent = { parentType: 'location', parentId: 'l1' } as const;
    expect(sectionPath('e1', 'location')).toBe('/dashboard/e1/locations');
    expect(offeringPath('e1', parent, 'o1')).toBe('/dashboard/e1/locations/l1/offerings/o1');
  });
});
