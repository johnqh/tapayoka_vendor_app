import { useState, useEffect, useCallback } from 'react';
import { FormField, Text, Button, Input } from '@sudobility/components';
import { FormModal } from '@sudobility/components';
import type {
  VendorInstallationSlot,
  VendorInstallationSlotCreateRequest,
  VendorModelPricing,
  VendorModelSlotPricing,
  VendorModelAction,
  VendorModelPayment,
  PricingTier,
  SlotAction,
  OfferingSignal,
} from '@sudobility/tapayoka_types';
import { VariablePricingForm, FixedPricingForm } from './pricingTierForms';
import {
  formatTierSummary,
  autoSelectTierId,
  makeDefaultCustomTier,
  canSaveSlot,
  buildSlotRequest,
  makeDefaultAction,
  slotUsesAction,
  appendSignal,
  removeSignalAt,
  updateSignalAt,
  parseIntOr,
} from '@sudobility/tapayoka_lib';

interface SlotFormModalProps {
  open: boolean;
  slot: VendorInstallationSlot | null;
  /** Model slot-pricing mode: 'Tiered' selects a shared offering tier, 'Unique' edits a per-slot tier. */
  slotPricing?: VendorModelSlotPricing | null;
  /** Model pricing kind, used to seed a default custom tier in 'Unique' mode. */
  modelPricing?: VendorModelPricing | null;
  /** Model action type, used to seed a default per-slot action for multi-slot models. */
  modelAction?: VendorModelAction | null;
  /** Model payment timing; an 'atEnd' action needs a second (end) phase. */
  modelPayment?: VendorModelPayment | null;
  /** The parent offering's pricing tiers, selectable in 'Tiered' mode. */
  offeringPricingTiers?: PricingTier[];
  /** Default currency for new custom tiers. */
  defaultCurrency?: string;
  onClose: () => void;
  onSave: (data: VendorInstallationSlotCreateRequest) => void | Promise<void>;
}

