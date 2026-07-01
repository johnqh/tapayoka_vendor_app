import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import { Card, ContentLayout, Spinner, Alert, Text } from '@sudobility/components';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DataCardList, RowIconButton } from '../../components/DataCardList';
import {
  useVendorOfferingsManager,
  useVendorModelsManager,
  useVendorLocationsManager,
  useVendorInstallationsManager,
  useVendorInstallationSlotsManager,
  resolveSlotTierName,
} from '@sudobility/tapayoka_lib';
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
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { dashboardTrail } from '../../lib/breadcrumbs';
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
    ? (modelsManager.models.find((m) => m.id === offering.vendorModelId) ?? null)
    : null;
  const parentName =
    parent.parentType === 'model'
      ? (model?.name ?? modelsManager.models.find((m) => m.id === parent.parentId)?.name)
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
  usePageBreadcrumbs(dashboardTrail(entitySlug, ...crumbs));

  return (
    <>
      <ContentLayout
        header={
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
        }
        contentClassName="p-4 space-y-4"
      >
        {slotsManager.error && <Alert variant="error">{slotsManager.error}</Alert>}

        {slotsManager.isLoading ? (
          <Card padding="none" className="flex justify-center p-8">
            <Spinner ariaLabel="Loading slots" />
          </Card>
        ) : (
          <DataCardList
            data={slotsManager.slots}
            keyExtractor={(slot) => slot.id}
            emptyMessage={
              isGrid ? 'No slots yet. Generate the grid in the mobile app.' : 'No slots yet.'
            }
            renderItem={(slot) => {
              const tierName = resolveSlotTierName(slot, offering?.pricingTiers ?? []);
              return (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Text weight="medium" truncate>
                      {slot.label}
                    </Text>
                    <Text size="sm" color="muted">
                      {tierName ?? '—'}
                    </Text>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-1">
                    <RowIconButton
                      icon={<PencilSquareIcon className="h-5 w-5" />}
                      label="Edit"
                      onClick={() => handleEdit(slot)}
                    />
                    <RowIconButton
                      icon={<TrashIcon className="h-5 w-5" />}
                      label="Delete"
                      variant="danger"
                      onClick={() => handleDelete(slot)}
                    />
                  </div>
                </div>
              );
            }}
          />
        )}
      </ContentLayout>

      <SlotFormModal
        open={modalOpen}
        slot={editing}
        slotPricing={model?.slotPricing ?? null}
        modelPricing={model?.pricing ?? null}
        offeringPricingTiers={offering?.pricingTiers ?? []}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />

      <InstallationFormModal
        open={installEditOpen}
        installation={installation}
        onClose={() => setInstallEditOpen(false)}
        onSave={handleSaveInstall}
      />
    </>
  );
}

export default InstallationDetailPage;
