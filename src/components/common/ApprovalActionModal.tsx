import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ApprovalItem } from '../../types/erp';
import { erpDataService } from '../../services/erpDataService';

interface ApprovalActionModalProps {
  item: ApprovalItem | null;
  onClose: () => void;
  onActionSuccess: (updatedItem: ApprovalItem) => void;
}

export const ApprovalActionModal: React.FC<ApprovalActionModalProps> = ({
  item,
  onClose,
  onActionSuccess,
}) => {
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!item) return null;

  const handleAction = async (action: 'Approve' | 'Reject') => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const updated = await erpDataService.handleApproval(item.id, action, note);
      onActionSuccess(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || `Failed to ${action.toLowerCase()} request.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {item.referenceNumber}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {item.type}
              </span>
            </div>
            <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              {item.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Requested By:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{item.requestedBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{item.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Submission Date:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{item.date}</span>
            </div>
            {item.amount !== undefined && (
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold dark:border-slate-700">
                <span className="text-slate-700 dark:text-slate-300">Total Valuation:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400 text-sm">
                  ₹{item.amount.toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Request Details &amp; Justification:
            </label>
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 leading-relaxed">
              {item.details}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Audit Note / Approval Remarks (Optional):
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add verification notes or reason for rejection..."
              className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleAction('Reject')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 disabled:opacity-50"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Reject Request</span>
            </button>
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleAction('Approve')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              <span>Approve &amp; Authorize</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
