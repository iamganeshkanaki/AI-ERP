import {
  WorkItem,
  WorkTodaySummary,
  WorkFilter,
  WorkActionType,
  WorkItemActionRequest,
  WorkItemActionResponse,
} from '../types/workToday';
import { apiRequest } from './apiClient';
import { environment } from '../config/environment';

const INITIAL_WORK_ITEMS: WorkItem[] = [
  // 1. Pending Approvals
  {
    id: 'work-app-101',
    category: 'Pending Approvals',
    module: 'Approvals',
    title: 'Purchase Order Approval',
    partyName: 'ABC Traders & Supplies',
    referenceNumber: 'PO-2026-4401',
    amount: 125000,
    date: '2026-09-18',
    dueDateLabel: 'Created: 18 Sep 2026',
    priority: 'High',
    urgency: 'Critical',
    status: 'Pending Sign-Off',
    requiredAction: 'Executive authorization required before 5:00 PM cutoff to secure production batch delivery.',
    requiredPermission: 'purchase.approve',
    aiPriorityRank: 1,
    aiUrgencyReason: 'Vendor requires 24h manufacturing slot confirmation. Prevents factory assembly line stoppage.',
    businessImpact: 'Crucial sensor components for October robotics manufacturing cycle.',
    primaryActionLabel: 'Approve',
    primaryActionType: 'Approve',
    secondaryActionLabel: 'Review',
    secondaryActionType: 'Review',
    metadata: {
      items: '100x Industrial Sensor Module B3, 50x Precision Bearings',
      requester: 'David Vance (Procurement)',
      paymentTerms: 'Net 30 Days',
    },
  },
  {
    id: 'work-app-102',
    category: 'Pending Approvals',
    module: 'Approvals',
    title: 'R&D Calibration Expense Claim',
    partyName: 'Priya Sharma (Senior R&D Lead)',
    referenceNumber: 'EXP-2026-088',
    amount: 42500,
    date: '2026-09-18',
    dueDateLabel: 'Created: 18 Sep 2026',
    priority: 'High',
    urgency: 'Important',
    status: 'Pending Review',
    requiredAction: 'Verify attached fuel, flight, and hotel receipts for reimbursement sign-off.',
    requiredPermission: 'finance.approve',
    aiPriorityRank: 6,
    aiUrgencyReason: 'All 6 tax invoices verified and match corporate travel limits.',
    businessImpact: 'Employee reimbursement cycle closes tomorrow.',
    primaryActionLabel: 'Approve',
    primaryActionType: 'Approve',
    secondaryActionLabel: 'Reject',
    secondaryActionType: 'Reject',
    metadata: {
      department: 'Engineering',
      category: 'Travel & Testing Calibrations',
      receiptsCount: 6,
    },
  },

  // 2. Overdue Payments
  {
    id: 'work-inv-1023',
    category: 'Overdue Payments',
    module: 'Finance',
    title: 'Overdue Customer Invoice',
    partyName: 'ABC Pvt Ltd (Zenith Group)',
    referenceNumber: 'INV-1023',
    amount: 85000,
    date: '2026-09-07',
    dueDateLabel: 'Due: 12 days ago',
    priority: 'High',
    urgency: 'Important',
    status: '12 Days Past Due',
    requiredAction: 'Contact accounts department and issue formal payment follow-up notice.',
    requiredPermission: 'finance.view',
    aiPriorityRank: 2,
    aiUrgencyReason: 'Credit limit reached (₹25L). Outstanding aging is impacting weekly receivables quota.',
    businessImpact: 'Cash collection needed for end-of-month vendor payables.',
    primaryActionLabel: 'Follow Up',
    primaryActionType: 'Follow Up',
    secondaryActionLabel: 'View',
    secondaryActionType: 'View',
    metadata: {
      contactPerson: 'Arun Verma / Finance Desk',
      phone: '+91 98200 12345',
      originalDueDate: '07 Sep 2026',
    },
  },
  {
    id: 'work-inv-7712',
    category: 'Overdue Payments',
    module: 'Finance',
    title: 'Overdue Commercial Invoice',
    partyName: 'Zenith Marine Works',
    referenceNumber: 'INV-7712',
    amount: 240000,
    date: '2026-08-16',
    dueDateLabel: 'Due: 34 days ago',
    priority: 'High',
    urgency: 'Critical',
    status: '34 Days Past Due',
    requiredAction: 'Review payment history, issue legal warning notice, or execute payment plan.',
    requiredPermission: 'finance.manage',
    aiPriorityRank: 3,
    aiUrgencyReason: 'Overdue exceeds 30-day corporate tolerance window. High risk of bad debt aging.',
    businessImpact: '₹2.4L outstanding balance at risk of default.',
    primaryActionLabel: 'Pay',
    primaryActionType: 'Pay',
    secondaryActionLabel: 'Review',
    secondaryActionType: 'Review',
    metadata: {
      contactPerson: 'Capt. Nair',
      email: 'nair@zenithmarine.com',
      totalOrders: 4,
    },
  },

  // 3. Low Stock Items
  {
    id: 'work-stock-01',
    category: 'Low Stock',
    module: 'Inventory',
    title: 'Printer Cartridge (High-Yield Toner Black)',
    partyName: 'Office & Factory Printing Hub',
    referenceNumber: 'SKU-SUPP-109',
    currentStock: 12,
    reorderLevel: 25,
    date: '2026-09-19',
    dueDateLabel: 'Runout in: 3 days',
    priority: 'High',
    urgency: 'Important',
    status: 'Low Stock (12 / 25)',
    requiredAction: 'Create purchase requisition for 50 cartridges to prevent invoice printing delays.',
    requiredPermission: 'inventory.view',
    aiPriorityRank: 4,
    aiUrgencyReason: 'Warehouse dispatch shipping labels rely on this printer. Stockout disrupts shipping.',
    businessImpact: 'High operational impact on warehouse shipping label generation.',
    primaryActionLabel: 'Reorder',
    primaryActionType: 'Reorder',
    secondaryActionLabel: 'View',
    secondaryActionType: 'View',
    metadata: {
      warehouse: 'Central Supply Depot',
      preferredSupplier: 'Alpha Stationers & Tech',
      unitCost: 1850,
    },
  },
  {
    id: 'work-stock-02',
    category: 'Low Stock',
    module: 'Inventory',
    title: 'Industrial Sensor Module B3',
    partyName: 'Sensors & Electrical Category',
    referenceNumber: 'SKU-ELEC-409',
    currentStock: 14,
    reorderLevel: 50,
    date: '2026-09-18',
    dueDateLabel: 'Stockout in: 4 days',
    priority: 'High',
    urgency: 'Important',
    status: 'Critical Low (14 / 50)',
    requiredAction: 'Reorder 100 modules from ABC Traders to maintain robotics assembly buffer.',
    requiredPermission: 'inventory.view',
    aiPriorityRank: 5,
    aiUrgencyReason: 'High consumption SKU. 8 units scheduled for SO-8922 fulfillment today.',
    businessImpact: 'Production bottleneck for robotics line.',
    primaryActionLabel: 'Reorder',
    primaryActionType: 'Reorder',
    secondaryActionLabel: 'Assign',
    secondaryActionType: 'Assign',
    metadata: {
      warehouse: 'Main Central Hub',
      preferredSupplier: 'ABC Traders & Supplies',
      unitCost: 4500,
    },
  },

  // 4. Pending Purchase Orders
  {
    id: 'work-po-4402',
    category: 'Pending Purchases',
    module: 'Purchase',
    title: 'Silicon Semiconductor Requisition',
    partyName: 'MicroChip Foundry Int',
    referenceNumber: 'PO-2026-4402',
    amount: 485000,
    date: '2026-09-17',
    dueDateLabel: 'Awaiting Ack: 2 days',
    priority: 'High',
    urgency: 'Important',
    status: 'Awaiting Vendor Ack',
    requiredAction: 'Follow up with vendor sales engineer for production delivery schedule.',
    requiredPermission: 'purchase.view',
    aiPriorityRank: 7,
    aiUrgencyReason: 'Lead time is 11 business days. Delivery target Sept 28 depends on acknowledgement today.',
    businessImpact: 'Silicon microcontrollers for Q4 smart grid line.',
    primaryActionLabel: 'Follow Up',
    primaryActionType: 'Follow Up',
    secondaryActionLabel: 'Review',
    secondaryActionType: 'Review',
    metadata: {
      contactPerson: 'Sales Team / MicroChip Foundry',
      expectedDate: '2026-09-28',
    },
  },

  // 5. Pending Sales Orders
  {
    id: 'work-so-8922',
    category: 'Pending Sales Orders',
    module: 'Sales',
    title: 'Commercial Solar Inverter Dispatch',
    partyName: 'Quantum Solar Systems Ltd',
    referenceNumber: 'SO-2026-8922',
    amount: 380000,
    date: '2026-09-18',
    dueDateLabel: 'Target Dispatch: Today',
    priority: 'High',
    urgency: 'Important',
    status: 'Ready for Dispatch',
    requiredAction: 'Review final packaging inspection, assign warehouse carrier, and confirm dispatch.',
    requiredPermission: 'sales.view',
    aiPriorityRank: 8,
    aiUrgencyReason: 'Customer remitted 50% advance. Delivery deadline committed for tomorrow.',
    businessImpact: '₹3.8L gross revenue recognition upon carrier handover.',
    primaryActionLabel: 'Confirm Dispatch',
    primaryActionType: 'Confirm Dispatch',
    secondaryActionLabel: 'Assign',
    secondaryActionType: 'Assign',
    metadata: {
      itemsCount: 14,
      carrier: 'BlueDart Logistics Fleet',
    },
  },

  // 6. Employee Requests
  {
    id: 'work-emp-034',
    category: 'Employee Requests',
    module: 'HR',
    title: 'Annual Vacation Leave (5 Days)',
    partyName: 'Marcus Sterling (Logistics Supervisor)',
    referenceNumber: 'LV-2026-034',
    date: '2026-09-18',
    dueDateLabel: 'Dates: Sept 28 - Oct 02',
    priority: 'Medium',
    urgency: 'Normal',
    status: 'Pending Manager Approval',
    requiredAction: 'Review shift handover plan with Linda Chen and approve leave application.',
    requiredPermission: 'hr.approve',
    aiPriorityRank: 9,
    aiUrgencyReason: 'Shift handover already agreed with warehouse supervisor Linda Chen.',
    businessImpact: 'Warehouse floor supervision coverage next week.',
    primaryActionLabel: 'Approve',
    primaryActionType: 'Approve',
    secondaryActionLabel: 'Reject',
    secondaryActionType: 'Reject',
    metadata: {
      department: 'Operations & Logistics',
      leaveBalance: '14 Days remaining',
    },
  },

  // 7. Today's Tasks
  {
    id: 'work-task-01',
    category: "Today's Tasks",
    module: 'Tasks',
    title: 'GST GSTR-3B Monthly Tax Pre-Audit',
    partyName: 'Finance & Taxation Compliance',
    referenceNumber: 'TASK-COMP-901',
    date: '2026-09-19',
    dueDateLabel: 'Due: Today 5:00 PM',
    priority: 'High',
    urgency: 'Critical',
    status: 'In Progress',
    requiredAction: 'Review input tax credit balance with senior accountant Sandra Bullock and assign final signoff.',
    requiredPermission: 'finance.view',
    aiPriorityRank: 10,
    aiUrgencyReason: 'Statutory government compliance deadline tonight avoids penalty interest on tax liabilities.',
    businessImpact: 'Statutory government compliance deadline.',
    primaryActionLabel: 'Mark Done',
    primaryActionType: 'Mark Done',
    secondaryActionLabel: 'Assign',
    secondaryActionType: 'Assign',
    metadata: {
      assignee: 'Sandra Bullock',
      statutoryDate: '2026-09-20',
    },
  },

  // 8. Important AI Alerts
  {
    id: 'work-ai-alert-01',
    category: 'Important AI Alerts',
    module: 'AI',
    title: 'Raw Material Margin Anomaly',
    partyName: 'Automated Procurement Watchdog',
    referenceNumber: 'AI-WARN-702',
    amount: 68000,
    date: '2026-09-19',
    dueDateLabel: 'Detected: 2 hours ago',
    priority: 'High',
    urgency: 'Important',
    status: 'Anomaly Detected',
    requiredAction: 'Investigate 8.4% steel cost increase and review impact on PO-4403 margins.',
    requiredPermission: 'ai.use',
    aiPriorityRank: 11,
    aiUrgencyReason: 'Steel vendor quote increased while client contract SO-8910 price is fixed.',
    businessImpact: 'Estimated margin erosion of ₹68,000 if not adjusted.',
    primaryActionLabel: 'Investigate',
    primaryActionType: 'Investigate',
    secondaryActionLabel: 'Review',
    secondaryActionType: 'Review',
    metadata: {
      affectedSKU: 'Raw Stainless 316 Rods',
      variancePercent: '+8.4%',
    },
  },
];

