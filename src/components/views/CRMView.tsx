import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  Building,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { KPICard } from '../common/KPICard';

export interface LeadItem {
  id: string;
  contactName: string;
  companyName: string;
  email: string;
  phone: string;
  stage: 'New Lead' | 'Discovery' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  estimatedValue: number;
  probability: number;
  assignedRep: string;
  source: string;
  lastContactDate: string;
}

const INITIAL_LEADS: LeadItem[] = [
  {
    id: 'lead-101',
    contactName: 'Rohit Kulkarni',
    companyName: 'Apex Industrial Automation Ltd',
    email: 'rohit@apexauto.in',
    phone: '+91 98201 44512',
    stage: 'Proposal',
    estimatedValue: 650000,
    probability: 75,
    assignedRep: 'Arun Verma',
    source: 'Website Inbound',
    lastContactDate: '2026-09-18',
  },
  {
    id: 'lead-102',
    contactName: 'Kavita Menon',
    companyName: 'Matrix Tech Robotics',
    email: 'kavita.m@matrixrobotics.com',
    phone: '+91 98450 11299',
    stage: 'Negotiation',
    estimatedValue: 1250000,
    probability: 85,
    assignedRep: 'Arun Verma',
    source: 'Trade Expo 2026',
    lastContactDate: '2026-09-19',
  },
  {
    id: 'lead-103',
    contactName: 'Sanjay Deshmukh',
    companyName: 'Bharat Electronics Tier-1',
    email: 'sanjay.d@bel.co.in',
    phone: '+91 94220 88711',
    stage: 'Discovery',
    estimatedValue: 420000,
    probability: 40,
    assignedRep: 'Pooja Hegde',
    source: 'Referral',
    lastContactDate: '2026-09-17',
  },
  {
    id: 'lead-104',
    contactName: 'Vikramaditya Rao',
    companyName: 'Southern Steel Fabricators',
    email: 'vikram@southsteel.com',
    phone: '+91 98800 33441',
    stage: 'Won',
    estimatedValue: 890000,
    probability: 100,
    assignedRep: 'Arun Verma',
    source: 'Direct Outreach',
    lastContactDate: '2026-09-16',
  },
  {
    id: 'lead-105',
    contactName: 'Ananya Roy',
    companyName: 'Optima Health Tech',
    email: 'ananya@optimahealth.org',
    phone: '+91 99112 55432',
    stage: 'New Lead',
    estimatedValue: 310000,
    probability: 25,
    assignedRep: 'Pooja Hegde',
    source: 'LinkedIn Campaign',
    lastContactDate: '2026-09-19',
  },
];

interface CRMViewProps {
  onOpenQuickCreate?: (type: string) => void;
  onAskAI?: (prompt?: string) => void;
}

export const CRMView: React.FC<CRMViewProps> = ({ onOpenQuickCreate, onAskAI }) => {
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_LEADS);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');

  const filteredLeads = leads.filter((l) => {
    if (stageFilter !== 'ALL' && l.stage !== stageFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.contactName.toLowerCase().includes(q) ||
        l.companyName.toLowerCase().includes(q) ||
        l.assignedRep.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalPipeline = leads.reduce((acc, l) => acc + l.estimatedValue, 0);
  const weightedPipeline = leads.reduce((acc, l) => acc + (l.estimatedValue * l.probability) / 100, 0);

  const getStageBadge = (stage: LeadItem['stage']) => {
    switch (stage) {
      case 'Won':
        return <Badge variant="success">Won</Badge>;
      case 'Negotiation':
        return <Badge variant="indigo">Negotiation</Badge>;
      case 'Proposal':
        return <Badge variant="purple">Proposal</Badge>;
      case 'Discovery':
        return <Badge variant="info">Discovery</Badge>;
      case 'New Lead':
        return <Badge variant="warning">New Lead</Badge>;
      case 'Lost':
      default:
        return <Badge variant="danger">Lost</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>CRM &amp; Sales Pipeline</span>
            </h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ₹{(totalPipeline / 100000).toFixed(1)}L Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage customer relationships, sales stages, deal probabilities, and revenue forecasts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onAskAI && (
            <button
              type="button"
              onClick={() => onAskAI('Analyze the CRM deal pipeline and identify which deals have the highest close probability this month')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Analyze Pipeline</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenQuickCreate && onOpenQuickCreate('customer')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Pipeline"
          value={`₹${(totalPipeline / 100000).toFixed(2)}L`}
          growth={18.4}
          subtext="Gross pipeline volume across 5 accounts"
        />
        <KPICard
          title="Weighted Forecast"
          value={`₹${(weightedPipeline / 100000).toFixed(2)}L`}
          growth={12.0}
          subtext="Probability adjusted cashflow forecast"
        />
        <KPICard
          title="Avg Win Rate"
          value="68.5%"
          growth={4.2}
          subtext="Proposal to Won conversion rate"
        />
        <KPICard
          title="Avg Deal Size"
          value={`₹${((totalPipeline / leads.length) / 1000).toFixed(0)}K`}
          subtext="Per qualified enterprise account"
        />
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads, companies, or account reps..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="ALL">All Stages</option>
            <option value="New Lead">New Lead</option>
            <option value="Discovery">Discovery</option>
            <option value="Proposal">Proposal</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
              <tr>
                <th className="py-3 px-4">Contact &amp; Company</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4 text-right">Deal Value</th>
                <th className="py-3 px-4 text-center">Probability</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4 text-right">Last Touch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      <span>{lead.companyName}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{lead.contactName}</span>
                      <span>•</span>
                      <span>{lead.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">{getStageBadge(lead.stage)}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                    ₹{lead.estimatedValue.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1">
                      <div className="w-12 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${lead.probability}%` }}
                        />
                      </div>
                      <span className="font-bold text-[10px] text-slate-600 dark:text-slate-400">
                        {lead.probability}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {lead.assignedRep}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{lead.source}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">{lead.lastContactDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
