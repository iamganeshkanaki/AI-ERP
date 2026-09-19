import React, { useState } from 'react';
import { FileText, Upload, CheckCircle2, Eye, Download, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { Badge } from '../common/Badge';

interface DocumentsViewProps {
  onOpenUpload: () => void;
  onAskAI: (prompt: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  onOpenUpload,
  onAskAI,
}) => {
  const documents = [
    {
      id: 'DOC-901',
      name: 'ABC_Traders_Inv_90812.pdf',
      type: 'Vendor Invoice (PDF)',
      vendor: 'ABC Traders Ltd',
      amount: 185000,
      date: '2026-09-18',
      status: 'Extracted',
      confidence: '98%',
    },
    {
      id: 'DOC-902',
      name: 'Apex_Q3_Stock_Audit.xlsx',
      type: 'Inventory Count (Excel)',
      vendor: 'Central Warehouse',
      amount: 4520000,
      date: '2026-09-17',
      status: 'Processed',
      confidence: '99%',
    },
    {
      id: 'DOC-903',
      name: 'Delivery_Receipt_Scan_441.png',
      type: 'Goods Receipt Note (Image)',
      vendor: 'Precision Components Corp',
      amount: 94000,
      date: '2026-09-15',
      status: 'Extracted',
      confidence: '94%',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Document Hub &amp; AI Invoice OCR</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload PDFs, scans, and spreadsheets for automated data extraction and ledger posting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAskAI('Check unposted OCR documents and reconcile vendor invoices')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>AI Document Reconciliation</span>
          </button>
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Upload Drag-and-Drop Callout */}
      <div
        onClick={onOpenUpload}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 p-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/60 dark:border-indigo-900/60 dark:bg-indigo-950/20"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs mb-3">
          <Upload className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Drop invoices, bills, or spreadsheets here for automated extraction
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Accepts PDF, Excel (.xlsx, .xls), CSV, and scanned images (PNG, JPG). Calls DRF OCR backend.
        </p>
      </div>

      {/* Processed Archive Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Recently Processed Documents
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-400 dark:border-slate-700">
              <tr>
                <th className="pb-2">Document ID</th>
                <th className="pb-2">Filename</th>
                <th className="pb-2">Classification</th>
                <th className="pb-2">Entity / Vendor</th>
                <th className="pb-2 text-right">Extracted Total (₹)</th>
                <th className="pb-2 text-center">Confidence</th>
                <th className="pb-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {doc.id}
                  </td>
                  <td className="py-2.5 font-semibold text-slate-900 dark:text-white">
                    {doc.name}
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300">{doc.type}</td>
                  <td className="py-2.5 text-slate-700 dark:text-slate-300">{doc.vendor}</td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                    ₹{doc.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 text-center font-mono text-emerald-600 font-bold">
                    {doc.confidence}
                  </td>
                  <td className="py-2.5 text-center">
                    <Badge variant="success">{doc.status}</Badge>
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
