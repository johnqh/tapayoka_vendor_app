import type { VendorOfferingPricing } from '@sudobility/tapayoka_types';

export function formatPricingSubtitle(pricing: VendorOfferingPricing): string {
  if (pricing.type === 'variable') {
    const unit = pricing.startDurationUnit === 'hours' ? 'hr' : 'min';
    return `$${pricing.startPrice} / ${pricing.startDuration}${unit}`;
  }
  if (pricing.type === 'fixed') {
    return `$${pricing.price}`;
  }
  return `${pricing.slots.length} slots`;
}
