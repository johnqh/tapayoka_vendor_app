import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import { useOrdersManager } from '@sudobility/tapayoka_lib';
import { Alert, ContentLayout, Spinner } from '@sudobility/components';
import { DataCardList } from '../../components/DataCardList';
import type { OrderStatus } from '@sudobility/tapayoka_types';
import { analyticsService } from '../../config/analytics';
import { DashboardPageHeader } from '../../components/DashboardPageHeader';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { dashboardTrail } from '../../lib/breadcrumbs';

const STATUS_BADGE: Record<OrderStatus, string> = {
  CREATED: 'bg-gray-100 text-gray-700',
  PAID: 'bg-blue-100 text-blue-700',
  AUTHORIZED: 'bg-indigo-100 text-indigo-700',
  RUNNING: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
};

function formatDate(date: Date | null): string {
  if (!date) return '--';
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function truncateId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}...` : id;
}

export function OrdersPage() {
  const { networkClient, baseUrl, token } = useApi();
  const { entitySlug } = useParams<{ entitySlug: string }>();
  const { currentEntitySlug } = useCurrentEntity();

  useEffect(() => {
    analyticsService.trackPageView('/dashboard/orders', 'Orders');
  }, []);

  usePageBreadcrumbs(dashboardTrail(entitySlug ?? '', { label: 'Orders', current: true }));

  const { orders, isLoading, error, refresh } = useOrdersManager(
    networkClient,
    baseUrl,
    currentEntitySlug,
    token
  );

  return (
    <ContentLayout
      header={
        <DashboardPageHeader
          title="Orders"
          onRefresh={() => {
            analyticsService.trackButtonClick('refresh_orders');
            refresh();
          }}
          refreshing={isLoading}
        />
      }
      contentClassName="p-4 space-y-4"
    >
      {error && <Alert variant="error" description={error} />}

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 flex justify-center">
          <Spinner ariaLabel="Loading orders" loadingText="Loading orders..." />
        </div>
      ) : (
        <DataCardList
          data={orders}
          keyExtractor={(order) => order.id}
          emptyMessage="No orders yet."
          renderItem={(order) => (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="truncate font-mono text-sm text-gray-700 dark:text-gray-300"
                  title={order.id}
                >
                  {truncateId(order.id)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatAmount(order.amountCents)}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-700'}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          )}
        />
      )}
    </ContentLayout>
  );
}

export default OrdersPage;
