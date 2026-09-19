import React, { useEffect, useState } from 'react';
import { Package, AlertTriangle, Plus, RefreshCw } from 'lucide-react';
import { DataTable } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { ColumnDef } from '../../types/table';
import { Product } from '../../types/erp';
import { erpDataService } from '../../services/erpDataService';

interface InventoryViewProps {
  onOpenCreateProduct: () => void;
  onAskAI: (prompt: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  onOpenCreateProduct,
  onAskAI,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await erpDataService.getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const columns: ColumnDef<Product>[] = [
    {
      key: 'sku',
      header: 'SKU / Code',
      width: '160px',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
          {item.sku}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Product Name',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
          <div className="text-[10px] text-slate-400">{item.category}</div>
        </div>
      ),
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (item) => (
        <span className="text-slate-600 dark:text-slate-300">{item.warehouse}</span>
      ),
    },
    {
      key: 'stockQty',
      header: 'Stock Qty',
      align: 'center',
      render: (item) => (
        <span
          className={`font-mono font-bold ${
            item.stockQty <= item.reorderLevel
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-800 dark:text-slate-200'
          }`}
        >
          {item.stockQty}
        </span>
      ),
    },
    {
      key: 'reorderLevel',
      header: 'Reorder Level',
      align: 'center',
      render: (item) => (
        <span className="font-mono text-slate-500">{item.reorderLevel}</span>
      ),
    },
    {
      key: 'unitPrice',
      header: 'Unit Cost (₹)',
      align: 'right',
      render: (item) => (
        <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
          ₹{item.unitPrice.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (item) => {
        const variant =
          item.status === 'In Stock'
            ? 'success'
            : item.status === 'Low Stock'
            ? 'warning'
            : 'danger';
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
  ];

  const filters = [
    {
      key: 'status',
      label: 'Inventory Status',
      options: [
        { label: 'In Stock', value: 'In Stock' },
        { label: 'Low Stock', value: 'Low Stock' },
        { label: 'Out of Stock', value: 'Out of Stock' },
      ],
    },
    {
      key: 'category',
      label: 'Category',
      options: [
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Mechanical', value: 'Mechanical' },
        { label: 'Hydraulics', value: 'Hydraulics' },
        { label: 'Automation', value: 'Automation' },
        { label: 'Raw Materials', value: 'Raw Materials' },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Inventory &amp; Stock Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time warehouse inventory, multi-location SKUs, and reorder alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAskAI('Which products are low in stock and need reordering?')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>AI Low Stock Audit</span>
          </button>
          <button
            type="button"
            onClick={fetchProducts}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onOpenCreateProduct}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Product SKU</span>
          </button>
        </div>
      </div>

      {/* Reusable Data Table */}
      <DataTable
        title="Warehouse Inventory Catalog"
        columns={columns}
        data={products}
        filters={filters}
        searchPlaceholder="Search product by SKU, name, or category..."
        bulkActions={[
          {
            label: 'Adjust Stock',
            action: (ids) => onAskAI(`Adjust stock for SKUs: ${ids.join(', ')}`),
          },
          {
            label: 'Export Barcodes',
            action: (ids) => alert(`Exporting barcodes for ${ids.length} products`),
          },
        ]}
      />
    </div>
  );
};
