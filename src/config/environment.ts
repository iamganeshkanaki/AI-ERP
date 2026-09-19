export interface AppEnvironment {
  apiBaseUrl: string;
  isMockMode: boolean;
  appName: string;
  version: string;
  endpoints: {
    auth: {
      login: string;
      refresh: string;
      currentUser: string;
      forgotPassword: string;
    };
    ai: {
      chat: string;
      confirmAction: string;
      insights: string;
    };
    dashboard: {
      kpis: string;
      charts: string;
    };
    sales: {
      orders: string;
      invoices: string;
      customers: string;
    };
    purchase: {
      orders: string;
      vendors: string;
    };
    inventory: {
      products: string;
      adjustments: string;
      warehouses: string;
    };
    finance: {
      expenses: string;
      accounts: string;
      reports: string;
    };
    approvals: {
      list: string;
      action: string;
    };
    documents: {
      upload: string;
      extract: string;
    };
    notifications: {
      list: string;
      markRead: string;
    };
    n8n: {
      webhook: string;
      webhookUrl: string;
      triggers: string;
    };
  };
}

const STORAGE_KEY_API_URL = 'ai_erp_api_url';
const STORAGE_KEY_MODE = 'ai_erp_mode';

export function getStoredApiUrl(): string {
  if (typeof window === 'undefined') return 'http://localhost:8000/api';
  return (
    localStorage.getItem(STORAGE_KEY_API_URL) ||
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8000/api'
  );
}

export function setStoredApiUrl(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_API_URL, url);
  }
}

export function getStoredIsMockMode(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(STORAGE_KEY_MODE);
  // Default to true (safe demo preview mode) so the app works straight out-of-the-box before Django backend is spun up
  return stored === null ? true : stored === 'true';
}

export function setStoredIsMockMode(isMock: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_MODE, isMock ? 'true' : 'false');
  }
}

export const setApiBaseUrl = setStoredApiUrl;
export const setMockMode = setStoredIsMockMode;

export const environment: AppEnvironment = {
  get apiBaseUrl() {
    return getStoredApiUrl();
  },
  get isMockMode() {
    return getStoredIsMockMode();
  },
  appName: 'AI ERP Platform',
  version: '2.4.0',
  endpoints: {
    auth: {
      login: '/token/',
      refresh: '/token/refresh/',
      currentUser: '/auth/user/',
      forgotPassword: '/auth/password/reset/',
    },
    ai: {
      chat: '/ai/chat/',
      confirmAction: '/ai/action/confirm/',
      insights: '/ai/insights/',
    },
    dashboard: {
      kpis: '/dashboard/kpis/',
      charts: '/dashboard/charts/',
    },
    sales: {
      orders: '/sales/orders/',
      invoices: '/sales/invoices/',
      customers: '/sales/customers/',
    },
    purchase: {
      orders: '/purchase/orders/',
      vendors: '/purchase/vendors/',
    },
    inventory: {
      products: '/inventory/products/',
      adjustments: '/inventory/adjustments/',
      warehouses: '/inventory/warehouses/',
    },
    finance: {
      expenses: '/finance/expenses/',
      accounts: '/finance/accounts/',
      reports: '/finance/reports/',
    },
    approvals: {
      list: '/approvals/',
      action: '/approvals/action/',
    },
    documents: {
      upload: '/documents/upload/',
      extract: '/documents/extract/',
    },
    notifications: {
      list: '/notifications/',
      markRead: '/notifications/mark-read/',
    },
    n8n: {
      webhook: '/webhooks/n8n/',
      webhookUrl: '/webhooks/n8n/',
      triggers: '/webhooks/triggers/',
    },
  },
};
