import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import { useVendorLocationsManager } from '@sudobility/tapayoka_lib';
import { ui } from '@sudobility/design';
import {
  Alert,
  Badge,
  Button,
  FormField,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
  type TableColumn,
} from '@sudobility/components';
import { analyticsService } from '../../config/analytics';
import { DashboardPageHeader } from '../../components/DashboardPageHeader';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { dashboardTrail } from '../../lib/breadcrumbs';
import type {
  VendorLocation,
  VendorLocationCreateRequest,
  VendorLocationUpdateRequest,
} from '@sudobility/tapayoka_types';

interface FormFields {
  name: string;
  address: string;
  city: string;
  stateProvince: string;
  zipcode: string;
  country: string;
}

const emptyForm: FormFields = {
  name: '',
  address: '',
  city: '',
  stateProvince: '',
  zipcode: '',
  country: '',
};

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
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    analyticsService.trackButtonClick('add_location');
    setEditingLocation(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (location: VendorLocation) => {
    setEditingLocation(location);
    setForm({
      name: location.name,
      address: location.address,
      city: location.city,
      stateProvince: location.stateProvince,
      zipcode: location.zipcode,
      country: location.country,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingLocation(null);
    setForm(emptyForm);
    manager.clearError();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingLocation) {
        const data: VendorLocationUpdateRequest = {
          name: form.name,
          address: form.address,
          city: form.city,
          stateProvince: form.stateProvince,
          zipcode: form.zipcode,
          country: form.country,
        };
        const result = await manager.updateLocation(editingLocation.id, data);
        if (result) closeModal();
      } else {
        const data: VendorLocationCreateRequest = {
          name: form.name,
          address: form.address,
          city: form.city,
          stateProvince: form.stateProvince,
          zipcode: form.zipcode,
          country: form.country,
        };
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

  const updateField = (field: keyof FormFields, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (manager.isLoading) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader
          title="Locations"
          onRefresh={() => manager.refresh()}
          refreshing
          onAdd={openAddModal}
          addLabel="Location"
        />
        <div className="bg-white rounded-lg shadow-sm border p-8 flex justify-center">
          <Spinner ariaLabel="Loading locations" />
        </div>
      </div>
    );
  }

  const columns: TableColumn<VendorLocation>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (location) => <span className="font-medium text-gray-900">{location.name}</span>,
    },
    {
      key: 'address',
      label: 'Address',
      render: (location) => <span className="text-gray-500">{location.address}</span>,
    },
    {
      key: 'city',
      label: 'City',
      render: (location) => <span className="text-gray-500">{location.city}</span>,
    },
    {
      key: 'stateProvince',
      label: 'State/Province',
      render: (location) => <span className="text-gray-500">{location.stateProvince}</span>,
    },
    {
      key: 'country',
      label: 'Country',
      render: (location) => <span className="text-gray-500">{location.country}</span>,
    },
    {
      key: 'offerings',
      label: 'Offerings',
      render: (location) =>
        location.offeringCount != null ? (
          <Badge variant="primary" pill>
            {location.offeringCount}
          </Badge>
        ) : null,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (location) => (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(location);
            }}
            className={`font-medium mr-4 ${ui.text.linkSubtle}`}
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(location);
            }}
            className={`font-medium ${ui.text.error} hover:opacity-80`}
          >
            Delete
          </button>
        </>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Locations"
        onRefresh={() => manager.refresh()}
        refreshing={manager.isLoading}
        onAdd={openAddModal}
        addLabel="Location"
      />

      {manager.locations.length === 0 ? (
        <EmptyState
          message="Manage your business premises here."
          buttonLabel="Add Location"
          onPress={openAddModal}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <Table
            columns={columns}
            data={manager.locations}
            keyExtractor={(location) => location.id}
            hoverable
            onRowClick={handleRowClick}
          />
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        size="medium"
        aria-labelledby="location-modal-title"
      >
        <ModalHeader>
          <h2 id="location-modal-title" className={ui.text.h5}>
            {editingLocation ? 'Edit Location' : 'Add Location'}
          </h2>
        </ModalHeader>
        <ModalContent variant="scrollable">
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
        </ModalContent>
        <ModalFooter>
          <Button variant="outline" size="sm" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

export default LocationsPage;
