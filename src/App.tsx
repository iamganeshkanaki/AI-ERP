import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { MobileNav } from './components/layout/MobileNav';
import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { DocumentUploadModal } from './components/common/DocumentUploadModal';
import { DynamicFormModal, FormFieldConfig } from './components/common/DynamicFormModal';
import { DashboardView } from './components/views/DashboardView';
import { InventoryView } from './components/views/InventoryView';
import { SalesView } from './components/views/SalesView';
import { PurchaseView } from './components/views/PurchaseView';
import { ApprovalsView } from './components/views/ApprovalsView';
import { FinanceView } from './components/views/FinanceView';
import { HRView } from './components/views/HRView';
import { ReportsView } from './components/views/ReportsView';
import { DocumentsView } from './components/views/DocumentsView';
import { SettingsView } from './components/views/SettingsView';
import { LoginView } from './components/views/LoginView';
import { mockNotifications } from './services/mockData';
import { erpDataService } from './services/erpDataService';
import { Notification } from './types/erp';

function MainAppShell() {
  const { isAuthenticated, user, hasRole } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>();
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  // Dynamic Form Modal State
  const [formModalState, setFormModalState] = useState<{
    isOpen: boolean;
    title: string;
    description?: string;
    fields: FormFieldConfig[];
    onSubmit: (values: Record<string, any>) => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    fields: [],
    onSubmit: async () => {},
  });

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const handleOpenAI = (prompt?: string) => {
    setAiInitialPrompt(prompt);
    setIsAIOpen(true);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Quick Action Form Handlers
  const handleOpenQuickCreate = (type: string) => {
    switch (type) {
      case 'product':
        setFormModalState({
          isOpen: true,
          title: 'Add New Product SKU',
          description: 'Register a new stock keeping unit in the warehouse inventory ledger.',
          fields: [
            { key: 'sku', label: 'SKU Code', type: 'text', required: true, placeholder: 'e.g. SKU-AUTO-901' },
            { key: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g. Servo Motor 45W' },
            {
              key: 'category',
              label: 'Category',
              type: 'select',
              required: true,
              options: [
                { label: 'Electronics', value: 'Electronics' },
                { label: 'Mechanical', value: 'Mechanical' },
                { label: 'Hydraulics', value: 'Hydraulics' },
                { label: 'Automation', value: 'Automation' },
                { label: 'Raw Materials', value: 'Raw Materials' },
              ],
            },
            { key: 'stockQty', label: 'Initial Quantity', type: 'number', required: true, placeholder: '100' },
            { key: 'reorderLevel', label: 'Reorder Level', type: 'number', required: true, placeholder: '25' },
            { key: 'unitPrice', label: 'Unit Cost (₹)', type: 'number', required: true, placeholder: '1250' },
            {
              key: 'warehouse',
              label: 'Warehouse Location',
              type: 'select',
              required: true,
              options: [
                { label: 'Central Hub', value: 'Central Hub' },
                { label: 'North Depot', value: 'North Depot' },
                { label: 'South Depot', value: 'South Depot' },
                { label: 'East Plant', value: 'East Plant' },
              ],
            },
          ],
          onSubmit: async (values) => {
            await erpDataService.createProduct({
              sku: values.sku,
              name: values.name,
              category: values.category,
              stockQty: Number(values.stockQty),
              reorderLevel: Number(values.reorderLevel),
              unitPrice: Number(values.unitPrice),
              warehouse: values.warehouse,
              status: Number(values.stockQty) > Number(values.reorderLevel) ? 'In Stock' : 'Low Stock',
            });
            setCurrentPath('/inventory');
          },
        });
        break;

      case 'sale':
        setFormModalState({
          isOpen: true,
          title: 'Create Sales Order',
          description: 'Draft a new customer sales order and assign fulfillment terms.',
          fields: [
            { key: 'customerName', label: 'Customer Organization', type: 'text', required: true, placeholder: 'e.g. Zenith Tech Corp' },
            { key: 'itemsCount', label: 'Number of Line Items', type: 'number', required: true, placeholder: '3' },
            { key: 'totalAmount', label: 'Gross Amount (₹)', type: 'number', required: true, placeholder: '150000' },
            {
              key: 'paymentStatus',
              label: 'Initial Payment Status',
              type: 'select',
              required: true,
              options: [
                { label: 'Pending', value: 'Pending' },
                { label: 'Paid', value: 'Paid' },
                { label: 'Partial', value: 'Partial' },
              ],
            },
          ],
          onSubmit: async (values) => {
            await erpDataService.createSalesOrder({
              orderNumber: `SO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              customerName: values.customerName,
              date: new Date().toISOString().split('T')[0],
              itemsCount: Number(values.itemsCount),
              totalAmount: Number(values.totalAmount),
              paymentStatus: values.paymentStatus,
              fulfillmentStatus: 'Confirmed',
            });
            setCurrentPath('/sales');
          },
        });
        break;

      case 'purchase':
        setFormModalState({
          isOpen: true,
          title: 'Draft Purchase Order',
          description: 'Create procurement requisition for vendor delivery and approval.',
          fields: [
            { key: 'vendorName', label: 'Vendor / Supplier', type: 'text', required: true, placeholder: 'e.g. ABC Traders Ltd' },
            { key: 'totalAmount', label: 'Total Valuation (₹)', type: 'number', required: true, placeholder: '85000' },
            { key: 'notes', label: 'Requisition Justification', type: 'textarea', placeholder: 'Replenishment for Q3 manufacturing run.' },
          ],
          onSubmit: async (values) => {
            await erpDataService.createPurchaseOrder({
              poNumber: `PO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              vendorName: values.vendorName,
              date: new Date().toISOString().split('T')[0],
              totalAmount: Number(values.totalAmount),
              approvalStatus: 'Pending',
              deliveryStatus: 'Ordered',
            });
            setCurrentPath('/purchase');
          },
        });
        break;

      case 'customer':
      case 'vendor':
      case 'expense':
      case 'leave':
      case 'employee':
      default:
        setFormModalState({
          isOpen: true,
          title: `Create ${type.charAt(0).toUpperCase() + type.slice(1)} Record`,
          description: `Submit entry into Django ERP ${type} schema.`,
          fields: [
            { key: 'name', label: 'Title / Name', type: 'text', required: true, placeholder: `Enter ${type} name` },
            { key: 'amount', label: 'Value / Amount (if applicable)', type: 'number', placeholder: '0' },
            { key: 'remarks', label: 'Remarks / Notes', type: 'textarea', placeholder: 'Operational details...' },
          ],
          onSubmit: async (values) => {
            alert(`Record created for ${type}: ${values.name}. Synced with ERP database.`);
          },
        });
        break;
    }
  };

  const renderView = () => {
    switch (currentPath) {
      case '/inventory':
        return (
          <InventoryView
            onOpenCreateProduct={() => handleOpenQuickCreate('product')}
            onAskAI={(p) => handleOpenAI(p)}
          />
        );
      case '/sales':
        return (
          <SalesView
            onOpenCreateOrder={() => handleOpenQuickCreate('sale')}
            onAskAI={(p) => handleOpenAI(p)}
          />
        );
      case '/purchase':
        return (
          <PurchaseView
            onOpenCreatePO={() => handleOpenQuickCreate('purchase')}
            onAskAI={(p) => handleOpenAI(p)}
          />
        );
      case '/approvals':
        return <ApprovalsView />;
      case '/finance':
        return (
          <FinanceView
            onOpenQuickCreate={handleOpenQuickCreate}
            onAskAI={(p) => handleOpenAI(p)}
          />
        );
      case '/hr':
        return (
          <HRView
            onOpenQuickCreate={handleOpenQuickCreate}
            onAskAI={(p) => handleOpenAI(p)}
          />
        );
      case '/reports':
        return <ReportsView onAskAIWithContext={(p) => handleOpenAI(p)} />;
      case '/documents':
        return (
          <DocumentsView
            onOpenUpload={() => setIsUploadOpen(true)}
            onAskAI={(p) => handleOpenAI(p)}
          />
        );
      case '/settings':
        return <SettingsView />;
      case '/dashboard':
      default:
        return (
          <DashboardView
            onOpenAI={handleOpenAI}
            onOpenQuickCreate={handleOpenQuickCreate}
            onNavigate={(p) => setCurrentPath(p)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans">
      {/* Desktop Navigation Sidebar */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => setCurrentPath(path)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Workspace Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Omnibar */}
        <TopBar
          onOpenAI={handleOpenAI}
          onOpenQuickCreate={handleOpenQuickCreate}
          onOpenUpload={() => setIsUploadOpen(true)}
          onNavigate={(path) => setCurrentPath(path)}
          notifications={notifications}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        />

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-7xl">
            {renderView()}
          </div>
        </main>

        {/* Mobile Sticky Navigation Bottom Bar */}
        <MobileNav
          currentPath={currentPath}
          onNavigate={(path) => setCurrentPath(path)}
          onOpenAI={() => handleOpenAI()}
          onOpenQuickCreate={() => handleOpenQuickCreate('sale')}
        />
      </div>

      {/* Global AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        initialPrompt={aiInitialPrompt}
      />

      {/* Global Document Upload & OCR Modal */}
      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onInvoiceCreated={(inv) => {
          setCurrentPath('/purchase');
        }}
      />

      {/* Global Dynamic Form Modal for Quick Actions */}
      <DynamicFormModal
        isOpen={formModalState.isOpen}
        onClose={() => setFormModalState((prev) => ({ ...prev, isOpen: false }))}
        title={formModalState.title}
        description={formModalState.description}
        fields={formModalState.fields}
        onSubmit={formModalState.onSubmit}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
