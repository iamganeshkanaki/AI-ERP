import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Wrench,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { KPICard } from '../common/KPICard';

export interface FixedAsset {
  id: string;
  assetTag: string;
  name: string;
  category: 'Machinery' | 'Vehicles' | 'IT & Hardware' | 'Facilities';
  purchaseDate: string;
  purchaseCost: number;
  currentBookValue: number;
  depreciationMethod: string;
  location: string;
  custodian: string;
  warrantyExpiry: string;
  status: 'Active' | 'Under Maintenance' | 'Scheduled Service' | 'Retired';
}

const INITIAL_ASSETS: FixedAsset[] = [
  {
    id: 'ast-01',
    assetTag: 'AST-MCH-001',
    name: 'CNC 5-Axis Precision Milling Center',
    category: 'Machinery',
    purchaseDate: '2024-03-15',
    purchaseCost: 3200000,
    currentBookValue: 2450000,
    depreciationMethod: 'SLM 10-Year',
    location: 'Main Plant - Bay 4',
    custodian: 'Rajesh Nair',
    warrantyExpiry: '2027-03-14',
    status: 'Active',
  },
  {
    id: 'ast-02',
    assetTag: 'AST-VEH-012',
    name: 'Electric Forklift 2.5 Ton (Toyota)',
    category: 'Vehicles',
    purchaseDate: '2023-11-20',
    purchaseCost: 950000,
    currentBookValue: 680000,
    depreciationMethod: 'WDV 15%',
    location: 'Central Warehouse Logistics',
    custodian: 'Marcus Sterling',
    warrantyExpiry: '2026-11-19',
    status: 'Scheduled Service',
  },
  {
    id: 'ast-03',
    assetTag: 'AST-IT-108',
    name: 'Dell PowerEdge R750 Enterprise Server',
    category: 'IT & Hardware',
    purchaseDate: '2025-01-10',
    purchaseCost: 650000,
    currentBookValue: 520000,
    depreciationMethod: 'SLM 5-Year',
    location: 'Server Room Alpha',
    custodian: 'Pooja Hegde',
    warrantyExpiry: '2028-01-09',
    status: 'Active',
  },
  {
    id: 'ast-04',
    assetTag: 'AST-MCH-009',
    name: 'Automated Hydraulic Stamping Press 50T',
    category: 'Machinery',
    purchaseDate: '2022-08-05',
    purchaseCost: 1800000,
    currentBookValue: 1100000,
    depreciationMethod: 'SLM 10-Year',
    location: 'Main Plant - Bay 1',
    custodian: 'Rajesh Nair',
    warrantyExpiry: '2025-08-04',
    status: 'Under Maintenance',
  },
];

interface AssetsViewProps {
  onOpenQuickCreate?: (type: string) => void;
  onAskAI?: (prompt?: string) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({ onOpenQuickCreate, onAskAI }) => {
  const [assets, setAssets] = useState<FixedAsset[]>(INITIAL_ASSETS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const filteredAssets = assets.filter((a) => {
    if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.assetTag.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.custodian.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalCost = assets.reduce((acc, a) => acc + a.purchaseCost, 0);
  const totalBookValue = assets.reduce((acc, a) => acc + a.currentBookValue, 0);

  const getStatusBadge = (status: FixedAsset['status']) => {
    switch (status) {
      case 'Active':
        return <Badge variant="success">Active</Badge>;
      case 'Scheduled Service':
        return <Badge variant="warning">Scheduled Service</Badge>;
      case 'Under Maintenance':
        return <Badge variant="danger">Under Maintenance</Badge>;
      case 'Retired':
      default:
        return <Badge variant="neutral">Retired</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Fixed Assets &amp; Plant Maintenance</span>
            </h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              ₹{(totalBookValue / 100000).toFixed(1)}L Net Book Value
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage capital equipment, asset tags, depreciation schedules, maintenance logs, and warranty tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onAskAI && (
            <button
              type="button"
              onClick={() => onAskAI('Audit fixed assets depreciation schedule and flag any plant equipment requiring preventive overhaul this quarter')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Asset Audit AI</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenQuickCreate && onOpenQuickCreate('asset')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Gross Asset Value"
          value={`₹${(totalCost / 100000).toFixed(1)}L`}
          growth={14.2}
          subtext="Historical cost across plant & IT"
        />
        <KPICard
          title="Net Book Value"
          value={`₹${(totalBookValue / 100000).toFixed(1)}L`}
          growth={0}
          subtext="71.8% retained book value"
        />
        <KPICard
          title="Plant Uptime"
          value="98.2%"
          growth={0.8}
          subtext="Machinery availability"
        />
        <KPICard
          title="Warranty Active"
          value="3 of 4"
          subtext="1 Expiring within 90 days"
        />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets by tag, equipment name, custodian, or bay location..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="ALL">All Categories</option>
            <option value="Machinery">Machinery</option>
            <option value="Vehicles">Vehicles</option>
            <option value="IT & Hardware">IT &amp; Hardware</option>
            <option value="Facilities">Facilities</option>
          </select>
        </div>
      </div>

      {/* Assets Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
              <tr>
                <th className="py-3 px-4">Asset Tag &amp; Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location &amp; Custodian</th>
                <th className="py-3 px-4 text-right">Purchase Cost</th>
                <th className="py-3 px-4 text-right">Book Value</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Warranty Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {asset.name}
                    </div>
                    <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {asset.assetTag}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {asset.category}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-slate-800 dark:text-slate-200">{asset.location}</div>
                    <div className="text-[10px] text-slate-400">Custodian: {asset.custodian}</div>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-400">
                    ₹{asset.purchaseCost.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                    ₹{asset.currentBookValue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(asset.status)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-500">
                    {asset.warrantyExpiry}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
