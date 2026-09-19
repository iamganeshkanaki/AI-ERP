import { apiRequest } from './apiClient';
import { environment } from '../config/environment';
import {
  Product,
  SalesOrder,
  PurchaseOrder,
  ApprovalItem,
  Notification,
  DashboardKPIs,
  AIInsight,
} from '../types/erp';
import {
  mockKPIs,
  mockInsights,
  mockProducts,
  mockSalesOrders,
  mockPurchaseOrders,
  mockApprovals,
  mockNotifications,
} from './mockData';

let stateProducts = [...mockProducts];
let stateSalesOrders = [...mockSalesOrders];
let statePurchaseOrders = [...mockPurchaseOrders];
let stateApprovals = [...mockApprovals];
let stateNotifications = [...mockNotifications];

export const erpDataService = {
  // 1. Dashboard
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    if (!environment.isMockMode) {
      return apiRequest<DashboardKPIs>(environment.endpoints.dashboard.kpis);
    }
    await new Promise((r) => setTimeout(r, 200));
    return {
      ...mockKPIs,
      pendingApprovalsCount: stateApprovals.filter((a) => a.status === 'Pending').length,
    };
  },

  async getAIInsights(): Promise<AIInsight[]> {
    if (!environment.isMockMode) {
      return apiRequest<AIInsight[]>(environment.endpoints.ai.insights);
    }
    await new Promise((r) => setTimeout(r, 150));
    return mockInsights;
  },

  // 2. Inventory / Products
  async getProducts(): Promise<Product[]> {
    if (!environment.isMockMode) {
      const res = await apiRequest<{ results: Product[] } | Product[]>(environment.endpoints.inventory.products);
      return Array.isArray(res) ? res : res.results;
    }
    await new Promise((r) => setTimeout(r, 250));
    return [...stateProducts];
  },

  async createProduct(product: Omit<Product, 'id' | 'lastUpdated'>): Promise<Product> {
    if (!environment.isMockMode) {
      return apiRequest<Product>(environment.endpoints.inventory.products, {
        method: 'POST',
        body: JSON.stringify(product),
      });
    }
    const newProduct: Product = {
      ...product,
      id: `PRD-00${stateProducts.length + 1}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    stateProducts = [newProduct, ...stateProducts];
    return newProduct;
  },

  // 3. Sales
  async getSalesOrders(): Promise<SalesOrder[]> {
    if (!environment.isMockMode) {
      const res = await apiRequest<{ results: SalesOrder[] } | SalesOrder[]>(environment.endpoints.sales.orders);
      return Array.isArray(res) ? res : res.results;
    }
    await new Promise((r) => setTimeout(r, 250));
    return [...stateSalesOrders];
  },

  async createSalesOrder(order: Partial<SalesOrder>): Promise<SalesOrder> {
    if (!environment.isMockMode) {
      return apiRequest<SalesOrder>(environment.endpoints.sales.orders, {
        method: 'POST',
        body: JSON.stringify(order),
      });
    }
    const newOrder: SalesOrder = {
      id: `SO-${Math.floor(8930 + Math.random() * 500)}`,
      orderNumber: `SO-2026-${Math.floor(8930 + Math.random() * 500)}`,
      customerName: order.customerName || 'Standard Client',
      date: new Date().toISOString().split('T')[0],
      itemsCount: order.itemsCount || 1,
      totalAmount: order.totalAmount || 50000,
      paymentStatus: order.paymentStatus || 'Pending',
      fulfillmentStatus: order.fulfillmentStatus || 'Confirmed',
    };
    stateSalesOrders = [newOrder, ...stateSalesOrders];
    return newOrder;
  },

  // 4. Purchase
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    if (!environment.isMockMode) {
      const res = await apiRequest<{ results: PurchaseOrder[] } | PurchaseOrder[]>(environment.endpoints.purchase.orders);
      return Array.isArray(res) ? res : res.results;
    }
    await new Promise((r) => setTimeout(r, 250));
    return [...statePurchaseOrders];
  },

  async createPurchaseOrder(po: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    if (!environment.isMockMode) {
      return apiRequest<PurchaseOrder>(environment.endpoints.purchase.orders, {
        method: 'POST',
        body: JSON.stringify(po),
      });
    }
    const newPo: PurchaseOrder = {
      id: `PO-${Math.floor(4410 + Math.random() * 500)}`,
      poNumber: `PO-2026-${Math.floor(4410 + Math.random() * 500)}`,
      vendorName: po.vendorName || 'ABC Traders & Supplies',
      issueDate: new Date().toISOString().split('T')[0],
      expectedDate: po.expectedDate || '2026-09-28',
      totalAmount: po.totalAmount || 120000,
      status: po.status || 'Waiting Approval',
    };
    statePurchaseOrders = [newPo, ...statePurchaseOrders];
    return newPo;
  },

  // 5. Approvals
  async getApprovals(): Promise<ApprovalItem[]> {
    if (!environment.isMockMode) {
      const res = await apiRequest<{ results: ApprovalItem[] } | ApprovalItem[]>(environment.endpoints.approvals.list);
      return Array.isArray(res) ? res : res.results;
    }
    await new Promise((r) => setTimeout(r, 200));
    return [...stateApprovals];
  },

  async handleApproval(id: string, action: 'Approve' | 'Reject', note?: string): Promise<ApprovalItem> {
    if (!environment.isMockMode) {
      return apiRequest<ApprovalItem>(environment.endpoints.approvals.action, {
        method: 'POST',
        body: JSON.stringify({ id, action, note }),
      });
    }
    await new Promise((r) => setTimeout(r, 400));
    stateApprovals = stateApprovals.map((item) =>
      item.id === id ? { ...item, status: action === 'Approve' ? 'Approved' : 'Rejected' } : item
    );
    const updated = stateApprovals.find((i) => i.id === id)!;
    return updated;
  },

  // 6. Notifications
  async getNotifications(): Promise<Notification[]> {
    if (!environment.isMockMode) {
      const res = await apiRequest<{ results: Notification[] } | Notification[]>(environment.endpoints.notifications.list);
      return Array.isArray(res) ? res : res.results;
    }
    return [...stateNotifications];
  },

  async markNotificationRead(id?: string): Promise<void> {
    if (!environment.isMockMode) {
      await apiRequest(environment.endpoints.notifications.markRead, {
        method: 'POST',
        body: JSON.stringify({ id }),
      });
      return;
    }
    if (id) {
      stateNotifications = stateNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    } else {
      stateNotifications = stateNotifications.map((n) => ({ ...n, read: true }));
    }
  },

  // 7. Document OCR Extraction
  async extractDocumentInvoice(file: { name: string; size: number }): Promise<any> {
    if (!environment.isMockMode) {
      const formData = new FormData();
      formData.append('document', file as any);
      return apiRequest(environment.endpoints.documents.extract, {
        method: 'POST',
        body: formData,
      });
    }

    // Pipeline simulated stages
    await new Promise((r) => setTimeout(r, 800));
    return {
      vendorName: 'Continental Steels & Alloys Corp',
      vendorGst: '27AABCC1234F1Z9',
      invoiceNumber: 'INV-CSA-9942',
      invoiceDate: '2026-09-18',
      dueDate: '2026-10-18',
      currency: 'INR',
      items: [
        { description: 'Seamless Stainless Steel 316L Pipes (6m)', qty: 40, unitPrice: 3200, amount: 128000 },
        { description: 'Titanium Fastener Assortment Box #8', qty: 15, unitPrice: 2400, amount: 36000 },
      ],
      subtotal: 164000,
      taxGstRate: '18%',
      taxAmount: 29520,
      totalAmount: 193520,
      confidenceScore: 0.98,
      status: 'Ready for Review',
    };
  },
};
