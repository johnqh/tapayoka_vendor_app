import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../../context/apiContextDef';
import { useCurrentEntity } from '@sudobility/entity_client';
import { useOrdersManager } from '@sudobility/tapayoka_lib';
import { Alert, Spinner, Table, type TableColumn } from '@sudobility/components';
import type { Order, OrderStatus } from '@sudobility/tapayoka_types';
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

  const columns: TableColumn<Order>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (order) => (
        <span className="font-mono text-gray-700" title={order.id}>
          {truncateId(order.id)}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (order) => formatAmount(order.amountCents),
    },
    {
      key: 'status',
      label: 'Status',
      render: (order) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[order.status] ?? 'bg-gray-100 text-gray-700'}`}
        >
          {order.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (order) => <span className="text-gray-500">{formatDate(order.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Orders"
        onRefresh={() => {
          analyticsService.trackButtonClick('refresh_orders');
          refresh();
        }}
        refreshing={isLoading}
      />

      {error && <Alert variant="error" description={error} />}

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border p-8 flex justify-center">
          <Spinner ariaLabel="Loading orders" loadingText="Loading orders..." />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <Table
            columns={columns}
            data={orders}
            keyExtractor={(order) => order.id}
            hoverable
            emptyMessage="No orders yet."
          />
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
