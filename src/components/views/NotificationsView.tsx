import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Archive,
  Check,
  Filter,
  ArrowRight,
  TrendingUp,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Badge } from '../common/Badge';

export interface EnterpriseNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  severity: 'Critical' | 'Warning' | 'Info' | 'Success';
  module: 'Approvals' | 'Finance' | 'Inventory' | 'Sales' | 'Purchase' | 'HR' | 'AI' | 'System';
  recordId?: string;
  recordPath?: string;
  status: 'unread' | 'read' | 'archived';
  actionLabel?: string;
  actionType?: string;
}

const INITIAL_NOTIFICATIONS: EnterpriseNotification[] = [
  {
    id: 'notif-1',
    title: 'High-Value Purchase Order Approval Required',
    description: 'PO-2026-4401 from ABC Traders & Supplies totaling ₹1,25,000 awaits executive authorization before 5:00 PM cutoff.',
    timestamp: '10 mins ago',
    severity: 'Critical',
    module: 'Approvals',
    recordId: 'PO-2026-4401',
    recordPath: '/approvals',
    status: 'unread',
    actionLabel: 'Review & Approve',
    actionType: 'approve',
  },
  {
    id: 'notif-2',
    title: 'Overdue Customer Invoice Alert',
    description: 'Invoice INV-1023 for ABC Pvt Ltd (₹85,000) is now 12 days past Net 30 due date.',
    timestamp: '45 mins ago',
    severity: 'Warning',
    module: 'Finance',
    recordId: 'INV-1023',
    recordPath: '/finance',
    status: 'unread',
    actionLabel: 'Send Reminder',
    actionType: 'remind',
  },
  {
    id: 'notif-3',
    title: 'Critical Low Stock Threshold Breached',
    description: 'Printer Cartridge Black inventory dropped to 12 units (minimum safety threshold: 25).',
    timestamp: '2 hours ago',
    severity: 'Warning',
    module: 'Inventory',
    recordId: 'SKU-PRN-02',
    recordPath: '/inventory',
    status: 'unread',
    actionLabel: 'Create Reorder PO',
    actionType: 'reorder',
  },
  {
    id: 'notif-4',
    title: 'AI Anomaly Detected: Unmatched Logistics Fee',
    description: 'AI Auditor identified freight charges exceeding agreed rate-card by +14.2% on PO-2026-4390.',
    timestamp: '3 hours ago',
    severity: 'Critical',
    module: 'AI',
    recordId: 'PO-2026-4390',
    recordPath: '/reports',
    status: 'unread',
    actionLabel: 'Inspect Discrepancy',
    actionType: 'inspect',
  },
  {
    id: 'notif-5',
    title: 'New Confirmed Sales Order SO-2026-1940',
    description: 'Zenith Tech Corp placed an order for 250 Industrial Sensor Modules totaling ₹3,45,000.',
    timestamp: '5 hours ago',
    severity: 'Success',
    module: 'Sales',
    recordId: 'SO-2026-1940',
    recordPath: '/sales',
    status: 'read',
    actionLabel: 'View Order',
    actionType: 'view',
  },
  {
    id: 'notif-6',
    title: 'Annual Leave Request Submitted',
    description: 'Marcus Sterling submitted 3 days privilege leave starting next Monday.',
    timestamp: 'Yesterday',
    severity: 'Info',
    module: 'HR',
    recordId: 'LEV-2026-08',
    recordPath: '/approvals',
    status: 'read',
    actionLabel: 'Review Request',
    actionType: 'review',
  },
  {
    id: 'notif-7',
    title: 'System Webhook Service Healthy',
    description: 'n8n integration worker completed 1,420 event dispatches with 99.98% SLA.',
    timestamp: '2 days ago',
    severity: 'Info',
    module: 'System',
    status: 'archived',
  },
];

interface NotificationsViewProps {
  onNavigate?: (path: string) => void;
  onOpenAI?: (prompt?: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onNavigate,
  onOpenAI,
}) => {
  const [items, setItems] = useState<EnterpriseNotification[]>(INITIAL_NOTIFICATIONS);
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'read' | 'archived'>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  const unreadCount = items.filter((n) => n.status === 'unread').length;

  const markAs = (id: string, newStatus: 'read' | 'unread' | 'archived') => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, status: newStatus } : n)));
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => (n.status === 'unread' ? { ...n, status: 'read' } : n)));
  };

  const clearArchived = () => {
    setItems((prev) => prev.filter((n) => n.status !== 'archived'));
  };

  const filteredItems = items.filter((item) => {
    if (filterTab !== 'all' && item.status !== filterTab) return false;
    if (moduleFilter !== 'ALL' && item.module !== moduleFilter) return false;
    return true;
  });

  const getSeverityBadge = (severity: EnterpriseNotification['severity']) => {
    switch (severity) {
      case 'Critical':
        return <Badge variant="danger">Critical</Badge>;
      case 'Warning':
        return <Badge variant="warning">Warning</Badge>;
      case 'Success':
        return <Badge variant="success">Success</Badge>;
      case 'Info':
      default:
        return <Badge variant="info">Info</Badge>;
    }
  };

  const getModuleIcon = (module: EnterpriseNotification['module']) => {
    switch (module) {
      case 'Approvals':
        return <CheckCircle2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case 'Finance':
        return <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Inventory':
        return <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'Sales':
        return <TrendingUp className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
      case 'Purchase':
        return <ShoppingCart className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'HR':
        return <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'AI':
        return <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'System':
      default:
        return <Info className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Enterprise Notification Center</span>
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time multi-channel alerts, approval notifications, stock thresholds, and AI anomaly triggers
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Mark All as Read</span>
            </button>
          )}
          <button
            type="button"
            onClick={clearArchived}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            title="Purge archived alerts"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Purge Archived</span>
          </button>
        </div>
      </div>

      {/* Tabs & Module Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {(['all', 'unread', 'read', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilterTab(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
                filterTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
          >
            <option value="ALL">All Modules</option>
            <option value="Approvals">Approvals</option>
            <option value="Finance">Finance</option>
            <option value="Inventory">Inventory</option>
            <option value="Sales">Sales</option>
            <option value="Purchase">Purchase</option>
            <option value="HR">HR</option>
            <option value="AI">AI Alerts</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <p className="font-bold text-slate-700 dark:text-slate-300">You&apos;re completely caught up!</p>
            <p className="mt-1">No notifications found matching your active filter criteria.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                item.status === 'unread'
                  ? 'border-indigo-200/80 bg-indigo-50/20 shadow-xs dark:border-indigo-900/50 dark:bg-indigo-950/20'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800 shadow-2xs">
                  {getModuleIcon(item.module)}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    {getSeverityBadge(item.severity)}
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {item.module}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 w-full sm:w-auto justify-end">
                {item.actionLabel && (
                  <button
                    type="button"
                    onClick={() => {
                      if (item.recordPath && onNavigate) {
                        onNavigate(item.recordPath);
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-indigo-700"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}

                {item.status === 'unread' ? (
                  <button
                    type="button"
                    onClick={() => markAs(item.id, 'read')}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => markAs(item.id, 'unread')}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold"
                    title="Mark as unread"
                  >
                    Unread
                  </button>
                )}

                {item.status !== 'archived' && (
                  <button
                    type="button"
                    onClick={() => markAs(item.id, 'archived')}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Archive notification"
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
