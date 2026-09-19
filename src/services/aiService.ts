import { apiRequest } from './apiClient';
import { environment } from '../config/environment';
import { AIChatMessage, AIChatRequest } from '../types/ai';

export const aiService = {
  async sendMessage(request: AIChatRequest): Promise<AIChatMessage> {
    if (!environment.isMockMode) {
      const response = await apiRequest<any>(environment.endpoints.ai.chat, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      // Map backend response into standard AIChatMessage
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: response.message || 'Operation processed by AI Agent.',
        responseType: response.type || 'text',
        tableData: response.tableData || (response.data && response.type === 'table' ? response.data : undefined),
        chartData: response.chart,
        actionPayload: response.requires_confirmation ? response.actions?.[0] : undefined,
      };
    }

    // High-fidelity local AI Engine response simulation
    await new Promise((r) => setTimeout(r, 650));
    const query = request.message.toLowerCase();

    // 1. Purchase order confirmation
    if (query.includes('purchase order') || query.includes('po') || query.includes('abc traders')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "I have prepared the Purchase Order draft for ABC Traders. Please review the items, supplier terms, and budget allocation below before committing.",
        responseType: 'confirmation',
        actionPayload: {
          actionType: 'create_po',
          title: 'Purchase Order Preview',
          summary: 'PO-2026-4405 • ABC Traders & Supplies',
          details: {
            vendor: 'ABC Traders & Supplies',
            expectedDelivery: '2026-09-26 (5 Business Days)',
            paymentTerms: 'Net 30 Days',
            products: [
              { name: 'Industrial Sensor Module B3', qty: 100, unitPrice: 4500, subtotal: 450000 },
              { name: 'Precision Titanium Bearing Set', qty: 50, unitPrice: 8900, subtotal: 445000 },
            ],
            subtotal: 895000,
            gstTax: 161100,
            totalAmount: 1056100,
          },
          status: 'waiting_confirmation',
        },
        quickActions: [
          { label: 'View ABC Traders History', prompt: 'Show previous purchase orders for ABC Traders' },
          { label: 'Check Warehouse Capacity', prompt: 'Which warehouse has space for 150 items?' },
        ],
      };
    }

    // 2. Low stock query
    if (query.includes('low') || query.includes('stock') || query.includes('inventory')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Found 3 items currently below minimum safety reorder thresholds in Central & West warehouses:',
        responseType: 'table',
        tableData: {
          title: 'Critical Low Stock SKUs',
          columns: [
            { key: 'sku', label: 'SKU Code', align: 'left' },
            { key: 'name', label: 'Product Name', align: 'left' },
            { key: 'stockQty', label: 'In Stock', align: 'center' },
            { key: 'reorderLevel', label: 'Reorder Level', align: 'center' },
            { key: 'warehouse', label: 'Warehouse Location', align: 'left' },
          ],
          rows: [
            { sku: 'SKU-ELEC-409', name: 'Industrial Sensor Module B3', stockQty: 14, reorderLevel: 50, warehouse: 'Main Central Hub' },
            { sku: 'SKU-MECH-882', name: 'Precision Titanium Bearing Set', stockQty: 8, reorderLevel: 25, warehouse: 'West Coast Depo' },
            { sku: 'SKU-RAW-304', name: 'Seamless Stainless Steel Tubing', stockQty: 0, reorderLevel: 100, warehouse: 'Main Central Hub' },
          ],
          totalSummary: 'Total 3 SKUs requiring procurement replenishment.',
        },
        quickActions: [
          { label: 'Create PO for ABC Traders', prompt: 'Create a purchase order for ABC Traders' },
          { label: 'View Inventory Adjustments', prompt: 'Show recent stock movements' },
        ],
      };
    }

    // 3. Sales today & comparison
    if (query.includes('sales') || query.includes('today')) {
      if (query.includes('compare') || query.includes('last month') || query.includes('trend')) {
        return {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: 'Sales in September are outperforming August by +18.5%. Here is the 6-month revenue vs purchase progression:',
          responseType: 'chart',
          chartData: {
            title: 'Revenue vs Procurement Spend (Apr - Sep 2026)',
            chartType: 'bar',
            xAxisKey: 'month',
            dataKeys: [
              { key: 'sales', color: '#4f46e5', label: 'Sales Revenue (₹)' },
              { key: 'purchases', color: '#0ea5e9', label: 'Purchases (₹)' },
            ],
            data: [
              { month: 'Apr', sales: 320000, purchases: 210000 },
              { month: 'May', sales: 410000, purchases: 290000 },
              { month: 'Jun', sales: 380000, purchases: 240000 },
              { month: 'Jul', sales: 520000, purchases: 310000 },
              { month: 'Aug', sales: 490000, purchases: 280000 },
              { month: 'Sep', sales: 580000, purchases: 340000 },
            ],
          },
          quickActions: [
            { label: 'Download Sales PDF', prompt: 'Generate sales PDF report for Q3' },
            { label: 'Show Overdue Invoices', prompt: 'Show overdue invoices' },
          ],
        };
      }

      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "Today's gross sales reached ₹4,28,500 across 6 fulfilled customer dispatches. Key contributor is Nexis Aerospace (₹4,20,000).",
        responseType: 'table',
        tableData: {
          title: "Top Products by Sales Volume (September)",
          columns: [
            { key: 'product', label: 'Product Name', align: 'left' },
            { key: 'quantity', label: 'Quantity Sold', align: 'center' },
            { key: 'revenue', label: 'Gross Revenue (₹)', align: 'right' },
          ],
          rows: [
            { product: 'Industrial Sensor Module B3', quantity: 520, revenue: '₹4,20,000' },
            { product: 'High-Pressure Hydraulic Valve 250bar', quantity: 410, revenue: '₹3,80,000' },
            { product: 'Brushless DC Motor 48V', quantity: 180, revenue: '₹1,95,000' },
            { product: 'Precision Titanium Bearing Set', quantity: 95, revenue: '₹1,42,000' },
          ],
          totalSummary: 'Total Volume: 1,205 units • Total Revenue: ₹11,37,000',
        },
        quickActions: [
          { label: 'Compare with Last Month', prompt: 'Compare sales with last month' },
          { label: 'Show Overdue Invoices', prompt: 'Show overdue invoices' },
        ],
      };
    }

    // 4. Overdue invoices
    if (query.includes('overdue') || query.includes('invoice')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'Identified 3 invoices exceeding terms by more than 15 days. Total aging receivables amount to ₹4,60,000.',
        responseType: 'table',
        tableData: {
          title: 'Overdue Receivables Aging Analysis',
          columns: [
            { key: 'invoiceNumber', label: 'Invoice #', align: 'left' },
            { key: 'customer', label: 'Client Organization', align: 'left' },
            { key: 'daysOverdue', label: 'Days Overdue', align: 'center' },
            { key: 'amount', label: 'Outstanding (₹)', align: 'right' },
          ],
          rows: [
            { invoiceNumber: 'INV-2026-7712', customer: 'Zenith Marine Works', daysOverdue: 34, amount: '₹2,40,000' },
            { invoiceNumber: 'INV-2026-7680', customer: 'Orion Advanced Robotics', daysOverdue: 22, amount: '₹1,35,000' },
            { invoiceNumber: 'INV-2026-7649', customer: 'Vanguard Instruments', daysOverdue: 16, amount: '₹85,000' },
          ],
          totalSummary: 'Total At-Risk Outstanding: ₹4,60,000',
        },
        quickActions: [
          { label: 'Send Payment Reminders', prompt: 'Send automatic payment reminder emails to overdue clients' },
          { label: 'Show Cashflow Forecast', prompt: 'Give me this month expenses and cashflow' },
        ],
      };
    }

    // 5. Pending approvals
    if (query.includes('approval') || query.includes('pending')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: 'You have 5 high-priority requests awaiting your approval in the Approval Center:',
        responseType: 'table',
        tableData: {
          title: 'Pending Authorization Queue',
          columns: [
            { key: 'ref', label: 'Reference #', align: 'left' },
            { key: 'type', label: 'Type', align: 'left' },
            { key: 'requester', label: 'Requester', align: 'left' },
            { key: 'amount', label: 'Value (₹)', align: 'right' },
          ],
          rows: [
            { ref: 'PO-2026-4401', type: 'Purchase Order', requester: 'David Vance', amount: '₹1,20,000' },
            { ref: 'EXP-2026-088', type: 'Expense Claim', requester: 'Priya Sharma', amount: '₹42,500' },
            { ref: 'PAY-2026-221', type: 'Vendor Payment', requester: 'Sandra Bullock', amount: '₹2,80,000' },
            { ref: 'LV-2026-034', type: 'Leave Request', requester: 'Marcus Sterling', amount: '5 Days' },
          ],
          totalSummary: 'Authorization required before 5:00 PM today to meet payment cutoffs.',
        },
        quickActions: [
          { label: 'Go to Approval Center', prompt: 'Open the approval center' },
          { label: 'Approve PO-2026-4401', prompt: 'Approve purchase order PO-2026-4401' },
        ],
      };
    }

    // 6. Expenses
    if (query.includes('expense')) {
      return {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "September operational expenses stand at ₹31,20,000 against a monthly budget of ₹35,00,000 (89.1% utilized). R&D and Freight have the highest variance.",
        responseType: 'table',
        tableData: {
          title: 'Department Expense Distribution',
          columns: [
            { key: 'department', label: 'Department', align: 'left' },
            { key: 'budget', label: 'Budget (₹)', align: 'right' },
            { key: 'actual', label: 'Actual (₹)', align: 'right' },
            { key: 'utilization', label: 'Utilization', align: 'center' },
          ],
          rows: [
            { department: 'Engineering & R&D', budget: '₹12,00,000', actual: '₹11,40,000', utilization: '95.0%' },
            { department: 'Operations & Logistics', budget: '₹10,00,000', actual: '₹8,90,000', utilization: '89.0%' },
            { department: 'Sales & Marketing', budget: '₹8,00,000', actual: '₹6,70,000', utilization: '83.7%' },
            { department: 'Administration & HR', budget: '₹5,00,000', actual: '₹4,20,000', utilization: '84.0%' },
          ],
          totalSummary: 'Available Remaining Margin: ₹3,80,000',
        },
        quickActions: [
          { label: 'Create New Expense', prompt: 'Create an expense' },
          { label: 'Compare with Last Month', prompt: 'Compare expenses with last month' },
        ],
      };
    }

    // Default intelligent assistant fallback
    return {
      id: `ai-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `I have analyzed your request: "${request.message}". All live ERP metrics are healthy. What specific module would you like to examine or update?`,
      responseType: 'text',
      quickActions: [
        { label: "Show Today's Sales", prompt: "Show today's sales" },
        { label: 'Check Low Stock', prompt: 'Which products are low in stock?' },
        { label: 'Create Purchase Order', prompt: 'Create a purchase order for ABC Traders' },
        { label: 'Show Overdue Invoices', prompt: 'Show overdue invoices' },
      ],
    };
  },

  async confirmAction(actionPayload: any): Promise<any> {
    if (!environment.isMockMode) {
      return apiRequest(environment.endpoints.ai.confirmAction, {
        method: 'POST',
        body: JSON.stringify(actionPayload),
      });
    }

    // Simulate backend action processing
    await new Promise((r) => setTimeout(r, 1200));
    return {
      success: true,
      resultId: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      message: `Purchase order successfully created and queued for vendor dispatch.`,
    };
  },
};
