import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useCurrentEntity } from '@sudobility/entity_client';
import { useVendorModelsManager } from '@sudobility/tapayoka_lib';
import type {
  VendorModel,
  VendorModelCreateRequest,
  VendorModelUpdateRequest,
  VendorModelType,
  VendorModelPricing,
  VendorModelSlot,
  VendorModelSlotPricing,
  VendorModelAction,
  VendorModelInterruption,
  VendorModelPayment,
} from '@sudobility/tapayoka_types';

const MODEL_TYPES: VendorModelType[] = ['Washer', 'Dryer', 'Parking', 'Locker', 'Vending'];
const PRICING_OPTIONS: VendorModelPricing[] = ['fixed', 'variable'];
const SLOT_OPTIONS: VendorModelSlot[] = ['single', 'multi1D', 'multi2D'];
const SLOT_PRICING_OPTIONS: VendorModelSlotPricing[] = ['Tiered', 'Unique'];
const ACTION_OPTIONS: VendorModelAction[] = ['timed', 'sequence'];
const INTERRUPTION_OPTIONS: VendorModelInterruption[] = ['stop', 'continue'];
const PAYMENT_OPTIONS: VendorModelPayment[] = ['atStart', 'atEnd'];

const TYPE_DEFAULTS: Record<VendorModelType, {
  pricing: VendorModelPricing;
  slot: VendorModelSlot;
  slotPricing: VendorModelSlotPricing | null;
  action: VendorModelAction;
  interruption: VendorModelInterruption | null;
  payment: VendorModelPayment;
}> = {
  Washer: { pricing: 'variable', slot: 'single', slotPricing: null, action: 'timed', interruption: 'stop', payment: 'atStart' },
  Dryer: { pricing: 'variable', slot: 'single', slotPricing: null, action: 'timed', interruption: 'stop', payment: 'atStart' },
  Parking: { pricing: 'variable', slot: 'multi1D', slotPricing: 'Tiered', action: 'timed', interruption: 'continue', payment: 'atStart' },
  Locker: { pricing: 'variable', slot: 'multi1D', slotPricing: 'Tiered', action: 'timed', interruption: 'stop', payment: 'atEnd' },
  Vending: { pricing: 'fixed', slot: 'multi1D', slotPricing: 'Tiered', action: 'sequence', interruption: null, payment: 'atStart' },
};

function displayValue(value: string | null | undefined): string {
  return value ?? '—';
}

function Chip<T extends string>({
  label,
  value,
  selected,
  onSelect,
}: {
  label: string;
  value: T | null;
  selected: T | null;
  onSelect: (v: T | null) => void;
}) {
  const isActive = value === selected;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
        isActive
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  );
}

function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  allowNone,
}: {
  label: string;
  options: { label: string; value: T }[];
  value: T | null;
  onChange: (v: T | null) => void;
  allowNone?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {allowNone && (
          <Chip label="None" value={null} selected={value} onSelect={onChange} />
        )}
        {options.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            value={opt.value}
            selected={value}
            onSelect={onChange}
          />
        ))}
      </div>
    </div>
  );
}

interface ModelFormModalProps {
  visible: boolean;
  model: VendorModel | null;
  onClose: () => void;
  onSave: (data: VendorModelCreateRequest | VendorModelUpdateRequest) => Promise<void>;
}

