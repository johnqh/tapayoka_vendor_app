import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import {
  useVendorLocationsManager,
  emptyLocationForm,
  locationToFormFields,
  buildLocationRequest,
  canSaveLocation,
  formatLocationAddress,
  type VendorLocationFormFields,
} from '@sudobility/tapayoka_lib';
import {
  Alert,
  Badge,
  Card,
  ContentLayout,
  FormField,
  Spinner,
  Text,
} from '@sudobility/components';
import { FormModal } from '@sudobility/components';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DataCardList, RowIconButton } from '../../components/DataCardList';
import { analyticsService } from '../../config/analytics';
import { DashboardPageHeader } from '../../components/DashboardPageHeader';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { dashboardTrail } from '../../lib/breadcrumbs';
import type { VendorLocation } from '@sudobility/tapayoka_types';

export function LocationsPage() {
  const navigate = useNavigate();
  const { entitySlug } = useParams<{ entitySlug: string }>();
  const { networkClient, baseUrl, token } = useApi();
  const { currentEntitySlug } = useCurrentEntity();

  const manager = useVendorLocationsManager(networkClient, baseUrl, currentEntitySlug, token);

  useEffect(() => {
    analyticsService.trackPageView('/dashboard/locations', 'Locations');
  }, []);

  usePageBreadcrumbs(dashboardTrail(entitySlug ?? '', { label: 'Locations', current: true }));

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<VendorLocation | null>(null);
  const [form, setForm] = useState<VendorLocationFormFields>(emptyLocationForm);
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    analyticsService.trackButtonClick('add_location');
    setEditingLocation(null);
    setForm(emptyLocationForm);
    setModalOpen(true);
  };

  const openEditModal = (location: VendorLocation) => {
    setEditingLocation(location);
    setForm(locationToFormFields(location));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingLocation(null);
    setForm(emptyLocationForm);
    manager.clearError();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = buildLocationRequest(form);
      if (editingLocation) {
        const result = await manager.updateLocation(editingLocation.id, data);
        if (result) closeModal();
      } else {
        const result = await manager.addLocation(data);
        if (result) closeModal();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (location: VendorLocation) => {
    if (!window.confirm(`Delete location "${location.name}"? This cannot be undone.`)) {
      return;
    }
    const ok = await manager.deleteLocation(location.id);
    if (!ok && manager.error) {
      alert(manager.error);
    }
  };

  const handleRowClick = (location: VendorLocation) => {
    navigate(`/dashboard/${encodeURIComponent(entitySlug ?? '')}/locations/${location.id}`);
  };

  const updateField = (field: keyof VendorLocationFormFields, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (manager.isLoading) {
    return (
      <ContentLayout
        header={
          <DashboardPageHeader
            title="Locations"
            onRefresh={() => manager.refresh()}
            refreshing
            onAdd={openAddModal}
            addLabel="Location"
          />
        }
        contentClassName="p-4"
      >
        <Card padding="none" className="flex justify-center p-8">
          <Spinner ariaLabel="Loading locations" />
        </Card>
      </ContentLayout>
    );
  }

  return (
    <>
      <ContentLayout
        header={
          <DashboardPageHeader
            title="Locations"
            onRefresh={() => manager.refresh()}
            refreshing={manager.isLoading}
            onAdd={openAddModal}
            addLabel="Location"
          />
        }
        contentClassName="p-4"
      >
        {manager.locations.length === 0 ? (
          <EmptyState
            message="Manage your business premises here."
            buttonLabel="Add Location"
            onPress={openAddModal}
          />
        ) : (
          <DataCardList
            data={manager.locations}
            keyExtractor={(location) => location.id}
            onItemClick={handleRowClick}
            renderItem={(location) => (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Text weight="medium" truncate>
                    {location.name}
                  </Text>
                  <Text size="sm" color="muted">
                    {formatLocationAddress(location)}
                  </Text>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  {location.offeringCount != null && (
                    <Badge variant="primary" pill>
                      {location.offeringCount}
                    </Badge>
                  )}
                  <RowIconButton
                    icon={<PencilSquareIcon className="h-5 w-5" />}
                    label="Edit"
                    onClick={() => openEditModal(location)}
                  />
                  <RowIconButton
                    icon={<TrashIcon className="h-5 w-5" />}
                    label="Delete"
                    variant="danger"
                    onClick={() => handleDelete(location)}
                  />
                </div>
              </div>
            )}
          />
        )}
      </ContentLayout>

      <FormModal
        open={modalOpen}
        title={editingLocation ? 'Edit Location' : 'Add Location'}
        onClose={closeModal}
        onSave={handleSave}
        saving={saving}
        canSave={canSaveLocation(form)}
        size="medium"
      >
        {manager.error && (
          <Alert variant="error" description={String(manager.error)} className="mb-4" />
        )}

        <div className="space-y-4">
          <FormField
            id="location-name"
            label="Name"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Location name"
          />
          <FormField
            id="location-address"
            label="Address"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="Street address"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="location-city"
              label="City"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="City"
            />
            <FormField
              id="location-state"
              label="State/Province"
              value={form.stateProvince}
              onChange={(e) => updateField('stateProvince', e.target.value)}
              placeholder="State or province"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              id="location-zip"
              label="Zip Code"
              value={form.zipcode}
              onChange={(e) => updateField('zipcode', e.target.value)}
              placeholder="Zip / postal code"
            />
            <FormField
              id="location-country"
              label="Country"
              value={form.country}
              onChange={(e) => updateField('country', e.target.value)}
              placeholder="Country"
            />
          </div>
        </div>
      </FormModal>
    </>
  );
}

export default LocationsPage;
