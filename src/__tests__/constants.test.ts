import { describe, it, expect } from 'vitest';
import { APP_NAME } from '../config/constants';

describe('constants', () => {
  it('exports APP_NAME', () => {
    expect(APP_NAME).toBe('Tapayoka Vendor');
  });
});
