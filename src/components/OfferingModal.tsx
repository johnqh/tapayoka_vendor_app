import { useState, useEffect } from 'react';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '@sudobility/components';
import { FormModal } from '@sudobility/components';
import type {
  VendorOffering,
  VendorOfferingCreateRequest,
  VendorOfferingUpdateRequest,
  VendorModel,
  VendorLocation,
} from '@sudobility/tapayoka_types';
import { buildOfferingCreateRequest, offeringDefaultName } from '@sudobility/tapayoka_lib';

interface OfferingModalProps {
  open: boolean;
  offering: VendorOffering | null;
  parentType: 'location' | 'model';
  parentId: string;
  parentName: string;
  models?: VendorModel[];
  locations?: VendorLocation[];
  selectedModel?: VendorModel;
  onClose: () => void;
  onSave: (data: VendorOfferingCreateRequest | VendorOfferingUpdateRequest) => Promise<void>;
}

/**
 * Create/rename an offering. Pricing tiers and schedule are managed on their
 * own dedicated screens ($ and calendar actions on the offering row); this
 * modal only handles the name (and, on create, the model/location it pairs).
 * A single default pricing tier is seeded on create so the offering is
 * immediately usable.
 */
export function OfferingModal({
  open,
  offering,
  parentType,
  parentId,
  parentName,
  models,
  locations,
  selectedModel: preselectedModel,
  onClose,
  onSave,
}: OfferingModalProps) {
  const [name, setName] = useState('');
  const [pickerId, setPickerId] = useState('');
  const [saving, setSaving] = useState(false);

  // Resolve the model to determine the default tier's pricing kind (on create).
  const resolvedModel =
    parentType === 'model' ? preselectedModel : models?.find((m) => m.id === pickerId);
  const modelPricing = resolvedModel?.pricing ?? null;

  useEffect(() => {
    if (open) {
      setName(offering ? offering.name : '');
      setPickerId(
        offering
          ? parentType === 'location'
            ? offering.vendorModelId
            : offering.vendorLocationId
          : ''
      );
    }
  }, [open, offering, parentType]);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (!offering && !pickerId) return;
    setSaving(true);
    try {
      if (offering) {
        await onSave({ name: name.trim() } as VendorOfferingUpdateRequest);
      } else {
        // Seeds one default tier so the new offering is usable; the user can
        // manage tiers afterward on the Pricing Tiers screen.
        await onSave(
          buildOfferingCreateRequest({ parentType, parentId, pickerId, name, modelPricing })
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const pickerItems =
    parentType === 'location'
      ? (models ?? []).map((m) => ({ id: m.id, label: m.name }))
      : (locations ?? []).map((l) => ({ id: l.id, label: l.name }));

  const title = offering
    ? 'Edit Offering'
    : parentType === 'location'
      ? `Add Offering to ${parentName}`
      : `Add ${parentName} Offering`;

  return (
    <FormModal
      open={open}
      title={title}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      canSave={!!name.trim() && (!!offering || !!pickerId)}
      size="medium"
    >
      <div className="space-y-4">
        <div>
          <Text as="label" size="sm" weight="medium" className="block mb-1">
            Name
          </Text>
          <Input
            type="text"
            className="w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Offering name"
          />
        </div>

        {!offering && (
          <div>
            <Text as="label" size="sm" weight="medium" className="block mb-1">
              {parentType === 'location' ? 'Model' : 'Location'}
            </Text>
            <Select
              value={pickerId}
              onValueChange={(value) => {
                setPickerId(value);
                if (!name.trim() && value) {
                  const item = pickerItems.find((i) => i.id === value);
                  if (item) setName(offeringDefaultName(item.label, parentName));
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {pickerItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </FormModal>
  );
}
