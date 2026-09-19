import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  Package,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Mic,
  Plus,
  BarChart2,
} from 'lucide-react';
import { KPICard } from '../common/KPICard';
import { DashboardKPIs, AIInsight } from '../../types/erp';
import { erpDataService } from '../../services/erpDataService';
import { useAuth } from '../../context/AuthContext';
import { mockSalesChartData } from '../../services/mockData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

interface DashboardViewProps {
  onOpenAI: (prompt?: string) => void;
  onOpenQuickCreate: (type: string) => void;
  onNavigate: (path: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAI,
  onOpenQuickCreate,
  onNavigate,
}) => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [dashboardPrompt, setDashboardPrompt] = useState('');
  const [chartTab, setChartTab] = useState<'trends' | 'revenue-expenses'>('trends');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [kpiData, insightData] = await Promise.all([
          erpDataService.getDashboardKPIs(),
          erpDataService.getAIInsights(),
        ]);
        setKpis(kpiData);
        setInsights(insightData);
      } catch (e) {
        console.error('Error loading dashboard data', e);
      }
    };
    loadDashboard();
  }, []);

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dashboardPrompt.trim()) {
      onOpenAI(dashboardPrompt);
      setDashboardPrompt('');
    } else {
      onOpenAI();
    }
  };

  const QUICK_ACTIONS = [
    { label: '+ Customer', type: 'customer' },
    { label: '+ Vendor', type: 'vendor' },
    { label: '+ Product SKU', type: 'product' },
    { label: '+ Sales Order', type: 'sale' },
    { label: '+ Purchase Order', type: 'purchase' },
    { label: '+ Expense Claim', type: 'expense' },
    { label: '+ Leave Request', type: 'leave' },
    { label: '+ Employee', type: 'employee' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Top Section: Personalized Welcome & Prominent AI Query Input */}
      <div className="rounded-2xl border border-indigo-100 bg-linear-to-r from-indigo-50/70 via-white to-slate-50 p-5 sm:p-6 dark:border-indigo-950/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Enterprise Control Center
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              Good morning, {user?.name || 'Ganesh Kanaki'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {user?.company || 'Apex Global Enterprises Ltd'} • {user?.branch || 'HQ Branch'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Role: {user?.role}
            </span>
            <button
              type="button"
              onClick={() => onOpenAI("Show today's sales")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
            >
              <Sparkles className="h-4 w-4" />
              <span>Ask AI Copilot</span>
            </button>
          </div>
        </div>

        {/* Prominent "Ask your ERP anything..." Search Bar */}
        <form onSubmit={handlePromptSubmit} className="mt-5 relative">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <input
              type="text"
              value={dashboardPrompt}
              onChange={(e) => setDashboardPrompt(e.target.value)}
              placeholder="Ask your ERP anything... (e.g. 'Show today sales', 'Which products are low in stock?', 'Create PO for ABC Traders')"
              className="flex-1 bg-transparent px-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
            />
            <button
              type="button"
              onClick={() => onOpenAI()}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
              title="Voice Input"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
            >
              Ask ERP
            </button>
          </div>

          {/* Quick Prompt Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-slate-400">Suggestions:</span>
            {[
              "Show today's sales",
              "Which products are low in stock?",
              "Create a purchase order for ABC Traders",
              "Show overdue invoices",
              "Compare sales with last month",
            ].map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onOpenAI(p)}
                className="rounded-md border border-slate-200 bg-white/80 px-2 py-0.5 text-[11px] text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                {p}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* 2. Configurable Quick Actions Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-slate-400">
          Quick Actions:
        </span>
        <button
          type="button"
          onClick={() => onNavigate('/reports')}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-2xs hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300"
        >
          <BarChart2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Reports &amp; Query Configurator</span>
        </button>
        {QUICK_ACTIONS.map((qa) => (
          <button
            key={qa.type}
            type="button"
            onClick={() => onOpenQuickCreate(qa.type)}
            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{qa.label}</span>
          </button>
        ))}
      </div>

      {/* 3. KPI Cards Grid (8 core metrics) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Sales Today"
          value={kpis?.salesToday || 428500}
          growth={kpis?.salesGrowth || 14.8}
          currency
          subtext="vs previous day"
          icon={<TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
          onClick={() => onNavigate('/sales')}
        />
        <KPICard
          title="Purchases (Month)"
          value={kpis?.purchasesThisMonth || 1250000}
          growth={kpis?.purchasesGrowth || -4.2}
          currency
          subtext="vs last month"
          icon={<ShoppingCart className="h-5 w-5 text-sky-600 dark:text-sky-400" />}
          onClick={() => onNavigate('/purchase')}
        />
        <KPICard
          title="Total Gross Revenue"
          value={kpis?.revenue || 8940000}
          growth={kpis?.revenueGrowth || 18.5}
          currency
          subtext="YTD Q3"
          icon={<DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          onClick={() => onNavigate('/reports')}
        />
        <KPICard
          title="Operating Expenses"
          value={kpis?.expenses || 3120000}
          growth={kpis?.expensesGrowth || 2.1}
          currency
          subtext="89% of budget"
          icon={<Receipt className="h-5 w-5 text-amber-600 dark:text-amber-400" />}
          onClick={() => onNavigate('/finance')}
        />
        <KPICard
          title="Receivables"
          value={kpis?.receivables || 1840000}
          currency
          subtext="₹4.6L overdue"
          icon={<ArrowDownLeft className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          onClick={() => onOpenAI('Show overdue invoices')}
        />
        <KPICard
          title="Payables"
          value={kpis?.payables || 920000}
          currency
          subtext="Net 30 terms"
          icon={<ArrowUpRight className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
          onClick={() => onNavigate('/purchase')}
        />
        <KPICard
          title="Inventory Value"
          value={kpis?.inventoryValue || 14650000}
          currency
          subtext="7 low-stock alerts"
          icon={<Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
          onClick={() => onNavigate('/inventory')}
        />
        <KPICard
          title="Pending Approvals"
          value={kpis?.pendingApprovalsCount || 5}
          subtext="Requires sign-off"
          icon={<CheckCircle2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
          onClick={() => onNavigate('/approvals')}
        />
      </div>

      {/* 4. AI Insights Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                AI Automated Insights &amp; Exceptions
              </h2>
              <p className="text-[11px] text-slate-500">
                Continuous anomaly detection and ledger alerts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenAI('Run full enterprise health audit')}
            className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Audit All Modules
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className={`flex flex-col justify-between rounded-xl border p-4 text-xs transition-all ${
                ins.type === 'warning'
                  ? 'border-amber-200 bg-amber-50/40 dark:border-amber-950 dark:bg-amber-950/20'
                  : ins.type === 'positive'
                  ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-950 dark:bg-emerald-950/20'
                  : 'border-indigo-200 bg-indigo-50/40 dark:border-indigo-950 dark:bg-indigo-950/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {ins.title}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {ins.description}
                </p>
              </div>

              {ins.actionLabel && (
                <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onOpenAI(ins.actionPrompt || ins.title)}
                    className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:underline dark:text-indigo-400 text-[11px]"
                  >
                    <span>{ins.actionLabel}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Interactive Business Analytics Charts */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Revenue, Procurement &amp; Operational Trends</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              6-Month Rolling Financial Comparison (Apr - Sep 2026)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setChartTab('trends')}
                className={`rounded-md px-3 py-1 text-xs font-semibold ${
                  chartTab === 'trends'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500'
                }`}
              >
                Revenue vs Purchase
              </button>
              <button
                type="button"
                onClick={() => setChartTab('revenue-expenses')}
                className={`rounded-md px-3 py-1 text-xs font-semibold ${
                  chartTab === 'revenue-expenses'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500'
                }`}
              >
                Profit Margin Curve
              </button>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartTab === 'trends' ? (
              <BarChart data={mockSalesChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
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
                <Bar dataKey="sales" name="Sales Revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchases" name="Purchases" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart data={mockSalesChartData}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Net Margin']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#profitGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
