import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalFooter, Button, FormField, Text } from '@sudobility/components';
import type { PricingTier, VendorModelPricing } from '@sudobility/tapayoka_types';
import { makeDefaultVariableTier, makeDefaultFixedTier } from '@sudobility/tapayoka_lib';
import { VariablePricingForm, FixedPricingForm } from './pricingTierForms';

interface TierFormModalProps {
  open: boolean;
  /** The tier being edited, or null to create a new one. */
  tier: PricingTier | null;
  /** Model pricing kind — decides the tier shape for a new tier. */
  modelPricing?: VendorModelPricing | null;
  defaultCurrency?: string;
  onClose: () => void;
  onSave: (tier: PricingTier) => void | Promise<void>;
}

/** Add or edit a single offering pricing tier (name + price configuration). */
export function TierFormModal({
  open,
  tier,
  modelPricing,
  defaultCurrency = 'USD',
  onClose,
  onSave,
}: TierFormModalProps) {
  const [draft, setDraft] = useState<PricingTier | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (tier) {
      setDraft(tier);
    } else {
      const kind = modelPricing ?? 'variable';
      setDraft(
        kind === 'variable'
          ? makeDefaultVariableTier(defaultCurrency, 'Default')
          : makeDefaultFixedTier(defaultCurrency, 'Default')
      );
    }
  }, [open, tier, modelPricing, defaultCurrency]);

  if (!draft) return null;

  const canSave = draft.name.trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={tier ? 'Edit pricing tier' : 'Add pricing tier'}
      size="medium"
    >
      <ModalContent variant="scrollable">
        <div className="space-y-4">
          <FormField
            id="tier-name"
            label="Name"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Tier name"
          />
          <div>
            <Text as="div" size="sm" weight="medium" color="muted" className="mb-1">
              Pricing
            </Text>
            <div className="rounded-lg border border-theme-border p-3">
              {draft.type === 'timed' ? (
                <VariablePricingForm config={draft} onChange={(c) => setDraft(c)} />
              ) : (
                <FixedPricingForm config={draft} onChange={(c) => setDraft(c)} />
              )}
            </div>
          </div>
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

export default TierFormModal;
