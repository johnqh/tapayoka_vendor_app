import { useState, useEffect, useCallback } from 'react';
import { ui } from '@sudobility/design';
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
} from '@sudobility/components';
import type {
  VendorOffering,
  VendorOfferingCreateRequest,
  VendorOfferingUpdateRequest,
  VendorModel,
  VendorLocation,
  VendorModelPricing,
  TimedPricingTier,
  FixedPricingTier,
  PricingTier,
  OfferingSignal,
  DurationUnit,
  DailySchedule,
  DayOfWeek,
} from '@sudobility/tapayoka_types';

const DURATION_UNITS: DurationUnit[] = ['minutes', 'hours'];
const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

let nextTierId = 1;
function generateTierId(): string {
  return `tier_${Date.now()}_${nextTierId++}`;
}

function makeDefaultVariableTier(currency: string, name: string): TimedPricingTier {
  return {
    type: 'timed',
    id: generateTierId(),
    name,
    currencyCode: currency,
    startPrice: '1.00',
    startDuration: 30,
    startDurationUnit: 'minutes',
    marginalPrice: '0.50',
    marginalDuration: 15,
    marginalDurationUnit: 'minutes',
    pinNumber: 0,
  };
}

function makeDefaultFixedTier(currency: string, name: string): FixedPricingTier {
  return {
    type: 'fixed',
    id: generateTierId(),
    name,
    currencyCode: currency,
    price: '5.00',
    signals: [{ pinNumber: 0, duration: 5 }],
  };
}

function makeDefaultTier(
  pricingType: VendorModelPricing,
  currency: string,
  name: string
): PricingTier {
  return pricingType === 'variable'
    ? makeDefaultVariableTier(currency, name)
    : makeDefaultFixedTier(currency, name);
}

