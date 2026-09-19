import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  FileCheck,
  XCircle,
  Edit3,
  Calendar,
  Building2,
  Clock,
  ShieldAlert,
  ChevronRight,
  Info,
} from 'lucide-react';
import { AIActionPayload, AIActionStatus } from '../../types/ai';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';

interface AIActionConfirmationCardProps {
  action: AIActionPayload;
  onActionComplete?: (result: any) => void;
  onEditAction?: (action: AIActionPayload) => void;
}

export const AIActionConfirmationCard: React.FC<AIActionConfirmationCardProps> = ({
  action,
  onActionComplete,
  onEditAction,
}) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<AIActionStatus>(action.status || 'waiting_confirmation');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [createdRef, setCreatedRef] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Guard against rapid duplicate double-clicks
  const submittingRef = useRef<boolean>(false);

  // Editable fields in case user clicks [Edit]
  const [editDeliveryDate, setEditDeliveryDate] = useState<string>(
    action.details?.expectedDelivery || '2026-09-26 (5 Business Days)'
  );
  const [editPaymentTerms, setEditPaymentTerms] = useState<string>(
    action.details?.paymentTerms || 'Net 30 Days'
  );
  const [editWarehouse, setEditWarehouse] = useState<string>(
    action.details?.warehouse || 'Pune Central Spares Depot'
  );

  const handleConfirm = async () => {
    // Prevent duplicate submission
    if (submittingRef.current || isSubmitting || status !== 'waiting_confirmation') {
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    setStatus('processing');
    setFeedback(null);

    try {
      // Include any user edits
      const finalPayload: AIActionPayload = {
        ...action,
        details: {
          ...action.details,
          expectedDelivery: editDeliveryDate,
          paymentTerms: editPaymentTerms,
          warehouse: editWarehouse,
        },
      };

      const res = await aiService.confirmAction(finalPayload, user?.role || 'Admin');

      if (res.success) {
        setStatus('success');
        setCreatedRef(res.resultId || action.details?.poDraftNumber || 'PO-2026-4405');
        setFeedback(res.message || 'Operation executed and synchronized with ERP ledger.');
        if (onActionComplete) onActionComplete(res);
      } else {
        setStatus('failed');
        setFeedback(res.message || 'Action authorization failed.');
      }
    } catch (err: any) {
      setStatus('failed');
      setFeedback(err.message || 'Action authorization failed.');
    } finally {
      setIsSubmitting(false);
      submittingRef.current = false;
    }
  };

  const handleCancel = () => {
    setStatus('draft');
    setFeedback('Draft action discarded. No records were created or modified.');
  };

  const { details } = action;
  const isPO = action.actionType === 'create_po';
  const isWaiting = status === 'waiting_confirmation';

  // Calculations breakdown
  const subtotal = details?.subtotal || 895000;
  const taxAmount = details?.taxAmount || details?.gstTax || Math.round(subtotal * 0.18);
  const totalAmount = details?.totalAmount || subtotal + taxAmount;

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-indigo-200 bg-white shadow-xs dark:border-indigo-900/60 dark:bg-slate-900">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-50/75 px-4 py-2.5 dark:border-indigo-900/50 dark:bg-indigo-950/40">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
            {action.title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              status === 'waiting_confirmation'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse'
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
      </div>

      {/* Safety Notice for Pending Preview */}
      {isWaiting && (
        <div className="flex items-center gap-2 bg-amber-50/70 px-4 py-1.5 text-[11px] text-amber-800 border-b border-amber-100 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
          <Info className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Draft stage only.</strong> No records have been written to the ERP database. Please review before committing.
          </span>
        </div>
      )}

      {/* Action Body Preview */}
      <div className="p-4 text-xs">
        {/* Draft Identifier & Vendor */}
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-1 border-b border-slate-100 pb-2.5 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Draft Reference
            </span>
            <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {details?.poDraftNumber || action.summary || 'PO-2026-4405 (Draft)'}
            </p>
          </div>
          {details?.vendor && (
            <div className="text-right">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Vendor
              </span>
              <p className="font-semibold text-slate-900 dark:text-white">{details.vendor}</p>
            </div>
          )}
          {details?.customer && (
            <div className="text-right">
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                Customer / Client
              </span>
              <p className="font-semibold text-slate-900 dark:text-white">{details.customer}</p>
            </div>
          )}
        </div>

        {/* Itemized Breakdown */}
        {details?.products && details.products.length > 0 && (
          <div className="mb-3 space-y-2 rounded-lg border border-slate-200 bg-slate-50/75 p-3 dark:border-slate-800 dark:bg-slate-800/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Items &amp; Quantities
            </span>

            <div className="space-y-2.5 pt-1">
              {details.products.map((p: any, idx: number) => {
                const itemQty = p.qty || p.quantity || 1;
                const unitPrice = p.unitPrice || Math.round(p.subtotal / itemQty);
                const itemSubtotal = p.subtotal || itemQty * unitPrice;

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-md bg-white p-2.5 shadow-2xs dark:bg-slate-900/80"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</p>
                      <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>
                          Quantity: <strong className="text-slate-700 dark:text-slate-300">{itemQty}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Unit Price: <strong className="font-mono text-slate-700 dark:text-slate-300">₹{unitPrice.toLocaleString('en-IN')}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">Subtotal</span>
                      <p className="font-mono font-semibold text-slate-900 dark:text-white">
                        ₹{itemSubtotal.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clearly show how Grand Total is calculated */}
            <div className="mt-3 border-t border-slate-200 pt-2.5 space-y-1.5 dark:border-slate-700">
              <div className="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
                <span>Subtotal:</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
                <span>Tax (GST 18%):</span>
                <span className="font-mono">+ ₹{taxAmount.toLocaleString('en-IN')}</span>
              </div>
              {details?.shippingCharges ? (
                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
                  <span>Shipping &amp; Logistics:</span>
                  <span className="font-mono">+ ₹{details.shippingCharges.toLocaleString('en-IN')}</span>
                </div>
              ) : null}
              {details?.discountAmount ? (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-xs">
                  <span>Supplier Discount:</span>
                  <span className="font-mono">- ₹{details.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900 dark:text-white dark:border-slate-700 text-sm">
                <span>Grand Total:</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  ₹{Number(totalAmount).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Logistics & Commercial Terms */}
        <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3 rounded-lg bg-slate-50 p-2.5 text-[11px] dark:bg-slate-800/60">
          <div>
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="h-3 w-3" />
              <span>Delivery Date</span>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editDeliveryDate}
                onChange={(e) => setEditDeliveryDate(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            ) : (
              <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-300">
                {editDeliveryDate}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1 text-slate-400">
              <Building2 className="h-3 w-3" />
              <span>Warehouse</span>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editWarehouse}
                onChange={(e) => setEditWarehouse(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            ) : (
              <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-300">
                {editWarehouse}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="h-3 w-3" />
              <span>Payment Terms</span>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editPaymentTerms}
                onChange={(e) => setEditPaymentTerms(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] text-slate-800 dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            ) : (
              <p className="mt-0.5 font-medium text-slate-700 dark:text-slate-300">
                {editPaymentTerms}
              </p>
            )}
          </div>
        </div>

        {/* Feedback Message */}
        {feedback && (
          <div
            className={`mt-3 flex items-start gap-2 rounded-lg p-2.5 text-xs font-medium ${
              status === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : status === 'failed'
                ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {status === 'success' && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
            {status === 'failed' && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            {status === 'draft' && <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            <div className="flex-1">
              <span>{feedback}</span>
              {createdRef && status === 'success' && (
                <div className="mt-1 flex items-center gap-1 text-[11px]">
                  <span>ERP Reference:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    {createdRef}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isWaiting && (
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <Edit3 className="h-3 w-3" />
              <span>{isEditing ? 'Done Editing' : 'Edit'}</span>
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FileCheck className="h-3.5 w-3.5" />
                  <span>Confirm &amp; Create</span>
                </>
              )}
            </button>
          </div>
        )}

        {status === 'processing' && (
          <div className="mt-4 flex items-center justify-center gap-2 py-2 text-indigo-600 dark:text-indigo-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="font-semibold">Authorizing and writing to ERP database ledger...</span>
          </div>
        )}
      </div>
    </div>
  );
};
