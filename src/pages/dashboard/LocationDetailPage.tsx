import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useCurrentEntity } from '@sudobility/entity_client';
import {
  useVendorLocationsManager,
  useVendorModelsManager,
  useVendorOfferingsManager,
} from '@sudobility/tapayoka_lib';
import { OfferingModal } from '../../components/OfferingModal';
import { formatPricingSubtitle } from '../../components/pricingUtils';
import type {
  VendorOffering,
  VendorOfferingCreateRequest,
  VendorOfferingUpdateRequest,
} from '@sudobility/tapayoka_types';

export function LocationDetailPage() {
  const { entitySlug, locationId } = useParams<{ entitySlug: string; locationId: string }>();
  const { networkClient, baseUrl, token } = useApi();
  const { currentEntitySlug } = useCurrentEntity();

  const locationsManager = useVendorLocationsManager(networkClient, baseUrl, currentEntitySlug, token);
  const modelsManager = useVendorModelsManager(networkClient, baseUrl, currentEntitySlug, token);
  const offeringsManager = useVendorOfferingsManager(
    networkClient, baseUrl, currentEntitySlug, token, locationId ?? null, 'location'
  );

  const location = locationsManager.locations.find(l => l.id === locationId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<VendorOffering | null>(null);

  const handleAdd = useCallback(() => {
    setEditingOffering(null);
    setModalOpen(true);
  }, []);

  const handleEdit = useCallback((inst: VendorOffering) => {
    setEditingOffering(inst);
    setModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (inst: VendorOffering) => {
    if (!window.confirm(`Delete offering "${inst.name}"?`)) return;
    const ok = await offeringsManager.deleteOffering(inst.id);
    if (!ok && offeringsManager.error) {
      alert(offeringsManager.error);
    }
  }, [offeringsManager]);

  const handleSave = useCallback(async (data: VendorOfferingCreateRequest | VendorOfferingUpdateRequest) => {
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
  }, [editingOffering, offeringsManager]);

  if (!location && !locationsManager.isLoading) {
    return (
      <div className="text-center text-gray-500 mt-12">
        Location not found.{' '}
        <Link to={`/dashboard/${entitySlug}/locations`} className="text-blue-600 hover:underline">Back to locations</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/dashboard/${entitySlug}/locations`}
          className="text-gray-400 hover:text-gray-600"
        >
          &larr;
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{location?.name ?? 'Loading...'}</h1>
          {location && (
            <p className="text-sm text-gray-500">
              {location.address}, {location.city}, {location.stateProvince} {location.zipcode}, {location.country}
            </p>
          )}
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          onClick={handleAdd}
        >
          Add Offering
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {offeringsManager.isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : offeringsManager.offerings.length === 0 ? (
          <EmptyState
            message="Manage your offerings here."
            buttonLabel="Add Offering"
            onPress={handleAdd}
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Pricing</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offeringsManager.offerings.map(inst => (
                <tr key={inst.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{inst.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatPricingSubtitle(inst.pricingTiers)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="text-blue-600 text-sm hover:text-blue-800 mr-3"
                      onClick={() => handleEdit(inst)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 text-sm hover:text-red-800"
                      onClick={() => handleDelete(inst)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
