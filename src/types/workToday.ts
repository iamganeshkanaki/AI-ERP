export type WorkCategory =
  | 'Pending Approvals'
  | 'Overdue Payments'
  | 'Low Stock'
  | 'Pending Purchases'
  | 'Pending Sales Orders'
  | 'Employee Requests'
  | "Today's Tasks"
  | 'Important AI Alerts';

export type WorkModule =
  | 'Approvals'
  | 'Finance'
  | 'Inventory'
  | 'Purchase'
  | 'Sales'
  | 'HR'
  | 'Tasks'
  | 'AI';

export type WorkUrgency = 'Critical' | 'Important' | 'Normal';

export type WorkPriority = 'High' | 'Medium' | 'Low';

export type WorkFilter =
  | 'All'
  | 'High Priority'
  | 'Today'
  | 'Overdue'
  | 'Approvals'
  | 'Finance'
  | 'Sales'
  | 'Purchase'
  | 'Inventory'
  | 'HR';

export interface WorkItem {
  id: string;
  category: WorkCategory;
  module: WorkModule;
  title: string;
  partyName?: string;
  referenceNumber?: string;
  amount?: number;
  currentStock?: number;
  reorderLevel?: number;
  date: string;
  dueDateLabel: string;
  priority: WorkPriority;
  urgency: WorkUrgency;
  status: string;
  requiredAction: string;
  aiPriorityRank?: number;
  aiUrgencyReason?: string;
  businessImpact?: string;
  primaryActionLabel: string;
  primaryActionType:
    | 'approve'
    | 'send_reminder'
    | 'create_purchase'
    | 'confirm_dispatch'
    | 'mark_done'
    | 'investigate';
  secondaryActionLabel?: string;
  secondaryActionType?:
    | 'view'
    | 'reject'
    | 'snooze'
    | 'view_product'
    | 'view_invoice';
  completed?: boolean;
  metadata?: Record<string, any>;
}

export interface WorkTodaySummary {
  totalCount: number;
  criticalCount: number;
  importantCount: number;
  normalCount: number;
  categoryCounts: Record<WorkCategory, number>;
  greeting: string;
  headlineSummary: string;
}
