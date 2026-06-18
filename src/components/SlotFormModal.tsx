import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalFooter, Button, FormField } from '@sudobility/components';
import type {
  VendorInstallationSlot,
  VendorInstallationSlotCreateRequest,
} from '@sudobility/tapayoka_types';

interface SlotFormModalProps {
  open: boolean;
  slot: VendorInstallationSlot | null;
  onClose: () => void;
  onSave: (data: VendorInstallationSlotCreateRequest) => void | Promise<void>;
}

export function SlotFormModal({ open, slot, onClose, onSave }: SlotFormModalProps) {
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLabel(slot?.label ?? '');
  }, [slot?.id, open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (!label.trim()) return;
    setSaving(true);
    try {
      await onSave({ label: label.trim() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={slot ? 'Edit slot' : 'Add slot'} size="small">
      <ModalContent>
        <FormField
          id="slot-label"
          label="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Slot label"
        />
      </ModalContent>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving || !label.trim()}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default SlotFormModal;
