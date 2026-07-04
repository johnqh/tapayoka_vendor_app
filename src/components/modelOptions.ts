import type { SegmentedControlOption } from './SegmentedControl';

/**
 * Shared option definitions (label + one-line explanation) for the vendor
 * model configuration controls. Used by both the model create/edit modal
 * (ModelsPage) and the Model Settings modal so the wording stays in sync.
 */

export const SLOT_OPTIONS: SegmentedControlOption[] = [
  {
    value: 'single',
    label: 'Single',
    description: 'One unit per device — a single machine such as a washer or dryer.',
  },
  {
    value: 'multi1D',
    label: 'Multi 1D',
    description: 'A row of independent units addressed by one label (e.g. lockers 1–10).',
  },
  {
    value: 'multi2D',
    label: 'Multi 2D',
    description: 'A grid of units addressed by row and column (e.g. a vending machine).',
  },
];

export const PRICING_OPTIONS: SegmentedControlOption[] = [
  {
    value: 'fixed',
    label: 'Fixed',
    description: 'A flat price per use, regardless of how long the device runs.',
  },
  {
    value: 'variable',
    label: 'Variable',
    description: 'Price scales with time — a starting rate plus a marginal rate.',
  },
];

export const SLOT_PRICING_OPTIONS: SegmentedControlOption[] = [
  {
    value: 'Tiered',
    label: 'Tiered',
    description: "Slots share the offering's pricing tiers; each slot picks one.",
  },
  { value: 'Unique', label: 'Unique', description: 'Each slot defines its own custom price.' },
];

export const ACTION_OPTIONS: SegmentedControlOption[] = [
  {
    value: 'timed',
    label: 'Timed',
    description: 'The device runs for the purchased duration (e.g. 30 minutes).',
  },
  {
    value: 'sequence',
    label: 'Sequence',
    description: 'The device fires a fixed sequence of signals once (e.g. vend an item).',
  },
];

export const INTERRUPTION_OPTIONS: SegmentedControlOption[] = [
  {
    value: 'stop',
    label: 'Stop',
    description: 'Pausing or unplugging ends the session; remaining time is forfeited.',
  },
  {
    value: 'continue',
    label: 'Continue',
    description: 'The session keeps counting down even if the device is interrupted.',
  },
];

export const PAYMENT_OPTIONS: SegmentedControlOption[] = [
  {
    value: 'atStart',
    label: 'At Start',
    description: 'The buyer pays up front, before the device runs.',
  },
  {
    value: 'atEnd',
    label: 'At End',
    description: 'The buyer is charged when the session finishes.',
  },
];
