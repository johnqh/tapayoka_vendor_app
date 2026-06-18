import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useCurrentEntity } from '@sudobility/entity_client';
import { ui } from '@sudobility/design';
import { Spinner, Alert, Table, type TableColumn } from '@sudobility/components';
import {
  useVendorOfferingsManager,
  useVendorModelsManager,
  useVendorLocationsManager,
  useVendorInstallationsManager,
  useVendorInstallationSlotsManager,
} from '@sudobility/tapayoka_lib';
import { AppBreadcrumbs } from '@sudobility/building_blocks';
import { DashboardPageHeader } from '../../components/DashboardPageHeader';
import { SlotFormModal } from '../../components/SlotFormModal';
import { InstallationFormModal } from '../../components/InstallationFormModal';
import { analyticsService } from '../../config/analytics';
import {
  resolveOfferingParent,
  sectionPath,
  parentDetailPath,
  offeringPath,
} from '../../lib/dashboardPaths';
import type {
  VendorInstallationSlot,
  VendorInstallationSlotCreateRequest,
  VendorInstallationUpdateRequest,
} from '@sudobility/tapayoka_types';

export function InstallationDetailPage() {
  const params = useParams<{
    entitySlug: string;
    modelId?: string;
    locationId?: string;
    offeringId: string;
    wallet: string;
  }>();
  const navigate = useNavigate();
  const entitySlug = params.entitySlug ?? '';
  const offeringId = params.offeringId ?? '';
  const wallet = params.wallet ?? '';
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
  const slotsManager = useVendorInstallationSlotsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token,
    wallet
  );

  const offering = offeringsManager.offerings.find((o) => o.id === offeringId) ?? null;
  const installation =
    installationsManager.installations.find((i) => i.walletAddress === wallet) ?? null;
  const model = offering
    ? modelsManager.models.find((m) => m.id === offering.vendorModelId) ?? null
    : null;
  const parentName =
    parent.parentType === 'model'
      ? model?.name ?? modelsManager.models.find((m) => m.id === parent.parentId)?.name
      : locationsManager.locations.find((l) => l.id === parent.parentId)?.name;
  const isGrid = model?.slot === 'multi2D';

  useEffect(() => {
    analyticsService.trackPageView(`/dashboard/installations/${wallet}`, 'Installation Detail');
  }, [wallet]);

  const [editing, setEditing] = useState<VendorInstallationSlot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (slot: VendorInstallationSlot) => {
    setEditing(slot);
    setModalOpen(true);
  };

  const handleDelete = async (slot: VendorInstallationSlot) => {
    if (!window.confirm(`Delete slot "${slot.label}"?`)) return;
    const ok = await slotsManager.deleteSlot(slot.id);
    if (!ok && slotsManager.error) alert(slotsManager.error);
  };

  const handleSave = async (data: VendorInstallationSlotCreateRequest) => {
    if (editing) {
      const result = await slotsManager.updateSlot(editing.id, data);
      if (!result && slotsManager.error) {
        alert(slotsManager.error);
        return;
      }
    } else {
      const result = await slotsManager.addSlot(data);
      if (!result && slotsManager.error) {
        alert(slotsManager.error);
        return;
      }
    }
    setModalOpen(false);
  };

  const [installEditOpen, setInstallEditOpen] = useState(false);

  const handleSaveInstall = async (data: VendorInstallationUpdateRequest) => {
    const result = await installationsManager.updateInstallation(wallet, data);
    if (!result && installationsManager.error) {
      alert(installationsManager.error);
      return;
    }
    setInstallEditOpen(false);
  };

  const crumbs = [
    {
      label: parent.parentType === 'model' ? 'Models' : 'Locations',
      href: sectionPath(entitySlug, parent.parentType),
    },
    { label: parentName ?? '…', href: parentDetailPath(entitySlug, parent) },
    { label: offering?.name ?? 'Offering', href: offeringPath(entitySlug, parent, offeringId) },
    { label: installation?.label ?? 'Installation', current: true },
  ];

  const columns: TableColumn<VendorInstallationSlot>[] = [
    {
      key: 'label',
      label: 'Slot',
      render: (slot) => <span className="text-gray-900">{slot.label}</span>,
    },
    {
      key: 'tier',
      label: 'Pricing Tier',
      render: (slot) => <span className="text-gray-500">{slot.pricingTier?.name ?? '—'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (slot) => (
        <>
          <button className={`text-sm mr-3 ${ui.text.linkSubtle}`} onClick={() => handleEdit(slot)}>
            Edit
          </button>
          <button
            className={`text-sm ${ui.text.error} hover:opacity-80`}
            onClick={() => handleDelete(slot)}
          >
            Delete
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AppBreadcrumbs items={crumbs} />
      <DashboardPageHeader
        title={installation?.label ?? 'Installation'}
        onBack={() => navigate(offeringPath(entitySlug, parent, offeringId))}
        onRefresh={() => slotsManager.refresh()}
        refreshing={slotsManager.isLoading}
        onSettings={() => setInstallEditOpen(true)}
        onAdd={handleAdd}
        addDisabled={isGrid}
        addTitle={isGrid ? 'Generate the grid in the mobile app' : undefined}
        addLabel="Slot"
      />

      {slotsManager.error && <Alert variant="error">{slotsManager.error}</Alert>}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-4 py-3 border-b">
          <h2 className={ui.text.h5}>Slots</h2>
        </div>

        {slotsManager.isLoading ? (
          <div className="p-8 flex justify-center">
            <Spinner ariaLabel="Loading slots" />
          </div>
        ) : slotsManager.slots.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {isGrid ? 'No slots yet. Generate the grid in the mobile app.' : 'No slots yet.'}
          </div>
        ) : (
          <Table
            columns={columns}
            data={slotsManager.slots}
            keyExtractor={(slot) => slot.id}
            hoverable
          />
        )}
      </div>

      <SlotFormModal
        open={modalOpen}
        slot={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <InstallationFormModal
        open={installEditOpen}
        installation={installation}
        onClose={() => setInstallEditOpen(false)}
        onSave={handleSaveInstall}
      />
    </div>
  );
}

export default InstallationDetailPage;