function ModelFormModal({ visible, model, onClose, onSave }: ModelFormModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<VendorModelType | null>(null);
  const [pricing, setPricing] = useState<VendorModelPricing | null>(null);
  const [slot, setSlot] = useState<VendorModelSlot | null>(null);
  const [slotPricing, setSlotPricing] = useState<VendorModelSlotPricing | null>(null);
  const [action, setAction] = useState<VendorModelAction | null>(null);
  const [interruption, setInterruption] = useState<VendorModelInterruption | null>(null);
  const [payment, setPayment] = useState<VendorModelPayment | null>(null);
  const [saving, setSaving] = useState(false);

  const isEditing = model !== null;

  useEffect(() => {
    if (visible) {
      setName(model?.name ?? '');
      setType(model?.type ?? null);
      setPricing(model?.pricing ?? null);
      setSlot(model?.slot ?? null);
      setSlotPricing(model?.slotPricing ?? null);
      setAction(model?.action ?? null);
      setInterruption(model?.interruption ?? null);
      setPayment(model?.payment ?? null);
    }
  }, [visible, model]);

  const handleTypeSelect = useCallback((mt: VendorModelType | null) => {
    setType(mt);
    if (mt && !isEditing) {
      const defaults = TYPE_DEFAULTS[mt];
      setPricing(defaults.pricing);
      setSlot(defaults.slot);
      setSlotPricing(defaults.slotPricing);
      setAction(defaults.action);
      setInterruption(defaults.interruption);
      setPayment(defaults.payment);
    }
  }, [isEditing]);

  const handleActionSelect = useCallback((a: VendorModelAction | null) => {
    setAction(a);
    if (a === 'sequence') {
      setInterruption(null);
    }
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        type: type || undefined,
        pricing: pricing || undefined,
        slot: slot || undefined,
        slotPricing: slot && slot !== 'single' ? (slotPricing || undefined) : undefined,
        action: action || undefined,
        interruption: interruption || undefined,
        payment: payment || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isEditing ? 'Edit Model' : 'Add Model'}
          </h2>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Model name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Type */}
            <ChipGroup
              label="Type"
              options={MODEL_TYPES.map((t) => ({ label: t, value: t }))}
              value={type}
              onChange={handleTypeSelect}
              allowNone
            />

            {/* Slot */}
            <ChipGroup
              label="Slot"
              options={SLOT_OPTIONS.map((s) => ({ label: s === 'multi1D' ? 'Multi 1D' : s === 'multi2D' ? 'Multi 2D' : 'Single', value: s }))}
              value={slot}
              onChange={setSlot}
            />

            {/* Pricing */}
            <ChipGroup
              label="Pricing"
              options={PRICING_OPTIONS.map((p) => ({ label: p, value: p }))}
              value={pricing}
              onChange={setPricing}
            />

            {/* Slot Pricing - only when slot is multi */}
            {slot && slot !== 'single' && (
              <ChipGroup
                label="Slot Pricing"
                options={SLOT_PRICING_OPTIONS.map((sp) => ({ label: sp, value: sp }))}
                value={slotPricing}
                onChange={setSlotPricing}
              />
            )}

            {/* Action */}
            <ChipGroup
              label="Action"
              options={ACTION_OPTIONS.map((a) => ({ label: a, value: a }))}
              value={action}
              onChange={handleActionSelect}
            />

            {/* Interruption - only when action is 'timed' */}
            {action === 'timed' && (
              <ChipGroup
                label="Interruption"
                options={INTERRUPTION_OPTIONS.map((i) => ({ label: i, value: i }))}
                value={interruption}
                onChange={setInterruption}
              />
            )}

            {/* Payment */}
            <ChipGroup
              label="Payment"
              options={PAYMENT_OPTIONS.map((p) => ({ label: p, value: p }))}
              value={payment}
              onChange={setPayment}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !name.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModelsPage() {
  const navigate = useNavigate();
  const { entitySlug } = useParams<{ entitySlug: string }>();
  const { networkClient, baseUrl, token } = useApi();
  const { currentEntitySlug } = useCurrentEntity();
  const manager = useVendorModelsManager(networkClient, baseUrl, currentEntitySlug, token);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<VendorModel | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingModel(null);
    setModalVisible(true);
  };

  const handleEdit = (model: VendorModel) => {
    setEditingModel(model);
    setModalVisible(true);
  };

  const handleDelete = async (model: VendorModel) => {
    if (!window.confirm(`Delete model "${model.name}"?`)) return;
    setDeletingId(model.id);
    await new Promise(r => setTimeout(r, 300));
    const ok = await manager.deleteModel(model.id);
    setDeletingId(null);
    if (!ok && manager.error) {
      alert(manager.error);
    }
  };

  const handleRowClick = (model: VendorModel) => {
    navigate(`/dashboard/${encodeURIComponent(entitySlug ?? '')}/models/${model.id}`);
  };

  const handleSave = async (data: VendorModelCreateRequest | VendorModelUpdateRequest) => {
    if (editingModel) {
      const result = await manager.updateModel(editingModel.id, data);
      if (!result && manager.error) {
        alert(manager.error);
        return;
      }
    } else {
      const result = await manager.addModel(data as VendorModelCreateRequest);
      if (!result && manager.error) {
        alert(manager.error);
        return;
      }
    }
    setModalVisible(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Models</h1>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Model
        </button>
      </div>

      {manager.isLoading && manager.models.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
          Loading...
        </div>
      ) : manager.models.length === 0 ? (
        <EmptyState
          message="Manage your installation models here."
          buttonLabel="Add Model"
          onPress={handleAdd}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slot
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offerings
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {manager.models.map((model) => (
                <tr
                  key={model.id}
                  onClick={() => handleRowClick(model)}
                  className="hover:bg-gray-50 cursor-pointer transition-all duration-300"
                  style={deletingId === model.id ? { opacity: 0, transform: 'translateX(-20px)' } : {}}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {model.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {displayValue(model.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {displayValue(model.pricing)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {displayValue(model.slot)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {displayValue(model.action)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {model.offeringCount != null && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {model.offeringCount}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(model);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(model);
                      }}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ModelFormModal
        visible={modalVisible}
        model={editingModel}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export default ModelsPage;
