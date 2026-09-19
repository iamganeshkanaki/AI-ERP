import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Plus, Receipt } from 'lucide-react';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';

interface FinanceViewProps {
  onOpenQuickCreate: (type: string) => void;
  onAskAI: (prompt: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  onOpenQuickCreate,
  onAskAI,
}) => {
  const accounts = [
    { code: '1001', name: 'HDFC Current Account (Operations)', type: 'Asset', balance: 5420000 },
    { code: '1002', name: 'ICICI Escrow Account', type: 'Asset', balance: 3200000 },
    { code: '2001', name: 'Vendor Payables Ledger', type: 'Liability', balance: 920000 },
    { code: '4001', name: 'Domestic Sales Revenue', type: 'Revenue', balance: 8940000 },
    { code: '5001', name: 'Cost of Goods Sold (COGS)', type: 'Expense', balance: 4120000 },
    { code: '5002', name: 'Operating & Admin Expenses', type: 'Expense', balance: 3120000 },
  ];

  const recentExpenses = [
    { id: '1', title: 'AWS Cloud Hosting & AI Inferencing', category: 'Infrastructure', amount: 84000, date: '2026-09-17', status: 'Approved' },
    { id: '2', title: 'Factory Forklift Battery Replacement', category: 'Maintenance', amount: 32000, date: '2026-09-16', status: 'Pending' },
    { id: '3', title: 'Office Stationery & Printer Toners', category: 'Admin', amount: 8500, date: '2026-09-15', status: 'Approved' },
    { id: '4', title: 'Domestic Logistics & Pallet Freight', category: 'Logistics', amount: 62000, date: '2026-09-14', status: 'Approved' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Finance &amp; General Ledger</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chart of accounts, cash flow, journal entries, and expense claims
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAskAI("Give me this month's expenses and show overdue invoices")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
          >
            <Receipt className="h-3.5 w-3.5" />
            <span>AI Expense Breakdown</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenQuickCreate('expense')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Liquid Cash &amp; Bank Balances"
          value={8620000}
          currency
          subtext="2 corporate accounts"
        />
        <KPICard
          title="Total Receivables (AR)"
          value={1840000}
          growth={8.2}
          currency
          subtext="₹4.6L overdue"
        />
        <KPICard
          title="Total Payables (AP)"
          value={920000}
          currency
          subtext="Next payout: Sep 25"
        />
      </div>

      {/* Chart of Accounts Grid */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Chart of Accounts (COA) Summary
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-400 dark:border-slate-700">
              <tr>
                <th className="pb-2">Account Code</th>
                <th className="pb-2">Account Name</th>
                <th className="pb-2">Classification</th>
                <th className="pb-2 text-right">Net Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {accounts.map((acc) => (
                <tr key={acc.code} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {acc.code}
                  </td>
                  <td className="py-2.5 font-semibold text-slate-900 dark:text-white">
                    {acc.name}
                  </td>
                  <td className="py-2.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {acc.type}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ₹{acc.balance.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Expense Claims */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Recent Operational Expenses &amp; Claims
        </h3>
        <div className="space-y-2">
          {recentExpenses.map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-xs dark:border-slate-800"
            >
              <div>
                <div className="font-semibold text-slate-900 dark:text-white">{exp.title}</div>
                <div className="text-[11px] text-slate-400">
                  {exp.category} • {exp.date}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₹{exp.amount.toLocaleString('en-IN')}
                </span>
                <Badge variant={exp.status === 'Approved' ? 'success' : 'warning'}>
                  {exp.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