class WorkTodayService {
  private items: WorkItem[] = [...INITIAL_WORK_ITEMS];
  private listeners: (() => void)[] = [];

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Filter items according to the logged-in user's role and granular permissions.
   * Prevents leaking confidential records to unauthorized roles.
   */
  private filterAuthorized(items: WorkItem[], userPermissions?: string[]): WorkItem[] {
    if (!userPermissions || userPermissions.includes('*')) {
      return items;
    }
    return items.filter((item) => {
      // Check if user has the specific permission or wildcard module access
      const [modulePrefix] = item.requiredPermission.split('.');
      return (
        userPermissions.includes(item.requiredPermission) ||
        userPermissions.includes(`${modulePrefix}.*`) ||
        userPermissions.includes(`${modulePrefix}.view`) ||
        userPermissions.includes(`${modulePrefix}.manage`)
      );
    });
  }

  public async getSummary(userPermissions?: string[]): Promise<WorkTodaySummary> {
    if (!environment.isMockMode) {
      try {
        const res = await apiRequest<WorkTodaySummary>('/api/v1/work-today/summary/');
        return res;
      } catch (e) {
        console.warn('Backend work-today summary unavailable, falling back to local service');
      }
    }

    const authorized = this.filterAuthorized(this.items, userPermissions);
    const activeItems = authorized.filter((item) => !item.completed);
    const criticalCount = activeItems.filter((i) => i.urgency === 'Critical').length;
    const importantCount = activeItems.filter((i) => i.urgency === 'Important').length;
    const normalCount = activeItems.filter((i) => i.urgency === 'Normal').length;

    const categoryCounts: Record<string, number> = {
      'Pending Approvals': 0,
      'Overdue Payments': 0,
      'Low Stock': 0,
      'Pending Purchases': 0,
      'Pending Sales Orders': 0,
      'Employee Requests': 0,
      "Today's Tasks": 0,
      'Important AI Alerts': 0,
    };

    activeItems.forEach((item) => {
      if (categoryCounts[item.category] !== undefined) {
        categoryCounts[item.category]++;
      }
    });

    const highPriorityCount = activeItems.filter(
      (i) => i.priority === 'High' || i.urgency === 'Critical'
    ).length;

    const headlineSummary = `Today you have ${activeItems.length} items requiring attention. ${highPriorityCount} are high priority.`;

    return {
      totalCount: activeItems.length,
      criticalCount,
      importantCount,
      normalCount,
      categoryCounts: categoryCounts as any,
      greeting: 'Today',
      headlineSummary,
    };
  }

