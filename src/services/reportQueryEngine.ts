import { ReportConfig, ReportFilterRule } from '../types/erp';
import {
  mockSalesOrders,
  mockProducts,
  mockPurchaseOrders,
  mockApprovals,
} from './mockData';

export interface DatasetField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'status' | 'boolean';
  options?: string[];
}

export interface DatasetSchema {
  id: ReportConfig['dataset'];
  name: string;
  description: string;
  defaultFields: string[];
  fields: DatasetField[];
  getData: () => any[];
}

// Pre-packaged rich enterprise data for datasets
const mockInvoices = [
  { id: 'INV-1001', invoiceNumber: 'INV-2026-1001', partyName: 'Nexis Aerospace', type: 'Sales', issueDate: '2026-09-12', dueDate: '2026-10-12', amount: 420000, taxAmount: 75600, status: 'Paid' },
  { id: 'INV-1002', invoiceNumber: 'INV-2026-1002', partyName: 'Quantum Solar Systems', type: 'Sales', issueDate: '2026-09-14', dueDate: '2026-10-14', amount: 380000, taxAmount: 68400, status: 'Unpaid' },
  { id: 'INV-1003', invoiceNumber: 'INV-2026-1003', partyName: 'Zenith Marine Works', type: 'Sales', issueDate: '2026-08-15', dueDate: '2026-09-15', amount: 760000, taxAmount: 136800, status: 'Overdue' },
  { id: 'INV-1004', invoiceNumber: 'INV-2026-1004', partyName: 'ABC Traders Ltd', type: 'Purchase', issueDate: '2026-09-10', dueDate: '2026-09-30', amount: 120000, taxAmount: 21600, status: 'Unpaid' },
  { id: 'INV-1005', invoiceNumber: 'INV-2026-1005', partyName: 'Continental Steels', type: 'Purchase', issueDate: '2026-09-01', dueDate: '2026-09-20', amount: 310000, taxAmount: 55800, status: 'Paid' },
  { id: 'INV-1006', invoiceNumber: 'INV-2026-1006', partyName: 'Orion Advanced Robotics', type: 'Sales', issueDate: '2026-09-18', dueDate: '2026-10-18', amount: 185000, taxAmount: 33300, status: 'Paid' },
  { id: 'INV-1007', invoiceNumber: 'INV-2026-1007', partyName: 'Vanguard Instruments', type: 'Sales', issueDate: '2026-09-16', dueDate: '2026-10-16', amount: 94000, taxAmount: 16920, status: 'Unpaid' },
];

const mockExpenses = [
  { id: 'EXP-01', expenseNumber: 'EXP-2026-001', category: 'Travel & Lodging', claimant: 'Ganesh Kanaki', department: 'Executive', date: '2026-09-14', amount: 34500, status: 'Approved', paymentMethod: 'Corporate Card' },
  { id: 'EXP-02', expenseNumber: 'EXP-2026-002', category: 'Software & Cloud', claimant: 'Alex Kumar', department: 'Engineering', date: '2026-09-10', amount: 89000, status: 'Approved', paymentMethod: 'Bank Wire' },
  { id: 'EXP-03', expenseNumber: 'EXP-2026-003', category: 'Plant Utilities', claimant: 'Robert Fox', department: 'Operations', date: '2026-09-05', amount: 142000, status: 'Paid', paymentMethod: 'Direct Debit' },
  { id: 'EXP-04', expenseNumber: 'EXP-2026-004', category: 'Marketing & PR', claimant: 'Elena Rostova', department: 'Sales', date: '2026-09-17', amount: 56000, status: 'Pending', paymentMethod: 'Corporate Card' },
  { id: 'EXP-05', expenseNumber: 'EXP-2026-005', category: 'Office Supplies', claimant: 'Lisa Patel', department: 'HR', date: '2026-09-18', amount: 12400, status: 'Pending', paymentMethod: 'Reimbursement' },
];

