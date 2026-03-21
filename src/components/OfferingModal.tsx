import { useState, useEffect, useCallback } from 'react';
import type {
  VendorOffering,
  VendorOfferingCreateRequest,
  VendorOfferingUpdateRequest,
  VendorModel,
  VendorLocation,
  VariablePricingConfig,
  FixedPricingConfig,
  VendorOfferingPricing,
  OfferingSignal,
  SlotPricing,
  DurationUnit,
} from '@sudobility/tapayoka_types';

const DURATION_UNITS: DurationUnit[] = ['minutes', 'hours'];

function makeDefaultVariable(currency: string): VariablePricingConfig {
  return {
    type: 'variable',
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

function makeDefaultFixed(currency: string): FixedPricingConfig {
  return {
    type: 'fixed',
    currencyCode: currency,
    price: '5.00',
    signals: [{ pinNumber: 0, duration: 5 }],
  };
}

function VariablePricingForm({
  config,
  onChange,
}: {
  config: VariablePricingConfig;
  onChange: (c: VariablePricingConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Start with</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="w-20 border rounded px-2 py-1 text-sm"
            value={config.startPrice}
            onChange={e => onChange({ ...config, startPrice: e.target.value })}
            placeholder="0.00"
          />
          <input
            type="text"
            className="w-14 border rounded px-2 py-1 text-sm uppercase"
            value={config.currencyCode}
            onChange={e => onChange({ ...config, currencyCode: e.target.value.toUpperCase() })}
            maxLength={3}
          />
          <span className="text-xs text-gray-500">for</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 text-sm"
            value={config.startDuration}
            onChange={e => onChange({ ...config, startDuration: parseInt(e.target.value, 10) || 0 })}
          />
          <div className="flex gap-1">
            {DURATION_UNITS.map(u => (
              <button
                key={u}
                type="button"
                className={`px-2 py-1 text-xs rounded border ${config.startDurationUnit === u ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                onClick={() => onChange({ ...config, startDurationUnit: u })}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Additional</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="w-20 border rounded px-2 py-1 text-sm"
            value={config.marginalPrice}
            onChange={e => onChange({ ...config, marginalPrice: e.target.value })}
            placeholder="0.00"
          />
          <input
            type="text"
            className="w-14 border rounded px-2 py-1 text-sm uppercase"
            value={config.currencyCode}
            onChange={e => onChange({ ...config, currencyCode: e.target.value.toUpperCase() })}
            maxLength={3}
          />
          <span className="text-xs text-gray-500">for</span>
          <input
            type="number"
            className="w-16 border rounded px-2 py-1 text-sm"
            value={config.marginalDuration}
            onChange={e => onChange({ ...config, marginalDuration: parseInt(e.target.value, 10) || 0 })}
          />
          <div className="flex gap-1">
            {DURATION_UNITS.map(u => (
              <button
                key={u}
                type="button"
                className={`px-2 py-1 text-xs rounded border ${config.marginalDurationUnit === u ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
                onClick={() => onChange({ ...config, marginalDurationUnit: u })}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Pin Number (0–25)</label>
        <input
          type="number"
          className="w-16 border rounded px-2 py-1 text-sm"
          value={config.pinNumber}
          min={0}
          max={25}
          onChange={e => onChange({ ...config, pinNumber: parseInt(e.target.value, 10) || 0 })}
        />
      </div>
    </div>
  );
}

function FixedPricingForm({
  config,
  onChange,
}: {
  config: FixedPricingConfig;
  onChange: (c: FixedPricingConfig) => void;
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
        <label className="block text-xs font-medium text-gray-500 mb-1">Price</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="w-20 border rounded px-2 py-1 text-sm"
            value={config.price}
            onChange={e => onChange({ ...config, price: e.target.value })}
            placeholder="0.00"
          />
          <input
            type="text"
            className="w-14 border rounded px-2 py-1 text-sm uppercase"
            value={config.currencyCode}
            onChange={e => onChange({ ...config, currencyCode: e.target.value.toUpperCase() })}
            maxLength={3}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Signals</label>
        {config.signals.map((signal, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500">Pin</span>
            <input
              type="number"
              className="w-14 border rounded px-2 py-1 text-sm"
              value={signal.pinNumber}
              min={0}
              max={25}
              onChange={e => handleUpdateSignal(index, { ...signal, pinNumber: parseInt(e.target.value, 10) || 0 })}
            />
            <span className="text-xs text-gray-500">Duration (s)</span>
            <input
              type="number"
              className="w-16 border rounded px-2 py-1 text-sm"
              value={signal.duration}
              onChange={e => handleUpdateSignal(index, { ...signal, duration: parseInt(e.target.value, 10) || 0 })}
            />
            <button
              type="button"
              className="text-red-500 text-xs hover:text-red-700"
              onClick={() => handleRemoveSignal(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="text-blue-600 text-xs hover:text-blue-800"
          onClick={handleAddSignal}
        >
          + Add Signal
        </button>
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
  const [pricing, setPricing] = useState<VendorOfferingPricing | null>(null);
  const [saving, setSaving] = useState(false);

  // Resolve model to determine pricing/slot
  const resolvedModel = parentType === 'model'
    ? preselectedModel
    : models?.find(m => m.id === pickerId);

  const modelPricing = resolvedModel?.pricing ?? null;
  const modelSlot = resolvedModel?.slot ?? null;

  // Init pricing when model changes
  useEffect(() => {
    if (!modelPricing || offering) return;
    const currency = 'USD';
    if (modelSlot && modelSlot !== 'single') {
      setPricing({
        type: 'multi',
        slots: [{
          name: 'Slot 1',
          pricing: modelPricing === 'variable' ? makeDefaultVariable(currency) : makeDefaultFixed(currency),
        }],
      });
    } else {
      setPricing(modelPricing === 'variable' ? makeDefaultVariable(currency) : makeDefaultFixed(currency));
    }
  }, [modelPricing, modelSlot, offering]);

  useEffect(() => {
    if (open) {
      if (offering) {
        setName(offering.name);
        setPricing(offering.pricing);
        setPickerId(parentType === 'location' ? offering.vendorModelId : offering.vendorLocationId);
      } else {
        setName('');
        setPricing(null);
        setPickerId('');
      }
    }
  }, [open, offering, parentType]);

  const handleSlotPricingChange = useCallback((index: number, slotPricing: VariablePricingConfig | FixedPricingConfig) => {
    if (!pricing || pricing.type !== 'multi') return;
    setPricing({ ...pricing, slots: pricing.slots.map((s, i) => (i === index ? { ...s, pricing: slotPricing } : s)) });
  }, [pricing]);

  const handleSlotNameChange = useCallback((index: number, slotName: string) => {
    if (!pricing || pricing.type !== 'multi') return;
    setPricing({ ...pricing, slots: pricing.slots.map((s, i) => (i === index ? { ...s, name: slotName } : s)) });
  }, [pricing]);

  const handleAddSlot = useCallback(() => {
    if (!pricing || pricing.type !== 'multi' || !modelPricing) return;
    const newSlot: SlotPricing = {
      name: `Slot ${pricing.slots.length + 1}`,
      pricing: modelPricing === 'variable' ? makeDefaultVariable('USD') : makeDefaultFixed('USD'),
    };
    setPricing({ ...pricing, slots: [...pricing.slots, newSlot] });
  }, [pricing, modelPricing]);

  const handleRemoveSlot = useCallback((index: number) => {
    if (!pricing || pricing.type !== 'multi') return;
    setPricing({ ...pricing, slots: pricing.slots.filter((_, i) => i !== index) });
  }, [pricing]);

  const handleSave = async () => {
    if (!name.trim() || !pricing) return;
    if (!offering && !pickerId) return;
    setSaving(true);
    try {
      if (offering) {
        await onSave({ name: name.trim(), pricing } as VendorOfferingUpdateRequest);
      } else {
        const vendorLocationId = parentType === 'location' ? parentId : pickerId;
        const vendorModelId = parentType === 'model' ? parentId : pickerId;
        await onSave({
          vendorLocationId,
          vendorModelId,
          name: name.trim(),
          pricing,
        } as VendorOfferingCreateRequest);
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const pickerItems = parentType === 'location'
    ? (models ?? []).map(m => ({ id: m.id, label: m.name }))
    : (locations ?? []).map(l => ({ id: l.id, label: l.name }));

  const title = offering
    ? 'Edit Offering'
    : parentType === 'location'
      ? `Add Offering to ${parentName}`
      : `Add ${parentName} Offering`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Offering name"
            />
          </div>

          {!offering && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {parentType === 'location' ? 'Model' : 'Location'}
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={pickerId}
                onChange={e => {
                  setPickerId(e.target.value);
                  if (!name.trim() && e.target.value) {
                    const item = pickerItems.find(i => i.id === e.target.value);
                    if (item) setName(`${item.label} at ${parentName}`);
                  }
                }}
              >
                <option value="">Select...</option>
                {pickerItems.map(item => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Pricing Section */}
          {pricing && pricing.type === 'variable' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Variable Pricing</h3>
              <VariablePricingForm config={pricing} onChange={p => setPricing(p)} />
            </div>
          )}

          {pricing && pricing.type === 'fixed' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Fixed Pricing</h3>
              <FixedPricingForm config={pricing} onChange={p => setPricing(p)} />
            </div>
          )}

          {pricing && pricing.type === 'multi' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Slots</h3>
              {pricing.slots.map((slot, index) => (
                <div key={index} className="border rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border rounded px-2 py-1 text-sm"
                      value={slot.name}
                      onChange={e => handleSlotNameChange(index, e.target.value)}
                      placeholder="Slot name"
                    />
                    {pricing.slots.length > 1 && (
                      <button
                        type="button"
                        className="text-red-500 text-xs hover:text-red-700"
                        onClick={() => handleRemoveSlot(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {slot.pricing.type === 'variable' ? (
                    <VariablePricingForm config={slot.pricing} onChange={p => handleSlotPricingChange(index, p)} />
                  ) : (
                    <FixedPricingForm config={slot.pricing} onChange={p => handleSlotPricingChange(index, p)} />
                  )}
                </div>
              ))}
              <button
                type="button"
                className="text-blue-600 text-sm hover:text-blue-800"
                onClick={handleAddSlot}
              >
                + Add Slot
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSave}
            disabled={saving || !name.trim() || !pricing}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
