import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Send,
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  Layers,
  ChevronRight,
  Check,
  X,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  FileText,
  UserCheck,
  Building2,
  Phone,
  Mail,
  Zap,
} from 'lucide-react';
import {
  WorkItem,
  WorkFilter,
  WorkCategory,
  WorkUrgency,
  WorkPriority,
} from '../../types/workToday';
import { workTodayService } from '../../services/workTodayService';
import { Badge } from '../common/Badge';

interface MyWorkTodaySectionProps {
  onOpenAI: (prompt?: string) => void;
  onNavigate: (path: string) => void;
  onOpenQuickCreate: (type: string) => void;
}

export const MyWorkTodaySection: React.FC<MyWorkTodaySectionProps> = ({
  onOpenAI,
  onNavigate,
  onOpenQuickCreate,
}) => {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [summary, setSummary] = useState(workTodayService.getSummary());
  const [activeFilter, setActiveFilter] = useState<WorkFilter>('All');
  const [isAiPrioritized, setIsAiPrioritized] = useState<boolean>(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<WorkItem | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{
    message: string;
    itemId?: string;
  } | null>(null);

  const loadData = () => {
    setItems(workTodayService.getFilteredItems(activeFilter, isAiPrioritized));
    setSummary(workTodayService.getSummary());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = workTodayService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [activeFilter, isAiPrioritized]);

  const handleAction = (item: WorkItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    switch (item.primaryActionType) {
      case 'approve': {
        workTodayService.completeItem(item.id);
        setActionFeedback({
          message: `✓ Approved ${item.title} (${item.referenceNumber || item.partyName || ''})`,
          itemId: item.id,
        });
        break;
      }
      case 'send_reminder': {
        workTodayService.completeItem(item.id);
        setActionFeedback({
          message: `✓ Payment reminder dispatched to ${item.partyName || 'client'}`,
          itemId: item.id,
        });
        break;
      }
      case 'create_purchase': {
        workTodayService.completeItem(item.id);
        setActionFeedback({
          message: `✓ Reorder purchase requisition initiated for ${item.title}`,
          itemId: item.id,
        });
        break;
      }
      case 'confirm_dispatch': {
        workTodayService.completeItem(item.id);
        setActionFeedback({
          message: `✓ Carrier dispatch confirmed for ${item.referenceNumber || item.title}`,
          itemId: item.id,
        });
        break;
      }
      case 'mark_done': {
        workTodayService.completeItem(item.id);
        setActionFeedback({
          message: `✓ Marked completed: ${item.title}`,
          itemId: item.id,
        });
        break;
      }
      case 'investigate': {
        onOpenAI(`Investigate ${item.title}: ${item.requiredAction}`);
        break;
      }
    }

    if (selectedItemForDetails?.id === item.id) {
      setSelectedItemForDetails(null);
    }

    setTimeout(() => {
      setActionFeedback((prev) => (prev?.itemId === item.id ? null : prev));
    }, 4500);
  };

  const handleUndo = (itemId: string) => {
    workTodayService.undoComplete(itemId);
    setActionFeedback(null);
  };

  const handleToggleAiPriority = () => {
    setIsAiPrioritized((prev) => !prev);
  };

  const FILTERS: { key: WorkFilter; label: string; count?: number }[] = [
    { key: 'All', label: 'All', count: summary.totalCount },
    { key: 'High Priority', label: 'High Priority' },
    { key: 'Today', label: 'Today' },
    { key: 'Overdue', label: 'Overdue' },
    { key: 'Approvals', label: 'Approvals' },
    { key: 'Finance', label: 'Finance' },
    { key: 'Sales', label: 'Sales' },
    { key: 'Purchase', label: 'Purchase' },
    { key: 'Inventory', label: 'Inventory' },
    { key: 'HR', label: 'HR' },
  ];

  const getModuleBadge = (module: string) => {
    switch (module) {
      case 'Approvals':
        return <Badge variant="indigo">Approvals</Badge>;
      case 'Finance':
        return <Badge variant="danger">Finance</Badge>;
      case 'Inventory':
        return <Badge variant="warning">Inventory</Badge>;
      case 'Purchase':
        return <Badge variant="info">Purchase</Badge>;
      case 'Sales':
        return <Badge variant="success">Sales</Badge>;
      case 'HR':
        return <Badge variant="neutral">HR</Badge>;
      case 'Tasks':
        return <Badge variant="indigo">Tasks</Badge>;
      default:
        return <Badge variant="neutral">{module}</Badge>;
    }
  };

  const getUrgencyIcon = (urgency: WorkUrgency) => {
    switch (urgency) {
      case 'Critical':
        return <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-rose-100 dark:ring-rose-950 animate-pulse" title="Critical Urgency" />;
      case 'Important':
        return <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950" title="Important" />;
      case 'Normal':
      default:
        return <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-950" title="Normal Priority" />;
    }
  };

  return (
    <div className="space-y-4" id="my-work-today-section">
      {/* Toast Notification for Immediate Feedback with Undo */}
      {actionFeedback && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-900/95 text-white px-4 py-3 shadow-xl backdrop-blur-sm text-xs transition-all animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{actionFeedback.message}</span>
          {actionFeedback.itemId && (
            <button
              type="button"
              onClick={() => handleUndo(actionFeedback.itemId!)}
              className="ml-2 inline-flex items-center gap-1 rounded bg-white/20 px-2 py-1 font-bold text-white hover:bg-white/30 transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Undo</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="p-1 text-emerald-300 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Container Card */}
      <div className="rounded-2xl border border-indigo-200/80 bg-white p-4 sm:p-6 shadow-xs dark:border-indigo-950/70 dark:bg-slate-900 transition-all">
        {/* Header with Title and AI Prioritization Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
                <Sparkles className="h-4 w-4" />
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                My Work Today
              </h2>
              <span className="ml-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {summary.totalCount} Pending
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Cross-modular action items requiring executive attention today
            </p>
          </div>

          {/* Indicators Bar (Critical, Important, Normal) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-2.5 py-1.5 font-bold text-rose-700 dark:border-rose-950 dark:bg-rose-950/40 dark:text-rose-300">
              <span className="h-2 w-2 rounded-full bg-rose-600 animate-ping" />
              <span>{summary.criticalCount} Critical</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/70 px-2.5 py-1.5 font-bold text-amber-700 dark:border-amber-950 dark:bg-amber-950/40 dark:text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>{summary.importantCount} Important</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-2.5 py-1.5 font-bold text-blue-700 dark:border-blue-950 dark:bg-blue-950/40 dark:text-blue-300">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>{summary.normalCount} Normal</span>
            </div>

            {/* AI Assistant Quick Prompt */}
            <button
              type="button"
              onClick={() => onOpenAI('What should I take care of today?')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors"
              title="Ask AI Copilot for morning action breakdown"
            >
              <Zap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>&ldquo;What should I take care of today?&rdquo;</span>
            </button>
          </div>
        </div>

        {/* AI-Generated Summary Banner at Top */}
        <div className="mt-4 rounded-xl border border-indigo-100 bg-linear-to-r from-indigo-50/70 via-white to-slate-50 p-4 dark:border-indigo-950/50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="font-bold text-indigo-700 dark:text-indigo-400">
                  {summary.greeting}{' '}
                </span>
                You have <span className="font-bold text-slate-900 dark:text-white">{summary.totalCount} items</span> requiring attention today:
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                <span>• {summary.categoryCounts['Pending Approvals']} high-priority approvals</span>
                <span>• {summary.categoryCounts['Overdue Payments']} overdue invoices</span>
                <span>• {summary.categoryCounts['Low Stock']} low-stock products</span>
                <span>• {summary.categoryCounts['Employee Requests']} employee requests</span>
                <span>• {summary.categoryCounts['Pending Purchases']} pending purchase order</span>
              </div>
            </div>

            {/* [Show me what I should handle first] AI Action Button */}
            <button
              type="button"
              onClick={handleToggleAiPriority}
              className={`shrink-0 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-xs min-h-[44px] ${
                isAiPrioritized
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-400/40'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>
                {isAiPrioritized
                  ? '✓ AI Urgency Priority Active'
                  : 'Show me what I should handle first'}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs (Responsive & Touch-Friendly) */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              className={`shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors min-h-[40px] sm:min-h-[36px] ${
                activeFilter === f.key
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              <span>{f.label}</span>
              {f.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    activeFilter === f.key
                      ? 'bg-indigo-800 text-white'
                      : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {f.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Work Items Grid / List */}
        <div className="mt-4">
          {items.length === 0 ? (
            /* Empty State: You're all caught up 🎉 */
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400 mb-3 shadow-inner">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                You&apos;re all caught up 🎉
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                No items pending in the &ldquo;{activeFilter}&rdquo; queue. All approvals, payment reminders, and stock replenishments are up to date.
              </p>
              <button
                type="button"
                onClick={() => workTodayService.resetAll()}
                className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Demo Queue</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemForDetails(item)}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-xs transition-all hover:border-indigo-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-indigo-600 cursor-pointer"
                >
                  {/* Top Row: Category, Urgency Indicator, Module */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        {getUrgencyIcon(item.urgency)}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getModuleBadge(item.module)}
                      </div>
                    </div>

                    {/* AI Priority Rank Badge (When AI Urgency Mode is active) */}
                    {isAiPrioritized && item.aiPriorityRank && (
                      <div className="mb-2 inline-flex items-center gap-1 rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                        <span>AI Priority #{item.aiPriorityRank}</span>
                      </div>
                    )}

                    {/* Title and Party / Subtitle */}
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h4>

                    {item.partyName && (
                      <p className="mt-0.5 font-semibold text-slate-700 dark:text-slate-300">
                        {item.partyName}
                      </p>
                    )}

                    {/* Key Attributes: Amount / Stock / Reference / Date */}
                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      {item.amount !== undefined ? (
                        <div>
                          <span className="text-[10px] font-medium text-slate-400 uppercase">
                            {item.category === 'Overdue Payments' ? 'Outstanding' : 'Amount'}
                          </span>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </p>
                        </div>
                      ) : item.currentStock !== undefined ? (
                        <div>
                          <span className="text-[10px] font-medium text-slate-400 uppercase">
                            Current Stock
                          </span>
                          <p className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                            {item.currentStock} units
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] font-medium text-slate-400 uppercase">
                            Reference
                          </span>
                          <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                            {item.referenceNumber || 'N/A'}
                          </p>
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-medium text-slate-400 uppercase">
                          {item.reorderLevel !== undefined ? 'Reorder Level' : 'Timeline'}
                        </span>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {item.reorderLevel !== undefined
                            ? `${item.reorderLevel} units`
                            : item.dueDateLabel}
                        </p>
                      </div>
                    </div>

                    {/* Required Action Description */}
                    <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Action required:{' '}
                      </span>
                      {item.requiredAction}
                    </div>

                    {/* AI Urgency Reason (Context) */}
                    {isAiPrioritized && item.aiUrgencyReason && (
                      <div className="mt-2 rounded bg-amber-50/80 p-1.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                        ⚡ Why first: {item.aiUrgencyReason}
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Buttons (Touch friendly min 44px on mobile) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                    {/* Secondary Action: View Details */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItemForDetails(item);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[44px] sm:min-h-[38px]"
                    >
                      <span>{item.secondaryActionLabel || 'View'}</span>
                    </button>

                    {/* Primary Action Button (Approve, Send Reminder, Create Purchase, etc.) */}
                    <button
                      type="button"
                      onClick={(e) => handleAction(item, e)}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all min-h-[44px] sm:min-h-[38px]"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>{item.primaryActionLabel}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Item Details Modal (Mobile & Desktop Friendly) */}
      {selectedItemForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getUrgencyIcon(selectedItemForDetails.urgency)}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {selectedItemForDetails.category}
                  </span>
                  {getModuleBadge(selectedItemForDetails.module)}
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  {selectedItemForDetails.title}
                </h3>
                {selectedItemForDetails.partyName && (
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    {selectedItemForDetails.partyName}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemForDetails(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Core Details Grid */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800">
                {selectedItemForDetails.amount !== undefined && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Amount / Value
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                      ₹{selectedItemForDetails.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
                {selectedItemForDetails.currentStock !== undefined && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Current Stock vs Reorder
                    </span>
                    <p className="text-sm font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                      {selectedItemForDetails.currentStock} / {selectedItemForDetails.reorderLevel} units
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Reference ID
                  </span>
                  <p className="font-mono font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                    {selectedItemForDetails.referenceNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Date &amp; Timing
                  </span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    {selectedItemForDetails.dueDateLabel}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Status
                  </span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    {selectedItemForDetails.status}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Priority Level
                  </span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                    {selectedItemForDetails.priority} Priority ({selectedItemForDetails.urgency})
                  </p>
                </div>
              </div>

              {/* Required Action Explanatory Box */}
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-950 dark:bg-indigo-950/30">
                <span className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider text-[10px]">
                  Required Action
                </span>
                <p className="mt-1 text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {selectedItemForDetails.requiredAction}
                </p>
              </div>

              {/* AI Business Context & Impact */}
              {selectedItemForDetails.aiUrgencyReason && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-950 dark:bg-amber-950/20">
                  <span className="font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-600" />
                    <span>AI Urgency &amp; Business Context</span>
                  </span>
                  <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedItemForDetails.aiUrgencyReason}
                  </p>
                  {selectedItemForDetails.businessImpact && (
                    <p className="mt-1 font-semibold text-amber-800 dark:text-amber-200 text-[11px]">
                      Impact: {selectedItemForDetails.businessImpact}
                    </p>
                  )}
                </div>
              )}

              {/* Metadata Details (Requester, Items, Warehouse, etc.) */}
              {selectedItemForDetails.metadata && (
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                    Ledger Context
                  </span>
                  <dl className="mt-2 space-y-1.5 text-xs">
                    {Object.entries(selectedItemForDetails.metadata).map(([k, v]) => (
                      <div key={k} className="flex justify-between py-0.5 border-b border-slate-100 dark:border-slate-800/60 last:border-0">
                        <dt className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1')}</dt>
                        <dd className="font-medium text-slate-700 dark:text-slate-200 text-right">{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>

            {/* Bottom Actions in Details Modal */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onOpenAI(`Give me full context and audit recommendations for ${selectedItemForDetails.title} (${selectedItemForDetails.referenceNumber || ''})`);
                  setSelectedItemForDetails(null);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 min-h-[44px]"
              >
                <Sparkles className="h-4 w-4" />
                <span>Consult AI Copilot</span>
              </button>

              <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForDetails(null)}
                  className="flex-1 sm:flex-initial rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 min-h-[44px]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(selectedItemForDetails)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm min-h-[44px]"
                >
                  <Check className="h-4 w-4" />
                  <span>{selectedItemForDetails.primaryActionLabel}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
