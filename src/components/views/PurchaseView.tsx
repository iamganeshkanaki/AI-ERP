import React, { useEffect, useState } from 'react';
import { ShoppingCart, Plus, RefreshCw, FileCheck } from 'lucide-react';
import { DataTable } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { ColumnDef } from '../../types/table';
import { PurchaseOrder } from '../../types/erp';
import { erpDataService } from '../../services/erpDataService';

interface PurchaseViewProps {
  onOpenCreatePO: () => void;
  onAskAI: (prompt: string) => void;
}

export const PurchaseView: React.FC<PurchaseViewProps> = ({
  onOpenCreatePO,
  onAskAI,
}) => {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const data = await erpDataService.getPurchaseOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      key: 'poNumber',
      header: 'PO #',
      width: '150px',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
          {item.poNumber}
        </span>
      ),
    },
    {
      key: 'vendorName',
      header: 'Vendor / Supplier',
      render: (item) => (
        <span className="font-semibold text-slate-900 dark:text-white">
          {item.vendorName}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Issue Date',
      render: (item) => <span className="text-slate-500">{item.date}</span>,
    },
    {
      key: 'totalAmount',
      header: 'PO Amount (₹)',
      align: 'right',
      render: (item) => (
        <span className="font-mono font-bold text-slate-900 dark:text-white">
          ₹{item.totalAmount.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'approvalStatus',
      header: 'Approval',
      align: 'center',
      render: (item) => {
        const variant =
          item.approvalStatus === 'Approved'
            ? 'success'
            : item.approvalStatus === 'Pending'
            ? 'warning'
            : item.approvalStatus === 'Rejected'
            ? 'danger'
            : 'neutral';
        return <Badge variant={variant}>{item.approvalStatus}</Badge>;
      },
    },
    {
      key: 'deliveryStatus',
      header: 'Delivery',
      align: 'center',
      render: (item) => {
        const variant =
          item.deliveryStatus === 'Received'
            ? 'success'
            : item.deliveryStatus === 'Ordered'
            ? 'info'
            : 'neutral';
        return <Badge variant={variant}>{item.deliveryStatus}</Badge>;
      },
    },
  ];

  const filters = [
    {
      key: 'approvalStatus',
      label: 'Approval Status',
      options: [
        { label: 'Approved', value: 'Approved' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Draft', value: 'Draft' },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Procurement &amp; Purchase Orders</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Vendor requisition management, purchase orders, goods receipts, and payables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAskAI('Create a purchase order for ABC Traders')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300"
          >
            <FileCheck className="h-3.5 w-3.5" />
            <span>AI Draft PO (ABC Traders)</span>
          </button>
          <button
            type="button"
            onClick={fetchPurchases}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onOpenCreatePO}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Purchase Order</span>
          </button>
        </div>
      </div>

      <DataTable
        title="Purchase Orders Register"
        columns={columns}
        data={orders}
        filters={filters}
        searchPlaceholder="Search PO # or vendor name..."
      />
    </div>
  );
};