const mockEmployees = [
  { id: 'EMP-01', code: 'APX-901', name: 'Ganesh Kanaki', department: 'Management', role: 'Executive Lead', status: 'Active', salary: 185000, joinDate: '2023-01-15', attendanceRate: '98.5%' },
  { id: 'EMP-02', code: 'APX-902', name: 'David Vance', department: 'Procurement', role: 'Purchase Manager', status: 'Active', salary: 110000, joinDate: '2023-06-01', attendanceRate: '96.2%' },
  { id: 'EMP-03', code: 'APX-903', name: 'Priya Sharma', department: 'Engineering', role: 'Senior R&D Lead', status: 'Active', salary: 145000, joinDate: '2022-11-20', attendanceRate: '99.1%' },
  { id: 'EMP-04', code: 'APX-904', name: 'Sandra Bullock', department: 'Finance', role: 'Senior Accountant', status: 'Active', salary: 120000, joinDate: '2024-02-10', attendanceRate: '97.4%' },
  { id: 'EMP-05', code: 'APX-905', name: 'Marcus Sterling', department: 'Logistics', role: 'Warehouse Supervisor', status: 'On Leave', salary: 85000, joinDate: '2024-08-01', attendanceRate: '93.8%' },
  { id: 'EMP-06', code: 'APX-906', name: 'Linda Chen', department: 'Sales', role: 'Account Executive', status: 'Active', salary: 98000, joinDate: '2024-04-12', attendanceRate: '97.8%' },
];

const mockCustomers = [
  { id: 'CUST-01', name: 'Nexis Aerospace Dynamics', tier: 'Enterprise Tier 1', contactPerson: 'Arun Verma', email: 'arun@nexisaero.com', phone: '+91 98200 12345', creditLimit: 5000000, outstandingBalance: 420000, city: 'Bengaluru' },
  { id: 'CUST-02', name: 'Quantum Solar Systems Ltd', tier: 'Corporate Tier 2', contactPerson: 'Deepa Mehta', email: 'mehta@quantumsolar.in', phone: '+91 98450 67890', creditLimit: 2500000, outstandingBalance: 380000, city: 'Hyderabad' },
  { id: 'CUST-03', name: 'Orion Advanced Robotics', tier: 'Enterprise Tier 1', contactPerson: 'Rohan Deshmukh', email: 'rohan@orionrobotics.com', phone: '+91 98110 54321', creditLimit: 4000000, outstandingBalance: 0, city: 'Pune' },
  { id: 'CUST-04', name: 'Zenith Marine Works', tier: 'Standard Tier 3', contactPerson: 'Capt. Nair', email: 'nair@zenithmarine.com', phone: '+91 98480 99887', creditLimit: 1500000, outstandingBalance: 760000, city: 'Kochi' },
  { id: 'CUST-05', name: 'Vanguard Instruments', tier: 'Standard Tier 3', contactPerson: 'Simran Kaur', email: 'simran@vanguardinst.in', phone: '+91 98720 11223', creditLimit: 1000000, outstandingBalance: 94000, city: 'Chandigarh' },
];

const mockVendors = [
  { id: 'VND-01', name: 'ABC Traders & Supplies', category: 'Sensors & Electrical', rating: '4.8 / 5.0', paymentTerms: 'Net 30', activeOrders: 2, totalSpendYTD: 1450000, contactEmail: 'supply@abctraders.com' },
  { id: 'VND-02', name: 'MicroChip Foundry Int', category: 'Semiconductors', rating: '4.9 / 5.0', paymentTerms: 'Net 45', activeOrders: 1, totalSpendYTD: 3800000, contactEmail: 'b2b@microchipfoundry.com' },
  { id: 'VND-03', name: 'Continental Steels Corp', category: 'Metals & Alloys', rating: '4.5 / 5.0', paymentTerms: 'Net 15', activeOrders: 3, totalSpendYTD: 2900000, contactEmail: 'orders@continentalsteels.com' },
  { id: 'VND-04', name: 'HydraTech Fluid Dynamics', category: 'Hydraulics & Valves', rating: '4.7 / 5.0', paymentTerms: 'Net 30', activeOrders: 1, totalSpendYTD: 950000, contactEmail: 'sales@hydratech.com' },
];

