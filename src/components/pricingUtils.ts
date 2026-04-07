import type { PricingTier } from '@sudobility/tapayoka_types';

export function formatPricingSubtitle(tiers: PricingTier[]): string {
  if (!tiers || tiers.length === 0) return 'No pricing';
  const first = tiers[0];
  if (first.type === 'timed') {
    if (!first.startPrice)
      return tiers.length > 1 ? `${tiers.length} tiers` : first.name || 'Timed';
    const unit = first.startDurationUnit === 'hours' ? 'hr' : 'min';
    const base = `$${first.startPrice} / ${first.startDuration}${unit}`;
    return tiers.length > 1 ? `${base} (+${tiers.length - 1} more)` : base;
  }
  if (!first.price) return tiers.length > 1 ? `${tiers.length} tiers` : first.name || 'Fixed';
  const base = `$${first.price}`;
  return tiers.length > 1 ? `${base} (+${tiers.length - 1} more)` : base;
}
