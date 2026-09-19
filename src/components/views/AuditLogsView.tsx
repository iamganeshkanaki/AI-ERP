import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Clock,
  User,
  Activity,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  RefreshCw,
  Eye,
  Laptop,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'PAYMENT' | 'EXPORT' | 'CONFIG_CHANGE';
  module: 'Sales' | 'Purchase' | 'Inventory' | 'Finance' | 'HR' | 'Approvals' | 'Settings' | 'Security';
  recordId: string;
  recordTitle: string;
  ipAddress: string;
  device: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-901',
    timestamp: '2026-09-19 07:42:15',
    userName: 'Vikram Mehta (CEO)',
    userRole: 'Admin',
    action: 'APPROVE',
    module: 'Approvals',
    recordId: 'PO-2026-4401',
    recordTitle: 'PO Approval: ABC Traders (₹1.25L)',
    ipAddress: '192.168.1.45',
    device: 'MacBook Pro / Chrome 128',
    details: 'Authorized high-priority purchase order for robotics sensors.',
    oldValue: 'status: Pending',
    newValue: 'status: Approved, authorizedBy: Vikram Mehta',
  },
  {
    id: 'aud-902',
    timestamp: '2026-09-19 07:35:10',
    userName: 'Sandra Bullock',
    userRole: 'Finance',
    action: 'PAYMENT',
    module: 'Finance',
    recordId: 'PAY-8921',
    recordTitle: 'Vendor Disbursal to Precision Tools Ltd',
    ipAddress: '192.168.1.88',
    device: 'Windows 11 / Edge 128',
    details: 'Initiated RTGS payment of ₹2,40,000 under Net 30 terms.',
    oldValue: 'paymentStatus: Unpaid',
    newValue: 'paymentStatus: Settled (Ref: RTGS99104)',
  },
  {
    id: 'aud-903',
    timestamp: '2026-09-19 06:12:00',
    userName: 'David Vance',
    userRole: 'Purchase',
    action: 'CREATE',
    module: 'Purchase',
    recordId: 'PO-2026-4405',
    recordTitle: 'Requisition Draft for Silicon Microcontrollers',
    ipAddress: '10.0.4.12',
    device: 'ThinkPad T14 / Linux',
    details: 'Created PO draft totaling ₹10,56,100 from Foundry Int.',
    newValue: 'Created PO-2026-4405 with 2 items',
  },
  {
    id: 'aud-904',
    timestamp: '2026-09-19 05:45:22',
    userName: 'System Watchdog',
    userRole: 'Admin',
    action: 'CONFIG_CHANGE',
    module: 'Security',
    recordId: 'SEC-POL-04',
    recordTitle: 'Updated n8n Webhook Endpoint Authentication',
    ipAddress: '127.0.0.1',
    device: 'Automated Service Daemon',
    details: 'Rotated HMAC signing secret for outbound ERP webhooks.',
    oldValue: 'secret: ****19a2',
    newValue: 'secret: ****88c1',
  },
  {
    id: 'aud-905',
    timestamp: '2026-09-18 18:30:11',
    userName: 'Arun Verma',
    userRole: 'Sales',
    action: 'EXPORT',
    module: 'Sales',
    recordId: 'REP-SLS-Q3',
    recordTitle: 'Exported Q3 Sales Pipeline Ledger to Excel',
    ipAddress: '192.168.1.104',
    device: 'iPad Pro / Safari',
    details: 'Downloaded 450 customer transaction rows (CSV/Excel).',
  },
  {
    id: 'aud-906',
    timestamp: '2026-09-18 16:15:00',
    userName: 'Priya Sharma',
    userRole: 'HR',
    action: 'UPDATE',
    module: 'HR',
    recordId: 'EMP-014',
    recordTitle: 'Employee Designation Update: Marcus Sterling',
    ipAddress: '192.168.1.72',
    device: 'Windows 11 / Chrome 128',
    details: 'Promoted Marcus Sterling to Senior Logistics Supervisor.',
    oldValue: 'designation: Warehouse Supervisor',
    newValue: 'designation: Senior Logistics Supervisor',
  },
];

