import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import { useVendorModelsManager } from '@sudobility/tapayoka_lib';
import { ui } from '@sudobility/design';
import {
  Badge,
  Button,
  Card,
  ContentLayout,
  FormField,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Text,
} from '@sudobility/components';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DataCardList, RowIconButton } from '../../components/DataCardList';
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
const PRICING_OPTIONS: VendorModelPricing[] = ['fixed', 'variable'];
const SLOT_OPTIONS: VendorModelSlot[] = ['single', 'multi1D', 'multi2D'];
const SLOT_PRICING_OPTIONS: VendorModelSlotPricing[] = ['Tiered', 'Unique'];
const ACTION_OPTIONS: VendorModelAction[] = ['timed', 'sequence'];
const INTERRUPTION_OPTIONS: VendorModelInterruption[] = ['stop', 'continue'];
const PAYMENT_OPTIONS: VendorModelPayment[] = ['atStart', 'atEnd'];

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
      <Text as="label" size="sm" weight="medium" className="block mb-1">
        {label}
      </Text>
      <div className="flex flex-wrap gap-2">
        {allowNone && <Chip label="None" value={null} selected={value} onSelect={onChange} />}
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
    <Modal isOpen={visible} onClose={onClose} size="medium" aria-labelledby="model-modal-title">
      <ModalHeader>
        <h2 id="model-modal-title" className={ui.text.h5}>
          {isEditing ? 'Edit Model' : 'Add Model'}
        </h2>
      </ModalHeader>
      <ModalContent variant="scrollable">
        <div className="space-y-4">
          {/* Name */}
          <FormField
            id="model-name"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Model name"
          />

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
            options={SLOT_OPTIONS.map((s) => ({
              label: s === 'multi1D' ? 'Multi 1D' : s === 'multi2D' ? 'Multi 2D' : 'Single',
              value: s,
            }))}
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
      </ModalContent>
      <ModalFooter>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSave}
          disabled={saving || !name.trim()}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </ModalFooter>
    </Modal>
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
