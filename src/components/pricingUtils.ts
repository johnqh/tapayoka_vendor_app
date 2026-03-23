import type { PricingTier } from '@sudobility/tapayoka_types';

export function formatPricingSubtitle(tiers: PricingTier[]): string {
  if (tiers.length === 0) return 'No pricing';
  const first = tiers[0];
  if (first.type === 'timed') {
    const unit = first.startDurationUnit === 'hours' ? 'hr' : 'min';
    const base = `$${first.startPrice} / ${first.startDuration}${unit}`;
    return tiers.length > 1 ? `${base} (+${tiers.length - 1} more)` : base;
  }
  const base = `$${first.price}`;
  return tiers.length > 1 ? `${base} (+${tiers.length - 1} more)` : base;
}
