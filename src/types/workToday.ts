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

export type WorkActionType =
  | 'Review'
  | 'Approve'
  | 'Reject'
  | 'View'
  | 'Pay'
  | 'Reorder'
  | 'Follow Up'
  | 'Assign'
  | 'Send Reminder'
  | 'Confirm Dispatch'
  | 'Mark Done'
  | 'Investigate';

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
  requiredPermission: string; // RBAC check: e.g. 'purchase.approve', 'finance.manage', 'inventory.view'
  aiPriorityRank?: number;
  aiUrgencyReason?: string;
  businessImpact?: string;
  primaryActionLabel: string;
  primaryActionType: WorkActionType;
  secondaryActionLabel?: string;
  secondaryActionType?: WorkActionType;
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

export interface WorkItemActionRequest {
  itemId: string;
  actionType: WorkActionType;
  note?: string;
  assignedTo?: string;
  paymentDetails?: {
    method: string;
    reference: string;
    amount: number;
  };
  reorderQuantity?: number;
}

export interface WorkItemActionResponse {
  success: boolean;
  itemId: string;
  actionExecuted: WorkActionType;
  updatedStatus: string;
  transactionRef?: string;
  message: string;
  auditLogId?: string;
}
