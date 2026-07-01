import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import { Card, ContentLayout, Spinner, Alert, Text } from '@sudobility/components';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DataCardList, RowIconButton } from '../../components/DataCardList';
import {
  useOfferingPricingTiersManager,
  useVendorModelsManager,
  formatTierSummary,
} from '@sudobility/tapayoka_lib';
import type { PricingTier } from '@sudobility/tapayoka_types';
import { DashboardPageHeader } from '../../components/DashboardPageHeader';
import { TierFormModal } from '../../components/TierFormModal';
import { analyticsService } from '../../config/analytics';
import {
  resolveOfferingParent,
  sectionPath,
  parentDetailPath,
  offeringPath,
} from '../../lib/dashboardPaths';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { dashboardTrail } from '../../lib/breadcrumbs';

export function OfferingPricingTiersPage() {
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

  const tiersManager = useOfferingPricingTiersManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token,
    parent.parentId,
    parent.parentType,
    offeringId
  );
  const modelsManager = useVendorModelsManager(networkClient, baseUrl, currentEntitySlug, token);

  const offering = tiersManager.offering;
  const model = offering
    ? (modelsManager.models.find((m) => m.id === offering.vendorModelId) ?? null)
    : null;
  const modelPricing = model?.pricing ?? null;

  useEffect(() => {
    analyticsService.trackPageView(
      `/dashboard/offerings/${offeringId}/pricing`,
      'Offering Pricing Tiers'
    );
  }, [offeringId]);

  const crumbs = [
    {
      label: parent.parentType === 'model' ? 'Models' : 'Locations',
      href: sectionPath(entitySlug, parent.parentType),
    },
    { label: offering?.name ?? 'Offering', href: offeringPath(entitySlug, parent, offeringId) },
    { label: 'Pricing Tiers', current: true },
  ];
  usePageBreadcrumbs(dashboardTrail(entitySlug, ...crumbs));

  const [editing, setEditing] = useState<PricingTier | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (tier: PricingTier) => {
    setEditing(tier);
    setModalOpen(true);
  };

  const handleDelete = async (tier: PricingTier) => {
    if (!window.confirm(`Delete pricing tier "${tier.name}"?`)) return;
    const result = await tiersManager.removeTier(tier.id);
    if (!result && tiersManager.error) alert(tiersManager.error);
  };

  const handleSave = async (tier: PricingTier) => {
    const result = editing
      ? await tiersManager.updateTier(editing.id, tier)
      : await tiersManager.addTier(tier);
    if (!result && tiersManager.error) {
      alert(tiersManager.error);
      return;
    }
    setModalOpen(false);
  };

  return (
    <>
      <ContentLayout
        header={
          <DashboardPageHeader
            title="Pricing Tiers"
            onBack={() => navigate(parentDetailPath(entitySlug, parent))}
            onRefresh={() => tiersManager.refresh()}
            refreshing={tiersManager.isLoading}
            onAdd={handleAdd}
            addLabel="Tier"
          />
        }
        contentClassName="p-4 space-y-4"
      >
        {tiersManager.error && <Alert variant="error">{tiersManager.error}</Alert>}

        {tiersManager.isLoading && tiersManager.tiers.length === 0 ? (
          <Card padding="none" className="flex justify-center p-8">
            <Spinner ariaLabel="Loading pricing tiers" />
          </Card>
        ) : (
          <DataCardList
            data={tiersManager.tiers}
            keyExtractor={(tier) => tier.id}
            emptyMessage="No pricing tiers yet."
            renderItem={(tier) => (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Text weight="medium" truncate>
                    {tier.name}
                  </Text>
                  <Text size="sm" color="muted">
                    {formatTierSummary(tier)}
                  </Text>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <RowIconButton
                    icon={<PencilSquareIcon className="h-5 w-5" />}
                    label="Edit"
                    onClick={() => handleEdit(tier)}
                  />
                  <RowIconButton
                    icon={<TrashIcon className="h-5 w-5" />}
                    label="Delete"
                    variant="danger"
                    onClick={() => handleDelete(tier)}
                  />
                </div>
              </div>
            )}
          />
        )}
      </ContentLayout>

      <TierFormModal
        open={modalOpen}
        tier={editing}
        modelPricing={modelPricing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}

export default OfferingPricingTiersPage;
