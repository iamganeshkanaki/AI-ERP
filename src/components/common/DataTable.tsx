import { useState, useMemo, ReactNode } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Download,
  Filter,
  Columns,
  LayoutGrid,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
} from 'lucide-react';
import { ColumnDef, TableFilterConfig } from '../../types/table';

interface DataTableProps<T extends { id: string }> {
  id?: string;
  title?: string;
  columns: ColumnDef<T>[];
  data: T[];
  filters?: TableFilterConfig[];
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  bulkActions?: {
    label: string;
    icon?: ReactNode;
    action: (selectedIds: string[]) => void;
    variant?: 'danger' | 'default';
  }[];
  headerActions?: ReactNode;
  initialSortKey?: string;
  initialSortDirection?: 'asc' | 'desc';
}

export function DataTable<T extends { id: string }>({
  id,
  title,
  columns,
  data,
  filters = [],
  searchPlaceholder = 'Search records...',
  onRowClick,
  bulkActions,
  headerActions,
  initialSortKey,
  initialSortDirection = 'asc',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey || columns[0]?.key);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(initialSortDirection);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    columns.forEach((c) => {
      init[c.key] = true;
    });
    return init;
  });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showColMenu, setShowColMenu] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter & Search logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matches = Object.values(item).some((val) => {
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
        if (!matches) return false;
      }

      // 2. Facet filters
      for (const [key, filterValue] of Object.entries(activeFilters)) {
        if (filterValue && filterValue !== 'all') {
          const itemVal = (item as any)[key];
          if (String(itemVal) !== filterValue) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, searchTerm, activeFilters]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = (a as any)[sortKey];
      const valB = (b as any)[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      const compare =
        typeof valA === 'number' && typeof valB === 'number'
          ? valA - valB
          : String(valA).localeCompare(String(valB));

      return sortDir === 'asc' ? compare : -compare;
    });
  }, [filteredData, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedData.map((d) => d.id));
    }
  };

  const toggleSelectOne = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  // CSV Export
  const handleExportCsv = () => {
    const exportCols = columns.filter((c) => visibleColumns[c.key]);
    const headers = exportCols.map((c) => `"${c.header}"`).join(',');
    const rows = sortedData.map((item) =>
      exportCols
        .map((c) => {
          const val = (item as any)[c.key];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title || 'export'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderedColumns = columns.filter((c) => visibleColumns[c.key]);

  return (
    <div
      id={id}
      className="rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Top Header & Toolbar */}
      <div className="border-b border-slate-200 p-4 sm:p-5 dark:border-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {sortedData.length} records total
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {headerActions}

            {/* View Mode Toggle (Table / Card) */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
                title="Table View"
                aria-label="Table View"
              >
                <TableIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                }`}
                title="Card View"
                aria-label="Card View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>

            {/* Export */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>

            {/* Column Visibility */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColMenu(!showColMenu)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Columns className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Columns</span>
              </button>

              {showColMenu && (
                <div className="absolute right-0 z-30 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  <div className="mb-1.5 px-2 text-xs font-semibold text-slate-400">
                    Toggle Columns
                  </div>
                  {columns.map((c) => (
                    <label
                      key={c.key}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[c.key] !== false}
                        onChange={(e) =>
                          setVisibleColumns((prev) => ({
                            ...prev,
                            [c.key]: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{c.header}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Bar & Search Input */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:focus:border-indigo-400 dark:focus:bg-slate-800"
            />
          </div>

          {filters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-medium text-slate-400">
                <Filter className="h-3 w-3" /> Filters:
              </span>
              {filters.map((f) => (
                <select
                  key={f.key}
                  value={activeFilters[f.key] || 'all'}
                  onChange={(e) => {
                    setActiveFilters((prev) => ({
                      ...prev,
                      [f.key]: e.target.value,
                    }));
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="all">{f.label}: All</option>
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ))}
            </div>
          )}
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
            <span>
              {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2">
              {bulkActions?.map((act, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => act.action(selectedIds)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold ${
                    act.variant === 'danger'
                      ? 'bg-rose-600 text-white hover:bg-rose-700'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {act.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-indigo-600 underline hover:text-indigo-800 dark:text-indigo-400"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Body or Mobile Card Grid */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="w-10 px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label="Select all rows"
                  >
                    {selectedIds.length > 0 && selectedIds.length === paginatedData.length ? (
                      <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>
                {renderedColumns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={`px-4 py-3 font-semibold uppercase tracking-wider ${
                      col.sortable !== false ? 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-white' : ''
                    } ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    style={{ width: col.width }}
                  >
                    <div
                      className={`inline-flex items-center gap-1 ${
                        col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : 'justify-start'
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable !== false && (
                        <span>
                          {sortKey === col.key ? (
                            sortDir === 'asc' ? (
                              <ChevronUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={renderedColumns.length + 1} className="py-12 text-center text-slate-400">
                    No matching records found
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, idx) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onRowClick && onRowClick(item)}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/20'
                          : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      } ${onRowClick ? 'cursor-pointer' : ''}`}
                    >
                      <td
                        className="px-4 py-3 text-center"
                        onClick={(e) => toggleSelectOne(item.id, e)}
                      >
                        <button
                          type="button"
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      {renderedColumns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-3 text-slate-700 dark:text-slate-300 ${
                            col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                          }`}
                        >
                          {col.render ? col.render(item, idx) : (item as any)[col.key]}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mobile Card Grid View */
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedData.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              No matching records found
            </div>
          ) : (
            paginatedData.map((item, idx) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => toggleSelectOne(item.id, e)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {isSelected ? (
                          <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                      <span className="font-mono text-xs font-semibold text-slate-500">
                        {item.id}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    {renderedColumns.slice(0, 4).map((col) => (
                      <div key={col.key} className="flex items-center justify-between border-b border-slate-100 pb-1 dark:border-slate-800">
                        <span className="text-slate-400">{col.header}:</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {col.render ? col.render(item, idx) : (item as any)[col.key]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 p-4 text-xs text-slate-500 sm:flex-row dark:border-slate-800 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="ml-2">
            Page {page} of {totalPages} ({sortedData.length} total)
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Prev
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
