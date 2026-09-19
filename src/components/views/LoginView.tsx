import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';

export const LoginView: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [username, setUsername] = useState('admin@apexglobals.com');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login(username, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid enterprise credentials');
    }
  };

  const handleQuickFill = (email: string, role: UserRole) => {
    setUsername(email);
    setPassword('password123');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-extrabold text-xl shadow-lg mb-3">
            ▲
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">AI ERP Platform</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enterprise Resource Planning with Built-in AI Copilot
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Sign in to your workplace
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Enter your enterprise credentials to access your modules
          </p>

          {errorMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to registered email.')}
                  className="text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Demo Roles */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Quick-Fill Demo Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@apexglobals.com', 'Admin')}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left text-xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">Admin</div>
                <div className="text-[10px] text-slate-400 truncate">All modules</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('finance@apexglobals.com', 'Finance')}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left text-xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">Finance Lead</div>
                <div className="text-[10px] text-slate-400 truncate">P&amp;L, AR/AP</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('inventory@apexglobals.com', 'Inventory')}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left text-xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">Inventory Mgr</div>
                <div className="text-[10px] text-slate-400 truncate">Stock &amp; SKUs</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('sales@apexglobals.com', 'Sales')}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left text-xs hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">Sales Exec</div>
                <div className="text-[10px] text-slate-400 truncate">Orders &amp; CRM</div>
              </button>
            </div>
          </div>
        </div>

        {/* Security & DRF Ready Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Secured with JWT &amp; DRF Token Refresh</span>
        </div>
      </div>
    </div>
  );
};
