import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import { useVendorModelsManager } from '@sudobility/tapayoka_lib';
import {
  Badge,
  Button,
  Card,
  ContentLayout,
  FormField,
  Spinner,
  Text,
} from '@sudobility/components';
import { FormModal } from '@sudobility/components';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DataCardList, RowIconButton } from '../../components/DataCardList';
import { SegmentedField } from '../../components/SegmentedField';
import {
  SLOT_OPTIONS,
  PRICING_OPTIONS,
  SLOT_PRICING_OPTIONS,
  ACTION_OPTIONS,
  INTERRUPTION_OPTIONS,
  PAYMENT_OPTIONS,
  TYPE_DESCRIPTIONS,
} from '../../components/modelOptions';
import { analyticsService } from '../../config/analytics';
import { DashboardPageHeader } from '../../components/DashboardPageHeader';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { dashboardTrail } from '../../lib/breadcrumbs';
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

const TYPE_DEFAULTS: Record<
  VendorModelType,
  {
    pricing: VendorModelPricing;
    slot: VendorModelSlot;
    slotPricing: VendorModelSlotPricing | null;
    action: VendorModelAction;
    interruption: VendorModelInterruption | null;
    payment: VendorModelPayment;
  }
> = {
  Washer: {
    pricing: 'variable',
    slot: 'single',
    slotPricing: null,
    action: 'timed',
    interruption: 'stop',
    payment: 'atStart',
  },
  Dryer: {
    pricing: 'variable',
    slot: 'single',
    slotPricing: null,
    action: 'timed',
    interruption: 'stop',
    payment: 'atStart',
  },
  Parking: {
    pricing: 'variable',
    slot: 'multi1D',
    slotPricing: 'Tiered',
    action: 'timed',
    interruption: 'continue',
    payment: 'atStart',
  },
  Locker: {
    pricing: 'variable',
    slot: 'multi1D',
    slotPricing: 'Tiered',
    action: 'timed',
    interruption: 'stop',
    payment: 'atEnd',
  },
  Vending: {
    pricing: 'fixed',
    slot: 'multi1D',
    slotPricing: 'Tiered',
    action: 'sequence',
    interruption: null,
    payment: 'atStart',
  },
};

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
    <Button
      type="button"
      variant={isActive ? 'primary' : 'outline'}
      size="sm"
      onClick={() => onSelect(value)}
    >
      {label}
    </Button>
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

  const handleTypeSelect = useCallback(
    (mt: VendorModelType | null) => {
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
    },
    [isEditing]
  );

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
        slotPricing: slot && slot !== 'single' ? slotPricing || undefined : undefined,
        action: action || undefined,
        interruption: interruption || undefined,
        payment: payment || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormModal
      open={visible}
      title={isEditing ? 'Edit Model' : 'Add Model'}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      canSave={!!name.trim()}
      size="medium"
    >
      <div className="space-y-4">
        {/* Name */}
        <FormField
          id="model-name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Model name"
        />

        {/* Type — a category picker (chips) whose selection seeds defaults */}
        <SegmentedField label="Type" value={type} description={type ? TYPE_DESCRIPTIONS[type] : ''}>
          <div className="flex flex-wrap gap-2">
            <Chip label="None" value={null} selected={type} onSelect={handleTypeSelect} />
            {MODEL_TYPES.map((mt) => (
              <Chip key={mt} label={mt} value={mt} selected={type} onSelect={handleTypeSelect} />
            ))}
          </div>
        </SegmentedField>

        {/* Slot */}
        <SegmentedField
          label="Slot"
          options={SLOT_OPTIONS}
          value={slot}
          onChange={(v) => setSlot(v as VendorModelSlot)}
        />

        {/* Pricing */}
        <SegmentedField
          label="Pricing"
          options={PRICING_OPTIONS}
          value={pricing}
          onChange={(v) => setPricing(v as VendorModelPricing)}
        />

        {/* Slot Pricing - only when slot is multi */}
        {slot && slot !== 'single' && (
          <SegmentedField
            label="Slot Pricing"
            options={SLOT_PRICING_OPTIONS}
            value={slotPricing}
            onChange={(v) => setSlotPricing(v as VendorModelSlotPricing)}
          />
        )}

        {/* Action */}
        <SegmentedField
          label="Action"
          options={ACTION_OPTIONS}
          value={action}
          onChange={(v) => handleActionSelect(v as VendorModelAction)}
        />

        {/* Interruption - only when action is 'timed' */}
        {action === 'timed' && (
          <SegmentedField
            label="Interruption"
            options={INTERRUPTION_OPTIONS}
            value={interruption}
            onChange={(v) => setInterruption(v as VendorModelInterruption)}
          />
        )}

        {/* Payment */}
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

export function ModelsPage() {
  const navigate = useNavigate();
  const { entitySlug } = useParams<{ entitySlug: string }>();
  const { networkClient, baseUrl, token } = useApi();
  const { currentEntitySlug } = useCurrentEntity();
  const manager = useVendorModelsManager(networkClient, baseUrl, currentEntitySlug, token);

  useEffect(() => {
    analyticsService.trackPageView('/dashboard/models', 'Models');
  }, []);

  usePageBreadcrumbs(dashboardTrail(entitySlug ?? '', { label: 'Models', current: true }));

  const [modalVisible, setModalVisible] = useState(false);
  const [editingModel, setEditingModel] = useState<VendorModel | null>(null);

  const handleAdd = () => {
    analyticsService.trackButtonClick('add_model');
    setEditingModel(null);
    setModalVisible(true);
  };

  const handleEdit = (model: VendorModel) => {
    setEditingModel(model);
    setModalVisible(true);
  };

  const handleDelete = async (model: VendorModel) => {
    if (!window.confirm(`Delete model "${model.name}"?`)) return;
    const ok = await manager.deleteModel(model.id);
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
    <>
      <ContentLayout
        header={
          <DashboardPageHeader
            title="Models"
            onRefresh={() => manager.refresh()}
            refreshing={manager.isLoading}
            onAdd={handleAdd}
            addLabel="Model"
          />
        }
        contentClassName="p-4"
      >
        {manager.isLoading && manager.models.length === 0 ? (
          <Card padding="none" className="flex justify-center p-8">
            <Spinner ariaLabel="Loading models" />
          </Card>
        ) : manager.models.length === 0 ? (
          <EmptyState
            message="Manage your installation models here."
            buttonLabel="Add Model"
            onPress={handleAdd}
          />
        ) : (
          <DataCardList
            data={manager.models}
            keyExtractor={(model) => model.id}
            onItemClick={handleRowClick}
            renderItem={(model) => (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Text weight="medium" truncate>
                    {model.name}
                  </Text>
                  <Text size="sm" color="muted">
                    {[model.type, model.pricing, model.slot, model.action]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </Text>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  {model.offeringCount != null && (
                    <Badge variant="primary" pill>
                      {model.offeringCount}
                    </Badge>
                  )}
                  <RowIconButton
                    icon={<PencilSquareIcon className="h-5 w-5" />}
                    label="Edit"
                    onClick={() => handleEdit(model)}
                  />
                  <RowIconButton
                    icon={<TrashIcon className="h-5 w-5" />}
                    label="Delete"
                    variant="danger"
                    onClick={() => handleDelete(model)}
                  />
                </div>
              </div>
            )}
          />
        )}
      </ContentLayout>

      <ModelFormModal
        visible={modalVisible}
        model={editingModel}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </>
  );
}

export default ModelsPage;
