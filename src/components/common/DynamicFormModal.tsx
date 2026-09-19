import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react';

export interface FormFieldDef {
  key: string;
  name?: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'currency'
    | 'date'
    | 'select'
    | 'textarea'
    | 'checkbox'
    | 'toggle'
    | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: any;
  helpText?: string;
}

export type FormFieldConfig = FormFieldDef;

interface DynamicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  description?: string;
  fields: FormFieldDef[];
  onSubmit: (values: Record<string, any>) => Promise<void>;
  submitLabel?: string;
}

export const DynamicFormModal: React.FC<DynamicFormModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  description,
  fields,
  onSubmit,
  submitLabel = 'Save Record',
}) => {
  const modalSubtitle = subtitle || description;
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      const fieldKey = f.key || f.name || '';
      initial[fieldKey] =
        f.defaultValue !== undefined
          ? f.defaultValue
          : f.type === 'checkbox' || f.type === 'toggle'
          ? false
          : '';
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && (formData[f.key] === '' || formData[f.key] === undefined || formData[f.key] === null)) {
        newErrors[f.key] = `${f.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  const handleClose = () => {
    if (isDirty && !window.confirm('You have unsaved form changes. Are you sure you want to discard them?')) {
      return;
    }
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      await onSubmit(formData);
      setSuccessMessage('Record successfully created and synchronized.');
      setTimeout(() => {
        setSuccessMessage(null);
        setIsDirty(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrors({ global: err.message || 'Failed to submit form data.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {errors.global && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errors.global}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => {
              const isColSpan2 = f.type === 'textarea' || f.type === 'file' || f.helpText;
              return (
                <div key={f.key} className={isColSpan2 ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {f.label} {f.required && <span className="text-rose-500">*</span>}
                  </label>

                  {f.type === 'text' && (
                    <input
                      type="text"
                      value={formData[f.key] || ''}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className={`w-full rounded-lg border px-3 py-2 text-xs focus:outline-none focus:ring-1 ${
                        errors[f.key]
                          ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-500'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-indigo-500'
                      }`}
                    />
                  )}

                  {f.type === 'number' && (
                    <input
                      type="number"
                      value={formData[f.key] ?? ''}
                      onChange={(e) => handleChange(f.key, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={f.placeholder}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  )}

                  {f.type === 'currency' && (
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400 font-mono">₹</span>
                      <input
                        type="number"
                        value={formData[f.key] ?? ''}
                        onChange={(e) => handleChange(f.key, e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder={f.placeholder || '0.00'}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-7 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {f.type === 'date' && (
                    <input
                      type="date"
                      value={formData[f.key] || ''}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  )}

                  {f.type === 'select' && (
                    <select
                      value={formData[f.key] || ''}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Select option...</option>
                      {f.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {f.type === 'textarea' && (
                    <textarea
                      rows={3}
                      value={formData[f.key] || ''}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  )}

                  {f.type === 'file' && (
                    <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <Upload className="h-6 w-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Click to select invoice, bill or PO file</span>
                      <span className="text-[10px] text-slate-400">PDF, PNG, JPG, CSV (Max 15MB)</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleChange(f.key, file.name);
                        }}
                      />
                      {formData[f.key] && (
                        <span className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                          Selected: {formData[f.key]}
                        </span>
                      )}
                    </label>
                  )}

                  {f.type === 'checkbox' && (
                    <label className="flex items-center gap-2 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        checked={!!formData[f.key]}
                        onChange={(e) => handleChange(f.key, e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-700 dark:text-slate-300">{f.placeholder || f.label}</span>
                    </label>
                  )}

                  {f.type === 'toggle' && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-600 dark:text-slate-400">{f.placeholder || 'Enable status'}</span>
                      <button
                        type="button"
                        onClick={() => handleChange(f.key, !formData[f.key])}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                          formData[f.key] ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform mt-0.5 ml-0.5 ${
                            formData[f.key] ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {errors[f.key] && (
                    <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors[f.key]}</p>
                  )}
                  {f.helpText && (
                    <p className="mt-1 text-[11px] text-slate-400">{f.helpText}</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{submitLabel}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
