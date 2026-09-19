import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { KPICard } from '../common/KPICard';

export interface ProjectItem {
  id: string;
  name: string;
  client: string;
  lead: string;
  startDate: string;
  deadline: string;
  budget: number;
  spent: number;
  progress: number;
  status: 'In Progress' | 'Completed' | 'On Hold' | 'At Risk';
  tasksCount: { total: number; completed: number };
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-01',
    name: 'Automated Conveyor System Rollout',
    client: 'Zenith Tech Corp',
    lead: 'Rajesh Nair',
    startDate: '2026-08-01',
    deadline: '2026-10-15',
    budget: 1850000,
    spent: 1240000,
    progress: 72,
    status: 'In Progress',
    tasksCount: { total: 48, completed: 35 },
  },
  {
    id: 'proj-02',
    name: 'Central Warehouse Robotics Upgrade',
    client: 'Internal Logistics Depot',
    lead: 'Marcus Sterling',
    startDate: '2026-07-15',
    deadline: '2026-09-30',
    budget: 2500000,
    spent: 2100000,
    progress: 88,
    status: 'In Progress',
    tasksCount: { total: 64, completed: 56 },
  },
  {
    id: 'proj-03',
    name: 'Smart SCADA Telemetry Integration',
    client: 'Southern Steel Fabricators',
    lead: 'Rajesh Nair',
    startDate: '2026-09-01',
    deadline: '2026-11-20',
    budget: 950000,
    spent: 280000,
    progress: 30,
    status: 'In Progress',
    tasksCount: { total: 32, completed: 10 },
  },
  {
    id: 'proj-04',
    name: 'Q2 ERP Cloud Migration & Data Cleanse',
    client: 'Finance & Accounts',
    lead: 'Sandra Bullock',
    startDate: '2026-06-01',
    deadline: '2026-08-31',
    budget: 600000,
    spent: 580000,
    progress: 100,
    status: 'Completed',
    tasksCount: { total: 24, completed: 24 },
  },
];

interface ProjectsViewProps {
  onOpenQuickCreate?: (type: string) => void;
  onAskAI?: (prompt?: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenQuickCreate, onAskAI }) => {
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.lead.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalBudget = projects.reduce((acc, p) => acc + p.budget, 0);
  const totalSpent = projects.reduce((acc, p) => acc + p.spent, 0);

  const getStatusBadge = (status: ProjectItem['status']) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="indigo">In Progress</Badge>;
      case 'On Hold':
        return <Badge variant="warning">On Hold</Badge>;
      case 'At Risk':
      default:
        return <Badge variant="danger">At Risk</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Projects &amp; Delivery Milestones</span>
            </h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {projects.length} Active Engagements
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track project deliverables, budget utilization, milestone velocity, and engineering burn rates
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onAskAI && (
            <button
              type="button"
              onClick={() => onAskAI('Check active project milestones and flag any contracts where spend rate exceeds milestone completion')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Project AI Audit</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenQuickCreate && onOpenQuickCreate('project')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Active Budget"
          value={`₹${(totalBudget / 100000).toFixed(1)}L`}
          growth={8.2}
          subtext="Committed project valuation"
        />
        <KPICard
          title="Actual Incurred"
          value={`₹${(totalSpent / 100000).toFixed(1)}L`}
          subtext={`${Math.round((totalSpent / totalBudget) * 100)}% budget burn`}
        />
        <KPICard
          title="Avg Milestone Pace"
          value="72.5%"
          growth={6.1}
          subtext="On-time delivery index"
        />
        <KPICard
          title="Open Tasks"
          value="43"
          subtext="125 total sprint backlog items"
        />
      </div>

      {/* Projects Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((proj) => {
          const budgetUsedPct = Math.round((proj.spent / proj.budget) * 100);
          return (
            <div
              key={proj.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client: <span className="font-semibold text-slate-700 dark:text-slate-300">{proj.client}</span> • Lead: {proj.lead}
                    </p>
                  </div>
                  {getStatusBadge(proj.status)}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Milestone Progress</span>
                    <span className="font-bold text-slate-900 dark:text-white">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        proj.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {/* Budget vs Actual */}
                <div className="mt-4 grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Total Budget</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      ₹{proj.budget.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Incurred Spend</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      ₹{proj.spent.toLocaleString('en-IN')}{' '}
                      <span className="text-[10px] text-slate-500 font-normal">({budgetUsedPct}%)</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Target: {proj.deadline}
                </span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {proj.tasksCount.completed}/{proj.tasksCount.total} Tasks Completed
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