export const DATASET_SCHEMAS: Record<ReportConfig['dataset'], DatasetSchema> = {
  sales_orders: {
    id: 'sales_orders',
    name: 'Sales Orders Ledger',
    description: 'Customer sales orders, fulfillment states, billing amounts, and dates',
    defaultFields: ['orderNumber', 'customerName', 'date', 'totalAmount', 'paymentStatus', 'fulfillmentStatus'],
    fields: [
      { key: 'orderNumber', label: 'Order #', type: 'string' },
      { key: 'customerName', label: 'Customer Name', type: 'string' },
      { key: 'date', label: 'Order Date', type: 'date' },
      { key: 'itemsCount', label: 'Item Count', type: 'number' },
      { key: 'totalAmount', label: 'Gross Amount (₹)', type: 'number' },
      { key: 'paymentStatus', label: 'Payment Status', type: 'status', options: ['Paid', 'Pending', 'Partial', 'Overdue'] },
      { key: 'fulfillmentStatus', label: 'Fulfillment Status', type: 'status', options: ['Confirmed', 'Shipped', 'Delivered', 'Cancelled'] },
    ],
    getData: () => mockSalesOrders,
  },
  inventory_products: {
    id: 'inventory_products',
    name: 'Inventory Stock & Valuation',
    description: 'Warehouse SKUs, physical stock quantities, unit valuation, and reorder levels',
    defaultFields: ['sku', 'name', 'category', 'stockQty', 'reorderLevel', 'unitPrice', 'status', 'warehouse'],
    fields: [
      { key: 'sku', label: 'SKU Code', type: 'string' },
      { key: 'name', label: 'Product Title', type: 'string' },
      { key: 'category', label: 'Category', type: 'string', options: ['Electronics', 'Mechanical', 'Hydraulics', 'Automation', 'Raw Materials', 'Power & Motors'] },
      { key: 'stockQty', label: 'On Hand Qty', type: 'number' },
      { key: 'reorderLevel', label: 'Safety Reorder Level', type: 'number' },
      { key: 'unitPrice', label: 'Unit Price (₹)', type: 'number' },
      { key: 'warehouse', label: 'Warehouse Hub', type: 'string', options: ['Main Central Hub', 'West Coast Depo', 'East Bay Logistics'] },
      { key: 'status', label: 'Stock Status', type: 'status', options: ['In Stock', 'Low Stock', 'Out of Stock'] },
      { key: 'lastUpdated', label: 'Last Count Date', type: 'date' },
    ],
    getData: () => mockProducts,
  },
  purchase_orders: {
    id: 'purchase_orders',
    name: 'Purchase Orders & Requisitions',
    description: 'Procurement POs, vendor allocations, issue dates, and approval milestones',
    defaultFields: ['poNumber', 'vendorName', 'issueDate', 'expectedDate', 'totalAmount', 'status'],
    fields: [
      { key: 'poNumber', label: 'PO Number', type: 'string' },
      { key: 'vendorName', label: 'Supplier / Vendor', type: 'string' },
      { key: 'issueDate', label: 'Issue Date', type: 'date' },
      { key: 'expectedDate', label: 'Expected Delivery', type: 'date' },
      { key: 'totalAmount', label: 'Total Valuation (₹)', type: 'number' },
      { key: 'status', label: 'PO Status', type: 'status', options: ['Draft', 'Waiting Approval', 'Approved', 'Received', 'Rejected'] },
    ],
    getData: () => mockPurchaseOrders,
  },
  invoices: {
    id: 'invoices',
    name: 'Invoices & Accounts Receivable/Payable',
    description: 'Sales and Purchase invoices, tax breakdowns, due dates, and settlement status',
    defaultFields: ['invoiceNumber', 'partyName', 'type', 'issueDate', 'dueDate', 'amount', 'taxAmount', 'status'],
    fields: [
      { key: 'invoiceNumber', label: 'Invoice #', type: 'string' },
      { key: 'partyName', label: 'Customer / Vendor', type: 'string' },
      { key: 'type', label: 'Invoice Type', type: 'status', options: ['Sales', 'Purchase'] },
      { key: 'issueDate', label: 'Issue Date', type: 'date' },
      { key: 'dueDate', label: 'Due Date', type: 'date' },
      { key: 'amount', label: 'Base Amount (₹)', type: 'number' },
      { key: 'taxAmount', label: 'Tax GST (₹)', type: 'number' },
      { key: 'status', label: 'Settlement Status', type: 'status', options: ['Paid', 'Unpaid', 'Overdue', 'Draft'] },
    ],
    getData: () => mockInvoices,
  },
  expenses: {
    id: 'expenses',
    name: 'Operating Expenses Ledger',
    description: 'Operational and capital expenditure claims, departments, and disbursement status',
    defaultFields: ['expenseNumber', 'category', 'claimant', 'department', 'date', 'amount', 'status', 'paymentMethod'],
    fields: [
      { key: 'expenseNumber', label: 'Expense Claim #', type: 'string' },
      { key: 'category', label: 'Expense Category', type: 'string', options: ['Travel & Lodging', 'Software & Cloud', 'Plant Utilities', 'Marketing & PR', 'Office Supplies'] },
      { key: 'claimant', label: 'Claimant', type: 'string' },
      { key: 'department', label: 'Department', type: 'string', options: ['Executive', 'Engineering', 'Operations', 'Sales', 'HR', 'Finance'] },
      { key: 'date', label: 'Expenditure Date', type: 'date' },
      { key: 'amount', label: 'Amount (₹)', type: 'number' },
      { key: 'paymentMethod', label: 'Payment Method', type: 'string' },
      { key: 'status', label: 'Status', type: 'status', options: ['Pending', 'Approved', 'Paid', 'Rejected'] },
    ],
    getData: () => mockExpenses,
  },
  approvals: {
    id: 'approvals',
    name: 'Approvals & Audit Trail',
    description: 'Corporate approval requests, priorities, requested amounts, and statuses',
    defaultFields: ['referenceNumber', 'title', 'type', 'requestedBy', 'department', 'amount', 'date', 'priority', 'status'],
    fields: [
      { key: 'referenceNumber', label: 'Ref #', type: 'string' },
      { key: 'title', label: 'Requisition Title', type: 'string' },
      { key: 'type', label: 'Workflow Type', type: 'string', options: ['Purchase', 'Expense', 'Leave', 'Payment', 'Invoice', 'Stock adjustment'] },
      { key: 'requestedBy', label: 'Submitted By', type: 'string' },
      { key: 'department', label: 'Department', type: 'string' },
      { key: 'amount', label: 'Claim Amount (₹)', type: 'number' },
      { key: 'date', label: 'Request Date', type: 'date' },
      { key: 'priority', label: 'Priority', type: 'status', options: ['High', 'Medium', 'Low'] },
      { key: 'status', label: 'Status', type: 'status', options: ['Pending', 'Approved', 'Rejected'] },
    ],
    getData: () => mockApprovals,
  },
  employees: {
    id: 'employees',
    name: 'Workforce & HR Directory',
    description: 'Active employee registry, salary grades, attendance rates, and roles',
    defaultFields: ['code', 'name', 'department', 'role', 'status', 'salary', 'attendanceRate', 'joinDate'],
    fields: [
      { key: 'code', label: 'Employee ID', type: 'string' },
      { key: 'name', label: 'Full Name', type: 'string' },
      { key: 'department', label: 'Department', type: 'string', options: ['Management', 'Procurement', 'Engineering', 'Finance', 'Logistics', 'Sales'] },
      { key: 'role', label: 'Job Role', type: 'string' },
      { key: 'salary', label: 'Base Monthly CTC (₹)', type: 'number' },
      { key: 'attendanceRate', label: 'Attendance', type: 'string' },
      { key: 'status', label: 'Status', type: 'status', options: ['Active', 'On Leave', 'Exited'] },
      { key: 'joinDate', label: 'Joining Date', type: 'date' },
    ],
    getData: () => mockEmployees,
  },
  customers: {
    id: 'customers',
    name: 'Customers & Accounts (CRM)',
    description: 'Corporate client profiles, credit thresholds, and outstanding accounts receivables',
    defaultFields: ['name', 'tier', 'contactPerson', 'email', 'phone', 'city', 'creditLimit', 'outstandingBalance'],
    fields: [
      { key: 'name', label: 'Company / Organization', type: 'string' },
      { key: 'tier', label: 'Customer Tier', type: 'string' },
      { key: 'contactPerson', label: 'Primary Contact', type: 'string' },
      { key: 'email', label: 'Email', type: 'string' },
      { key: 'phone', label: 'Phone', type: 'string' },
      { key: 'city', label: 'Location', type: 'string' },
      { key: 'creditLimit', label: 'Credit Limit (₹)', type: 'number' },
      { key: 'outstandingBalance', label: 'Outstanding Balance (₹)', type: 'number' },
    ],
    getData: () => mockCustomers,
  },
  vendors: {
    id: 'vendors',
    name: 'Suppliers & Vendors Directory',
    description: 'Authorized vendors, fulfillment ratings, commercial payment terms, and annual spend',
    defaultFields: ['name', 'category', 'rating', 'paymentTerms', 'activeOrders', 'totalSpendYTD', 'contactEmail'],
    fields: [
      { key: 'name', label: 'Supplier Name', type: 'string' },
      { key: 'category', label: 'Supplied Goods', type: 'string' },
      { key: 'rating', label: 'Supplier Rating', type: 'string' },
      { key: 'paymentTerms', label: 'Payment Terms', type: 'string' },
      { key: 'activeOrders', label: 'Active Requisitions', type: 'number' },
      { key: 'totalSpendYTD', label: 'Total Spend YTD (₹)', type: 'number' },
      { key: 'contactEmail', label: 'Direct Email', type: 'string' },
    ],
    getData: () => mockVendors,
  },
};

