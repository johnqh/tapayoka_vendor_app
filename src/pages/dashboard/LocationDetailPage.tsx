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
  useVendorLocationsManager,
  useVendorModelsManager,
  useVendorOfferingsManager,
} from '@sudobility/tapayoka_lib';
import { OfferingModal } from '../../components/OfferingModal';
import { DashboardPageHeader, DashboardDetailFooter } from '../../components/DashboardPageHeader';
import { offeringPath, sectionPath } from '../../lib/dashboardPaths';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { dashboardTrail } from '../../lib/breadcrumbs';
import { formatPricingSubtitle } from '../../components/pricingUtils';
import type {
  VendorOffering,
  VendorOfferingCreateRequest,
  VendorOfferingUpdateRequest,
} from '@sudobility/tapayoka_types';

export function LocationDetailPage() {
  const { entitySlug, locationId } = useParams<{ entitySlug: string; locationId: string }>();
  const navigate = useNavigate();
  const { networkClient, baseUrl, token } = useApi();
  const { currentEntitySlug } = useCurrentEntity();

  const locationsManager = useVendorLocationsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token
  );
  const modelsManager = useVendorModelsManager(networkClient, baseUrl, currentEntitySlug, token);
  const offeringsManager = useVendorOfferingsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token,
    locationId ?? null,
    'location'
  );

  const location = locationsManager.locations.find((l) => l.id === locationId);

  useEffect(() => {
    analyticsService.trackPageView(`/dashboard/locations/${locationId}`, 'Location Detail');
  }, [locationId]);

  usePageBreadcrumbs(
    dashboardTrail(
      entitySlug ?? '',
      { label: 'Locations', href: sectionPath(entitySlug ?? '', 'location') },
      { label: location?.name ?? 'Loading...', current: true }
    )
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<VendorOffering | null>(null);

  const handleAdd = useCallback(() => {
    analyticsService.trackButtonClick('add_offering', { context: 'location_detail' });
    setEditingOffering(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((inst: VendorOffering) => {
    setEditingOffering(inst);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (inst: VendorOffering) => {
      if (!window.confirm(`Delete offering "${inst.name}"?`)) return;
      const ok = await offeringsManager.deleteOffering(inst.id);
      if (!ok && offeringsManager.error) {
        alert(offeringsManager.error);
      }
    },
    [offeringsManager]
  );

  const handleSave = useCallback(
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

  if (!location && !locationsManager.isLoading) {
    return (
      <div className="text-center text-gray-500 mt-12">
        Location not found.{' '}
        <Link to={`/dashboard/${entitySlug}/locations`} className={ui.text.linkSubtle}>
          Back to locations
        </Link>
      </div>
    );
  }

  return (
    <>
      <ContentLayout
        header={
          <DashboardPageHeader
            title={location?.name ?? 'Loading...'}
            onBack={() => navigate(sectionPath(entitySlug ?? '', 'location'))}
            onRefresh={() => offeringsManager.refresh()}
            refreshing={offeringsManager.isLoading}
            onAdd={handleAdd}
            addLabel="Offering"
          />
        }
        footer={
          location ? (
            <DashboardDetailFooter>
              {location.address}, {location.city}, {location.stateProvince} {location.zipcode},{' '}
              {location.country}
            </DashboardDetailFooter>
          ) : undefined
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
            onPress={handleAdd}
          />
        ) : (
          <DataCardList
            data={offeringsManager.offerings}
            keyExtractor={(inst) => inst.id}
            onItemClick={(inst) =>
              navigate(
                offeringPath(
                  entitySlug ?? '',
                  { parentType: 'location', parentId: locationId ?? '' },
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

      <OfferingModal
        open={modalOpen}
        offering={editingOffering}
        parentType="location"
        parentId={locationId ?? ''}
        parentName={location?.name ?? ''}
        models={modelsManager.models}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}

export default LocationDetailPage;