export const AuditLogsView: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [search, setSearch] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (selectedAction !== 'ALL' && log.action !== selectedAction) return false;
    if (selectedModule !== 'ALL' && log.module !== selectedModule) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.recordTitle.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        log.recordId.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActionBadge = (action: AuditLogEntry['action']) => {
    switch (action) {
      case 'APPROVE':
        return <Badge variant="success">APPROVE</Badge>;
      case 'PAYMENT':
        return <Badge variant="indigo">PAYMENT</Badge>;
      case 'CREATE':
        return <Badge variant="info">CREATE</Badge>;
      case 'UPDATE':
        return <Badge variant="warning">UPDATE</Badge>;
      case 'REJECT':
      case 'DELETE':
        return <Badge variant="danger">{action}</Badge>;
      case 'EXPORT':
        return <Badge variant="neutral">EXPORT</Badge>;
      case 'CONFIG_CHANGE':
        return <Badge variant="purple">CONFIG</Badge>;
      default:
        return <Badge variant="neutral">{action}</Badge>;
    }
  };

  const exportAuditCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Module', 'Record ID', 'Title', 'IP Address', 'Device', 'Details'];
    const rows = filteredLogs.map((l) => [
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      l.action,
      l.module,
      l.recordId,
      `"${l.recordTitle}"`,
      l.ipAddress,
      `"${l.device}"`,
      `"${l.details}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `erp_audit_trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Immutable Audit Trail &amp; Compliance Logs</span>
            </h1>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              SOC2 / ISO 27001 Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographically sealed audit records of all user mutations, financial approvals, and data exports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportAuditCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, record title, PO/INV reference, or IP address..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            <option value="ALL">All Actions</option>
            <option value="APPROVE">Approve</option>
            <option value="REJECT">Reject</option>
            <option value="PAYMENT">Payment</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="EXPORT">Export</option>
            <option value="CONFIG_CHANGE">Config Change</option>
          </select>

          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            <option value="ALL">All Modules</option>
            <option value="Approvals">Approvals</option>
            <option value="Finance">Finance</option>
            <option value="Purchase">Purchase</option>
            <option value="Sales">Sales</option>
            <option value="Inventory">Inventory</option>
            <option value="HR">HR</option>
            <option value="Security">Security</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Target Record</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Origin / IP</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedEntry(log)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {log.module}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {log.recordTitle}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      ID: {log.recordId}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {log.userName}
                    </div>
                    <div className="text-[10px] text-slate-400">{log.userRole}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {log.ipAddress}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntry(log);
                      }}
                      className="rounded p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Drill-down Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                  Audit Record Verification
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedEntry.recordTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="rounded p-1 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl dark:bg-slate-800/60">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Action Type</span>
                  <div className="mt-0.5">{getActionBadge(selectedEntry.action)}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Timestamp</span>
                  <p className="font-mono text-slate-700 dark:text-slate-300 mt-0.5">{selectedEntry.timestamp}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Executed By</span>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedEntry.userName} ({selectedEntry.userRole})</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-bold">Source Device / IP</span>
                  <p className="font-mono text-slate-700 dark:text-slate-300 mt-0.5">{selectedEntry.ipAddress}</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300">Operational Summary</span>
                <p className="mt-1 text-slate-600 dark:text-slate-400 bg-slate-50 p-2.5 rounded-lg dark:bg-slate-800/40">
                  {selectedEntry.details}
                </p>
              </div>

              {selectedEntry.oldValue && (
                <div>
                  <span className="font-bold text-rose-600 dark:text-rose-400">Previous State (Old Value)</span>
                  <pre className="mt-1 p-2 rounded bg-rose-50/50 font-mono text-[11px] text-rose-900 dark:bg-rose-950/30 dark:text-rose-300 overflow-x-auto">
                    {selectedEntry.oldValue}
                  </pre>
                </div>
              )}

              {selectedEntry.newValue && (
                <div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Committed State (New Value)</span>
                  <pre className="mt-1 p-2 rounded bg-emerald-50/50 font-mono text-[11px] text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 overflow-x-auto">
                    {selectedEntry.newValue}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Close Audit Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
