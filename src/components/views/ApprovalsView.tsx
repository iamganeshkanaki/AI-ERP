import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Eye, AlertCircle, RefreshCw, ShieldAlert, Check } from 'lucide-react';
import { ApprovalItem } from '../../types/erp';
import { erpDataService } from '../../services/erpDataService';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';
import { ApprovalActionModal } from '../common/ApprovalActionModal';

export const ApprovalsView: React.FC = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [activeModalItem, setActiveModalItem] = useState<ApprovalItem | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const data = await erpDataService.getApprovals();
      setApprovals(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleQuickApprove = async (item: ApprovalItem) => {
    try {
      const updated = await erpDataService.handleApproval(item.id, 'Approve', 'Approved via quick action');
      setApprovals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (e: any) {
      alert(e.message || 'Error processing approval');
    }
  };

  const handleQuickReject = async (item: ApprovalItem) => {
    try {
      const updated = await erpDataService.handleApproval(item.id, 'Reject', 'Rejected via quick action');
      setApprovals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (e: any) {
      alert(e.message || 'Error rejecting');
    }
  };

  const APPROVAL_TYPES = [
    'All',
    'Purchase Order',
    'Expense Claim',
    'Leave Request',
    'Payment Voucher',
    'Vendor Invoice',
    'Stock Adjustment',
  ];

  const filteredItems = approvals.filter((item) => {
    if (statusFilter !== 'All' && item.status !== statusFilter) return false;
    if (selectedType !== 'All' && item.type !== selectedType) return false;
    return true;
  });

  const pendingCount = approvals.filter((a) => a.status === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <span>Enterprise Approval Center</span>
            </h1>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              {pendingCount} Pending
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Role-gated multi-department sign-offs for purchase orders, expenses, leave, and invoices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchApprovals}
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Role permission info banner */}
      <div className="flex items-center gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs text-indigo-950 dark:border-indigo-950 dark:bg-indigo-950/30 dark:text-indigo-200">
        <ShieldAlert className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <div>
          <span className="font-bold">Active Approval Authority: </span>
          <span>Logged in as <strong>{user?.name}</strong> ({user?.role}). You have authorization to approve procurement, financial vouchers, and operational requisitions up to policy limits.</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Filter */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900 text-xs">
          {(['Pending', 'Approved', 'Rejected', 'All'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {st} {st === 'Pending' && `(${pendingCount})`}
            </button>
          ))}
        </div>

        {/* Type Dropdown Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {APPROVAL_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              className={`shrink-0 rounded-lg px-2.5 py-1 font-medium transition-colors ${
                selectedType === type
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Approval Items Cards List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <Check className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No Approvals Found</p>
            <p className="text-xs text-slate-400 mt-1">
              You are completely caught up on all requests matching this criteria.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {item.referenceNumber}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {item.type}
                  </span>
                  <Badge
                    variant={
                      item.status === 'Approved'
                        ? 'success'
                        : item.status === 'Pending'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {item.status}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Requested by: <strong className="text-slate-700 dark:text-slate-300">{item.requestedBy}</strong> ({item.department})</span>
                  <span>Date: {item.date}</span>
                  {item.amount !== undefined && (
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      Amount: ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModalItem(item)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View Details</span>
                </button>

                {item.status === 'Pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleQuickReject(item)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickApprove(item)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Modal */}
      {activeModalItem && (
        <ApprovalActionModal
          item={activeModalItem}
          onClose={() => setActiveModalItem(null)}
          onActionSuccess={(updated) => {
            setApprovals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
          }}
        />
      )}
    </div>
  );
};