function VariablePricingForm({
  config,
  onChange,
}: {
  config: TimedPricingTier;
  onChange: (c: TimedPricingTier) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Text as="label" size="xs" weight="medium" color="muted" className="block mb-1">
          Start with
        </Text>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            className="w-20"
            value={config.startPrice}
            onChange={(e) => onChange({ ...config, startPrice: e.target.value })}
            placeholder="0.00"
          />
          <Input
            type="text"
            className="w-14 uppercase"
            value={config.currencyCode}
            onChange={(e) => onChange({ ...config, currencyCode: e.target.value.toUpperCase() })}
            maxLength={3}
          />
          <Text as="span" size="xs" color="muted">
            for
          </Text>
          <Input
            type="number"
            className="w-16"
            value={config.startDuration}
            onChange={(e) =>
              onChange({ ...config, startDuration: parseInt(e.target.value, 10) || 1 })
            }
          />
          <div className="flex gap-1">
            {DURATION_UNITS.map((u) => (
              <Button
                key={u}
                type="button"
                variant={config.startDurationUnit === u ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onChange({ ...config, startDurationUnit: u })}
              >
                {u}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Text as="label" size="xs" weight="medium" color="muted" className="block mb-1">
          Additional
        </Text>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            className="w-20"
            value={config.marginalPrice}
            onChange={(e) => onChange({ ...config, marginalPrice: e.target.value })}
            placeholder="0.00"
          />
          <Input
            type="text"
            className="w-14 uppercase"
            value={config.currencyCode}
            onChange={(e) => onChange({ ...config, currencyCode: e.target.value.toUpperCase() })}
            maxLength={3}
          />
          <Text as="span" size="xs" color="muted">
            for
          </Text>
          <Input
            type="number"
            className="w-16"
            value={config.marginalDuration}
            onChange={(e) =>
              onChange({ ...config, marginalDuration: parseInt(e.target.value, 10) || 1 })
            }
          />
          <div className="flex gap-1">
            {DURATION_UNITS.map((u) => (
              <Button
                key={u}
                type="button"
                variant={config.marginalDurationUnit === u ? 'primary' : 'outline'}
                size="sm"
                onClick={() => onChange({ ...config, marginalDurationUnit: u })}
              >
                {u}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <Text as="label" size="xs" weight="medium" color="muted" className="block mb-1">
          Pin Number (0–25)
        </Text>
        <Input
          type="number"
          className="w-16"
          value={config.pinNumber}
          min={0}
          max={25}
          onChange={(e) => onChange({ ...config, pinNumber: parseInt(e.target.value, 10) || 0 })}
        />
      </div>
    </div>
  );
}

function FixedPricingForm({
  config,
  onChange,
}: {
  config: FixedPricingTier;
  onChange: (c: FixedPricingTier) => void;
}) {
  const handleAddSignal = () => {
    onChange({ ...config, signals: [...config.signals, { pinNumber: 0, duration: 5 }] });
  };
  const handleRemoveSignal = (index: number) => {
    onChange({ ...config, signals: config.signals.filter((_, i) => i !== index) });
  };
  const handleUpdateSignal = (index: number, signal: OfferingSignal) => {
    onChange({ ...config, signals: config.signals.map((s, i) => (i === index ? signal : s)) });
  };

  return (
    <div className="space-y-3">
      <div>
        <Text as="label" size="xs" weight="medium" color="muted" className="block mb-1">
          Price
        </Text>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            className="w-20"
            value={config.price}
            onChange={(e) => onChange({ ...config, price: e.target.value })}
            placeholder="0.00"
          />
          <Input
            type="text"
            className="w-14 uppercase"
            value={config.currencyCode}
            onChange={(e) => onChange({ ...config, currencyCode: e.target.value.toUpperCase() })}
            maxLength={3}
          />
        </div>
      </div>
      <div>
        <Text as="label" size="xs" weight="medium" color="muted" className="block mb-1">
          Signals
        </Text>
        {config.signals.map((signal, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Text as="span" size="xs" color="muted">
              Pin
            </Text>
            <Input
              type="number"
              className="w-14"
              value={signal.pinNumber}
              min={0}
              max={25}
              onChange={(e) =>
                handleUpdateSignal(index, {
                  ...signal,
                  pinNumber: parseInt(e.target.value, 10) || 0,
                })
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
                handleUpdateSignal(index, {
                  ...signal,
                  duration: parseInt(e.target.value, 10) || 1,
                })
              }
            />
            <Button
              type="button"
              variant="destructive-outline"
              size="sm"
              onClick={() => handleRemoveSignal(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="link" size="sm" onClick={handleAddSignal}>
          + Add Signal
        </Button>
      </div>
    </div>
  );
}

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
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [schedule, setSchedule] = useState<DailySchedule[]>([]);
  const [saving, setSaving] = useState(false);

  // Resolve model to determine pricing type
  const resolvedModel =
    parentType === 'model' ? preselectedModel : models?.find((m) => m.id === pickerId);

  const modelPricing = resolvedModel?.pricing ?? null;

  // Init pricing tiers when model changes
  useEffect(() => {
    if (!modelPricing || offering) return;
    setPricingTiers([makeDefaultTier(modelPricing, 'USD', 'Default')]);
  }, [modelPricing, offering]);

  useEffect(() => {
    if (open) {
      if (offering) {
        setName(offering.name);
        setPricingTiers(offering.pricingTiers);
        setSchedule(offering.schedule ?? []);
        setPickerId(parentType === 'location' ? offering.vendorModelId : offering.vendorLocationId);
      } else {
        setName('');
        setPricingTiers([]);
        setSchedule([]);
        setPickerId('');
      }
    }
  }, [open, offering, parentType]);

  const handleTierChange = useCallback((index: number, tier: PricingTier) => {
    setPricingTiers((prev) => prev.map((t, i) => (i === index ? tier : t)));
  }, []);

  const handleTierNameChange = useCallback((index: number, tierName: string) => {
    setPricingTiers((prev) => prev.map((t, i) => (i === index ? { ...t, name: tierName } : t)));
  }, []);

  const handleAddTier = useCallback(() => {
    if (!modelPricing) return;
    setPricingTiers((prev) => [
      ...prev,
      makeDefaultTier(modelPricing, 'USD', `Tier ${prev.length + 1}`),
    ]);
  }, [modelPricing]);

  const handleRemoveTier = useCallback((index: number) => {
    setPricingTiers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (!offering && !pickerId) return;
    setSaving(true);
    try {
      if (offering) {
        await onSave({
          name: name.trim(),
          pricingTiers,
          schedule: schedule.length > 0 ? schedule : null,
        } as VendorOfferingUpdateRequest);
      } else {
        const vendorLocationId = parentType === 'location' ? parentId : pickerId;
        const vendorModelId = parentType === 'model' ? parentId : pickerId;
        await onSave({
          vendorLocationId,
          vendorModelId,
          name: name.trim(),
          pricingTiers,
          ...(schedule.length > 0 ? { schedule } : {}),
        } as VendorOfferingCreateRequest);
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
    <Modal isOpen={open} onClose={onClose} size="medium" aria-labelledby="offering-modal-title">
      <ModalHeader>
        <h2 id="offering-modal-title" className={ui.text.h4}>
          {title}
        </h2>
      </ModalHeader>
      <ModalContent variant="scrollable">
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
                    if (item) setName(`${item.label} at ${parentName}`);
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

          {/* Pricing Tiers Section */}
          {pricingTiers.length > 0 && (
            <div>
              <Text as="div" size="sm" weight="semibold" className="mb-2">
                Pricing Tiers
              </Text>
              {pricingTiers.map((tier, index) => (
                <div key={tier.id} className="border border-theme-border rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      type="text"
                      className="flex-1"
                      value={tier.name}
                      onChange={(e) => handleTierNameChange(index, e.target.value)}
                      placeholder="Tier name"
                    />
                    {pricingTiers.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive-outline"
                        size="sm"
                        onClick={() => handleRemoveTier(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  {tier.type === 'timed' ? (
                    <VariablePricingForm
                      config={tier}
                      onChange={(p) => handleTierChange(index, p)}
                    />
                  ) : (
                    <FixedPricingForm config={tier} onChange={(p) => handleTierChange(index, p)} />
                  )}
                </div>
              ))}
              <Button type="button" variant="link" size="sm" onClick={handleAddTier}>
                + Add Tier
              </Button>
            </div>
          )}
          {/* Schedule Section */}
          <div>
            <Text as="label" size="sm" weight="medium" className="block mb-2">
              Schedule
            </Text>
            {schedule.map((entry, index) => (
              <div
                key={`${entry.dayOfWeek}-${index}`}
                className="flex items-center gap-3 mb-2 bg-theme-bg-secondary rounded-lg px-3 py-2"
              >
                <Text as="span" size="sm" weight="medium" className="w-24">
                  {entry.dayOfWeek}
                </Text>
                <Input
                  type="text"
                  className="w-20"
                  value={entry.startTime}
                  onChange={(e) =>
                    setSchedule((prev) =>
                      prev.map((s, i) => (i === index ? { ...s, startTime: e.target.value } : s))
                    )
                  }
                  placeholder="09:00"
                  maxLength={5}
                />
                <Text as="span" size="xs" color="muted">
                  to
                </Text>
                <Input
                  type="text"
                  className="w-20"
                  value={entry.endTime}
                  onChange={(e) =>
                    setSchedule((prev) =>
                      prev.map((s, i) => (i === index ? { ...s, endTime: e.target.value } : s))
                    )
                  }
                  placeholder="17:00"
                  maxLength={5}
                />
                <Button
                  type="button"
                  variant="destructive-outline"
                  size="sm"
                  onClick={() => setSchedule((prev) => prev.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap gap-2 mt-2">
              {DAYS_OF_WEEK.filter((d) => !schedule.some((s) => s.dayOfWeek === d)).map((day) => (
                <Button
                  key={day}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const last = schedule[schedule.length - 1];
                    setSchedule((prev) => [
                      ...prev,
                      {
                        dayOfWeek: day,
                        startTime: last?.startTime ?? '09:00',
                        endTime: last?.endTime ?? '17:00',
                      },
                    ]);
                  }}
                >
                  + {day.slice(0, 3)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={saving || !name.trim()}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
