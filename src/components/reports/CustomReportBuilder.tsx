import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  Copy,
  Plus,
  Trash2,
  Filter,
  Columns,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Database,
  Code2,
  SlidersHorizontal,
  Search,
  ChevronDown,
  Bookmark,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import {
  DATASET_SCHEMAS,
  PRESET_REPORTS,
  executeReportQuery,
  generateSqlQueryFromConfig,
  QueryExecutionResult,
} from '../../services/reportQueryEngine';
import {
  exportToCSV,
  exportToExcel,
  exportToTXT,
  exportToJSON,
  printReportTable,
} from '../../utils/reportExporter';
import { ReportConfig, ReportFilterRule, ReportExportFormat } from '../../types/erp';

interface CustomReportBuilderProps {
  onAskAI?: (prompt: string) => void;
}

export const CustomReportBuilder: React.FC<CustomReportBuilderProps> = ({ onAskAI }) => {
  // Query Mode: Visual Builder vs SQL / DRF Query Editor
  const [queryMode, setQueryMode] = useState<'visual' | 'sql'>('visual');

  // Active Configuration
  const [config, setConfig] = useState<ReportConfig>({
    title: 'Custom Sales & Revenue Analysis',
    description: 'Configurable query report across sales orders and customer invoices',
    mode: 'visual',
    dataset: 'sales_orders',
    fields: ['orderNumber', 'customerName', 'date', 'totalAmount', 'paymentStatus', 'fulfillmentStatus'],
    filters: [],
    dateRange: 'all',
    sortBy: 'totalAmount',
    sortDirection: 'desc',
    limit: 50,
    rawSql: 'SELECT orderNumber, customerName, date, totalAmount, paymentStatus, fulfillmentStatus FROM sales_orders WHERE totalAmount > 50000 ORDER BY totalAmount DESC LIMIT 50;',
  });

  // Query Execution State
  const [executionResult, setExecutionResult] = useState<QueryExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [tableSearch, setTableSearch] = useState('');
  const [selectedExportFormat, setSelectedExportFormat] = useState<ReportExportFormat>('excel');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [includeQueryInExport, setIncludeQueryInExport] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState<{ id: string; name: string; config: ReportConfig }[]>(() => {
    try {
      const saved = localStorage.getItem('erp_saved_report_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Active Dataset Schema
  const currentSchema = DATASET_SCHEMAS[config.dataset] || DATASET_SCHEMAS.sales_orders;

  // Run query initially on mount
  useEffect(() => {
    handleExecuteQuery();
  }, []);

  const handleExecuteQuery = (overrideConfig?: ReportConfig) => {
    setIsExecuting(true);
    const activeConfig: ReportConfig = overrideConfig || {
      ...config,
      mode: queryMode,
    };
    setTimeout(() => {
      const result = executeReportQuery(activeConfig);
      setExecutionResult(result);
      setIsExecuting(false);
    }, 80);
  };

  // Switch between visual builder and SQL editor
  const handleSwitchMode = (mode: 'visual' | 'sql') => {
    if (mode === 'sql') {
      const syncSql = generateSqlQueryFromConfig(config);
      setConfig((prev) => ({
        ...prev,
        mode: 'sql',
        rawSql: syncSql,
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        mode: 'visual',
      }));
    }
    setQueryMode(mode);
  };

  // Change Dataset
  const handleSelectDataset = (datasetKey: ReportConfig['dataset']) => {
    const schema = DATASET_SCHEMAS[datasetKey];
    const newConfig: ReportConfig = {
      ...config,
      mode: queryMode,
      dataset: datasetKey,
      fields: [...schema.defaultFields],
      filters: [],
      sortBy: schema.defaultFields[0],
      sortDirection: 'desc',
      rawSql: `SELECT ${schema.defaultFields.slice(0, 5).join(', ')} FROM ${datasetKey} LIMIT 50;`,
    };
    setConfig(newConfig);
    handleExecuteQuery(newConfig);
  };

  // Toggle Field Selection
  const handleToggleField = (fieldKey: string) => {
    setConfig((prev) => {
      const exists = prev.fields.includes(fieldKey);
      let nextFields: string[];
      if (exists) {
        if (prev.fields.length <= 1) return prev; // Keep at least 1 field
        nextFields = prev.fields.filter((f) => f !== fieldKey);
      } else {
        nextFields = [...prev.fields, fieldKey];
      }
      return { ...prev, fields: nextFields };
    });
  };

  const handleSelectAllFields = () => {
    setConfig((prev) => ({
      ...prev,
      fields: currentSchema.fields.map((f) => f.key),
    }));
  };

  const handleResetDefaultFields = () => {
    setConfig((prev) => ({
      ...prev,
      fields: [...currentSchema.defaultFields],
    }));
  };

  // Filter Rule Management
  const handleAddFilter = () => {
    const newRule: ReportFilterRule = {
      id: `flt_${Date.now()}`,
      field: currentSchema.fields[0]?.key || 'id',
      operator: 'equals',
      value: '',
    };
    setConfig((prev) => ({
      ...prev,
      filters: [...prev.filters, newRule],
    }));
  };

  const handleUpdateFilter = (id: string, updates: Partial<ReportFilterRule>) => {
    setConfig((prev) => ({
      ...prev,
      filters: prev.filters.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }));
  };

  const handleRemoveFilter = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      filters: prev.filters.filter((f) => f.id !== id),
    }));
  };

  // Load Preset
  const handleLoadPreset = (presetId: string) => {
    const preset = PRESET_REPORTS.find((p) => p.id === presetId);
    if (preset) {
      setConfig({
        ...preset.config,
        rawSql: `SELECT ${preset.config.fields.join(', ')} FROM ${preset.config.dataset};`,
      });
      setSelectedExportFormat(preset.defaultFormat);
      setTimeout(() => {
        const result = executeReportQuery(preset.config);
        setExecutionResult(result);
      }, 50);
    }
  };

  // Save Template to localStorage
  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    const newTmpl = {
      id: `tmpl_${Date.now()}`,
      name: templateName.trim(),
      config: { ...config, title: templateName.trim() },
    };
    const updated = [newTmpl, ...savedTemplates];
    setSavedTemplates(updated);
    try {
      localStorage.setItem('erp_saved_report_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setShowSaveModal(false);
    setTemplateName('');
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = savedTemplates.filter((t) => t.id !== id);
    setSavedTemplates(updated);
    try {
      localStorage.setItem('erp_saved_report_templates', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Filter Result Table rows by search term
  const displayedRows = useMemo(() => {
    if (!executionResult?.data) return [];
    if (!tableSearch.trim()) return executionResult.data;
    const query = tableSearch.toLowerCase();
    return executionResult.data.filter((row) =>
      Object.values(row).some((val) => String(val).toLowerCase().includes(query))
    );
  }, [executionResult, tableSearch]);

  // Export handlers
  const handleExport = (format: ReportExportFormat) => {
    if (!executionResult?.data || executionResult.data.length === 0) {
      alert('No data rows available to export. Run the query first.');
      return;
    }

    const cleanTitle = (config.title || 'ERP_Report').replace(/\s+/g, '_');
    const filename = `${cleanTitle}_${new Date().toISOString().split('T')[0]}`;
    const meta = {
      title: config.title,
      datasetName: config.dataset,
      query: executionResult.executedQuery,
      totalRows: executionResult.data.length,
      includeQueryHeader: includeQueryInExport,
    };

    switch (format) {
      case 'csv':
        exportToCSV(executionResult.data, filename, meta);
        break;
      case 'excel':
        exportToExcel(executionResult.data, filename, meta);
        break;
      case 'txt':
        exportToTXT(executionResult.data, filename, meta);
        break;
      case 'json':
        exportToJSON(executionResult.data, filename, meta);
        break;
      case 'pdf':
        printReportTable(
          executionResult.data,
          config.title,
          includeQueryInExport ? executionResult.executedQuery : undefined
        );
        break;
    }
  };

  const handleCopyClipboard = () => {
    if (!executionResult?.data || executionResult.data.length === 0) return;
    const columns = Object.keys(executionResult.data[0]);
    const header = columns.join('\t');
    const rows = executionResult.data.map((r) => columns.map((c) => r[c]).join('\t')).join('\n');
    navigator.clipboard.writeText(header + '\n' + rows);
    setCopyFeedback('Table copied as TSV!');
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Presets Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase tracking-wider dark:bg-indigo-950 dark:text-indigo-300">
                <Database className="h-3 w-3" />
                <span>Query Engine &amp; Exporter</span>
              </span>
              <span className="text-[11px] text-slate-400">PostgreSQL / DRF ORM Compatible</span>
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
              Custom Report Builder &amp; Query Configurator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select datasets, configure custom query rules, execute queries, and convert data into selected file extensions (TXT, CSV, Excel, JSON).
            </p>
          </div>

          {/* Preset Queries & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Presets Dropdown */}
            <div className="relative">
              <select
                onChange={(e) => {
                  if (e.target.value) handleLoadPreset(e.target.value);
                }}
                defaultValue=""
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="" disabled>
                  ⚡ Load Enterprise Presets...
                </option>
                {PRESET_REPORTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Save as Template */}
            <button
              type="button"
              onClick={() => setShowSaveModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <Bookmark className="h-3.5 w-3.5 text-amber-500" />
              <span>Save Template</span>
            </button>

            {/* Ask AI with Context */}
            {onAskAI && (
              <button
                type="button"
                onClick={() =>
                  onAskAI(
                    `Analyze the report findings from dataset "${config.dataset}" with ${executionResult?.recordCount || 0} records. Identify patterns and key business takeaways.`
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask AI About Query</span>
              </button>
            )}
          </div>
        </div>

        {/* Saved Templates Badges */}
        {savedTemplates.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Saved Templates:
            </span>
            {savedTemplates.map((t) => (
              <div
                key={t.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                <button
                  type="button"
                  onClick={() => {
                    setConfig(t.config);
                    setTimeout(() => {
                      const res = executeReportQuery(t.config);
                      setExecutionResult(res);
                    }, 50);
                  }}
                  className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {t.name}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTemplate(t.id)}
                  className="text-slate-400 hover:text-rose-600"
                  title="Delete template"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Query Mode Switcher & Dataset Selector */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          {/* Query Mode Tabs */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => handleSwitchMode('visual')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                queryMode === 'visual'
                  ? 'bg-white text-indigo-700 shadow-2xs dark:bg-slate-900 dark:text-indigo-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Visual Query Builder</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('sql')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                queryMode === 'sql'
                  ? 'bg-white text-indigo-700 shadow-2xs dark:bg-slate-900 dark:text-indigo-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              <span>SQL / DRF Query Editor</span>
            </button>
          </div>

          {/* Execution Button (Always Prominent) */}
          <button
            type="button"
            onClick={() => handleExecuteQuery()}
            disabled={isExecuting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            <Play className={`h-4 w-4 fill-white ${isExecuting ? 'animate-spin' : ''}`} />
            <span>{isExecuting ? 'Executing Query...' : 'Execute Query'}</span>
          </button>
        </div>

        {/* Dataset Selector Carousel */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Select Data Model / Entity
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {(Object.keys(DATASET_SCHEMAS) as ReportConfig['dataset'][]).map((key) => {
              const ds = DATASET_SCHEMAS[key];
              const isSelected = config.dataset === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectDataset(key)}
                  className={`flex flex-col items-start rounded-xl p-2.5 text-left border transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <div className="font-semibold text-xs leading-tight truncate w-full">{ds.name}</div>
                  <div className="mt-1 text-[10px] font-mono text-slate-400 truncate w-full">
                    {ds.getData().length} records
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MODE 1: VISUAL QUERY BUILDER */}
        {queryMode === 'visual' && (
          <div className="mt-6 space-y-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            {/* Columns / Fields Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Columns className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Choose Report Columns / Fields ({config.fields.length} selected)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllFields}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    type="button"
                    onClick={handleResetDefaultFields}
                    className="text-[11px] font-semibold text-slate-500 hover:underline dark:text-slate-400"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {currentSchema.fields.map((f) => {
                  const isChecked = config.fields.includes(f.key);
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => handleToggleField(f.key)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="h-3 w-3 rounded border-slate-300 text-indigo-600 pointer-events-none"
                      />
                      <span>{f.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({f.type})</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filter Conditions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <Filter className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Filter Conditions (WHERE Clauses)</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddFilter}
                  className="inline-flex items-center gap-1 rounded-lg border border-dashed border-indigo-300 bg-indigo-50/50 px-2.5 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-indigo-300"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Filter Rule</span>
                </button>
              </div>

              {config.filters.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-slate-800">
                  No filter rules applied. Showing all records. Click &quot;Add Filter Rule&quot; to narrow down data.
                </div>
              ) : (
                <div className="space-y-2">
                  {config.filters.map((rule, idx) => (
                    <div
                      key={rule.id}
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-800/60 text-xs"
                    >
                      <span className="font-mono text-slate-400 text-[11px] font-semibold w-8">
                        #{idx + 1}
                      </span>

                      {/* Field Selection */}
                      <select
                        value={rule.field}
                        onChange={(e) => handleUpdateFilter(rule.id, { field: e.target.value })}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        {currentSchema.fields.map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label} ({f.key})
                          </option>
                        ))}
                      </select>

                      {/* Operator Selection */}
                      <select
                        value={rule.operator}
                        onChange={(e) =>
                          handleUpdateFilter(rule.id, {
                            operator: e.target.value as ReportFilterRule['operator'],
                          })
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="equals">Equals (=)</option>
                        <option value="not_equals">Not Equals (!=)</option>
                        <option value="contains">Contains (LIKE)</option>
                        <option value="greater_than">Greater Than (&gt;)</option>
                        <option value="gte">Greater Than or Equal (&gt;=)</option>
                        <option value="less_than">Less Than (&lt;)</option>
                        <option value="lte">Less Than or Equal (&lt;=)</option>
                        <option value="is_empty">Is Empty / Null</option>
                        <option value="is_not_empty">Is Not Empty</option>
                      </select>

                      {/* Value Input */}
                      {!['is_empty', 'is_not_empty'].includes(rule.operator) && (
                        <input
                          type="text"
                          value={rule.value}
                          onChange={(e) => handleUpdateFilter(rule.id, { value: e.target.value })}
                          placeholder="Filter value..."
                          className="flex-1 min-w-[140px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      )}

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveFilter(rule.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                        title="Remove rule"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sorting, Date Ranges, and Limit Rows */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Date Range */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Date Range Constraint
                </label>
                <select
                  value={config.dateRange}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      dateRange: e.target.value as ReportConfig['dateRange'],
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="all">All Available Records</option>
                  <option value="today">Today Only</option>
                  <option value="last_7_days">Last 7 Days</option>
                  <option value="this_month">This Month</option>
                  <option value="custom">Custom Date Range...</option>
                </select>
              </div>

              {/* Sort Column */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Sort By Column
                </label>
                <select
                  value={config.sortBy || ''}
                  onChange={(e) => setConfig((prev) => ({ ...prev, sortBy: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {currentSchema.fields.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Direction */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Sort Direction
                </label>
                <select
                  value={config.sortDirection || 'asc'}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      sortDirection: e.target.value as 'asc' | 'desc',
                    }))
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="asc">Ascending (A-Z, 0-9)</option>
                  <option value="desc">Descending (Z-A, High to Low)</option>
                </select>
              </div>

              {/* Row Limit */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Max Rows (LIMIT)
                </label>
                <select
                  value={config.limit || 50}
                  onChange={(e) => setConfig((prev) => ({ ...prev, limit: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="10">Top 10 Records</option>
                  <option value="25">Top 25 Records</option>
                  <option value="50">Top 50 Records</option>
                  <option value="100">Top 100 Records</option>
                  <option value="500">Top 500 Records</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: SQL / DRF QUERY EDITOR */}
        {queryMode === 'sql' && (
          <div className="mt-6 space-y-4 pt-5 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Code2 className="h-4 w-4 text-indigo-600" />
                  <span>SQL / DRF Query Statement</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  Target Schema: {config.dataset}
                </span>
              </div>
              <textarea
                rows={4}
                value={config.rawSql}
                onChange={(e) => setConfig((prev) => ({ ...prev, rawSql: e.target.value }))}
                placeholder="SELECT column1, column2 FROM dataset WHERE condition..."
                className="w-full rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-emerald-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                You can write SQL queries e.g. <code>SELECT * FROM sales_orders WHERE totalAmount &gt; 50000;</code> or query other tables like <code>inventory_products</code>, <code>invoices</code>, <code>purchase_orders</code>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Conversion & Multi-Format Export Command Center */}
      <div className="rounded-2xl border border-indigo-100 bg-linear-to-r from-indigo-50/50 via-white to-slate-50 p-4 sm:p-5 dark:border-indigo-950/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Export &amp; File Conversion Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Convert live query data into your required file extension format:
              </p>
            </div>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Excel (.xls/.xlsx compatible) */}
            <button
              type="button"
              onClick={() => handleExport('excel')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Export Excel (.xls)</span>
            </button>

            {/* CSV */}
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs"
            >
              <Download className="h-4 w-4 text-sky-600" />
              <span>Export CSV</span>
            </button>

            {/* TXT */}
            <button
              type="button"
              onClick={() => handleExport('txt')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300 shadow-2xs"
            >
              <FileText className="h-4 w-4 text-amber-600" />
              <span>Export TXT</span>
            </button>

            {/* JSON */}
            <button
              type="button"
              onClick={() => handleExport('json')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-bold text-purple-800 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300 shadow-2xs"
            >
              <Code2 className="h-4 w-4 text-purple-600" />
              <span>Export JSON</span>
            </button>

            {/* Print / PDF */}
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs"
            >
              <Printer className="h-4 w-4 text-slate-600" />
              <span>Print / PDF</span>
            </button>

            {/* Copy TSV */}
            <button
              type="button"
              onClick={handleCopyClipboard}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs"
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4 text-slate-600" />
              <span>{copyFeedback || 'Copy Data'}</span>
            </button>
          </div>
        </div>

        {/* Downloaded File Header & Query Configuration Toggle */}
        <div className="mt-3.5 pt-3 border-t border-indigo-100/70 dark:border-indigo-950/50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeQueryInExport}
              onChange={(e) => setIncludeQueryInExport(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Include Executed SQL Query in Downloaded File Header
            </span>
          </label>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {includeQueryInExport
              ? '✓ Query statement and execution timestamp will be included in report file header'
              : '✓ Clean data export: file contains pure tabular data rows without SQL query comments'}
          </span>
        </div>
      </div>

      {/* Query Execution Status Banner */}
      {executionResult && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-900 dark:text-white">Query Status:</span>
            <span className="font-semibold text-emerald-600">200 OK (Executed)</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500">Execution Time:</span>
            <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
              {executionResult.executionTimeMs}ms
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500">Rows Returned:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {executionResult.recordCount} records
            </span>
          </div>

          <div className="flex items-center gap-2 max-w-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Executed:
            </span>
            <span
              className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/60 truncate max-w-xs sm:max-w-sm"
              title={executionResult.executedQuery}
            >
              {executionResult.executedQuery}
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(executionResult.executedQuery);
                setCopyFeedback('Query copied!');
                setTimeout(() => setCopyFeedback(null), 2000);
              }}
              className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
              title="Copy executed query"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Live Data Results Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        {/* Table Filter & Search Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-900 dark:text-white">
              Query Results Ledger
            </span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {displayedRows.length} of {executionResult?.recordCount || 0} rows
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search in returned data..."
              className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Results Data Table */}
        <div className="overflow-x-auto max-h-[500px]">
          {displayedRows.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching records found for the executed query configuration.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <tr>
                  <th className="px-3 py-2.5 font-bold text-[11px] text-slate-400 w-10 text-center">
                    #
                  </th>
                  {Object.keys(displayedRows[0]).map((col) => (
                    <th key={col} className="px-4 py-2.5 font-bold text-[11px] capitalize whitespace-nowrap">
                      {col.replace(/([A-Z])/g, ' $1')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-indigo-50/30 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-3 py-2 text-center text-[10px] font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    {Object.keys(displayedRows[0]).map((col) => {
                      const val = row[col];
                      const isNumber = typeof val === 'number';
                      const isStatus =
                        col.toLowerCase().includes('status') ||
                        ['Paid', 'Pending', 'Unpaid', 'Low Stock', 'In Stock', 'Overdue'].includes(
                          String(val)
                        );

                      let badgeClass = 'text-slate-700 dark:text-slate-300';
                      if (isStatus) {
                        if (['Paid', 'In Stock', 'Approved', 'Delivered', 'Active'].includes(String(val))) {
                          badgeClass =
                            'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold text-[10px]';
                        } else if (
                          ['Pending', 'Waiting Approval', 'Partial', 'Low Stock'].includes(String(val))
                        ) {
                          badgeClass =
                            'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold text-[10px]';
                        } else if (['Overdue', 'Out of Stock', 'Rejected'].includes(String(val))) {
                          badgeClass =
                            'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:border-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold text-[10px]';
                        }
                      }

                      return (
                        <td
                          key={col}
                          className={`px-4 py-2 whitespace-nowrap ${
                            isNumber ? 'font-mono text-right' : ''
                          }`}
                        >
                          {isStatus ? (
                            <span className={badgeClass}>{String(val)}</span>
                          ) : isNumber ? (
                            col.toLowerCase().includes('amount') ||
                            col.toLowerCase().includes('price') ||
                            col.toLowerCase().includes('salary') ? (
                              <span className="font-semibold text-slate-900 dark:text-white">
                                ₹{val.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              val.toLocaleString('en-IN')
                            )
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Aggregates Summary Footer */}
        {executionResult && executionResult.summaryColumns.length > 0 && (
          <div className="border-t border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/80">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                Computed Aggregates:
              </span>
              {executionResult.summaryColumns.map((sc) => (
                <div key={sc.key} className="flex items-center gap-1.5">
                  <span className="capitalize">{sc.key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    Total: ₹{sc.sum?.toLocaleString('en-IN')} (Avg: ₹{sc.avg?.toLocaleString('en-IN')})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal: Save Report Template */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Save Report as Template
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Give this query configuration a recognizable name to run and export it again anytime.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Monthly High-Value Sales Audit"
                  className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
