import React, { useState } from 'react';
import {
  Search,
  Mic,
  Bell,
  Plus,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  Shield,
  ChevronDown,
  UserCheck,
  Server,
  Upload,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types/auth';
import { Notification } from '../../types/erp';
import { environment } from '../../config/environment';

interface TopBarProps {
  onOpenAI: (initialPrompt?: string) => void;
  onOpenQuickCreate: (type: string) => void;
  onOpenUpload: () => void;
  onOpenGlobalSearch?: () => void;
  onNavigate?: (path: string) => void;
  notifications: Notification[];
  onMarkAllNotificationsRead: () => void;
}

const ROLES: UserRole[] = [
  'Admin',
  'Manager',
  'Finance',
  'HR',
  'Sales',
  'Purchase',
  'Inventory',
  'Employee',
];

export const TopBar: React.FC<TopBarProps> = ({
  onOpenAI,
  onOpenQuickCreate,
  onOpenUpload,
  onOpenGlobalSearch,
  onNavigate,
  notifications,
  onMarkAllNotificationsRead,
}) => {
  const { user, switchRole } = useAuth();
  const { theme, effectiveTheme, setTheme } = useTheme();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [topSearch, setTopSearch] = useState('');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topSearch.trim()) {
      onOpenAI(topSearch);
      setTopSearch('');
    } else {
      onOpenAI();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      {/* Left: AI Prompt Omnibar & Global Search Trigger */}
      <div className="flex flex-1 items-center max-w-xl gap-2">
        {onOpenGlobalSearch && (
          <button
            type="button"
            onClick={onOpenGlobalSearch}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800"
            title="Global ERP Search (⌘K)"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">Quick Search...</span>
            <kbd className="hidden lg:inline-block rounded bg-white px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 dark:bg-slate-900 font-mono text-[10px]">
              ⌘K
            </kbd>
          </button>
        )}

        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={topSearch}
            onChange={(e) => setTopSearch(e.target.value)}
            placeholder='Ask AI anything... ("Show today sales", "Low stock SKUs")'
            className="w-full rounded-xl border border-slate-200 bg-slate-50/75 py-2 pl-9 pr-10 text-xs text-slate-900 placeholder:text-slate-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white dark:focus:border-indigo-400"
          />
          <button
            type="button"
            onClick={() => onOpenAI()}
            className="absolute right-2 top-1.5 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/50 hover:text-indigo-600 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
            title="Voice / AI Assistant"
          >
            <Mic className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 ml-3">
        {/* Reports & Query Builder Quick Nav Button */}
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('/reports')}
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Open Report & Query Configurator"
          >
            <BarChart3 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Reports &amp; Query</span>
          </button>
        )}

        {/* Document OCR Button */}
        <button
          type="button"
          onClick={onOpenUpload}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          title="Extract Document OCR"
        >
          <Upload className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Upload OCR</span>
        </button>

        {/* Quick Create Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="h-3 w-3 opacity-80" />
          </button>

          {showCreateMenu && (
            <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Actions
              </div>
              {[
                { label: '+ Customer', type: 'customer' },
                { label: '+ Vendor', type: 'vendor' },
                { label: '+ Product SKU', type: 'product' },
                { label: '+ Sales Order', type: 'sale' },
                { label: '+ Purchase Order', type: 'purchase' },
                { label: '+ Expense Claim', type: 'expense' },
                { label: '+ Leave Request', type: 'leave' },
              ].map((act) => (
                <button
                  key={act.type}
                  type="button"
                  onClick={() => {
                    setShowCreateMenu(false);
                    onOpenQuickCreate(act.type);
                  }}
                  className="w-full text-left rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
                >
                  {act.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Notifications &amp; Alerts
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {unreadCount} unread enterprise events
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={onMarkAllNotificationsRead}
                    className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="mt-3 max-h-72 overflow-y-auto space-y-2 text-xs">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`rounded-xl p-2.5 border transition-colors ${
                      n.read
                        ? 'border-slate-100 bg-white dark:border-slate-800/80 dark:bg-slate-900'
                        : 'border-indigo-100 bg-indigo-50/40 dark:border-indigo-950 dark:bg-indigo-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">
                      {n.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase dark:bg-slate-800 dark:text-slate-400">
                        {n.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle (Light / Dark / System) */}
        <button
          type="button"
          onClick={() => {
            if (theme === 'light') setTheme('dark');
            else if (theme === 'dark') setTheme('system');
            else setTheme('light');
          }}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          title={`Theme: ${theme} (click to toggle)`}
        >
          {theme === 'system' ? (
            <Monitor className="h-4 w-4 text-indigo-500" />
          ) : effectiveTheme === 'dark' ? (
            <Moon className="h-4 w-4 text-amber-400" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500" />
          )}
        </button>

        {/* Role Switcher & Profile */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-1.5 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:bg-slate-800"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800 font-bold text-xs dark:bg-indigo-950 dark:text-indigo-300">
              {user?.name?.[0] || 'G'}
            </div>
            <div className="hidden text-left md:block pr-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user?.name || 'Ganesh K.'}
              </div>
              <div className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Shield className="h-2.5 w-2.5" />
                <span>{user?.role || 'Admin'}</span>
              </div>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 pb-2 mb-2 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Server className="h-3 w-3 text-emerald-500" />
                  <span>Mode: {environment.isMockMode ? 'Interactive Demo' : 'Live DRF'}</span>
                </div>
              </div>

              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Test Role &amp; Permissions
              </div>
              <div className="space-y-0.5 mt-1">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      switchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                      user?.role === r
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{r}</span>
                    {user?.role === r && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
