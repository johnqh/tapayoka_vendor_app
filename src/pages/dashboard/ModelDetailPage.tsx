import { useState, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import { ui } from '@sudobility/design';
import { Badge, Spinner, Table, type TableColumn } from '@sudobility/components';
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

  usePageBreadcrumbs([
    { label: 'Models', href: sectionPath(entitySlug ?? '', 'model') },
    { label: model?.name ?? 'Loading...', current: true },
  ]);

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

  const offeringColumns: TableColumn<VendorOffering>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (inst) => <span className="text-gray-900">{inst.name}</span>,
    },
    {
      key: 'pricing',
      label: 'Pricing',
      render: (inst) => (
        <span className="text-gray-500">{formatPricingSubtitle(inst.pricingTiers)}</span>
      ),
    },
    {
      key: 'installations',
      label: 'Installations',
      render: (inst) =>
        inst.installationCount != null ? (
          <Badge variant="primary" pill>
            {inst.installationCount}
          </Badge>
        ) : null,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (inst) => (
        <>
          <button
            className={`text-sm mr-3 ${ui.text.linkSubtle}`}
            onClick={(e) => {
              e.stopPropagation();
              handleEditOffering(inst);
            }}
          >
            Edit
          </button>
          <button
            className={`text-sm ${ui.text.error} hover:opacity-80`}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteOffering(inst);
            }}
          >
            Delete
          </button>
        </>
      ),
    },
  ];

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
    <div className="space-y-6">
      <DashboardPageHeader
        title={model?.name ?? 'Loading...'}
        onBack={() => navigate(sectionPath(entitySlug ?? '', 'model'))}
        onRefresh={() => offeringsManager.refresh()}
        refreshing={offeringsManager.isLoading}
        onSettings={() => setSettingsOpen(true)}
        onAdd={handleAddOffering}
        addLabel="Offering"
      />

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 py-3 border-b">
          <h2 className={ui.text.h5}>Offerings</h2>
        </div>

        {offeringsManager.isLoading ? (
          <div className="p-8 flex justify-center">
            <Spinner ariaLabel="Loading offerings" />
          </div>
        ) : offeringsManager.offerings.length === 0 ? (
          <EmptyState
            message="Manage your offerings here."
            buttonLabel="Add Offering"
            onPress={handleAddOffering}
          />
        ) : (
          <Table
            columns={offeringColumns}
            data={offeringsManager.offerings}
            keyExtractor={(inst) => inst.id}
            onRowClick={(inst) =>
              navigate(
                offeringPath(entitySlug ?? '', { parentType: 'model', parentId: modelId ?? '' }, inst.id)
              )
            }
            hoverable
          />
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

      <ModelSettingsModal
        open={settingsOpen}
        model={model}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

export default ModelDetailPage;