export interface QueryExecutionResult {
  data: any[];
  recordCount: number;
  executionTimeMs: number;
  executedQuery: string;
  appliedFiltersCount: number;
  totalSum?: number;
  summaryColumns: { key: string; sum?: number; avg?: number }[];
}

/**
 * Generates an accurate, standard SQL query string from visual report configuration
 */
export function generateSqlQueryFromConfig(config: ReportConfig): string {
  const fields = config.fields && config.fields.length > 0 ? config.fields.join(', ') : '*';
  let sql = `SELECT ${fields} FROM ${config.dataset}`;

  const conditions: string[] = [];

  // 1. Date Range
  if (config.dateRange && config.dateRange !== 'all') {
    const todayStr = new Date().toISOString().split('T')[0];
    if (config.dateRange === 'today') {
      conditions.push(`date = '${todayStr}'`);
    } else if (config.dateRange === 'last_7_days') {
      conditions.push(`date >= CURRENT_DATE - INTERVAL '7 days'`);
    } else if (config.dateRange === 'this_month') {
      conditions.push(`date >= DATE_TRUNC('month', CURRENT_DATE)`);
    } else if (config.dateRange === 'custom' && config.customStartDate && config.customEndDate) {
      conditions.push(`date BETWEEN '${config.customStartDate}' AND '${config.customEndDate}'`);
    }
  }

  // 2. Custom Filter Rules
  if (config.filters && config.filters.length > 0) {
    config.filters.forEach((f) => {
      if (!f.field) return;
      const isNum = !isNaN(Number(f.value)) && f.value.trim() !== '';
      const formattedVal = isNum ? f.value.trim() : `'${f.value}'`;

      switch (f.operator) {
        case 'equals':
          conditions.push(`${f.field} = ${formattedVal}`);
          break;
        case 'not_equals':
          conditions.push(`${f.field} != ${formattedVal}`);
          break;
        case 'contains':
          conditions.push(`${f.field} ILIKE '%${f.value}%'`);
          break;
        case 'greater_than':
          conditions.push(`${f.field} > ${formattedVal}`);
          break;
        case 'gte':
          conditions.push(`${f.field} >= ${formattedVal}`);
          break;
        case 'less_than':
          conditions.push(`${f.field} < ${formattedVal}`);
          break;
        case 'lte':
          conditions.push(`${f.field} <= ${formattedVal}`);
          break;
        case 'is_empty':
          conditions.push(`${f.field} IS NULL`);
          break;
        case 'is_not_empty':
          conditions.push(`${f.field} IS NOT NULL`);
          break;
      }
    });
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  if (config.sortBy) {
    sql += ` ORDER BY ${config.sortBy} ${(config.sortDirection || 'ASC').toUpperCase()}`;
  }

  if (config.limit) {
    sql += ` LIMIT ${config.limit}`;
  }

  return sql + ';';
}

/**
 * Lightweight in-memory SQL parser that parses and executes standard SELECT queries
 */
export function parseAndExecuteSql(
  rawSql: string,
  fallbackDataset: ReportConfig['dataset']
): {
  data: any[];
  fields: string[];
  executedQuery: string;
  datasetName: string;
} {
  const cleanSql = rawSql.trim().replace(/;+$/, '');

  // 1. Detect dataset/table from 'FROM <table>'
  let targetDataset = fallbackDataset;
  const fromMatch = cleanSql.match(/\bFROM\s+([a-zA-Z0-9_]+)/i);
  if (fromMatch && fromMatch[1]) {
    const rawTable = fromMatch[1].toLowerCase();
    if (DATASET_SCHEMAS[rawTable as ReportConfig['dataset']]) {
      targetDataset = rawTable as ReportConfig['dataset'];
    } else if (rawTable.includes('sale') || rawTable.includes('order')) {
      targetDataset = 'sales_orders';
    } else if (rawTable.includes('product') || rawTable.includes('stock') || rawTable.includes('inventor')) {
      targetDataset = 'inventory_products';
    } else if (rawTable.includes('purchase') || rawTable.includes('po')) {
      targetDataset = 'purchase_orders';
    } else if (rawTable.includes('invoice') || rawTable.includes('ar') || rawTable.includes('ap')) {
      targetDataset = 'invoices';
    } else if (rawTable.includes('expense')) {
      targetDataset = 'expenses';
    } else if (rawTable.includes('approval')) {
      targetDataset = 'approvals';
    } else if (rawTable.includes('employee') || rawTable.includes('user') || rawTable.includes('staff')) {
      targetDataset = 'employees';
    } else if (rawTable.includes('customer') || rawTable.includes('client')) {
      targetDataset = 'customers';
    } else if (rawTable.includes('vendor') || rawTable.includes('supplier')) {
      targetDataset = 'vendors';
    }
  }

  const schema = DATASET_SCHEMAS[targetDataset] || DATASET_SCHEMAS.sales_orders;
  let rows = [...schema.getData()];

  // 2. Parse SELECT columns
  const selectMatch = cleanSql.match(/\bSELECT\s+(.*?)\s+\bFROM\b/i);
  let requestedFields: string[] = [];
  if (selectMatch && selectMatch[1]) {
    const rawCols = selectMatch[1].trim();
    if (rawCols === '*') {
      requestedFields = schema.fields.map((f) => f.key);
    } else {
      requestedFields = rawCols
        .split(',')
        .map((c) => c.trim().replace(/^[`"']|[`"']$/g, ''))
        .filter(Boolean);
    }
  }
  if (requestedFields.length === 0) {
    requestedFields = [...schema.defaultFields];
  }

  // 3. Parse WHERE clause
  const whereMatch = cleanSql.match(/\bWHERE\s+(.*?)(?:\s+\bORDER\s+BY\b|\s+\bLIMIT\b|$)/i);
  if (whereMatch && whereMatch[1]) {
    const whereClause = whereMatch[1].trim();
    const conditions = whereClause.split(/\s+\bAND\b\s+/i);
    conditions.forEach((cond) => {
      const opMatch = cond.match(
        /([a-zA-Z0-9_]+)\s*(=|!=|<>|>=|<=|>|<|\bILIKE\b|\bLIKE\b|\bIS\s+NOT\s+NULL\b|\bIS\s+NULL\b)\s*(.*)/i
      );
      if (opMatch) {
        const field = opMatch[1].trim();
        const op = opMatch[2].toUpperCase().trim();
        const rawVal = (opMatch[3] || '').trim().replace(/^['"]|['"]$/g, '');

        rows = rows.filter((r) => {
          const rowVal = r[field];
          if (op === 'IS NULL') return rowVal === null || rowVal === undefined || rowVal === '';
          if (op === 'IS NOT NULL') return rowVal !== null && rowVal !== undefined && rowVal !== '';

          const isNum = typeof rowVal === 'number' && !isNaN(Number(rawVal)) && rawVal !== '';
          if (isNum) {
            const numVal = Number(rawVal);
            if (op === '=') return rowVal === numVal;
            if (op === '!=' || op === '<>') return rowVal !== numVal;
            if (op === '>') return rowVal > numVal;
            if (op === '>=') return rowVal >= numVal;
            if (op === '<') return rowVal < numVal;
            if (op === '<=') return rowVal <= numVal;
          } else {
            const strA = String(rowVal || '').toLowerCase();
            const strB = rawVal.toLowerCase().replace(/%/g, '');
            if (op === '=') return strA === strB;
            if (op === '!=' || op === '<>') return strA !== strB;
            if (op.includes('LIKE')) return strA.includes(strB);
          }
          return true;
        });
      }
    });
  }

  // 4. Parse ORDER BY clause
  const orderMatch = cleanSql.match(/\bORDER\s+BY\s+([a-zA-Z0-9_]+)(?:\s+(ASC|DESC))?/i);
  if (orderMatch && orderMatch[1]) {
    const sortCol = orderMatch[1].trim();
    const isDesc = (orderMatch[2] || 'ASC').toUpperCase() === 'DESC';
    rows.sort((a, b) => {
      const valA = a[sortCol];
      const valB = b[sortCol];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return isDesc ? valB - valA : valA - valB;
      }
      return isDesc
        ? String(valB || '').localeCompare(String(valA || ''))
        : String(valA || '').localeCompare(String(valB || ''));
    });
  }

  // 5. Parse LIMIT clause
  const limitMatch = cleanSql.match(/\bLIMIT\s+([0-9]+)/i);
  if (limitMatch && limitMatch[1]) {
    const limitNum = parseInt(limitMatch[1], 10);
    if (!isNaN(limitNum) && limitNum > 0) {
      rows = rows.slice(0, limitNum);
    }
  }

  // Project requested fields
  const projected = rows.map((r) => {
    const obj: Record<string, any> = {};
    requestedFields.forEach((f) => {
      obj[f] = r[f] !== undefined ? r[f] : '-';
    });
    return obj;
  });

  return {
    data: projected,
    fields: requestedFields,
    executedQuery: cleanSql + ';',
    datasetName: targetDataset,
  };
}

/**
 * Executes a structured query configuration or raw SQL against ERP datasets
 */
export function executeReportQuery(config: ReportConfig): QueryExecutionResult {
  const startTime = performance.now();

  // If in SQL query mode or raw SQL is explicitly specified and mode is 'sql'
  if (config.mode === 'sql' && config.rawSql && config.rawSql.trim()) {
    const parsed = parseAndExecuteSql(config.rawSql, config.dataset);
    const endTime = performance.now();
    const latency = Math.max(8, Math.round(endTime - startTime));

    // Calculate numeric summaries
    const summaryColumns: { key: string; sum?: number; avg?: number }[] = [];
    const schema = DATASET_SCHEMAS[parsed.datasetName as ReportConfig['dataset']] || DATASET_SCHEMAS.sales_orders;
    parsed.fields.forEach((f) => {
      const fieldDef = schema.fields.find((df) => df.key === f);
      if (fieldDef?.type === 'number') {
        const sum = parsed.data.reduce((acc, r) => acc + (typeof r[f] === 'number' ? r[f] : 0), 0);
        const avg = parsed.data.length > 0 ? Math.round(sum / parsed.data.length) : 0;
        summaryColumns.push({ key: f, sum, avg });
      }
    });

    return {
      data: parsed.data,
      recordCount: parsed.data.length,
      executionTimeMs: latency,
      executedQuery: parsed.executedQuery,
      appliedFiltersCount: (config.rawSql.match(/\bWHERE\b/i) ? 1 : 0),
      summaryColumns,
    };
  }

  // Visual Builder Execution
  const schema = DATASET_SCHEMAS[config.dataset] || DATASET_SCHEMAS.sales_orders;
  let rawData = [...schema.getData()];
  const executedQuerySummary = generateSqlQueryFromConfig(config);

  // 1. Filter by Date Range
  if (config.dateRange && config.dateRange !== 'all') {
    rawData = rawData.filter((row) => {
      const dateVal = row.date || row.issueDate || row.lastUpdated || row.joinDate;
      if (!dateVal) return true;
      const d = new Date(dateVal);
      const now = new Date();
      if (config.dateRange === 'today') {
        return d.toDateString() === now.toDateString();
      }
      if (config.dateRange === 'this_month') {
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }
      if (config.dateRange === 'last_7_days') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= weekAgo;
      }
      if (config.dateRange === 'custom' && config.customStartDate && config.customEndDate) {
        return d >= new Date(config.customStartDate) && d <= new Date(config.customEndDate);
      }
      return true;
    });
  }

  // 2. Filter by Custom Rules
  if (config.filters && config.filters.length > 0) {
    rawData = rawData.filter((row) => {
      return config.filters.every((rule) => {
        if (!rule.field || rule.operator === undefined) return true;
        const rowVal = row[rule.field];
        const filterVal = rule.value;

        switch (rule.operator) {
          case 'equals':
            return String(rowVal).toLowerCase() === String(filterVal).toLowerCase();
          case 'not_equals':
            return String(rowVal).toLowerCase() !== String(filterVal).toLowerCase();
          case 'contains':
            return String(rowVal).toLowerCase().includes(String(filterVal).toLowerCase());
          case 'greater_than':
            return Number(rowVal) > Number(filterVal);
          case 'gte':
            return Number(rowVal) >= Number(filterVal);
          case 'less_than':
            return Number(rowVal) < Number(filterVal);
          case 'lte':
            return Number(rowVal) <= Number(filterVal);
          case 'is_empty':
            return rowVal === null || rowVal === undefined || rowVal === '';
          case 'is_not_empty':
            return rowVal !== null && rowVal !== undefined && rowVal !== '';
          default:
            return true;
        }
      });
    });
  }

  // 3. Sort Order
  if (config.sortBy) {
    const sortField = config.sortBy;
    const isDesc = config.sortDirection === 'desc';
    rawData.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return isDesc ? valB - valA : valA - valB;
      }
      return isDesc
        ? String(valB).localeCompare(String(valA))
        : String(valA).localeCompare(String(valB));
    });
  }

  // 4. Limit results
  if (config.limit && config.limit > 0) {
    rawData = rawData.slice(0, config.limit);
  }

  // 5. Select only chosen fields
  const fieldsToKeep = config.fields.length > 0 ? config.fields : schema.defaultFields;
  const projectedData = rawData.map((row) => {
    const projected: Record<string, any> = {};
    fieldsToKeep.forEach((f) => {
      projected[f] = row[f] !== undefined ? row[f] : '-';
    });
    return projected;
  });

  // 6. Calculate summaries (sums/averages for numeric columns)
  const summaryColumns: { key: string; sum?: number; avg?: number }[] = [];
  fieldsToKeep.forEach((f) => {
    const fieldDef = schema.fields.find((df) => df.key === f);
    if (fieldDef?.type === 'number') {
      const sum = projectedData.reduce((acc, r) => acc + (typeof r[f] === 'number' ? r[f] : 0), 0);
      const avg = projectedData.length > 0 ? Math.round(sum / projectedData.length) : 0;
      summaryColumns.push({ key: f, sum, avg });
    }
  });

  const endTime = performance.now();
  const latency = Math.max(8, Math.round(endTime - startTime));

  return {
    data: projectedData,
    recordCount: projectedData.length,
    executionTimeMs: latency,
    executedQuery: executedQuerySummary,
    appliedFiltersCount: config.filters.length,
    summaryColumns,
  };
}

export const PRESET_REPORTS: {
  id: string;
  name: string;
  description: string;
  config: ReportConfig;
  defaultFormat: 'csv' | 'excel' | 'txt' | 'json';
}[] = [
  {
    id: 'preset-high-value-sales',
    name: 'High-Value Sales Orders (> ₹1,00,000)',
    description: 'Filter orders above ₹1,00,000 with fulfillment and payment reconciliation status',
    defaultFormat: 'excel',
    config: {
      title: 'High-Value Sales Orders',
      dataset: 'sales_orders',
      fields: ['orderNumber', 'customerName', 'date', 'totalAmount', 'paymentStatus', 'fulfillmentStatus'],
      filters: [{ id: 'f1', field: 'totalAmount', operator: 'gte', value: '100000' }],
      dateRange: 'all',
      sortBy: 'totalAmount',
      sortDirection: 'desc',
    },
  },
  {
    id: 'preset-low-stock-skus',
    name: 'Critical Low Stock & Reorder Alert',
    description: 'Inventory items whose quantity is below safety stock threshold',
    defaultFormat: 'csv',
    config: {
      title: 'Critical Low Stock SKUs',
      dataset: 'inventory_products',
      fields: ['sku', 'name', 'category', 'stockQty', 'reorderLevel', 'unitPrice', 'warehouse', 'status'],
      filters: [{ id: 'f2', field: 'status', operator: 'equals', value: 'Low Stock' }],
      dateRange: 'all',
      sortBy: 'stockQty',
      sortDirection: 'asc',
    },
  },
  {
    id: 'preset-overdue-invoices',
    name: 'Accounts Receivable Overdue Invoices',
    description: 'Unsettled corporate customer invoices requiring immediate collection follow-up',
    defaultFormat: 'txt',
    config: {
      title: 'AR Overdue Invoices Aging',
      dataset: 'invoices',
      fields: ['invoiceNumber', 'partyName', 'type', 'issueDate', 'dueDate', 'amount', 'taxAmount', 'status'],
      filters: [{ id: 'f3', field: 'status', operator: 'equals', value: 'Overdue' }],
      dateRange: 'all',
      sortBy: 'amount',
      sortDirection: 'desc',
    },
  },
  {
    id: 'preset-pending-purchases',
    name: 'Pending Vendor Purchase Orders',
    description: 'Procurement requisitions awaiting management sign-off or factory receipt',
    defaultFormat: 'excel',
    config: {
      title: 'Procurement Orders Status',
      dataset: 'purchase_orders',
      fields: ['poNumber', 'vendorName', 'issueDate', 'expectedDate', 'totalAmount', 'status'],
      filters: [],
      dateRange: 'all',
      sortBy: 'issueDate',
      sortDirection: 'desc',
    },
  },
  {
    id: 'preset-department-expenses',
    name: 'Operating Expenses by Department',
    description: 'Comprehensive operational expenditure breakdown across business divisions',
    defaultFormat: 'json',
    config: {
      title: 'Departmental Operating Expenses',
      dataset: 'expenses',
      fields: ['expenseNumber', 'category', 'claimant', 'department', 'date', 'amount', 'status', 'paymentMethod'],
      filters: [],
      dateRange: 'all',
      sortBy: 'amount',
      sortDirection: 'desc',
    },
  },
  {
    id: 'preset-workforce-payroll',
    name: 'Workforce Directory & Compensation',
    description: 'Departmental staffing, attendance ratios, and base payroll commitments',
    defaultFormat: 'txt',
    config: {
      title: 'Workforce Payroll & Attendance Summary',
      dataset: 'employees',
      fields: ['code', 'name', 'department', 'role', 'status', 'salary', 'attendanceRate', 'joinDate'],
      filters: [{ id: 'f5', field: 'status', operator: 'equals', value: 'Active' }],
      dateRange: 'all',
      sortBy: 'salary',
      sortDirection: 'desc',
    },
  },
];
