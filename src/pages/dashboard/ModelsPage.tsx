import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalizedNavigate } from '@sudobility/components';
import { isLanguageSupported } from '../../i18n';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import {
  useVendorModelsManager,
  MODEL_TYPES,
  getModelTypeDefaults,
  buildVendorModelConfig,
  formatModelSummary,
  slotSupportsSlotPricing,
  actionSupportsInterruption,
} from '@sudobility/tapayoka_lib';
import { Badge, Card, ContentLayout, Dropdown, Spinner, Text } from '@sudobility/components';
import { FormModal } from '@sudobility/components';
import { PencilSquareIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';
import { DataCardList, RowIconButton } from '../../components/DataCardList';
import { SegmentedField } from '../../components/SegmentedField';
import { MODEL_TYPE_ICONS, MODEL_TYPE_COLORS } from '../../config/modelTypeIcons';
import {
  SLOT_OPTIONS,
  PRICING_OPTIONS,
  SLOT_PRICING_OPTIONS,
  ACTION_OPTIONS,
  INTERRUPTION_OPTIONS,
  PAYMENT_OPTIONS,
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

  // Type is descriptive metadata, but picking one also seeds the settings below
  // (still editable afterward). 'None' just clears the type without touching them.
  const handleSelectType = useCallback(
    (mt: VendorModelType | null) => {
      setType(mt);
      if (!mt) return;
      if (!name.trim()) setName(mt);
      const defaults = getModelTypeDefaults(mt);
      setPricing(defaults.pricing);
      setSlot(defaults.slot);
      setSlotPricing(defaults.slotPricing);
      setAction(defaults.action);
      setInterruption(defaults.interruption);
      setPayment(defaults.payment);
    },
    [name]
  );

  const handleActionSelect = useCallback((a: VendorModelAction | null) => {
    setAction(a);
    if (!actionSupportsInterruption(a)) {
      setInterruption(null);
    }
  }, []);

  const TypeIcon = type ? MODEL_TYPE_ICONS[type] : null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        type: type || undefined,
        ...buildVendorModelConfig({
          pricing,
          slot,
          slotPricing,
          action,
          interruption,
          payment,
        }),
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
        {/* Name — with a trailing type accessory. Type is descriptive; picking
            one from the menu also seeds the settings below (still editable). */}
        <div>
          <Text as="label" size="sm" weight="medium" className="block mb-1">
            Name
          </Text>
          <div className="relative">
            <input
              id="model-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Model name"
              className="w-full px-3 py-2 pr-11 text-sm bg-muted border-none rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="absolute inset-y-0 right-1 flex items-center">
              <Dropdown
                align="right"
                trigger={
                  <button
                    type="button"
                    aria-label="Type"
                    className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-background"
                  >
                    {TypeIcon ? (
                      <TypeIcon className="h-5 w-5" style={{ color: MODEL_TYPE_COLORS[type!] }} />
                    ) : (
                      <TagIcon className="h-5 w-5 text-theme-text-tertiary" />
                    )}
                  </button>
                }
                items={[
                  { id: 'none', label: 'None', onClick: () => handleSelectType(null) },
                  ...MODEL_TYPES.map((mt) => ({
                    id: mt,
                    label: mt,
                    icon: MODEL_TYPE_ICONS[mt],
                    onClick: () => handleSelectType(mt),
                  })),
                ]}
              />
            </div>
          </div>
        </div>

        {/* Slot */}
        <SegmentedField
          label="Slot"
          options={SLOT_OPTIONS}
          value={slot}
          onChange={(v) => setSlot(v as VendorModelSlot)}
        />

        {/* Action */}
        <SegmentedField
          label="Action"
          options={ACTION_OPTIONS}
          value={action}
          onChange={(v) => handleActionSelect(v as VendorModelAction)}
        />

        {/* Pricing — independent of the action (fixed or variable). */}
        <SegmentedField
          label="Pricing"
          options={PRICING_OPTIONS}
          value={pricing}
          onChange={(v) => setPricing(v as VendorModelPricing)}
        />

        {/* Slot Pricing - only when slot is multi */}
        {slotSupportsSlotPricing(slot) && (
          <SegmentedField
            label="Slot Pricing"
            options={SLOT_PRICING_OPTIONS}
            value={slotPricing}
            onChange={(v) => setSlotPricing(v as VendorModelSlotPricing)}
          />
        )}

        {/* Interruption - only when action is 'timed' */}
        {actionSupportsInterruption(action) && (
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
  const { navigate } = useLocalizedNavigate({ isLanguageSupported });
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
            renderItem={(model) => {
              const RowIcon = model.type ? MODEL_TYPE_ICONS[model.type] : null;
              return (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2">
                    {RowIcon && (
                      <RowIcon
                        className="mt-0.5 h-5 w-5 flex-shrink-0"
                        style={{ color: MODEL_TYPE_COLORS[model.type!] }}
                      />
                    )}
                    <div className="min-w-0">
                      <Text weight="medium" truncate>
                        {model.name}
                      </Text>
                      <Text size="sm" color="muted">
                        {formatModelSummary(model)}
                      </Text>
                    </div>
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
              );
            }}
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
