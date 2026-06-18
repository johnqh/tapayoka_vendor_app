import { useState, useEffect } from 'react';
import { Modal, ModalContent, ModalFooter, Button, FormField } from '@sudobility/components';
import type {
  VendorInstallation,
  VendorInstallationUpdateRequest,
} from '@sudobility/tapayoka_types';

interface InstallationFormModalProps {
  open: boolean;
  installation: VendorInstallation | null;
  onClose: () => void;
  onSave: (data: VendorInstallationUpdateRequest) => void | Promise<void>;
}

export function InstallationFormModal({
  open,
  installation,
  onClose,
  onSave,
}: InstallationFormModalProps) {
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLabel(installation?.label ?? '');
  }, [installation?.walletAddress, open]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <Modal isOpen={open} onClose={onClose} title="Edit installation" size="small">
      <ModalContent>
        <FormField
          id="installation-label"
          label="Label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Installation label"
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

export default InstallationFormModal;
