export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  stockQty: number;
  reorderLevel: number;
  unitPrice: number;
  warehouse: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  creditLimit: number;
  outstandingBalance: number;
  status: 'Active' | 'On Hold' | 'Inactive';
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  payableBalance: number;
  rating: number;
  status: 'Verified' | 'Pending' | 'Blocked';
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  itemsCount: number;
  totalAmount: number;
  paymentStatus: 'Paid' | 'Partial' | 'Pending' | 'Overdue';
  fulfillmentStatus: 'Draft' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  issueDate?: string;
  expectedDate?: string;
  date?: string;
  totalAmount: number;
  status?: 'Draft' | 'Waiting Approval' | 'Approved' | 'Received' | 'Rejected';
  approvalStatus?: 'Draft' | 'Pending' | 'Approved' | 'Rejected';
  deliveryStatus?: 'Draft' | 'Ordered' | 'Received' | 'Pending';
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  partyName: string;
  type: 'Sales' | 'Purchase';
  issueDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Draft';
}

export interface Expense {
  id: string;
  expenseNumber: string;
  category: string;
  claimant: string;
  department: string;
  date: string;
  amount: number;
  receiptAttached: boolean;
  status: 'Pending' | 'Approved' | 'Paid' | 'Rejected';
}

export interface ApprovalItem {
  id: string;
  type: 'Purchase' | 'Expense' | 'Leave' | 'Payment' | 'Invoice' | 'Stock adjustment';
  referenceNumber: string;
  requestedBy: string;
  department: string;
  amount?: number;
  date: string;
  title: string;
  details: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  priority: 'High' | 'Medium' | 'Low';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: 'Approval' | 'Inventory' | 'Finance' | 'HR' | 'Sales' | 'Purchase' | 'System' | 'AI insights';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface DashboardKPIs {
  salesToday: number;
  salesGrowth: number;
  purchasesThisMonth: number;
  purchasesGrowth: number;
  revenue: number;
  revenueGrowth: number;
  expenses: number;
  expensesGrowth: number;
  receivables: number;
  payables: number;
  inventoryValue: number;
  pendingApprovalsCount: number;
}

export interface AIInsight {
  id: string;
  title: string;
  type: 'warning' | 'info' | 'positive' | 'action';
  description: string;
  metric?: string;
  actionLabel?: string;
  actionPrompt?: string;
}

export type ReportExportFormat = 'txt' | 'csv' | 'excel' | 'json' | 'pdf';

export interface ReportFilterRule {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'gte' | 'lte' | 'is_empty' | 'is_not_empty';
  value: string;
}

export interface ReportConfig {
  id?: string;
  title: string;
  description?: string;
  mode?: 'visual' | 'sql';
  includeQueryHeader?: boolean;
  dataset: 'sales_orders' | 'inventory_products' | 'purchase_orders' | 'invoices' | 'expenses' | 'approvals' | 'employees' | 'vendors' | 'customers';
  fields: string[];
  filters: ReportFilterRule[];
  dateRange: 'all' | 'today' | 'yesterday' | 'last_7_days' | 'this_month' | 'last_month' | 'this_quarter' | 'ytd' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  groupBy?: string;
  rawSql?: string;
}

export interface SavedReportTemplate {
  id: string;
  name: string;
  description: string;
  dataset: string;
  config: ReportConfig;
  defaultFormat: ReportExportFormat;
  createdAt: string;
  updatedAt: string;
}