export function SlotFormModal({
  open,
  slot,
  slotPricing,
  modelPricing,
  modelAction,
  modelPayment,
  offeringPricingTiers,
  defaultCurrency = 'USD',
  onClose,
  onSave,
}: SlotFormModalProps) {
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
  // Tiered mode: id of the selected offering tier.
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  // Unique mode: the per-slot custom tier being edited.
  const [customPricingTier, setCustomPricingTier] = useState<PricingTier | null>(null);
  // Multi-slot models: the per-slot relay action (null for single-slot models).
  const [action, setAction] = useState<SlotAction | null>(null);

  const isTiered = slotPricing === 'Tiered';
  const isUnique = slotPricing === 'Unique';
  const usesAction = slotUsesAction(slotPricing);
  const tiers = offeringPricingTiers ?? [];

  useEffect(() => {
    if (!open) return;
    const availableTiers = offeringPricingTiers ?? [];
    // Only multi-slot models collect a per-slot action; single-slot keep it on the tier.
    const seedAction = () =>
      usesAction ? makeDefaultAction(modelAction ?? 'sequence', modelPayment) : null;
    if (slot) {
      setLabel(slot.label);
      setSelectedTierId(slot.pricingTierId ?? null);
      setCustomPricingTier(slot.pricingTier ?? null);
      setAction(usesAction ? (slot.action ?? seedAction()) : null);
    } else {
      setLabel('');
      // Auto-select when the offering has exactly one tier.
      setSelectedTierId(autoSelectTierId(availableTiers));
      setCustomPricingTier(
        isUnique && modelPricing ? makeDefaultCustomTier(modelPricing, defaultCurrency) : null
      );
      setAction(seedAction());
    }
  }, [
    open,
    slot,
    isUnique,
    usesAction,
    modelAction,
    modelPayment,
    modelPricing,
    defaultCurrency,
    offeringPricingTiers,
  ]);

  const handleCustomPricingChange = useCallback((tier: PricingTier) => {
    setCustomPricingTier(tier);
  }, []);

  // Update the start/end signal list of the per-slot action.
  const updateStart = (signals: OfferingSignal[]) =>
    setAction((prev) => (prev ? { ...prev, start: signals } : prev));
  const updateEnd = (signals: OfferingSignal[]) =>
    setAction((prev) => (prev ? { ...prev, end: signals } : prev));

  const canSave = canSaveSlot({
    label,
    slotPricing,
    tiers,
    selectedTierId,
    customPricingTier,
    action,
    payment: modelPayment,
  });

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(
        buildSlotRequest({ label, slotPricing, selectedTierId, customPricingTier, action })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      open={open}
      title={slot ? 'Edit slot' : 'Add slot'}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      canSave={canSave}
      size="small"
    >
      <div className="space-y-4">
        <FormField
          id="slot-label"
          label="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Slot label"
        />

        {/* Tiered mode: pick one of the offering's pricing tiers */}
        {isTiered && tiers.length > 0 && (
          <div>
            <Text as="div" size="sm" weight="medium" color="muted" className="mb-1">
              Pricing tier
            </Text>
            <div className="space-y-1.5">
              {tiers.map((tier) => {
                const isSelected = selectedTierId === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTierId(tier.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      isSelected
                        ? 'border-theme-primary bg-theme-bg-secondary'
                        : 'border-theme-border'
                    }`}
                  >
                    <Text weight="semibold">{tier.name}</Text>
                    <Text size="sm" color="muted" className="mt-0.5">
                      {formatTierSummary(tier)}
                    </Text>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Unique mode: edit a per-slot custom pricing tier */}
        {isUnique && customPricingTier && (
          <div>
            <Text as="div" size="sm" weight="semibold" className="mb-1">
              Pricing
            </Text>
            <div className="rounded-lg border border-theme-border p-3">
              {customPricingTier.type === 'timed' ? (
                <VariablePricingForm
                  config={customPricingTier}
                  onChange={handleCustomPricingChange}
                />
              ) : (
                <FixedPricingForm config={customPricingTier} onChange={handleCustomPricingChange} />
              )}
            </div>
          </div>
        )}

        {/* Multi-slot models: per-slot relay action (start, and end for atEnd payment) */}
        {usesAction && action && (
          <div>
            <Text as="div" size="sm" weight="semibold" className="mb-1">
              Actions
            </Text>
            <div className="space-y-3 rounded-lg border border-theme-border p-3">
              <SignalsEditor label="Start signals" signals={action.start} onChange={updateStart} />
              {modelPayment === 'atEnd' && (
                <SignalsEditor
                  label="End signals"
                  signals={action.end ?? []}
                  onChange={updateEnd}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </FormModal>
  );
}

/**
 * Editor for a list of relay signals (pin + duration), mirroring the "Signals"
 * block in FixedPricingForm. Used for a slot action's start/end phases.
 */
function SignalsEditor({
  label,
  signals,
  onChange,
}: {
  label: string;
  signals: OfferingSignal[];
  onChange: (signals: OfferingSignal[]) => void;
}) {
  return (
    <div>
      <Text as="label" size="xs" weight="medium" color="muted" className="block mb-1">
        {label}
      </Text>
      {signals.map((signal, index) => (
        <div key={index} className="flex items-center gap-2 mb-2">
          <Text as="span" size="xs" color="muted">
            Pin
          </Text>
          <Input
            type="number"
            className="w-14"
            value={signal.pinNumber}
            min={0}
            max={27}
            onChange={(e) =>
              onChange(
                updateSignalAt(signals, index, {
                  ...signal,
                  pinNumber: parseIntOr(e.target.value, 0),
                })
              )
            }
          />
          <Text as="span" size="xs" color="muted">
            Duration (s)
          </Text>
          <Input
            type="number"
            className="w-16"
            value={signal.duration}
            onChange={(e) =>
              onChange(
                updateSignalAt(signals, index, {
                  ...signal,
                  duration: parseIntOr(e.target.value, 1),
                })
              )
            }
          />
          <Button
            type="button"
            variant="destructive-outline"
            size="sm"
            onClick={() => onChange(removeSignalAt(signals, index))}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={() => onChange(appendSignal(signals))}
      >
        + Add Signal
      </Button>
    </div>
  );
}

export default SlotFormModal;
