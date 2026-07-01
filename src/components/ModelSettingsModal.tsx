import { useState, useEffect } from 'react';
import { FormModal } from '@sudobility/components';
import type {
  VendorModel,
  VendorModelUpdateRequest,
  VendorModelPricing,
  VendorModelSlot,
  VendorModelSlotPricing,
  VendorModelAction,
  VendorModelInterruption,
  VendorModelPayment,
} from '@sudobility/tapayoka_types';
import { buildVendorModelConfig } from '@sudobility/tapayoka_lib';
import { SegmentedField } from './SegmentedField';
import {
  SLOT_OPTIONS,
  PRICING_OPTIONS,
  SLOT_PRICING_OPTIONS,
  ACTION_OPTIONS,
  INTERRUPTION_OPTIONS,
  PAYMENT_OPTIONS,
} from './modelOptions';

interface ModelSettingsModalProps {
  open: boolean;
  model: VendorModel | null | undefined;
  onClose: () => void;
  onSave: (data: VendorModelUpdateRequest) => void | Promise<void>;
}

export function ModelSettingsModal({ open, model, onClose, onSave }: ModelSettingsModalProps) {
  const [pricing, setPricing] = useState<VendorModelPricing | null>(null);
  const [slot, setSlot] = useState<VendorModelSlot | null>(null);
  const [slotPricing, setSlotPricing] = useState<VendorModelSlotPricing | null>(null);
  const [action, setAction] = useState<VendorModelAction | null>(null);
  const [interruption, setInterruption] = useState<VendorModelInterruption | null>(null);
  const [payment, setPayment] = useState<VendorModelPayment | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPricing(model?.pricing ?? null);
    setSlot(model?.slot ?? null);
    setSlotPricing(model?.slotPricing ?? null);
    setAction(model?.action ?? null);
    setInterruption(model?.interruption ?? null);
    setPayment(model?.payment ?? null);
  }, [model?.id, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(
        buildVendorModelConfig({ pricing, slot, slotPricing, action, interruption, payment })
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      open={open}
      title="Model settings"
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      size="medium"
    >
      <div className="space-y-3">
        <SegmentedField
          label="Slot"
          options={SLOT_OPTIONS}
          value={slot}
          onChange={(v) => setSlot(v as VendorModelSlot)}
        />

        <SegmentedField
          label="Pricing"
          options={PRICING_OPTIONS}
          value={pricing}
          onChange={(v) => setPricing(v as VendorModelPricing)}
        />

        {slot && slot !== 'single' && (
          <SegmentedField
            label="Slot Pricing"
            options={SLOT_PRICING_OPTIONS}
            value={slotPricing}
            onChange={(v) => setSlotPricing(v as VendorModelSlotPricing)}
          />
        )}

        <SegmentedField
          label="Action"
          options={ACTION_OPTIONS}
          value={action}
          onChange={(v) => {
            setAction(v as VendorModelAction);
            if (v === 'sequence') setInterruption(null);
          }}
        />

        {action === 'timed' && (
          <SegmentedField
            label="Interruption"
            options={INTERRUPTION_OPTIONS}
            value={interruption}
            onChange={(v) => setInterruption(v as VendorModelInterruption)}
          />
        )}

        <SegmentedField
          label="Payment"
          options={PAYMENT_OPTIONS}
          value={payment}
          onChange={(v) => setPayment(v as VendorModelPayment)}
        />
      </div>
    </FormModal>
  );
}

export default ModelSettingsModal;
