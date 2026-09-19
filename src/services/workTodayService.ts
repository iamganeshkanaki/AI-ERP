import { WorkItem, WorkTodaySummary, WorkFilter } from '../types/workToday';

const INITIAL_WORK_ITEMS: WorkItem[] = [
  // 1. Pending Approvals
  {
    id: 'work-app-101',
    category: 'Pending Approvals',
    module: 'Approvals',
    title: 'Purchase Order',
    partyName: 'ABC Traders & Supplies',
    referenceNumber: 'PO-2026-4401',
    amount: 125000,
    date: '2026-09-18',
    dueDateLabel: 'Created: 18 Sep 2026',
    priority: 'High',
    urgency: 'Critical',
    status: 'Pending Sign-Off',
    requiredAction: 'Executive authorization required before 5:00 PM cutoff to ensure on-time delivery.',
    aiPriorityRank: 1,
    aiUrgencyReason: 'Vendor requires 24h manufacturing slot confirmation. Prevents factory line pause.',
    businessImpact: 'Crucial sensor components for October assembly cycle.',
    primaryActionLabel: 'Approve',
    primaryActionType: 'approve',
    secondaryActionLabel: 'View',
    secondaryActionType: 'view',
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
    title: 'R&D Field Expense Claim',
    partyName: 'Priya Sharma (Senior R&D Lead)',
    referenceNumber: 'EXP-2026-088',
    amount: 42500,
    date: '2026-09-18',
    dueDateLabel: 'Created: 18 Sep 2026',
    priority: 'High',
    urgency: 'Important',
    status: 'Pending Review',
    requiredAction: 'Verify attached fuel, flight, and hotel receipts for reimbursement approval.',
    aiPriorityRank: 6,
    aiUrgencyReason: 'All 6 tax invoices verified and match corporate travel limits.',
    businessImpact: 'Employee reimbursement cycle closes tomorrow.',
    primaryActionLabel: 'Approve',
    primaryActionType: 'approve',
    secondaryActionLabel: 'View',
    secondaryActionType: 'view',
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
    aiPriorityRank: 2,
    aiUrgencyReason: 'Credit limit reached (₹25L). Outstanding aging is impacting weekly receivables quota.',
    businessImpact: 'Cash collection needed for end-of-month vendor payables.',
    primaryActionLabel: 'Send Reminder',
    primaryActionType: 'send_reminder',
    secondaryActionLabel: 'View Invoice',
    secondaryActionType: 'view_invoice',
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
    requiredAction: 'Escalate to Accounts Director; place temporary credit hold on new dispatches.',
    aiPriorityRank: 3,
    aiUrgencyReason: 'Overdue exceeds 30-day corporate tolerance window. Risk score elevated.',
    businessImpact: '₹2.4L outstanding balance at risk of aging into bad debt.',
    primaryActionLabel: 'Send Reminder',
    primaryActionType: 'send_reminder',
    secondaryActionLabel: 'View Invoice',
    secondaryActionType: 'view_invoice',
    metadata: {
      contactPerson: 'Capt. Nair',
      email: 'nair@zenithmarine.com',
      totalOrders: 4,
    },
  },
  {
    id: 'work-inv-7680',
    category: 'Overdue Payments',
    module: 'Finance',
    title: 'Overdue Milestone Invoice',
    partyName: 'Orion Advanced Robotics',
    referenceNumber: 'INV-7680',
    amount: 135000,
    date: '2026-08-28',
    dueDateLabel: 'Due: 22 days ago',
    priority: 'Medium',
    urgency: 'Normal',
    status: '22 Days Past Due',
    requiredAction: 'Issue automated WhatsApp & Email notification to finance manager.',
    aiPriorityRank: 8,
    aiUrgencyReason: 'Client has historically settled within 25 days. Mild risk.',
    businessImpact: 'Expected settlement this week if reminded today.',
    primaryActionLabel: 'Send Reminder',
    primaryActionType: 'send_reminder',
    secondaryActionLabel: 'View Invoice',
    secondaryActionType: 'view_invoice',
    metadata: {
      contactPerson: 'Rohan Deshmukh',
      phone: '+91 98110 54321',
    },
  },

  // 3. Low Stock
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
    aiPriorityRank: 4,
    aiUrgencyReason: 'Warehouse dispatch shipping labels rely on this printer. Stockout disrupts dispatch operations.',
    businessImpact: 'High operational impact on warehouse shipping label generation.',
    primaryActionLabel: 'Create Purchase',
    primaryActionType: 'create_purchase',
    secondaryActionLabel: 'View Product',
    secondaryActionType: 'view_product',
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
    requiredAction: 'Approve or place restocking order with ABC Traders to maintain production SLA.',
    aiPriorityRank: 5,
    aiUrgencyReason: 'High consumption SKU. 8 units scheduled for SO-8922 fulfillment today.',
    businessImpact: 'Production bottleneck for robotics line.',
    primaryActionLabel: 'Create Purchase',
    primaryActionType: 'create_purchase',
    secondaryActionLabel: 'View Product',
    secondaryActionType: 'view_product',
    metadata: {
      warehouse: 'Main Central Hub',
      preferredSupplier: 'ABC Traders & Supplies',
      unitCost: 4500,
    },
  },
  {
    id: 'work-stock-03',
    category: 'Low Stock',
    module: 'Inventory',
    title: 'Precision Titanium Bearing Set',
    partyName: 'Mechanical Spares',
    referenceNumber: 'SKU-MECH-882',
    currentStock: 8,
    reorderLevel: 25,
    date: '2026-09-17',
    dueDateLabel: 'Stockout in: 6 days',
    priority: 'Medium',
    urgency: 'Normal',
    status: 'Low Stock (8 / 25)',
    requiredAction: 'Reorder 40 sets from West Coast Depo partner.',
    aiPriorityRank: 9,
    aiUrgencyReason: 'Secondary supplier available within 48 hours delivery.',
    businessImpact: 'Moderate maintenance inventory deficit.',
    primaryActionLabel: 'Create Purchase',
    primaryActionType: 'create_purchase',
    secondaryActionLabel: 'View Product',
    secondaryActionType: 'view_product',
    metadata: {
      warehouse: 'West Coast Depo',
      unitCost: 8900,
    },
  },

  // 4. Pending Purchases
  {
    id: 'work-po-4402',
    category: 'Pending Purchases',
    module: 'Purchase',
    title: 'Purchase Order Requisition',
    partyName: 'MicroChip Foundry Int',
    referenceNumber: 'PO-2026-4402',
    amount: 485000,
    date: '2026-09-17',
    dueDateLabel: 'Awaiting Ack: 2 days',
    priority: 'High',
    urgency: 'Important',
    status: 'Awaiting Vendor Ack',
    requiredAction: 'Follow up with vendor sales rep for delivery schedule confirmation.',
    aiPriorityRank: 7,
    aiUrgencyReason: 'Lead time is 11 business days. Delivery target Sept 28 depends on acknowledgement today.',
    businessImpact: 'Crucial silicon semiconductor chips for Q4 production.',
    primaryActionLabel: 'Send Reminder',
    primaryActionType: 'send_reminder',
    secondaryActionLabel: 'View',
    secondaryActionType: 'view',
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
    title: 'Sales Order Dispatch',
    partyName: 'Quantum Solar Systems Ltd',
    referenceNumber: 'SO-2026-8922',
    amount: 380000,
    date: '2026-09-18',
    dueDateLabel: 'Target Dispatch: Today',
    priority: 'High',
    urgency: 'Important',
    status: 'Ready for Dispatch',
    requiredAction: 'Verify final packaging inspection and generate carrier dispatch manifest.',
    aiPriorityRank: 10,
    aiUrgencyReason: 'Client has remitted 50% advance. Delivery deadline committed for tomorrow.',
    businessImpact: '₹3.8L gross revenue recognition upon carrier handover.',
    primaryActionLabel: 'Confirm Dispatch',
    primaryActionType: 'confirm_dispatch',
    secondaryActionLabel: 'View',
    secondaryActionType: 'view',
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
    partyName: 'Marcus Sterling (Logistics)',
    referenceNumber: 'LV-2026-034',
    date: '2026-09-18',
    dueDateLabel: 'Dates: Sept 28 - Oct 02',
    priority: 'Medium',
    urgency: 'Normal',
    status: 'Pending Manager Approval',
    requiredAction: 'Review handover plan with Linda Chen and approve shift cover schedule.',
    aiPriorityRank: 11,
    aiUrgencyReason: 'Shift handover already agreed with warehouse supervisor Linda Chen.',
    businessImpact: 'Team planning and workforce capacity for next week.',
    primaryActionLabel: 'Approve',
    primaryActionType: 'approve',
    secondaryActionLabel: 'View',
    secondaryActionType: 'view',
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
    title: 'GST GSTR-3B Monthly Return Pre-Audit',
    partyName: 'Finance & Compliance Team',
    referenceNumber: 'TASK-COMP-901',
    date: '2026-09-19',
    dueDateLabel: 'Due: Today 5:00 PM',
    priority: 'High',
    urgency: 'Critical',
    status: 'In Progress',
    requiredAction: 'Review input tax credit reconciliations with senior accountant Sandra Bullock.',
    aiPriorityRank: 12,
    aiUrgencyReason: 'Statutory compliance deadline tonight avoids penalty interest on tax liabilities.',
    businessImpact: 'Statutory government compliance deadline.',
    primaryActionLabel: 'Mark Complete',
    primaryActionType: 'mark_done',
    secondaryActionLabel: 'View',
    secondaryActionType: 'view',
    metadata: {
      assignee: 'Sandra Bullock',
      statutoryDate: '2026-09-20',
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

  public getItems(): WorkItem[] {
    return [...this.items];
  }

  public getSummary(): WorkTodaySummary {
    const activeItems = this.items.filter((item) => !item.completed);
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

    const highPriorityApprovals = activeItems.filter(
      (i) => i.category === 'Pending Approvals' && i.priority === 'High'
    ).length;
    const overdueInvoices = activeItems.filter((i) => i.category === 'Overdue Payments').length;
    const lowStockCount = activeItems.filter((i) => i.category === 'Low Stock').length;
    const employeeRequestsCount = activeItems.filter((i) => i.category === 'Employee Requests').length;
    const pendingPurchasesCount = activeItems.filter((i) => i.category === 'Pending Purchases').length;

    const headlineSummary = `You have ${activeItems.length} items requiring attention today.\n${highPriorityApprovals} high-priority approvals\n${overdueInvoices} overdue invoices\n${lowStockCount} low-stock products\n${employeeRequestsCount} employee requests\n${pendingPurchasesCount} pending purchase order`;

    return {
      totalCount: activeItems.length,
      criticalCount,
      importantCount,
      normalCount,
      categoryCounts: categoryCounts as any,
      greeting: 'Good morning.',
      headlineSummary,
    };
  }

  public getFilteredItems(filter: WorkFilter, sortByUrgency: boolean = false): WorkItem[] {
    let result = this.items.filter((item) => !item.completed);

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
        // AI Urgency Rank: 1 is top priority
        const rankA = a.aiPriorityRank ?? 99;
        const rankB = b.aiPriorityRank ?? 99;
        return rankA - rankB;
      });
    }

    return result;
  }

  public completeItem(id: string): WorkItem | null {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.completed = true;
      this.notify();
      return item;
    }
    return null;
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
