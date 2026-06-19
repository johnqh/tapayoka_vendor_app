import { useState, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import { ui } from '@sudobility/design';
import { Badge, ContentLayout, Spinner } from '@sudobility/components';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DataCardList, RowIconButton } from '../../components/DataCardList';
import { analyticsService } from '../../config/analytics';
import {
  useVendorModelsManager,
  useVendorLocationsManager,
  useVendorOfferingsManager,
} from '@sudobility/tapayoka_lib';
import { OfferingModal } from '../../components/OfferingModal';
import { ModelSettingsModal } from '../../components/ModelSettingsModal';
import { DashboardPageHeader } from '../../components/DashboardPageHeader';
import { offeringPath, sectionPath } from '../../lib/dashboardPaths';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { dashboardTrail } from '../../lib/breadcrumbs';
import { formatPricingSubtitle } from '../../components/pricingUtils';
import type {
  VendorOffering,
  VendorOfferingCreateRequest,
  VendorOfferingUpdateRequest,
  VendorModelUpdateRequest,
} from '@sudobility/tapayoka_types';

export function ModelDetailPage() {
  const { entitySlug, modelId } = useParams<{ entitySlug: string; modelId: string }>();
  const navigate = useNavigate();
  const { networkClient, baseUrl, token } = useApi();
  const { currentEntitySlug } = useCurrentEntity();

  const modelsManager = useVendorModelsManager(networkClient, baseUrl, currentEntitySlug, token);
  const locationsManager = useVendorLocationsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token
  );
  const offeringsManager = useVendorOfferingsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token,
    modelId ?? null,
    'model'
  );

  const model = modelsManager.models.find((m) => m.id === modelId);

  useEffect(() => {
    analyticsService.trackPageView(`/dashboard/models/${modelId}`, 'Model Detail');
  }, [modelId]);

  usePageBreadcrumbs(
    dashboardTrail(
      entitySlug ?? '',
      { label: 'Models', href: sectionPath(entitySlug ?? '', 'model') },
      { label: model?.name ?? 'Loading...', current: true }
    )
  );

  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSaveSettings = useCallback(
    async (data: VendorModelUpdateRequest) => {
      if (!modelId) return;
      analyticsService.trackButtonClick('save_model_settings', { model_id: modelId });
      const result = await modelsManager.updateModel(modelId, data);
      if (!result && modelsManager.error) {
        alert(modelsManager.error);
        return;
      }
      setSettingsOpen(false);
    },
    [modelsManager, modelId]
  );

  // Offerings
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<VendorOffering | null>(null);

  const handleAddOffering = useCallback(() => {
    analyticsService.trackButtonClick('add_offering', { context: 'model_detail' });
    setEditingOffering(null);
    setModalOpen(true);
  }, []);

  const handleEditOffering = useCallback((inst: VendorOffering) => {
    setEditingOffering(inst);
    setModalOpen(true);
  }, []);

  const handleDeleteOffering = useCallback(
    async (inst: VendorOffering) => {
      if (!window.confirm(`Delete offering "${inst.name}"?`)) return;
      const ok = await offeringsManager.deleteOffering(inst.id);
      if (!ok && offeringsManager.error) {
        alert(offeringsManager.error);
      }
    },
    [offeringsManager]
  );

  const handleSaveOffering = useCallback(
    async (data: VendorOfferingCreateRequest | VendorOfferingUpdateRequest) => {
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
    },
    [editingOffering, offeringsManager]
  );

  if (!model && !modelsManager.isLoading) {
    return (
      <div className="text-center text-gray-500 mt-12">
        Model not found.{' '}
        <Link to={`/dashboard/${entitySlug}/models`} className={ui.text.linkSubtle}>
          Back to models
        </Link>
      </div>
    );
  }

  return (
    <>
      <ContentLayout
        header={
          <DashboardPageHeader
            title={model?.name ?? 'Loading...'}
            onBack={() => navigate(sectionPath(entitySlug ?? '', 'model'))}
            onRefresh={() => offeringsManager.refresh()}
            refreshing={offeringsManager.isLoading}
            onSettings={() => setSettingsOpen(true)}
            onAdd={handleAddOffering}
            addLabel="Offering"
          />
        }
        contentClassName="p-4"
      >
        {offeringsManager.isLoading ? (
          <div className="flex justify-center rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
            <Spinner ariaLabel="Loading offerings" />
          </div>
        ) : offeringsManager.offerings.length === 0 ? (
          <EmptyState
            message="Manage your offerings here."
            buttonLabel="Add Offering"
            onPress={handleAddOffering}
          />
        ) : (
          <DataCardList
            data={offeringsManager.offerings}
            keyExtractor={(inst) => inst.id}
            onItemClick={(inst) =>
              navigate(
                offeringPath(
                  entitySlug ?? '',
                  { parentType: 'model', parentId: modelId ?? '' },
                  inst.id
                )
              )
            }
            renderItem={(inst) => (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                    {inst.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatPricingSubtitle(inst.pricingTiers)}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  {inst.installationCount != null && (
                    <Badge variant="primary" pill>
                      {inst.installationCount}
                    </Badge>
                  )}
                  <RowIconButton
                    icon={<PencilSquareIcon className="h-5 w-5" />}
                    label="Edit"
                    onClick={() => handleEditOffering(inst)}
                  />
                  <RowIconButton
                    icon={<TrashIcon className="h-5 w-5" />}
                    label="Delete"
                    variant="danger"
                    onClick={() => handleDeleteOffering(inst)}
                  />
                </div>
              </div>
            )}
          />
        )}
      </ContentLayout>

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

      <ModelSettingsModal
        open={settingsOpen}
        model={model}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </>
  );
}

export default ModelDetailPage;
