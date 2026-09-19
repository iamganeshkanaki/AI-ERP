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
  Loader2,
  AlertOctagon,
  UserPlus,
  CreditCard,
  Eye,
} from 'lucide-react';
import {
  WorkItem,
  WorkFilter,
  WorkCategory,
  WorkUrgency,
  WorkPriority,
  WorkActionType,
  WorkTodaySummary,
} from '../../types/workToday';
import { workTodayService } from '../../services/workTodayService';
import { useAuth } from '../../context/AuthContext';
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
  const { user } = useAuth();
  const [items, setItems] = useState<WorkItem[]>([]);
  const [summary, setSummary] = useState<WorkTodaySummary | null>(null);
  const [activeFilter, setActiveFilter] = useState<WorkFilter>('All');
  const [isAiPrioritized, setIsAiPrioritized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<WorkItem | null>(null);

  // Interactive Action Modal State (for Assign, Pay, Reject, Review)
  const [actionModal, setActionModal] = useState<{
    item: WorkItem;
    actionType: WorkActionType;
    isOpen: boolean;
    note: string;
    assignee: string;
    paymentAmount?: number;
  } | null>(null);

  const [actionFeedback, setActionFeedback] = useState<{
    message: string;
    itemId?: string;
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [sum, itms] = await Promise.all([
        workTodayService.getSummary(user?.permissions),
        workTodayService.getFilteredItems(activeFilter, isAiPrioritized, user?.permissions),
      ]);
      setSummary(sum);
      setItems(itms);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to fetch Action Center items. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = workTodayService.subscribe(() => {
      loadData();
    });
    return () => unsubscribe();
  }, [activeFilter, isAiPrioritized, user?.role, user?.permissions]);

  const handleAction = async (item: WorkItem, actionType: WorkActionType, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Check if action requires input (e.g. Reject reason, Assignee selection, Pay confirmation)
    if (actionType === 'Assign' || actionType === 'Reject' || actionType === 'Pay') {
      setActionModal({
        item,
        actionType,
        isOpen: true,
        note: '',
        assignee: 'Sandra Bullock',
        paymentAmount: item.amount,
      });
      return;
    }

    if (actionType === 'View') {
      setSelectedItemForDetails(item);
      return;
    }

    if (actionType === 'Review') {
      setSelectedItemForDetails(item);
      return;
    }

    if (actionType === 'Investigate') {
      onOpenAI(`Investigate ${item.title}: ${item.requiredAction}`);
      return;
    }

    // Direct execution for Approve, Reorder, Follow Up, Confirm Dispatch, Mark Done
    try {
      const res = await workTodayService.executeAction({
        itemId: item.id,
        actionType,
      });

      setActionFeedback({
        message: `✓ ${res.message}`,
        itemId: item.id,
      });

      if (selectedItemForDetails?.id === item.id) {
        setSelectedItemForDetails(null);
      }
    } catch (e: any) {
      alert(e.message || 'Action failed.');
    }

    setTimeout(() => {
      setActionFeedback((prev) => (prev?.itemId === item.id ? null : prev));
    }, 4500);
  };

  const handleModalSubmit = async () => {
    if (!actionModal) return;

    try {
      const res = await workTodayService.executeAction({
        itemId: actionModal.item.id,
        actionType: actionModal.actionType,
        note: actionModal.note,
        assignedTo: actionModal.assignee,
      });

      setActionFeedback({
        message: `✓ ${res.message} ${actionModal.note ? `("${actionModal.note}")` : ''}`,
        itemId: actionModal.item.id,
      });

      setActionModal(null);
      if (selectedItemForDetails?.id === actionModal.item.id) {
        setSelectedItemForDetails(null);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to submit action.');
    }
  };

  const handleUndo = (itemId: string) => {
    workTodayService.undoComplete(itemId);
    setActionFeedback(null);
  };

  const handleToggleAiPriority = () => {
    setIsAiPrioritized((prev) => !prev);
  };

  const FILTERS: { key: WorkFilter; label: string; count?: number }[] = [
    { key: 'All', label: 'All', count: summary?.totalCount },
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
        return <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-950" title="Important Priority" />;
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
                My Work Today / Action Center
              </h2>
              {summary && (
                <span className="ml-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {summary.totalCount} Pending
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Cross-modular action items filtered for your role: <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.role}</span> ({user?.department})
            </p>
          </div>

          {/* Indicators Bar (Critical, Important, Normal) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {summary && (
              <>
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
              </>
            )}

            {/* AI Assistant Quick Prompt */}
            <button
              type="button"
              onClick={() => onOpenAI('What should I take care of today?')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors"
              title="Ask AI Copilot for morning action breakdown"
            >
              <Zap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>&ldquo;What should I handle today?&rdquo;</span>
            </button>
          </div>
        </div>

        {/* AI-Generated Summary Banner at Top */}
        <div className="mt-4 rounded-xl border border-indigo-100 bg-linear-to-r from-indigo-50/70 via-white to-slate-50 p-4 dark:border-indigo-950/50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span className="font-bold text-indigo-700 dark:text-indigo-400">
                  AI Morning Brief:{' '}
                </span>
                {summary?.headlineSummary || 'Scanning ERP ledgers across all authorized modules...'}
              </p>
              {summary && summary.totalCount > 0 && (
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  {summary.categoryCounts['Pending Approvals'] > 0 && (
                    <span>• {summary.categoryCounts['Pending Approvals']} approvals</span>
                  )}
                  {summary.categoryCounts['Overdue Payments'] > 0 && (
                    <span>• {summary.categoryCounts['Overdue Payments']} overdue payments</span>
                  )}
                  {summary.categoryCounts['Low Stock'] > 0 && (
                    <span>• {summary.categoryCounts['Low Stock']} low stock</span>
                  )}
                  {summary.categoryCounts['Pending Purchases'] > 0 && (
                    <span>• {summary.categoryCounts['Pending Purchases']} pending POs</span>
                  )}
                  {summary.categoryCounts['Pending Sales Orders'] > 0 && (
                    <span>• {summary.categoryCounts['Pending Sales Orders']} pending sales orders</span>
                  )}
                  {summary.categoryCounts['Employee Requests'] > 0 && (
                    <span>• {summary.categoryCounts['Employee Requests']} employee requests</span>
                  )}
                  {summary.categoryCounts["Today's Tasks"] > 0 && (
                    <span>• {summary.categoryCounts["Today's Tasks"]} tasks</span>
                  )}
                  {summary.categoryCounts['Important AI Alerts'] > 0 && (
                    <span>• {summary.categoryCounts['Important AI Alerts']} AI alerts</span>
                  )}
                </div>
              )}
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

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-2" />
            <p className="text-xs font-medium text-slate-500">
              Querying authorized ERP ledgers and evaluating business urgency...
            </p>
          </div>
        )}

        {/* Error State */}
        {!isLoading && errorMessage && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4 dark:border-rose-950 dark:bg-rose-950/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-rose-600 shrink-0" />
              <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                {errorMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadData()}
              className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700 shadow-2xs"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Work Items Grid / List */}
        {!isLoading && !errorMessage && (
          <div className="mt-4">
            {items.length === 0 ? (
              /* Empty State: You’re all caught up. */
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/20">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-400 mb-3 shadow-inner">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  You&apos;re all caught up.
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                  No items requiring attention in the &ldquo;{activeFilter}&rdquo; view for role <span className="font-semibold">{user?.role}</span>. All approvals, payment follow-ups, and replenishment queues are clear.
                </p>
                <button
                  type="button"
                  onClick={() => workTodayService.resetAll()}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Action Center Queue</span>
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
                          <span>AI Urgency Priority #{item.aiPriorityRank}</span>
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
                            {item.reorderLevel !== undefined ? 'Reorder Level' : 'Date / Timeline'}
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
                      {/* Secondary Action: Review / View / Reject / Assign */}
                      {item.secondaryActionType && (
                        <button
                          type="button"
                          onClick={(e) => handleAction(item, item.secondaryActionType!, e)}
                          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[44px] sm:min-h-[38px]"
                        >
                          <span>{item.secondaryActionLabel || item.secondaryActionType}</span>
                        </button>
                      )}

                      {/* Primary Action Button (Approve, Pay, Reorder, Follow Up, Assign, etc.) */}
                      <button
                        type="button"
                        onClick={(e) => handleAction(item, item.primaryActionType, e)}
                        className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-bold text-white shadow-xs transition-all min-h-[44px] sm:min-h-[38px] ${
                          item.primaryActionType === 'Approve'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : item.primaryActionType === 'Pay'
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : item.primaryActionType === 'Reorder'
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{item.primaryActionLabel || item.primaryActionType}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Interactive Action Modal (for Reject, Assign, Pay, Review) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                  Action Execution
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {actionModal.actionType}: {actionModal.item.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              {actionModal.actionType === 'Assign' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assign Responsibility To
                  </label>
                  <select
                    value={actionModal.assignee}
                    onChange={(e) =>
                      setActionModal((prev) => (prev ? { ...prev, assignee: e.target.value } : null))
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Sandra Bullock (Finance Lead)">Sandra Bullock (Finance Lead)</option>
                    <option value="David Vance (Procurement)">David Vance (Procurement)</option>
                    <option value="Linda Chen (Warehouse Ops)">Linda Chen (Warehouse Ops)</option>
                    <option value="Arun Verma (Accounts)">Arun Verma (Accounts)</option>
                  </select>
                </div>
              )}

              {actionModal.actionType === 'Pay' && (
                <div className="rounded-lg bg-blue-50/70 p-3 border border-blue-200 dark:border-blue-950 dark:bg-blue-950/30">
                  <div className="flex justify-between text-xs font-bold text-blue-950 dark:text-blue-200">
                    <span>Payment Disbursal Amount:</span>
                    <span>₹{actionModal.item.amount?.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-blue-800 dark:text-blue-300">
                    Requires dual-factor CFO authorization. Dispatches via RTGS/NEFT gateway.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Audit Notes / Instructions {actionModal.actionType === 'Reject' && '(Required)'}
                </label>
                <textarea
                  rows={3}
                  value={actionModal.note}
                  onChange={(e) =>
                    setActionModal((prev) => (prev ? { ...prev, note: e.target.value } : null))
                  }
                  placeholder={`Add operational context for ${actionModal.actionType}...`}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSubmit}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm min-h-[44px]"
              >
                Confirm {actionModal.actionType}
              </button>
            </div>
          </div>
        </div>
      )}

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
                    Date &amp; Timeline
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
                    Permission Scope
                  </span>
                  <p className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {selectedItemForDetails.requiredPermission}
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
                {selectedItemForDetails.secondaryActionType && (
                  <button
                    type="button"
                    onClick={(e) => handleAction(selectedItemForDetails, selectedItemForDetails.secondaryActionType!, e)}
                    className="flex-1 sm:flex-initial rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 min-h-[44px]"
                  >
                    {selectedItemForDetails.secondaryActionLabel || selectedItemForDetails.secondaryActionType}
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => handleAction(selectedItemForDetails, selectedItemForDetails.primaryActionType, e)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm min-h-[44px]"
                >
                  <Check className="h-4 w-4" />
                  <span>{selectedItemForDetails.primaryActionLabel || selectedItemForDetails.primaryActionType}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
