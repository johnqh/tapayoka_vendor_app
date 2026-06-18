import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalFooter, Button } from '@sudobility/components';
import { ui, buttonVariant } from '@sudobility/design';
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

const PRICING_OPTIONS: VendorModelPricing[] = ['fixed', 'variable'];
const SLOT_OPTIONS: VendorModelSlot[] = ['single', 'multi1D', 'multi2D'];
const SLOT_PRICING_OPTIONS: VendorModelSlotPricing[] = ['Tiered', 'Unique'];
const ACTION_OPTIONS: VendorModelAction[] = ['timed', 'sequence'];
const INTERRUPTION_OPTIONS: VendorModelInterruption[] = ['stop', 'continue'];
const PAYMENT_OPTIONS: VendorModelPayment[] = ['atStart', 'atEnd'];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`px-3 py-1.5 text-sm rounded-lg border ${ui.transition.default} ${
        active ? `${buttonVariant('primary')}` : `${buttonVariant('outline')} hover:border-gray-400`
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={`block text-sm font-medium mb-2 ${ui.text.muted}`}>{label}</label>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  );
}

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
      await onSave({
        pricing: pricing || undefined,
        slot: slot || undefined,
        slotPricing: slot && slot !== 'single' ? slotPricing || undefined : undefined,
        action: action || undefined,
        interruption: action === 'timed' ? interruption || undefined : undefined,
        payment: payment || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title="Model settings" size="medium">
      <ModalContent>
        <div className="space-y-4">
          <Field label="Slot">
            {SLOT_OPTIONS.map((s) => (
              <Chip
                key={s}
                label={s === 'multi1D' ? 'Multi 1D' : s === 'multi2D' ? 'Multi 2D' : 'Single'}
                active={slot === s}
                onClick={() => setSlot(s)}
              />
            ))}
          </Field>

          <Field label="Pricing">
            {PRICING_OPTIONS.map((p) => (
              <Chip
                key={p}
                label={p === 'fixed' ? 'Fixed' : 'Variable'}
                active={pricing === p}
                onClick={() => setPricing(p)}
              />
            ))}
          </Field>

          {slot && slot !== 'single' && (
            <Field label="Slot Pricing">
              {SLOT_PRICING_OPTIONS.map((sp) => (
                <Chip
                  key={sp}
                  label={sp}
                  active={slotPricing === sp}
                  onClick={() => setSlotPricing(sp)}
                />
              ))}
            </Field>
          )}

          <Field label="Action">
            {ACTION_OPTIONS.map((a) => (
              <Chip
                key={a}
                label={a === 'timed' ? 'Timed' : 'Sequence'}
                active={action === a}
                onClick={() => {
                  setAction(a);
                  if (a === 'sequence') setInterruption(null);
                }}
              />
            ))}
          </Field>

          {action === 'timed' && (
            <Field label="Interruption">
              {INTERRUPTION_OPTIONS.map((i) => (
                <Chip
                  key={i}
                  label={i === 'stop' ? 'Stop' : 'Continue'}
                  active={interruption === i}
                  onClick={() => setInterruption(i)}
                />
              ))}
            </Field>
          )}

          <Field label="Payment">
            {PAYMENT_OPTIONS.map((p) => (
              <Chip
                key={p}
                label={p === 'atStart' ? 'At Start' : 'At End'}
                active={payment === p}
                onClick={() => setPayment(p)}
              />
            ))}
          </Field>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModelSettingsModal;
