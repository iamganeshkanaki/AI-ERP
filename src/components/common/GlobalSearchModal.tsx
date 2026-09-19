import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  TrendingUp,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  FileText,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { mockProducts, mockSalesOrders, mockPurchaseOrders, mockInvoices, mockEmployees } from '../../services/mockData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onOpenAI?: (prompt?: string) => void;
}

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  module: string;
  category: 'Sales' | 'Purchase' | 'Inventory' | 'Finance' | 'HR' | 'Reports' | 'Approvals';
  path: string;
  badge?: string;
  roleRequired?: string[];
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAI,
}) => {
  const { hasRole } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global keydown handler for Escape & Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Indexed searchable records
  const allSearchableItems: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // Products
    mockProducts.forEach((p) => {
      items.push({
        id: `prod-${p.id}`,
        title: p.name,
        subtitle: `SKU: ${p.sku} • Stock: ${p.stockQty} • Warehouse: ${p.warehouse}`,
        module: 'Inventory',
        category: 'Inventory',
        path: '/inventory',
        badge: `₹${p.unitPrice}`,
        roleRequired: ['Admin', 'Manager', 'Inventory', 'Purchase'],
      });
    });

    // Sales Orders
    mockSalesOrders.forEach((s) => {
      items.push({
        id: `so-${s.id}`,
        title: `${s.orderNumber} - ${s.customerName}`,
        subtitle: `₹${s.totalAmount.toLocaleString('en-IN')} • Status: ${s.fulfillmentStatus}`,
        module: 'Sales',
        category: 'Sales',
        path: '/sales',
        badge: s.paymentStatus,
        roleRequired: ['Admin', 'Manager', 'Sales', 'Finance'],
      });
    });

    // Purchase Orders
    mockPurchaseOrders.forEach((p) => {
      items.push({
        id: `po-${p.id}`,
        title: `${p.poNumber} - ${p.vendorName}`,
        subtitle: `₹${p.totalAmount.toLocaleString('en-IN')} • ${p.deliveryStatus}`,
        module: 'Purchase',
        category: 'Purchase',
        path: '/purchase',
        badge: p.approvalStatus,
        roleRequired: ['Admin', 'Manager', 'Purchase', 'Finance'],
      });
    });

    // Invoices
    mockInvoices.forEach((inv) => {
      items.push({
        id: `inv-${inv.id}`,
        title: `${inv.invoiceNumber} - ${inv.partyName}`,
        subtitle: `₹${inv.amount.toLocaleString('en-IN')} • Due: ${inv.dueDate}`,
        module: 'Finance',
        category: 'Finance',
        path: '/finance',
        badge: inv.status,
        roleRequired: ['Admin', 'Manager', 'Finance'],
      });
    });

    // Employees
    mockEmployees.forEach((emp) => {
      items.push({
        id: `emp-${emp.id}`,
        title: emp.name,
        subtitle: `${emp.role} • ${emp.dept} • ${emp.email}`,
        module: 'HR',
        category: 'HR',
        path: '/hr',
        badge: emp.status,
        roleRequired: ['Admin', 'Manager', 'HR'],
      });
    });

    // Standard Modules & Reports
    items.push(
      {
        id: 'mod-reports',
        title: 'Monthly Sales & Revenue Report',
        subtitle: 'Executive revenue breakdown, product margins, and regional sales velocity',
        module: 'Reports',
        category: 'Reports',
        path: '/reports',
        badge: 'Analytics',
      },
      {
        id: 'mod-aging',
        title: 'Accounts Receivable Aging Report',
        subtitle: '30/60/90 days outstanding customer debt ledger and collection metrics',
        module: 'Reports',
        category: 'Finance',
        path: '/reports',
        badge: 'Cashflow',
      },
      {
        id: 'mod-approvals',
        title: 'Enterprise Approval Center',
        subtitle: 'Sign off on pending POs, reimbursement claims, and staff leave',
        module: 'Approvals',
        category: 'Approvals',
        path: '/approvals',
        badge: 'Action',
      }
    );

    return items;
  }, []);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    const authorized = allSearchableItems.filter((item) => {
      if (!item.roleRequired) return true;
      return hasRole(item.roleRequired as any);
    });

    if (!q) return authorized.slice(0, 8);

    return authorized
      .filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q) ||
          item.module.toLowerCase().includes(q)
      )
      .slice(0, 15);
  }, [allSearchableItems, query, hasRole]);

  const handleSelect = (item: SearchResultItem) => {
    onNavigate(item.path);
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sales':
        return <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Purchase':
        return <ShoppingCart className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
      case 'Inventory':
        return <Package className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'Finance':
        return <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'HR':
        return <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'Approvals':
        return <CheckCircle2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case 'Reports':
      default:
        return <BarChart3 className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers, vendors, products, invoices, POs, reports... (Esc to close)"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                No matching records found for &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1">Try searching for an SKU code, customer name, PO number, or report name.</p>
              <button
                type="button"
                onClick={() => {
                  if (onOpenAI) {
                    onOpenAI(query ? `Search ERP records for: ${query}` : undefined);
                  }
                  onClose();
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask AI Copilot instead</span>
              </button>
            </div>
          ) : (
            filteredResults.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`group flex items-center justify-between gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  idx === selectedIndex
                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-800 shadow-2xs">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {item.title}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {item.module}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.badge && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                      {item.badge}
                    </span>
                  )}
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Quick Tips */}
        <div className="border-t border-slate-200 px-4 py-2.5 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/90 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="rounded bg-white px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-mono text-[10px]">↵</kbd> to open</span>
            <span><kbd className="rounded bg-white px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-mono text-[10px]">Esc</kbd> to close</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (onOpenAI) {
                onOpenAI(query);
              }
              onClose();
            }}
            className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Sparkles className="h-3 w-3" />
            <span>Search via AI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
