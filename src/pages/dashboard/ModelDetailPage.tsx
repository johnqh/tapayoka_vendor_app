import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useCurrentEntity } from '@sudobility/entity_client';
import {
  useVendorModelsManager,
  useVendorLocationsManager,
  useVendorOfferingsManager,
} from '@sudobility/tapayoka_lib';
import { OfferingModal } from '../../components/OfferingModal';
import { formatPricingSubtitle } from '../../components/pricingUtils';
import type {
  VendorOffering,
  VendorOfferingCreateRequest,
  VendorOfferingUpdateRequest,
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
      className={`px-3 py-1.5 text-sm rounded-lg border transition ${
        active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export function ModelDetailPage() {
  const { entitySlug, modelId } = useParams<{ entitySlug: string; modelId: string }>();
  const { networkClient, baseUrl, token } = useApi();
  const { currentEntitySlug } = useCurrentEntity();

  const modelsManager = useVendorModelsManager(networkClient, baseUrl, currentEntitySlug, token);
  const locationsManager = useVendorLocationsManager(networkClient, baseUrl, currentEntitySlug, token);
  const offeringsManager = useVendorOfferingsManager(
    networkClient, baseUrl, currentEntitySlug, token, modelId ?? null, 'model'
  );

  const model = modelsManager.models.find(m => m.id === modelId);

  // Settings state
  const [pricing, setPricing] = useState<VendorModelPricing | null>(null);
  const [slot, setSlot] = useState<VendorModelSlot | null>(null);
  const [slotPricing, setSlotPricing] = useState<VendorModelSlotPricing | null>(null);
  const [action, setAction] = useState<VendorModelAction | null>(null);
  const [interruption, setInterruption] = useState<VendorModelInterruption | null>(null);
  const [payment, setPayment] = useState<VendorModelPayment | null>(null);
  const [saving, setSaving] = useState(false);
  const [settingsDirty, setSettingsDirty] = useState(false);

  useEffect(() => {
    if (model) {
      setPricing(model.pricing ?? null);
      setSlot(model.slot ?? null);
      setSlotPricing(model.slotPricing ?? null);
      setAction(model.action ?? null);
      setInterruption(model.interruption ?? null);
      setPayment(model.payment ?? null);
      setSettingsDirty(false);
    }
  }, [model?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleActionSelect = useCallback((a: VendorModelAction) => {
    setAction(a);
    if (a === 'sequence') setInterruption(null);
    setSettingsDirty(true);
  }, []);

  const handleSaveSettings = useCallback(async () => {
    if (!modelId) return;
    setSaving(true);
    try {
      const result = await modelsManager.updateModel(modelId, {
        pricing: pricing || undefined,
        slot: slot || undefined,
        slotPricing: slot && slot !== 'single' ? (slotPricing || undefined) : undefined,
        action: action || undefined,
        interruption: action === 'timed' ? (interruption || undefined) : undefined,
        payment: payment || undefined,
      });
      if (!result && modelsManager.error) {
        alert(modelsManager.error);
      } else {
        setSettingsDirty(false);
      }
    } finally {
      setSaving(false);
    }
  }, [modelsManager, modelId, pricing, slot, slotPricing, action, interruption, payment]);

  // Offerings
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<VendorOffering | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddOffering = useCallback(() => {
    setEditingOffering(null);
    setModalOpen(true);
  }, []);

  const handleEditOffering = useCallback((inst: VendorOffering) => {
    setEditingOffering(inst);
    setModalOpen(true);
  }, []);

  const handleDeleteOffering = useCallback(async (inst: VendorOffering) => {
    if (!window.confirm(`Delete offering "${inst.name}"?`)) return;
    setDeletingId(inst.id);
    await new Promise(r => setTimeout(r, 300));
    const ok = await offeringsManager.deleteOffering(inst.id);
    setDeletingId(null);
    if (!ok && offeringsManager.error) {
      alert(offeringsManager.error);
    }
  }, [offeringsManager]);

  const handleSaveOffering = useCallback(async (data: VendorOfferingCreateRequest | VendorOfferingUpdateRequest) => {
    if (editingOffering) {
      const result = await offeringsManager.updateOffering(editingOffering.id, data);
      if (!result && offeringsManager.error) {
        alert(offeringsManager.error);
        return;
      }
    } else {
      const result = await offeringsManager.addOffering(data as VendorOfferingCreateRequest);
      if (!result && offeringsManager.error) {
        alert(offeringsManager.error);
        return;
      }
    }
    setModalOpen(false);
  }, [editingOffering, offeringsManager]);

  if (!model && !modelsManager.isLoading) {
    return (
      <div className="text-center text-gray-500 mt-12">
        Model not found.{' '}
        <Link to={`/dashboard/${entitySlug}/models`} className="text-blue-600 hover:underline">Back to models</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/dashboard/${entitySlug}/models`} className="text-gray-400 hover:text-gray-600">&larr;</Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">{model?.name ?? 'Loading...'}</h1>
      </div>

      {/* Model Settings */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          {settingsDirty && (
            <button
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Slot</label>
            <div className="flex gap-2">
              {SLOT_OPTIONS.map(s => (
                <Chip key={s} label={s === 'multi1D' ? 'Multi 1D' : s === 'multi2D' ? 'Multi 2D' : 'Single'} active={slot === s} onClick={() => { setSlot(s); setSettingsDirty(true); }} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Pricing</label>
            <div className="flex gap-2">
              {PRICING_OPTIONS.map(p => (
                <Chip key={p} label={p === 'fixed' ? 'Fixed' : 'Variable'} active={pricing === p} onClick={() => { setPricing(p); setSettingsDirty(true); }} />
              ))}
            </div>
          </div>

          {slot && slot !== 'single' && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Slot Pricing</label>
              <div className="flex gap-2">
                {SLOT_PRICING_OPTIONS.map(sp => (
                  <Chip key={sp} label={sp} active={slotPricing === sp} onClick={() => { setSlotPricing(sp); setSettingsDirty(true); }} />
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Action</label>
            <div className="flex gap-2">
              {ACTION_OPTIONS.map(a => (
                <Chip key={a} label={a === 'timed' ? 'Timed' : 'Sequence'} active={action === a} onClick={() => handleActionSelect(a)} />
              ))}
            </div>
          </div>

          {action === 'timed' && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">Interruption</label>
              <div className="flex gap-2">
                {INTERRUPTION_OPTIONS.map(i => (
                  <Chip key={i} label={i === 'stop' ? 'Stop' : 'Continue'} active={interruption === i} onClick={() => { setInterruption(i); setSettingsDirty(true); }} />
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">Payment</label>
            <div className="flex gap-2">
              {PAYMENT_OPTIONS.map(p => (
                <Chip key={p} label={p === 'atStart' ? 'At Start' : 'At End'} active={payment === p} onClick={() => { setPayment(p); setSettingsDirty(true); }} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Offerings */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Offerings</h2>
          <button
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            onClick={handleAddOffering}
          >
            Add Offering
          </button>
        </div>

        {offeringsManager.isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : offeringsManager.offerings.length === 0 ? (
          <EmptyState
            message="Manage your offerings here."
            buttonLabel="Add Offering"
            onPress={handleAddOffering}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Pricing</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Installations</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offeringsManager.offerings.map(inst => (
                <tr key={inst.id} className="border-b last:border-0 hover:bg-gray-50 transition-all duration-300" style={deletingId === inst.id ? { opacity: 0, transform: 'translateX(-20px)' } : {}}>
                  <td className="px-4 py-3 text-sm text-gray-900">{inst.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatPricingSubtitle(inst.pricingTiers)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {inst.installationCount != null && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {inst.installationCount}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-600 text-sm hover:text-blue-800 mr-3" onClick={() => handleEditOffering(inst)}>Edit</button>
                    <button className="text-red-600 text-sm hover:text-red-800" onClick={() => handleDeleteOffering(inst)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <OfferingModal
        open={modalOpen}
        offering={editingOffering}
        parentType="model"
        parentId={modelId ?? ''}
        parentName={model?.name ?? ''}
        locations={locationsManager.locations}
        selectedModel={model ?? undefined}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveOffering}
      />
    </div>
  );
}

export default ModelDetailPage;