  public async getFilteredItems(
    filter: WorkFilter,
    sortByUrgency: boolean = false,
    userPermissions?: string[]
  ): Promise<WorkItem[]> {
    if (!environment.isMockMode) {
      try {
        const queryParams = new URLSearchParams({
          filter,
          ai_prioritized: String(sortByUrgency),
        });
        const res = await apiRequest<WorkItem[]>(`/api/v1/work-today/items/?${queryParams}`);
        return res;
      } catch (e) {
        console.warn('Backend work-today items API unavailable, falling back to local service');
      }
    }

    // Simulated short network delay for realistic loading states
    await new Promise((r) => setTimeout(r, 120));

    const authorized = this.filterAuthorized(this.items, userPermissions);
    let result = authorized.filter((item) => !item.completed);

    switch (filter) {
      case 'High Priority':
        result = result.filter((i) => i.priority === 'High' || i.urgency === 'Critical');
        break;
      case 'Today':
        result = result.filter(
          (i) =>
            i.dueDateLabel.toLowerCase().includes('today') ||
            i.date === '2026-09-19'
        );
        break;
      case 'Overdue':
        result = result.filter(
          (i) =>
            i.category === 'Overdue Payments' ||
            i.dueDateLabel.toLowerCase().includes('ago')
        );
        break;
      case 'Approvals':
        result = result.filter((i) => i.category === 'Pending Approvals');
        break;
      case 'Finance':
        result = result.filter((i) => i.module === 'Finance');
        break;
      case 'Sales':
        result = result.filter((i) => i.module === 'Sales');
        break;
      case 'Purchase':
        result = result.filter((i) => i.module === 'Purchase');
        break;
      case 'Inventory':
        result = result.filter((i) => i.module === 'Inventory');
        break;
      case 'HR':
        result = result.filter((i) => i.module === 'HR');
        break;
      case 'All':
      default:
        break;
    }

    if (sortByUrgency) {
      result.sort((a, b) => {
        const rankA = a.aiPriorityRank ?? 99;
        const rankB = b.aiPriorityRank ?? 99;
        return rankA - rankB;
      });
    }

    return result;
  }

  public async executeAction(req: WorkItemActionRequest): Promise<WorkItemActionResponse> {
    if (!environment.isMockMode) {
      return apiRequest<WorkItemActionResponse>(`/api/v1/work-today/items/${req.itemId}/execute-action/`, {
        method: 'POST',
        body: JSON.stringify(req),
      });
    }

    // Local simulation
    const item = this.items.find((i) => i.id === req.itemId);
    if (!item) {
      throw new Error(`Work item ${req.itemId} not found.`);
    }

    item.completed = true;
    this.notify();

    return {
      success: true,
      itemId: req.itemId,
      actionExecuted: req.actionType,
      updatedStatus: 'Processed',
      transactionRef: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      message: `Successfully executed ${req.actionType} on ${item.title}`,
      auditLogId: `AUD-${Date.now()}`,
    };
  }

  public undoComplete(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.completed = false;
      this.notify();
    }
  }

  public resetAll(): void {
    this.items = [...INITIAL_WORK_ITEMS];
    this.notify();
  }
}

export const workTodayService = new WorkTodayService();
