import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLocalizedNavigate } from '@sudobility/components';
import { isLanguageSupported } from '../../i18n';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import { Card, ContentLayout, Spinner, Alert, Text } from '@sudobility/components';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { DataCardList, RowIconButton } from '../../components/DataCardList';
import { useOfferingScheduleManager } from '@sudobility/tapayoka_lib';
import type { DailySchedule } from '@sudobility/tapayoka_types';
import { DashboardPageHeader } from '../../components/DashboardPageHeader';
import { ScheduleFormModal } from '../../components/ScheduleFormModal';
import { analyticsService } from '../../config/analytics';
import {
  resolveOfferingParent,
  sectionPath,
  parentDetailPath,
  offeringPath,
} from '../../lib/dashboardPaths';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { dashboardTrail } from '../../lib/breadcrumbs';

export function OfferingSchedulePage() {
  const params = useParams<{
    entitySlug: string;
    modelId?: string;
    locationId?: string;
    offeringId: string;
  }>();
  const { navigate } = useLocalizedNavigate({ isLanguageSupported });
  const entitySlug = params.entitySlug ?? '';
  const offeringId = params.offeringId ?? '';
  const parent = resolveOfferingParent(params);

  const { networkClient, baseUrl, token } = useApi();
  const { currentEntitySlug } = useCurrentEntity();

  const scheduleManager = useOfferingScheduleManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token,
    parent.parentId,
    parent.parentType,
    offeringId
  );

  const offering = scheduleManager.offering;

  useEffect(() => {
    analyticsService.trackPageView(
      `/dashboard/offerings/${offeringId}/schedule`,
      'Offering Schedule'
    );
  }, [offeringId]);

  const crumbs = [
    {
      label: parent.parentType === 'model' ? 'Models' : 'Locations',
      href: sectionPath(entitySlug, parent.parentType),
    },
    { label: offering?.name ?? 'Offering', href: offeringPath(entitySlug, parent, offeringId) },
    { label: 'Schedule', current: true },
  ];
  usePageBreadcrumbs(dashboardTrail(entitySlug, ...crumbs));

  const [editing, setEditing] = useState<DailySchedule | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleEdit = (entry: DailySchedule) => {
    setEditing(entry);
    setModalOpen(true);
  };

  const handleDelete = async (entry: DailySchedule) => {
    if (!window.confirm(`Remove ${entry.dayOfWeek} from the schedule?`)) return;
    const result = await scheduleManager.removeEntry(entry.dayOfWeek);
    if (!result && scheduleManager.error) alert(scheduleManager.error);
  };

  const handleSave = async (entry: DailySchedule) => {
    const result = editing
      ? await scheduleManager.updateEntry(editing.dayOfWeek, entry)
      : await scheduleManager.addEntry(entry);
    if (!result && scheduleManager.error) {
      alert(scheduleManager.error);
      return;
    }
    setModalOpen(false);
  };

  const usedDays = scheduleManager.schedule.map((s) => s.dayOfWeek);
  const allDaysUsed = usedDays.length >= 7;

  return (
    <>
      <ContentLayout
        header={
          <DashboardPageHeader
            title="Schedule"
            onBack={() => navigate(parentDetailPath(entitySlug, parent))}
            onRefresh={() => scheduleManager.refresh()}
            refreshing={scheduleManager.isLoading}
            onAdd={handleAdd}
            addDisabled={allDaysUsed}
            addTitle={allDaysUsed ? 'All days are scheduled' : undefined}
            addLabel="Day"
          />
        }
        contentClassName="p-4 space-y-4"
      >
        {scheduleManager.error && <Alert variant="error">{scheduleManager.error}</Alert>}

        {scheduleManager.isLoading && scheduleManager.schedule.length === 0 ? (
          <Card padding="none" className="flex justify-center p-8">
            <Spinner ariaLabel="Loading schedule" />
          </Card>
        ) : (
          <DataCardList
            data={scheduleManager.schedule}
            keyExtractor={(entry) => entry.dayOfWeek}
            emptyMessage="No schedule set — the offering is available at all times."
            renderItem={(entry) => (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Text weight="medium" truncate>
                    {entry.dayOfWeek}
                  </Text>
                  <Text size="sm" color="muted">
                    {entry.startTime} – {entry.endTime}
                  </Text>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1">
                  <RowIconButton
                    icon={<PencilSquareIcon className="h-5 w-5" />}
                    label="Edit"
                    onClick={() => handleEdit(entry)}
                  />
                  <RowIconButton
                    icon={<TrashIcon className="h-5 w-5" />}
                    label="Delete"
                    variant="danger"
                    onClick={() => handleDelete(entry)}
                  />
                </div>
              </div>
            )}
          />
        )}
      </ContentLayout>

      <ScheduleFormModal
        open={modalOpen}
        entry={editing}
        usedDays={usedDays}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}

export default OfferingSchedulePage;
