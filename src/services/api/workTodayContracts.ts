import {
  WorkItem,
  WorkTodaySummary,
  WorkFilter,
  WorkActionType,
  WorkItemActionRequest,
  WorkItemActionResponse,
} from '../../types/workToday';

/**
 * ============================================================================
 * DJANGO REST FRAMEWORK (DRF) API CONTRACTS
 * ============================================================================
 *
 * Designed to map cleanly to Django ViewSets and Serializers:
 * - WorkTodayViewSet.as_view({'get': 'list', 'post': 'execute_action'})
 * - URL: /api/v1/work-today/
 */

export interface DRFPaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface WorkTodayQueryParams {
  filter?: WorkFilter;
  ai_prioritized?: boolean;
  module?: string;
  urgency?: string;
  priority?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface WorkTodayAPIResponse {
  summary: WorkTodaySummary;
  items: WorkItem[];
  user_permissions: string[];
  server_timestamp: string;
}

/**
 * ============================================================================
 * n8n WORKFLOW AUTOMATION & WEBHOOK CONTRACTS
 * ============================================================================
 *
 * Architecture:
 * Django ORM Signal / Event -> Webhook Dispatcher -> n8n Webhook -> AI Agent -> Django API
 *
 * These contracts define the standard event envelope that n8n receives from ERP.
 */

export type ERPEventType =
  | 'approval.required'
  | 'approval.granted'
  | 'approval.rejected'
  | 'invoice.created'
  | 'invoice.overdue'
  | 'payment.received'
  | 'payment.due'
  | 'stock.low'
  | 'stock.critical'
  | 'purchase_order.created'
  | 'purchase_order.approved'
  | 'sales_order.created'
  | 'sales_order.dispatched'
  | 'employee.leave_requested'
  | 'employee.expense_submitted';

export interface N8NEventEnvelope<T = Record<string, any>> {
  eventId: string;
  eventType: ERPEventType;
  timestamp: string;
  tenantId: string;
  companyId: string;
  branchId: string;
  triggeredByUserId: string;
  idempotencyKey: string;
  payload: T;
  aiContext?: {
    recommendedAction?: string;
    urgencyScore?: number;
    financialExposure?: number;
  };
}

export interface N8NApprovalRequiredPayload {
  approvalId: string;
  referenceNumber: string;
  module: string;
  type: string;
  amount: number;
  requesterName: string;
  requesterEmail: string;
  approverRolesRequired: string[];
  deadline: string;
}

export interface N8NStockLowPayload {
  sku: string;
  productName: string;
  currentStock: number;
  reorderLevel: number;
  warehouseCode: string;
  preferredSupplierId: string;
  estimatedLeadDays: number;
}

export interface N8NInvoiceOverduePayload {
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amountDue: number;
  dueDate: string;
  daysOverdue: number;
  remindersSentCount: number;
}
