import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useCurrentEntity } from '@sudobility/entity_client';
import { useVendorLocationsManager } from '@sudobility/tapayoka_lib';
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

  const manager = useVendorLocationsManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token,
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<VendorLocation | null>(null);
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openAddModal = () => {
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
    setDeletingId(location.id);
    await new Promise(r => setTimeout(r, 300));
    const ok = await manager.deleteLocation(location.id);
    setDeletingId(null);
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
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Location
        </button>
      </div>

      {manager.locations.length === 0 ? (
        <EmptyState
          message="Manage your business premises here."
          buttonLabel="Add Location"
          onPress={openAddModal}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  State/Province
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Offerings
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {manager.locations.map((location) => (
                <tr
                  key={location.id}
                  onClick={() => handleRowClick(location)}
                  className="hover:bg-gray-50 cursor-pointer transition-all duration-300"
                  style={deletingId === location.id ? { opacity: 0, transform: 'translateX(-20px)' } : {}}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {location.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {location.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {location.city}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {location.stateProvince}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {location.country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {location.offeringCount != null && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {location.offeringCount}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(location);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(location);
                      }}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingLocation ? 'Edit Location' : 'Add Location'}
            </h2>

            {manager.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {String(manager.error)}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Location name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => updateField('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={form.stateProvince}
                    onChange={(e) => updateField('stateProvince', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="State or province"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={form.zipcode}
                    onChange={(e) => updateField('zipcode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Zip / postal code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(e) => updateField('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationsPage;
