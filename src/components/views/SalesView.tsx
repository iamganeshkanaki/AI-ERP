import React, { useEffect, useState } from 'react';
import { TrendingUp, Plus, RefreshCw, FileText } from 'lucide-react';
import { DataTable } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { ColumnDef } from '../../types/table';
import { SalesOrder } from '../../types/erp';
import { erpDataService } from '../../services/erpDataService';

interface SalesViewProps {
  onOpenCreateOrder: () => void;
  onAskAI: (prompt: string) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  onOpenCreateOrder,
  onAskAI,
}) => {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await erpDataService.getSalesOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const columns: ColumnDef<SalesOrder>[] = [
    {
      key: 'orderNumber',
      header: 'Order #',
      width: '150px',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
          {item.orderNumber}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer Organization',
      render: (item) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          {item.customerName}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Order Date',
      render: (item) => <span className="text-slate-500">{item.date}</span>,
    },
    {
      key: 'itemsCount',
      header: 'Items',
      align: 'center',
      render: (item) => <span className="font-mono text-slate-700 dark:text-slate-300">{item.itemsCount}</span>,
    },
    {
      key: 'totalAmount',
      header: 'Gross Total (₹)',
      align: 'right',
      render: (item) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          ₹{item.totalAmount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      align: 'center',
      render: (item) => {
        const variant =
          item.paymentStatus === 'Paid'
            ? 'success'
            : item.paymentStatus === 'Partial'
            ? 'warning'
            : item.paymentStatus === 'Overdue'
            ? 'danger'
            : 'neutral';
        return <Badge variant={variant}>{item.paymentStatus}</Badge>;
      },
    },
    {
      key: 'fulfillmentStatus',
      header: 'Fulfillment',
      align: 'center',
      render: (item) => {
        const variant =
          item.fulfillmentStatus === 'Delivered'
            ? 'success'
            : item.fulfillmentStatus === 'Shipped'
            ? 'info'
            : 'neutral';
        return <Badge variant={variant}>{item.fulfillmentStatus}</Badge>;
      },
    },
  ];

  const filters = [
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      options: [
        { label: 'Paid', value: 'Paid' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Partial', value: 'Partial' },
        { label: 'Overdue', value: 'Overdue' },
      ],
    },
    {
      key: 'fulfillmentStatus',
      label: 'Fulfillment',
      options: [
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Shipped', value: 'Shipped' },
        { label: 'Delivered', value: 'Delivered' },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Sales &amp; Customer Orders</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fulfillments, dispatch notes, customer accounts, and receivables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAskAI("Show today's sales and compare with last month")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>AI Sales Analysis</span>
          </button>
          <button
            type="button"
            onClick={fetchOrders}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onOpenCreateOrder}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Sales Order</span>
          </button>
        </div>
      </div>

      <DataTable
        title="Sales Orders Register"
        columns={columns}
        data={orders}
        filters={filters}
        searchPlaceholder="Search order number or client..."
      />
    </div>
  );
};
