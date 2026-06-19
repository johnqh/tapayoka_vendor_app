import { useState, useCallback, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import { ui } from '@sudobility/design';
import { Badge, Spinner, Table, type TableColumn } from '@sudobility/components';
import { analyticsService } from '../../config/analytics';
import {
  useVendorLocationsManager,
  useVendorModelsManager,
  useVendorOfferingsManager,
} from '@sudobility/tapayoka_lib';
import { OfferingModal } from '../../components/OfferingModal';
import { DashboardPageHeader } from '../../components/DashboardPageHeader';
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
    <div className="space-y-6">
      <DashboardPageHeader
        title={location?.name ?? 'Loading...'}
        onBack={() => navigate(sectionPath(entitySlug ?? '', 'location'))}
        onRefresh={() => offeringsManager.refresh()}
        refreshing={offeringsManager.isLoading}
        onAdd={handleAdd}
        addLabel="Offering"
      />
      {location && (
        <p className={ui.text.bodySmall}>
          {location.address}, {location.city}, {location.stateProvince} {location.zipcode},{' '}
          {location.country}
        </p>
      )}

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {offeringsManager.isLoading ? (
          <div className="p-8 flex justify-center">
            <Spinner ariaLabel="Loading offerings" />
          </div>
        ) : offeringsManager.offerings.length === 0 ? (
          <EmptyState
            message="Manage your offerings here."
            buttonLabel="Add Offering"
            onPress={handleAdd}
          />
        ) : (
          <Table
            columns={offeringColumns}
            data={offeringsManager.offerings}
            keyExtractor={(inst) => inst.id}
            onRowClick={(inst) =>
              navigate(
                offeringPath(
                  entitySlug ?? '',
                  { parentType: 'location', parentId: locationId ?? '' },
                  inst.id
                )
              )
            }
            hoverable
          />
        )}
      </div>

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
    </div>
  );
}

export default LocationDetailPage;
