import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Sparkles,
  FileSpreadsheet,
  Filter,
  SlidersHorizontal,
  LineChart,
} from 'lucide-react';
import { KPICard } from '../common/KPICard';
import { CustomReportBuilder } from '../reports/CustomReportBuilder';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface ReportsViewProps {
  onAskAIWithContext: (prompt: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onAskAIWithContext }) => {
  // Active Tab: 'builder' (Custom Query & Export Configurator) vs 'executive' (Visual Analytics)
  const [activeTab, setActiveTab] = useState<'builder' | 'executive'>('builder');

  // Executive overview filters
  const [reportType, setReportType] = useState('sales_summary');
  const [dateRange, setDateRange] = useState('this_quarter');
  const [branch, setBranch] = useState('all');
  const [department, setDepartment] = useState('all');

  const reportData = [
    { period: 'Apr 2026', revenue: 4200000, target: 3800000, orders: 420 },
    { period: 'May 2026', revenue: 4800000, target: 4000000, orders: 485 },
    { period: 'Jun 2026', revenue: 5100000, target: 4500000, orders: 512 },
    { period: 'Jul 2026', revenue: 5600000, target: 5000000, orders: 590 },
    { period: 'Aug 2026', revenue: 6200000, target: 5500000, orders: 630 },
    { period: 'Sep 2026', revenue: 6800000, target: 6000000, orders: 710 },
  ];

  const handleExportCSV = () => {
    const headers = 'Period,Revenue,Target,Orders\n';
    const rows = reportData.map((d) => `"${d.period}",${d.revenue},${d.target},${d.orders}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${reportType}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* View Header & Module Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Business Reports &amp; Query Configurator</span>
            </h1>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
              TXT • CSV • Excel (.xls) • JSON
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure custom SQL/DRF queries, filter datasets, and convert output into your required extension files.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('builder')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
              activeTab === 'builder'
                ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Custom Query &amp; Exporter</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('executive')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
              activeTab === 'executive'
                ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <LineChart className="h-3.5 w-3.5" />
            <span>Executive BI &amp; Analytics</span>
          </button>
        </div>
      </div>

      {/* TAB 1: CUSTOM QUERY BUILDER & EXPORTER */}
      {activeTab === 'builder' && (
        <CustomReportBuilder onAskAI={onAskAIWithContext} />
      )}

      {/* TAB 2: EXECUTIVE BI & ANALYTICS OVERVIEW */}
      {activeTab === 'executive' && (
        <div className="space-y-6">
          {/* Executive Filter Matrix Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Filter className="h-3.5 w-3.5 text-indigo-600" />
                <span>Executive Aggregate Parameters</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onAskAIWithContext(
                      `Explain the findings of the ${reportType.replace('_', ' ')} report for ${dateRange}. Which areas exceeded targets?`
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Ask AI About This Report</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Report Domain</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="sales_summary">Sales Performance &amp; Revenue</option>
                  <option value="inventory_valuation">Inventory Stock Valuation</option>
                  <option value="ar_aging">Receivables Aging Analysis</option>
                  <option value="p_and_l">P&amp;L Operating Margins</option>
                  <option value="purchase_commitments">Procurement Commitments</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Time Horizon</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="this_month">This Month (Sept 2026)</option>
                  <option value="this_quarter">Current Fiscal Quarter (Q3)</option>
                  <option value="ytd">Year to Date (FY 2026-27)</option>
                  <option value="last_year">Prior Financial Year</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Entity / Hub</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="all">Consolidated (All Branches)</option>
                  <option value="hq">Headquarters (Mumbai)</option>
                  <option value="delhi">Northern Hub (Delhi)</option>
                  <option value="bangalore">Tech &amp; Distribution (Bangalore)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="all">All Departments</option>
                  <option value="sales">Sales &amp; Distribution</option>
                  <option value="supply">Procurement &amp; Supply Chain</option>
                  <option value="finance">Finance &amp; Accounts</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Consolidated Revenue"
              value={32700000}
              growth={16.2}
              currency
              subtext="vs prior cycle"
            />
            <KPICard
              title="Target Attainment"
              value={112.8}
              growth={4.5}
              subtext="% of projected quota"
            />
            <KPICard
              title="Total Processed Orders"
              value={3347}
              growth={18.1}
              subtext="Avg ₹9,770 / order"
            />
            <KPICard
              title="Gross Operating Margin"
              value={41.4}
              growth={2.2}
              subtext="% margin contribution"
            />
          </div>

          {/* Interactive Chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Revenue Actuals vs Budget Targets
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => `₹${val / 100000}L`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="revenue" name="Actual Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Budget Target" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Report Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 font-bold text-xs text-slate-900 dark:text-white">
              Detailed Financial Breakdown
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/30">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Accounting Period</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Actual Revenue (₹)</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Target Quota (₹)</th>
                    <th className="px-4 py-2.5 font-semibold text-right">Variance (%)</th>
                    <th className="px-4 py-2.5 font-semibold text-center">Fulfillments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reportData.map((row) => {
                    const variance = ((row.revenue - row.target) / row.target) * 100;
                    return (
                      <tr key={row.period} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">
                          {row.period}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-right font-medium">
                          ₹{row.revenue.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-right text-slate-500">
                          ₹{row.target.toLocaleString('en-IN')}
                        </td>
                        <td
                          className={`px-4 py-2.5 font-mono text-right font-semibold ${
                            variance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {variance >= 0 ? `+${variance.toFixed(1)}%` : `${variance.toFixed(1)}%`}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-center text-slate-700 dark:text-slate-300">
                          {row.orders}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
