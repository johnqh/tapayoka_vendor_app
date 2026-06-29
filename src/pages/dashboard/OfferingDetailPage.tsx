import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import { Badge, Card, ContentLayout, Spinner, Alert, Text } from '@sudobility/components';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DataCardList, RowIconButton } from '../../components/DataCardList';
import {
  useVendorOfferingsManager,
  useVendorModelsManager,
  useVendorLocationsManager,
  useVendorInstallationsManager,
} from '@sudobility/tapayoka_lib';
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
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { dashboardTrail } from '../../lib/breadcrumbs';
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

  const crumbs = [
    {
      label: parent.parentType === 'model' ? 'Models' : 'Locations',
      href: sectionPath(entitySlug, parent.parentType),
    },
    { label: parentName ?? '…', href: parentDetailPath(entitySlug, parent) },
    { label: offering?.name ?? 'Offering', current: true },
  ];
  usePageBreadcrumbs(dashboardTrail(entitySlug, ...crumbs));

  return (
    <>
      <ContentLayout
        header={
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
        }
        contentClassName="p-4 space-y-4"
      >
        {installationsManager.error && <Alert variant="error">{installationsManager.error}</Alert>}

        {installationsManager.isLoading ? (
          <Card padding="none" className="flex justify-center p-8">
            <Spinner ariaLabel="Loading installations" />
          </Card>
        ) : (
          <DataCardList
            data={installationsManager.installations}
            keyExtractor={(inst) => inst.walletAddress}
            emptyMessage="No installations yet. Pair a device in the mobile app to add one."
            onItemClick={(inst) =>
              navigate(installationPath(entitySlug, parent, offeringId, inst.walletAddress))
            }
            renderItem={(inst) => (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Text weight="medium" truncate>
                    {inst.label}
                  </Text>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  {inst.slotCount != null && (
                    <Badge variant="primary" pill>
                      {inst.slotCount}
                    </Badge>
                  )}
                  <RowIconButton
                    icon={<PencilSquareIcon className="h-5 w-5" />}
                    label="Edit"
                    onClick={() => handleEdit(inst)}
                  />
                  <RowIconButton
                    icon={<TrashIcon className="h-5 w-5" />}
                    label="Delete"
                    variant="danger"
                    onClick={() => handleDelete(inst)}
                  />
                </div>
              </div>
            )}
          />
        )}
      </ContentLayout>

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
    </>
  );
}

export default OfferingDetailPage;
