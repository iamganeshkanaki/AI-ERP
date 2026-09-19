export type AIResponseType =
  | 'text'
  | 'table'
  | 'chart'
  | 'form'
  | 'confirmation'
  | 'report'
  | 'error';

export type AIActionStatus =
  | 'draft'
  | 'waiting_confirmation'
  | 'processing'
  | 'success'
  | 'failed';

export interface AIActionPayload {
  actionType:
    | 'create_po'
    | 'create_invoice'
    | 'approve_request'
    | 'create_expense'
    | 'adjust_stock'
    | 'create_sale'
    | 'create_payment'
    | 'delete_invoice';
  title: string;
  summary: string;
  details: Record<string, any>;
  status: AIActionStatus;
  resultId?: string;
  errorMessage?: string;
  idempotencyKey?: string;
}

export interface TableResponseData {
  title: string;
  columns: { key: string; label: string; align?: 'left' | 'center' | 'right' }[];
  rows: Record<string, any>[];
  totalSummary?: string;
}

export interface ChartResponseData {
  title: string;
  chartType: 'bar' | 'line' | 'pie';
  xAxisKey: string;
  dataKeys: { key: string; color: string; label: string }[];
  data: Record<string, any>[];
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  text: string;
  responseType?: AIResponseType;
  tableData?: TableResponseData;
  chartData?: ChartResponseData;
  actionPayload?: AIActionPayload;
  quickActions?: { label: string; prompt: string }[];
  attachments?: { name: string; size: string; type: string }[];
}

export interface AIChatRequest {
  message: string;
  conversation_id?: string;
  context?: {
    currentRoute?: string;
    activeRole?: string;
    filters?: Record<string, any>;
  };
}
