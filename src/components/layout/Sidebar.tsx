import React from 'react';
import {
  LayoutDashboard,
  Bot,
  CheckCircle2,
  TrendingUp,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  FileText,
  BarChart3,
  Settings,
  ChevronRight,
  Shield,
  Bell,
  Briefcase,
  Wrench,
  LifeBuoy,
  ShieldCheck,
} from 'lucide-react';
import { navigationGroups, NavItem } from '../../config/navigation';
import { useAuth } from '../../context/AuthContext';
import { environment } from '../../config/environment';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Bot: <Bot className="h-4 w-4" />,
  CheckCircle2: <CheckCircle2 className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  ShoppingCart: <ShoppingCart className="h-4 w-4" />,
  Package: <Package className="h-4 w-4" />,
  DollarSign: <DollarSign className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  FileText: <FileText className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
  Bell: <Bell className="h-4 w-4" />,
  Briefcase: <Briefcase className="h-4 w-4" />,
  Wrench: <Wrench className="h-4 w-4" />,
  LifeBuoy: <LifeBuoy className="h-4 w-4" />,
  ShieldCheck: <ShieldCheck className="h-4 w-4" />,
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  collapsed,
}) => {
  const { hasRole, user } = useAuth();

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-all duration-200 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
        <div
          onClick={() => onNavigate('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-extrabold text-sm shadow-xs">
            ▲
          </div>
          {!collapsed && (
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                AI ERP
              </span>
              <span className="ml-1 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Platform
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav Groups */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {navigationGroups.map((group) => {
          // Filter items based on user role
          const visibleItems = group.items.filter((item) => hasRole(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.groupName} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {group.groupName}
                </div>
              )}
              {visibleItems.map((item: NavItem) => {
                const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`${
                          isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                        }`}
                      >
                        {ICON_MAP[item.iconName] || <ChevronRight className="h-4 w-4" />}
                      </span>
                      {!collapsed && <span>{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          typeof item.badge === 'number'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer / Backend Status Info */}
      {!collapsed && (
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] dark:border-slate-800 dark:bg-slate-800/60">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Target Backend</span>
              <span className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                DRF Ready
              </span>
            </div>
            <p className="truncate text-[10px] font-mono text-slate-500 dark:text-slate-400">
              {environment.apiBaseUrl}
            </p>
            <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-[10px]">
              <span className="text-slate-500">Role:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Shield className="h-3 w-3" /> {user?.role || 'Admin'}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
