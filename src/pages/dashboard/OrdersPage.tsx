import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import { useOrdersManager } from '@sudobility/tapayoka_lib';
import { Alert, Badge, Card, ContentLayout, Spinner, Text } from '@sudobility/components';
import type { BadgeProps } from '@sudobility/components';
import { DataCardList } from '../../components/DataCardList';
import type { OrderStatus } from '@sudobility/tapayoka_types';
import { analyticsService } from '../../config/analytics';
import { DashboardPageHeader } from '../../components/DashboardPageHeader';
import { usePageBreadcrumbs } from '../../hooks/usePageConfig';
import { dashboardTrail } from '../../lib/breadcrumbs';

const STATUS_BADGE: Record<OrderStatus, BadgeProps['variant']> = {
  CREATED: 'default',
  PAID: 'primary',
  AUTHORIZED: 'purple',
  RUNNING: 'warning',
  DONE: 'success',
  FAILED: 'danger',
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
        <Card padding="none" className="flex justify-center p-8">
          <Spinner ariaLabel="Loading orders" loadingText="Loading orders..." />
        </Card>
      ) : (
        <DataCardList
          data={orders}
          keyExtractor={(order) => order.id}
          emptyMessage="No orders yet."
          renderItem={(order) => (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="truncate font-mono text-sm text-theme-text-secondary"
                  title={order.id}
                >
                  {truncateId(order.id)}
                </p>
                <Text size="xs" color="muted">
                  {formatDate(order.createdAt)}
                </Text>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                <Text as="span" weight="medium">
                  {formatAmount(order.amountCents)}
                </Text>
                <Badge variant={STATUS_BADGE[order.status] ?? 'default'} size="sm" pill>
                  {order.status}
                </Badge>
              </div>
            </div>
          )}
        />
      )}
    </ContentLayout>
  );
}

export default OrdersPage;
