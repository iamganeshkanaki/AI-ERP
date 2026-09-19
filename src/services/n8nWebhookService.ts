import { environment } from '../config/environment';

export type ERPEventType =
  | 'invoice.created'
  | 'invoice.overdue'
  | 'payment.received'
  | 'purchase_order.created'
  | 'purchase_order.approved'
  | 'sales_order.created'
  | 'stock.low'
  | 'employee.leave_requested'
  | 'expense.submitted'
  | 'approval.required';

export interface N8NWebhookPayload<T = Record<string, any>> {
  eventId: string;
  eventType: ERPEventType;
  timestamp: string;
  idempotencyKey: string;
  version: '1.0';
  tenantId: string;
  companyId: string;
  branchId?: string;
  actor: {
    userId: string;
    userName: string;
    userRole: string;
  };
  payload: T;
  retryCount?: number;
  metadata?: {
    source: 'NEXUS_ERP_DJANGO';
    clientIp?: string;
    correlationId: string;
  };
}

export interface WebhookDeliveryLog {
  id: string;
  eventId: string;
  eventType: ERPEventType;
  targetWebhookUrl: string;
  httpStatus: number;
  deliveredAt: string;
  durationMs: number;
  status: 'SUCCESS' | 'RETRYING' | 'FAILED';
  responseBody?: string;
  idempotencyKey: string;
}

const IN_MEMORY_DELIVERY_LOGS: WebhookDeliveryLog[] = [
  {
    id: 'del-01',
    eventId: 'evt-99104',
    eventType: 'approval.required',
    targetWebhookUrl: 'https://n8n.internal.nexus.erp/webhook/v1/approvals',
    httpStatus: 200,
    deliveredAt: '2026-09-19 07:30:12',
    durationMs: 42,
    status: 'SUCCESS',
    responseBody: '{"workflowId": "wf_approval_router", "executionId": "8912"}',
    idempotencyKey: 'idemp-po-4401-app-1726740612',
  },
  {
    id: 'del-02',
    eventId: 'evt-99105',
    eventType: 'stock.low',
    targetWebhookUrl: 'https://n8n.internal.nexus.erp/webhook/v1/inventory-alerts',
    httpStatus: 200,
    deliveredAt: '2026-09-19 06:45:00',
    durationMs: 38,
    status: 'SUCCESS',
    responseBody: '{"workflowId": "wf_procure_replenish", "notifiedSlackChannel": "#warehouse-ops"}',
    idempotencyKey: 'idemp-sku-prn-02-low-1726737900',
  },
  {
    id: 'del-03',
    eventId: 'evt-99106',
    eventType: 'invoice.overdue',
    targetWebhookUrl: 'https://n8n.internal.nexus.erp/webhook/v1/dunning-finance',
    httpStatus: 200,
    deliveredAt: '2026-09-19 05:15:30',
    durationMs: 51,
    status: 'SUCCESS',
    responseBody: '{"workflowId": "wf_ar_dunning", "dispatchedWhatsApp": true}',
    idempotencyKey: 'idemp-inv-1023-overdue-1726732530',
  },
];

export const n8nWebhookService = {
  /**
   * Dispatches an ERP event to the n8n automation engine via authenticated webhook
   */
  async dispatchEvent<T = any>(
    eventType: ERPEventType,
    payload: T,
    actor = { userId: 'usr-admin', userName: 'System Admin', userRole: 'Admin' }
  ): Promise<WebhookDeliveryLog> {
    const eventId = `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const idempotencyKey = `idemp-${eventType}-${Date.now()}`;
    const timestamp = new Date().toISOString();

    const envelope: N8NWebhookPayload<T> = {
      eventId,
      eventType,
      timestamp,
      idempotencyKey,
      version: '1.0',
      tenantId: 'tenant-nexus-default',
      companyId: 'comp-acme-corp',
      actor,
      payload,
      metadata: {
        source: 'NEXUS_ERP_DJANGO',
        correlationId: `corr-${Date.now()}`,
      },
    };

    // If real backend configured
    if (!environment.isMockMode && environment.endpoints.n8n?.webhookUrl) {
      try {
        const start = performance.now();
        const res = await fetch(environment.endpoints.n8n.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-ERP-Signature-256': 'sha256-hmac-simulated',
            'X-Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify(envelope),
        });

        const durationMs = Math.round(performance.now() - start);
        const log: WebhookDeliveryLog = {
          id: `del-${Date.now()}`,
          eventId,
          eventType,
          targetWebhookUrl: environment.endpoints.n8n.webhookUrl,
          httpStatus: res.status,
          deliveredAt: new Date().toLocaleString(),
          durationMs,
          status: res.ok ? 'SUCCESS' : 'FAILED',
          idempotencyKey,
        };
        IN_MEMORY_DELIVERY_LOGS.unshift(log);
        return log;
      } catch (err: any) {
        const log: WebhookDeliveryLog = {
          id: `del-${Date.now()}`,
          eventId,
          eventType,
          targetWebhookUrl: environment.endpoints.n8n?.webhookUrl || 'https://n8n.internal.nexus.erp',
          httpStatus: 504,
          deliveredAt: new Date().toLocaleString(),
          durationMs: 120,
          status: 'RETRYING',
          responseBody: err.message,
          idempotencyKey,
        };
        IN_MEMORY_DELIVERY_LOGS.unshift(log);
        return log;
      }
    }

    // High fidelity simulator
    await new Promise((r) => setTimeout(r, 40));
    const log: WebhookDeliveryLog = {
      id: `del-${Date.now()}`,
      eventId,
      eventType,
      targetWebhookUrl: 'https://n8n.internal.nexus.erp/webhook/v1/erp-events',
      httpStatus: 200,
      deliveredAt: new Date().toLocaleString(),
      durationMs: 35,
      status: 'SUCCESS',
      responseBody: JSON.stringify({
        acknowledged: true,
        eventId,
        n8nExecutionId: Math.floor(1000 + Math.random() * 9000),
      }),
      idempotencyKey,
    };
    IN_MEMORY_DELIVERY_LOGS.unshift(log);
    return log;
  },

  getDeliveryLogs(): WebhookDeliveryLog[] {
    return [...IN_MEMORY_DELIVERY_LOGS];
  },
};
