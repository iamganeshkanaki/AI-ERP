import React, { useState } from 'react';
import {
  LayoutDashboard,
  Bot,
  CheckCircle2,
  PlusCircle,
  Menu,
  X,
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Users,
  FileText,
  Settings,
  BarChart3,
  Briefcase,
  Wrench,
  LifeBuoy,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenAI: () => void;
  onOpenQuickCreate: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPath,
  onNavigate,
  onOpenAI,
  onOpenQuickCreate,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { hasRole, user } = useAuth();

  const handleNav = (path: string) => {
    onNavigate(path);
    setDrawerOpen(false);
  };

  const navLinks = [
    { label: 'Dashboard & Actions', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Notifications', path: '/notifications', icon: Bell },
    { label: 'CRM & Pipeline', path: '/crm', icon: Users, roles: ['Admin', 'Manager', 'Sales'] },
    { label: 'Sales Orders', path: '/sales', icon: TrendingUp, roles: ['Admin', 'Manager', 'Sales', 'Finance'] },
    { label: 'Purchase & POs', path: '/purchase', icon: ShoppingCart, roles: ['Admin', 'Manager', 'Purchase', 'Finance'] },
    { label: 'Inventory & Stock', path: '/inventory', icon: Package, roles: ['Admin', 'Manager', 'Inventory', 'Purchase'] },
    { label: 'Projects & Milestones', path: '/projects', icon: Briefcase, roles: ['Admin', 'Manager', 'Employee'] },
    { label: 'Fixed Assets & Plant', path: '/assets', icon: Wrench, roles: ['Admin', 'Manager', 'Inventory'] },
    { label: 'Service & Helpdesk', path: '/service', icon: LifeBuoy, roles: ['Admin', 'Manager', 'Employee', 'Sales'] },
    { label: 'Finance & Ledger', path: '/finance', icon: DollarSign, roles: ['Admin', 'Manager', 'Finance'] },
    { label: 'HR Personnel', path: '/hr', icon: Users, roles: ['Admin', 'Manager', 'HR'] },
    { label: 'Approval Center', path: '/approvals', icon: CheckCircle2, roles: ['Admin', 'Manager', 'Finance', 'Purchase', 'HR'] },
    { label: 'Reports & Query', path: '/reports', icon: BarChart3 },
    { label: 'Audit Trail (SOC2)', path: '/audit-logs', icon: ShieldCheck, roles: ['Admin', 'Manager'] },
    { label: 'Document OCR', path: '/documents', icon: FileText },
    { label: 'Settings & n8n', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Bottom Sticky Tab Bar (Only visible on mobile/tablet < 1024px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md lg:hidden dark:border-slate-800 dark:bg-slate-900/95">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => onNavigate('/dashboard')}
          className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 ${
            currentPath === '/dashboard'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        {/* 2. Approvals */}
        <button
          type="button"
          onClick={() => onNavigate('/approvals')}
          className={`relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 ${
            currentPath === '/approvals'
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <div className="relative">
            <CheckCircle2 className="h-5 w-5" />
            <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white">
              5
            </span>
          </div>
          <span className="text-[10px] font-semibold">Approvals</span>
        </button>

        {/* 3. Center AI Action (Prominent FAB) */}
        <button
          type="button"
          onClick={onOpenAI}
          className="relative -top-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg ring-4 ring-white dark:ring-slate-900 transition-transform active:scale-95"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
        </button>

        {/* 4. Quick Action */}
        <button
          type="button"
          onClick={onOpenQuickCreate}
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <PlusCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span className="text-[10px] font-semibold">Create</span>
        </button>

        {/* 5. Menu Drawer Trigger */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Modules</span>
        </button>
      </nav>

      {/* Mobile Drawer Slide-over */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/60 backdrop-blur-xs">
          <div className="relative ml-auto flex h-full w-4/5 max-w-sm flex-col bg-white p-5 shadow-2xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-xs">
                  ▲
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-white">ERP Modules</span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex-1 overflow-y-auto space-y-1">
              {navLinks
                .filter((item) => !item.roles || hasRole(item.roles as any))
                .map((link) => {
                  const Icon = link.icon;
                  const isActive = currentPath === link.path;
                  return (
                    <button
                      key={link.path}
                      type="button"
                      onClick={() => handleNav(link.path)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </button>
                  );
                })}
            </div>

            <div className="border-t border-slate-200 pt-4 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Active Role:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
