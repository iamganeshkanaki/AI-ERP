import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight, DollarSign } from 'lucide-react';
import { erpDataService } from '../../services/erpDataService';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated?: (invoice: any) => void;
}

type UploadStage = 'idle' | 'uploading' | 'processing' | 'extracting' | 'validating' | 'ready';

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onInvoiceCreated,
}) => {
  const [stage, setStage] = useState<UploadStage>('idle');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number } | null>(null);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) startProcessing(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) startProcessing(file);
  };

  const startProcessing = async (file: File) => {
    setSelectedFile({ name: file.name, size: file.size });
    setErrorMsg(null);
    setStage('uploading');

    try {
      // Step 1: Uploading
      await new Promise((r) => setTimeout(r, 600));
      setStage('processing');

      // Step 2: Processing
      await new Promise((r) => setTimeout(r, 700));
      setStage('extracting');

      // Step 3: Extracting via DRF API / Mock
      const result = await erpDataService.extractDocumentInvoice({
        name: file.name,
        size: file.size,
      });

      // Step 4: Validating
      setStage('validating');
      await new Promise((r) => setTimeout(r, 600));

      // Step 5: Ready
      setExtractedData(result);
      setStage('ready');
    } catch (err: any) {
      setErrorMsg(err.message || 'Extraction failed');
      setStage('idle');
    }
  };

  const handleConfirmAndPost = () => {
    if (onInvoiceCreated && extractedData) {
      onInvoiceCreated(extractedData);
    }
    onClose();
  };

  const STAGES: { key: UploadStage; label: string }[] = [
    { key: 'uploading', label: '1. Upload' },
    { key: 'processing', label: '2. Processing' },
    { key: 'extracting', label: '3. Extracting' },
    { key: 'validating', label: '4. Validation' },
    { key: 'ready', label: '5. Ready' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              AI Document OCR &amp; Extraction
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload invoices, purchase orders, or bills for automated ledger extraction
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Workflow Stepper */}
          {stage !== 'idle' && (
            <div className="mb-6 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60">
              {STAGES.map((s, idx) => {
                const isCurrent = stage === s.key;
                const isPassed =
                  STAGES.findIndex((x) => x.key === stage) > idx || stage === 'ready';
                return (
                  <div key={s.key} className="flex items-center gap-1.5">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        isPassed
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-indigo-600 text-white animate-pulse'
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </span>
                    <span
                      className={`font-semibold ${
                        isCurrent
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : isPassed
                          ? 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                    {idx < STAGES.length - 1 && (
                      <span className="text-slate-300 dark:text-slate-600 ml-1">→</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {stage === 'idle' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-indigo-500 hover:bg-indigo-50/20 dark:border-slate-700 dark:hover:border-indigo-400 dark:hover:bg-indigo-950/20 transition-all"
            >
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <UploadCloud className="h-7 w-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Drag and drop your document here
              </h4>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Supports PDF, scanned images (PNG, JPG), Excel spreadsheets (.xlsx, .xls), and CSV files up to 25MB.
              </p>

              <label className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 cursor-pointer">
                <span>Browse Local Files</span>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls,.doc,.docx"
                />
              </label>
            </div>
          )}

          {stage !== 'idle' && stage !== 'ready' && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                AI Pipeline Processing: {selectedFile?.name}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Parsing document structure, identifying tax headers, line items, and vendor details...
              </p>
            </div>
          )}

          {stage === 'ready' && extractedData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                    Document Extracted Successfully ({Math.round(extractedData.confidenceScore * 100)}% Confidence)
                  </span>
                </div>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">
                  {selectedFile?.name}
                </span>
              </div>

              {/* Extraction Preview Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/60">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Vendor</span>
                    <span className="font-bold text-slate-900 dark:text-white">{extractedData.vendorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Invoice #</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{extractedData.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Invoice Date</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{extractedData.invoiceDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Vendor GST/Tax ID</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{extractedData.vendorGst}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
                  <span className="text-slate-500 font-semibold block mb-2">Extracted Line Items:</span>
                  <table className="w-full text-left text-[11px]">
                    <thead className="border-b border-slate-200 text-slate-400 dark:border-slate-700">
                      <tr>
                        <th className="pb-1">Item Description</th>
                        <th className="pb-1 text-center">Qty</th>
                        <th className="pb-1 text-right">Unit Price</th>
                        <th className="pb-1 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {extractedData.items.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="py-1.5 font-medium text-slate-800 dark:text-slate-200">{item.description}</td>
                          <td className="py-1.5 text-center">{item.qty}</td>
                          <td className="py-1.5 text-right font-mono">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 text-right font-mono font-semibold">₹{item.amount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="mt-3 border-t border-slate-200 pt-3 flex flex-col items-end gap-1 dark:border-slate-700 text-xs">
                  <div className="flex justify-between w-48 text-slate-600 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{extractedData.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between w-48 text-slate-600 dark:text-slate-400">
                    <span>Tax (GST 18%):</span>
                    <span className="font-mono">₹{extractedData.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between w-48 font-bold text-slate-900 dark:text-white border-t border-slate-300 pt-1 dark:border-slate-600">
                    <span>Total Amount:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      ₹{extractedData.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setStage('idle');
              setExtractedData(null);
            }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Upload Another
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Close
            </button>
            {stage === 'ready' && (
              <button
                type="button"
                onClick={handleConfirmAndPost}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
              >
                <span>Accept &amp; Create ERP Bill</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
