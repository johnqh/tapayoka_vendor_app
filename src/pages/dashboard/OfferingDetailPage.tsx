import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useCurrentEntity } from '@sudobility/entity_client';
import { ui } from '@sudobility/design';
import { Badge, Spinner, Table, Alert, type TableColumn } from '@sudobility/components';
import {
  useVendorOfferingsManager,
  useVendorModelsManager,
  useVendorLocationsManager,
  useVendorInstallationsManager,
} from '@sudobility/tapayoka_lib';
import { DashboardBreadcrumb, type Crumb } from '../../components/DashboardBreadcrumb';
import { DashboardPageHeader } from '../../components/DashboardPageHeader';
import { InstallationFormModal } from '../../components/InstallationFormModal';
import { OfferingModal } from '../../components/OfferingModal';
import { analyticsService } from '../../config/analytics';
import {
  resolveOfferingParent,
  sectionPath,
  parentDetailPath,
  installationPath,
} from '../../lib/dashboardPaths';
import type {
  VendorInstallation,
  VendorInstallationUpdateRequest,
  VendorOfferingCreateRequest,
  VendorOfferingUpdateRequest,
} from '@sudobility/tapayoka_types';

export function OfferingDetailPage() {
  const params = useParams<{
    entitySlug: string;
    modelId?: string;
    locationId?: string;
    offeringId: string;
  }>();
  const navigate = useNavigate();
  const entitySlug = params.entitySlug ?? '';
  const offeringId = params.offeringId ?? '';
  const parent = resolveOfferingParent(params);

  const { networkClient, baseUrl, token } = useApi();
  const { currentEntitySlug } = useCurrentEntity();

  const offeringsManager = useVendorOfferingsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token,
    parent.parentId,
    parent.parentType
  );
  const modelsManager = useVendorModelsManager(networkClient, baseUrl, currentEntitySlug, token);
  const locationsManager = useVendorLocationsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token
  );
  const installationsManager = useVendorInstallationsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token,
    offeringId
  );

  const offering = offeringsManager.offerings.find((o) => o.id === offeringId) ?? null;
  const offeringModel = offering
    ? modelsManager.models.find((m) => m.id === offering.vendorModelId)
    : undefined;
  const parentName =
    parent.parentType === 'model'
      ? modelsManager.models.find((m) => m.id === parent.parentId)?.name
      : locationsManager.locations.find((l) => l.id === parent.parentId)?.name;

  useEffect(() => {
    analyticsService.trackPageView(`/dashboard/offerings/${offeringId}`, 'Offering Detail');
  }, [offeringId]);

  const [editing, setEditing] = useState<VendorInstallation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleEdit = (inst: VendorInstallation) => {
    setEditing(inst);
    setModalOpen(true);
  };

  const handleDelete = async (inst: VendorInstallation) => {
    if (!window.confirm(`Delete installation "${inst.label}"?`)) return;
    const ok = await installationsManager.deleteInstallation(inst.walletAddress);
    if (!ok && installationsManager.error) alert(installationsManager.error);
  };

  const handleSave = async (data: VendorInstallationUpdateRequest) => {
    if (!editing) return;
    const result = await installationsManager.updateInstallation(editing.walletAddress, data);
    if (!result && installationsManager.error) {
      alert(installationsManager.error);
      return;
    }
    setModalOpen(false);
  };

  const [offeringEditOpen, setOfferingEditOpen] = useState(false);

  const handleSaveOffering = async (
    data: VendorOfferingCreateRequest | VendorOfferingUpdateRequest
  ) => {
    if (!offering) return;
    const result = await offeringsManager.updateOffering(offering.id, data);
    if (!result && offeringsManager.error) {
      alert(offeringsManager.error);
      return;
    }
    setOfferingEditOpen(false);
  };

  const crumbs: Crumb[] = [
    {
      label: parent.parentType === 'model' ? 'Models' : 'Locations',
      to: sectionPath(entitySlug, parent.parentType),
    },
    { label: parentName ?? '…', to: parentDetailPath(entitySlug, parent) },
    { label: offering?.name ?? 'Offering' },
  ];

  const columns: TableColumn<VendorInstallation>[] = [
    {
      key: 'label',
      label: 'Installation',
      render: (inst) => <span className="text-gray-900">{inst.label}</span>,
    },
    {
      key: 'slots',
      label: 'Slots',
      render: (inst) =>
        inst.slotCount != null ? (
          <Badge variant="primary" pill>
            {inst.slotCount}
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
              handleEdit(inst);
            }}
          >
            Edit
          </button>
          <button
            className={`text-sm ${ui.text.error} hover:opacity-80`}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(inst);
            }}
          >
            Delete
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardBreadcrumb crumbs={crumbs} />
      <DashboardPageHeader
        title={offering?.name ?? 'Offering'}
        onBack={() => navigate(parentDetailPath(entitySlug, parent))}
        onRefresh={() => installationsManager.refresh()}
        refreshing={installationsManager.isLoading}
        onSettings={() => setOfferingEditOpen(true)}
        onAdd={() => undefined}
        addDisabled
        addTitle="Pair a device in the mobile app"
        addLabel="Installation"
      />

      {installationsManager.error && <Alert variant="error">{installationsManager.error}</Alert>}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 py-3 border-b">
          <h2 className={ui.text.h5}>Installations</h2>
        </div>

        {installationsManager.isLoading ? (
          <div className="p-8 flex justify-center">
            <Spinner ariaLabel="Loading installations" />
          </div>
        ) : installationsManager.installations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No installations yet. Pair a device in the mobile app to add one.
          </div>
        ) : (
          <Table
            columns={columns}
            data={installationsManager.installations}
            keyExtractor={(inst) => inst.walletAddress}
            onRowClick={(inst) =>
              navigate(installationPath(entitySlug, parent, offeringId, inst.walletAddress))
            }
            hoverable
          />
        )}
      </div>

      <InstallationFormModal
        open={modalOpen}
        installation={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <OfferingModal
        open={offeringEditOpen}
        offering={offering}
        parentType={parent.parentType}
        parentId={parent.parentId}
        parentName={parentName ?? ''}
        models={modelsManager.models}
        locations={locationsManager.locations}
        selectedModel={offeringModel}
        onClose={() => setOfferingEditOpen(false)}
        onSave={handleSaveOffering}
      />
    </div>
  );
}

export default OfferingDetailPage;
