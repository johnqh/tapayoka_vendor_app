import { useState, useEffect, useCallback } from 'react';
import type {
  VendorOffering,
  VendorOfferingCreateRequest,
  VendorOfferingUpdateRequest,
  VendorModel,
  VendorLocation,
  VendorModelPricing,
  VariablePricingTier,
  FixedPricingTier,
  PricingTier,
  OfferingSignal,
  DurationUnit,
} from '@sudobility/tapayoka_types';

const DURATION_UNITS: DurationUnit[] = ['minutes', 'hours'];

let nextTierId = 1;
function generateTierId(): string {
  return `tier_${Date.now()}_${nextTierId++}`;
}

function makeDefaultVariableTier(currency: string, name: string): VariablePricingTier {
  return {
    type: 'variable',
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

function makeDefaultTier(pricingType: VendorModelPricing, currency: string, name: string): PricingTier {
  return pricingType === 'variable'
    ? makeDefaultVariableTier(currency, name)
    : makeDefaultFixedTier(currency, name);
}

function VariablePricingForm({
  config,
  onChange,
}: {
  config: VariablePricingTier;
  onChange: (c: VariablePricingTier) => void;
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
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [saving, setSaving] = useState(false);

  // Resolve model to determine pricing type
  const resolvedModel = parentType === 'model'
    ? preselectedModel
    : models?.find(m => m.id === pickerId);

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
        setPickerId(parentType === 'location' ? offering.vendorModelId : offering.vendorLocationId);
      } else {
        setName('');
        setPricingTiers([]);
        setPickerId('');
      }
    }
  }, [open, offering, parentType]);

  const handleTierChange = useCallback((index: number, tier: PricingTier) => {
    setPricingTiers(prev => prev.map((t, i) => (i === index ? tier : t)));
  }, []);

  const handleTierNameChange = useCallback((index: number, tierName: string) => {
    setPricingTiers(prev => prev.map((t, i) => (i === index ? { ...t, name: tierName } : t)));
  }, []);

  const handleAddTier = useCallback(() => {
    if (!modelPricing) return;
    setPricingTiers(prev => [
      ...prev,
      makeDefaultTier(modelPricing, 'USD', `Tier ${prev.length + 1}`),
    ]);
  }, [modelPricing]);

  const handleRemoveTier = useCallback((index: number) => {
    setPricingTiers(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    if (!offering && !pickerId) return;
    setSaving(true);
    try {
      if (offering) {
        await onSave({ name: name.trim(), pricingTiers } as VendorOfferingUpdateRequest);
      } else {
        const vendorLocationId = parentType === 'location' ? parentId : pickerId;
        const vendorModelId = parentType === 'model' ? parentId : pickerId;
        await onSave({
          vendorLocationId,
          vendorModelId,
          name: name.trim(),
          pricingTiers,
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

          {/* Pricing Tiers Section */}
          {pricingTiers.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Pricing Tiers</h3>
              {pricingTiers.map((tier, index) => (
                <div key={tier.id} className="border rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 border rounded px-2 py-1 text-sm"
                      value={tier.name}
                      onChange={e => handleTierNameChange(index, e.target.value)}
                      placeholder="Tier name"
                    />
                    {pricingTiers.length > 1 && (
                      <button
                        type="button"
                        className="text-red-500 text-xs hover:text-red-700"
                        onClick={() => handleRemoveTier(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {tier.type === 'variable' ? (
                    <VariablePricingForm config={tier} onChange={p => handleTierChange(index, p)} />
                  ) : (
                    <FixedPricingForm config={tier} onChange={p => handleTierChange(index, p)} />
                  )}
                </div>
              ))}
              <button
                type="button"
                className="text-blue-600 text-sm hover:text-blue-800"
                onClick={handleAddTier}
              >
                + Add Tier
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
            disabled={saving || !name.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
