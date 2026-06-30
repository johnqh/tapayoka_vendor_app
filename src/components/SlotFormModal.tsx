import { useState, useEffect, useCallback } from 'react';
import { Modal, ModalContent, ModalFooter, Button, FormField, Text } from '@sudobility/components';
import type {
  VendorInstallationSlot,
  VendorInstallationSlotCreateRequest,
  VendorModelPricing,
  VendorModelSlotPricing,
  PricingTier,
} from '@sudobility/tapayoka_types';
import { VariablePricingForm, FixedPricingForm } from './pricingTierForms';
import {
  makeDefaultVariableTier,
  makeDefaultFixedTier,
  formatTierSummary,
} from '@sudobility/tapayoka_lib';

interface SlotFormModalProps {
  open: boolean;
  slot: VendorInstallationSlot | null;
  /** Model slot-pricing mode: 'Tiered' selects a shared offering tier, 'Unique' edits a per-slot tier. */
  slotPricing?: VendorModelSlotPricing | null;
  /** Model pricing kind, used to seed a default custom tier in 'Unique' mode. */
  modelPricing?: VendorModelPricing | null;
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

  const isTiered = slotPricing === 'Tiered';
  const isUnique = slotPricing === 'Unique';
  const tiers = offeringPricingTiers ?? [];

  useEffect(() => {
    if (!open) return;
    const availableTiers = offeringPricingTiers ?? [];
    if (slot) {
      setLabel(slot.label);
      setSelectedTierId(slot.pricingTierId ?? null);
      setCustomPricingTier(slot.pricingTier ?? null);
    } else {
      setLabel('');
      // Auto-select when the offering has exactly one tier.
      setSelectedTierId(availableTiers.length === 1 ? availableTiers[0].id : null);
      if (isUnique && modelPricing) {
        setCustomPricingTier(
          modelPricing === 'variable'
            ? makeDefaultVariableTier(defaultCurrency, 'Default')
            : makeDefaultFixedTier(defaultCurrency, 'Default')
        );
      } else {
        setCustomPricingTier(null);
      }
    }
  }, [open, slot, isUnique, modelPricing, defaultCurrency, offeringPricingTiers]);

  const handleCustomPricingChange = useCallback((tier: PricingTier) => {
    setCustomPricingTier(tier);
  }, []);

  const canSave = (() => {
    if (!label.trim()) return false;
    if (isTiered && tiers.length > 0 && !selectedTierId) return false;
    if (isUnique && !customPricingTier) return false;
    return true;
  })();

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const data: VendorInstallationSlotCreateRequest = { label: label.trim() };
      if (isTiered && selectedTierId) data.pricingTierId = selectedTierId;
      if (isUnique && customPricingTier) data.pricingTier = customPricingTier;
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={slot ? 'Edit slot' : 'Add slot'} size="small">
      <ModalContent variant="scrollable">
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
                  <FixedPricingForm
                    config={customPricingTier}
                    onChange={handleCustomPricingChange}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving || !canSave}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default SlotFormModal;
