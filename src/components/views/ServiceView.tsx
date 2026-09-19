import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { KPICard } from '../common/KPICard';

export interface ServiceTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  subject: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Pending Parts' | 'Resolved' | 'Closed';
  assignedEngineer: string;
  createdAt: string;
  slaDeadline: string;
  slaBreached: boolean;
}

const INITIAL_TICKETS: ServiceTicket[] = [
  {
    id: 'tkt-01',
    ticketNumber: 'SRV-2026-891',
    customerName: 'Zenith Tech Corp',
    subject: 'Robotics Servo Axis 3 Calibration Drift Warning',
    priority: 'Critical',
    status: 'In Progress',
    assignedEngineer: 'Rajesh Nair',
    createdAt: '2026-09-19 06:30',
    slaDeadline: '2026-09-19 10:30 (4h SLA)',
    slaBreached: false,
  },
  {
    id: 'tkt-02',
    ticketNumber: 'SRV-2026-892',
    customerName: 'Apex Industrial Automation Ltd',
    subject: 'PLC Gateway Firmware Update Request v4.2',
    priority: 'Medium',
    status: 'Open',
    assignedEngineer: 'Arun Verma',
    createdAt: '2026-09-18 14:15',
    slaDeadline: '2026-09-20 18:00 (48h SLA)',
    slaBreached: false,
  },
  {
    id: 'tkt-03',
    ticketNumber: 'SRV-2026-889',
    customerName: 'Southern Steel Fabricators',
    subject: 'Emergency Hydraulic Pump Seal Replacement',
    priority: 'Critical',
    status: 'Pending Parts',
    assignedEngineer: 'Rajesh Nair',
    createdAt: '2026-09-17 09:00',
    slaDeadline: '2026-09-17 17:00 (8h SLA)',
    slaBreached: true,
  },
  {
    id: 'tkt-04',
    ticketNumber: 'SRV-2026-885',
    customerName: 'Matrix Tech Robotics',
    subject: 'Telemetry Cloud Sync Timeout Issue',
    priority: 'Low',
    status: 'Resolved',
    assignedEngineer: 'Pooja Hegde',
    createdAt: '2026-09-16 11:30',
    slaDeadline: '2026-09-19 12:00',
    slaBreached: false,
  },
];

interface ServiceViewProps {
  onOpenQuickCreate?: (type: string) => void;
  onAskAI?: (prompt?: string) => void;
}

export const ServiceView: React.FC<ServiceViewProps> = ({ onOpenQuickCreate, onAskAI }) => {
  const [tickets, setTickets] = useState<ServiceTicket[]>(INITIAL_TICKETS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.customerName.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.ticketNumber.toLowerCase().includes(q) ||
        t.assignedEngineer.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getPriorityBadge = (priority: ServiceTicket['priority']) => {
    switch (priority) {
      case 'Critical':
        return <Badge variant="danger">Critical</Badge>;
      case 'High':
        return <Badge variant="warning">High</Badge>;
      case 'Medium':
        return <Badge variant="info">Medium</Badge>;
      case 'Low':
      default:
        return <Badge variant="neutral">Low</Badge>;
    }
  };

  const getStatusBadge = (status: ServiceTicket['status']) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return <Badge variant="success">{status}</Badge>;
      case 'In Progress':
        return <Badge variant="indigo">In Progress</Badge>;
      case 'Pending Parts':
        return <Badge variant="warning">Pending Parts</Badge>;
      case 'Open':
      default:
        return <Badge variant="purple">Open</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Customer Service &amp; Helpdesk</span>
            </h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length} Active Tickets
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage customer issue tickets, SLA resolution commitments, field service engineers, and warranty repair orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onAskAI && (
            <button
              type="button"
              onClick={() => onAskAI('Check active service tickets approaching SLA cutoff and prioritize dispatch')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>SLA Triage AI</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onOpenQuickCreate && onOpenQuickCreate('service')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Open Tickets"
          value="3"
          subtext="1 ticket requires field engineer on-site"
        />
        <KPICard
          title="SLA Compliance"
          value="94.2%"
          growth={1.8}
          subtext="Within agreed enterprise response SLA"
        />
        <KPICard
          title="Avg Resolution Time"
          value="4.6 hrs"
          growth={-12.5}
          subtext="Fastest turnaround in Industrial tier"
        />
        <KPICard
          title="Customer CSAT"
          value="4.8 / 5.0"
          growth={4.2}
          subtext="Based on 42 verified surveys"
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
            placeholder="Search tickets by subject, customer name, ticket ID, or engineer..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending Parts">Pending Parts</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket &amp; Customer</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Engineer</th>
                <th className="py-3 px-4 text-right">SLA Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTickets.map((tkt) => (
                <tr key={tkt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {tkt.customerName}
                    </div>
                    <div className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {tkt.ticketNumber}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-xs">
                    {tkt.subject}
                  </td>
                  <td className="py-3 px-4">{getPriorityBadge(tkt.priority)}</td>
                  <td className="py-3 px-4">{getStatusBadge(tkt.status)}</td>
                  <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {tkt.assignedEngineer}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-mono text-[11px] ${
                        tkt.slaBreached
                          ? 'font-bold text-rose-600 dark:text-rose-400'
                          : 'text-slate-500'
                      }`}
                    >
                      {tkt.slaDeadline}
                    </span>
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
