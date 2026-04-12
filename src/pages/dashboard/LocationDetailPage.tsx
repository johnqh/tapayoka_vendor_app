import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EmptyState } from '@sudobility/building_blocks';
import { useApi } from '@sudobility/building_blocks/firebase';
import { useCurrentEntity } from '@sudobility/entity_client';
import { ui, buttonVariant } from '@sudobility/design';
import { analyticsService } from '../../config/analytics';
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

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffering, setEditingOffering] = useState<VendorOffering | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      setDeletingId(inst.id);
      await new Promise((r) => setTimeout(r, 300));
      const ok = await offeringsManager.deleteOffering(inst.id);
      setDeletingId(null);
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/dashboard/${entitySlug}/locations`}
          className="text-gray-400 hover:text-gray-600"
        >
          &larr;
        </Link>
        <div className="flex-1">
          <h1 className={ui.text.h3}>{location?.name ?? 'Loading...'}</h1>
          {location && (
            <p className={ui.text.bodySmall}>
              {location.address}, {location.city}, {location.stateProvince} {location.zipcode},{' '}
              {location.country}
            </p>
          )}
        </div>
        <button
          className={`px-4 py-2 rounded-lg text-sm ${buttonVariant('primary')}`}
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
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">
                  Installations
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {offeringsManager.offerings.map((inst) => (
                <tr
                  key={inst.id}
                  className="border-b last:border-0 hover:bg-gray-50 transition-all duration-300"
                  style={
                    deletingId === inst.id ? { opacity: 0, transform: 'translateX(-20px)' } : {}
                  }
                >
                  <td className="px-4 py-3 text-sm text-gray-900">{inst.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatPricingSubtitle(inst.pricingTiers)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {inst.installationCount != null && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {inst.installationCount}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className={`text-sm mr-3 ${ui.text.linkSubtle}`}
                      onClick={() => handleEdit(inst)}
                    >
                      Edit
                    </button>
                    <button
                      className={`text-sm ${ui.text.error} hover:opacity-80`}
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
