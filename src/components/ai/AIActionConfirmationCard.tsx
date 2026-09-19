import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ShieldCheck, FileCheck, XCircle } from 'lucide-react';
import { AIActionPayload, AIActionStatus } from '../../types/ai';
import { aiService } from '../../services/aiService';

interface AIActionConfirmationCardProps {
  action: AIActionPayload;
  onActionComplete?: (result: any) => void;
}

export const AIActionConfirmationCard: React.FC<AIActionConfirmationCardProps> = ({
  action,
  onActionComplete,
}) => {
  const [status, setStatus] = useState<AIActionStatus>(action.status || 'waiting_confirmation');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [createdRef, setCreatedRef] = useState<string | null>(null);

  const handleConfirm = async () => {
    setStatus('processing');
    try {
      const res = await aiService.confirmAction(action);
      setStatus('success');
      setCreatedRef(res.resultId || 'PO-2026-4405');
      setFeedback(res.message || 'Operation executed and synchronized with ERP ledger.');
      if (onActionComplete) onActionComplete(res);
    } catch (err: any) {
      setStatus('failed');
      setFeedback(err.message || 'Action authorization failed.');
    }
  };

  const handleCancel = () => {
    setStatus('draft');
    setFeedback('Draft action discarded. No records were modified.');
  };

  const { details } = action;

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-indigo-200 bg-white shadow-xs dark:border-indigo-900/60 dark:bg-slate-900">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-indigo-50/75 px-4 py-2.5 dark:bg-indigo-950/40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
            {action.title}
          </span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            status === 'waiting_confirmation'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              : status === 'processing'
              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
              : status === 'success'
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : status === 'failed'
              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {status.replace('_', ' ')}
        </span>
      </div>

      {/* Action Body Preview */}
      <div className="p-4 text-xs">
        <p className="font-semibold text-slate-700 dark:text-slate-200 mb-3">
          {action.summary}
        </p>

        {details && (
          <div className="space-y-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            {details.vendor && (
              <div className="flex justify-between">
                <span className="text-slate-500">Vendor:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{details.vendor}</span>
              </div>
            )}
            {details.products && (
              <div className="border-t border-slate-200 pt-2 dark:border-slate-700">
                <span className="text-slate-500 block mb-1">Products:</span>
                <div className="space-y-1 pl-2">
                  {details.products.map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span className="text-slate-700 dark:text-slate-300">
                        {p.name} - {p.qty} units
                      </span>
                      <span className="font-mono text-slate-500">
                        ₹{(p.subtotal || p.qty * p.unitPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {details.totalAmount && (
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 dark:text-white dark:border-slate-700">
                <span>Total Amount:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  ₹{Number(details.totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        )}

        {feedback && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-lg p-2.5 text-xs font-medium ${
              status === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : status === 'failed'
                ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {status === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {status === 'failed' && <AlertCircle className="h-4 w-4 shrink-0" />}
            {status === 'draft' && <XCircle className="h-4 w-4 shrink-0" />}
            <span>{feedback}</span>
            {createdRef && (
              <span className="ml-auto font-mono font-bold text-emerald-700 dark:text-emerald-300">
                {createdRef}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {status === 'waiting_confirmation' && (
          <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
            >
              <FileCheck className="h-3.5 w-3.5" />
              <span>Confirm &amp; Create</span>
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="mt-4 flex items-center justify-center gap-2 py-2 text-indigo-600 dark:text-indigo-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-semibold">Transacting with ERP backend ledger...</span>
          </div>
        )}
      </div>
    </div>
  );
};
