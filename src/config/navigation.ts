import { UserRole } from '../types/auth';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  badge?: string | number;
  roles?: UserRole[];
  children?: {
    id: string;
    label: string;
    path: string;
    roles?: UserRole[];
  }[];
}

export interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const navigationGroups: NavGroup[] = [
  {
    groupName: 'Core & AI',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        iconName: 'LayoutDashboard',
      },
      {
        id: 'ai-assistant',
        label: 'AI ERP Assistant',
        path: '/ai-assistant',
        iconName: 'Bot',
        badge: 'Smart',
      },
      {
        id: 'approvals',
        label: 'Approval Center',
        path: '/approvals',
        iconName: 'CheckCircle2',
        badge: 5,
        roles: ['Admin', 'Manager', 'Finance', 'Purchase', 'HR'],
      },
    ],
  },
  {
    groupName: 'Operations',
    items: [
      {
        id: 'sales',
        label: 'Sales & CRM',
        path: '/sales',
        iconName: 'TrendingUp',
        roles: ['Admin', 'Manager', 'Sales', 'Finance'],
        children: [
          { id: 'sales-orders', label: 'Sales Orders', path: '/sales/orders' },
          { id: 'quotations', label: 'Quotations', path: '/sales/quotations' },
          { id: 'customers', label: 'Customers', path: '/sales/customers' },
          { id: 'invoices', label: 'Invoices', path: '/sales/invoices' },
        ],
      },
      {
        id: 'purchase',
        label: 'Purchase & Vendors',
        path: '/purchase',
        iconName: 'ShoppingCart',
        roles: ['Admin', 'Manager', 'Purchase', 'Finance'],
        children: [
          { id: 'purchase-orders', label: 'Purchase Orders', path: '/purchase/orders' },
          { id: 'vendors', label: 'Vendors', path: '/purchase/vendors' },
          { id: 'goods-receipts', label: 'Goods Receipts', path: '/purchase/receipts' },
        ],
      },
      {
        id: 'inventory',
        label: 'Inventory & Stock',
        path: '/inventory',
        iconName: 'Package',
        roles: ['Admin', 'Manager', 'Inventory', 'Purchase'],
        children: [
          { id: 'products', label: 'Products', path: '/inventory/products' },
          { id: 'warehouses', label: 'Warehouses', path: '/inventory/warehouses' },
          { id: 'adjustments', label: 'Stock Adjustments', path: '/inventory/adjustments' },
        ],
      },
    ],
  },
  {
    groupName: 'Management',
    items: [
      {
        id: 'finance',
        label: 'Finance & Accounts',
        path: '/finance',
        iconName: 'DollarSign',
        roles: ['Admin', 'Manager', 'Finance'],
        children: [
          { id: 'expenses', label: 'Expenses', path: '/finance/expenses' },
          { id: 'receivables', label: 'Receivables & Payables', path: '/finance/receivables' },
          { id: 'journal', label: 'Journal Entries', path: '/finance/journal' },
        ],
      },
      {
        id: 'hr',
        label: 'HR & Personnel',
        path: '/hr',
        iconName: 'Users',
        roles: ['Admin', 'Manager', 'HR'],
        children: [
          { id: 'employees', label: 'Employees', path: '/hr/employees' },
          { id: 'leave', label: 'Leave Requests', path: '/hr/leave' },
          { id: 'payroll', label: 'Payroll', path: '/hr/payroll' },
        ],
      },
      {
        id: 'documents',
        label: 'Document Extraction',
        path: '/documents',
        iconName: 'FileText',
        badge: 'OCR',
      },
      {
        id: 'reports',
        label: 'Reports & Query Builder',
        path: '/reports',
        iconName: 'BarChart3',
        badge: 'Query/Export',
      },
      {
        id: 'settings',
        label: 'System & API Config',
        path: '/settings',
        iconName: 'Settings',
      },
    ],
  },
];
