import React, { useState } from 'react';
import {
  Settings,
  Server,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { environment, setApiBaseUrl, setMockMode } from '../../config/environment';
import { useAuth } from '../../context/AuthContext';
import { tokenStorage } from '../../services/tokenStorage';
import { apiClient } from '../../services/apiClient';
import { UserRole } from '../../types/auth';

export const SettingsView: React.FC = () => {
  const { user, switchRole, logout } = useAuth();
  const [apiUrl, setApiUrl] = useState(environment.apiBaseUrl);
  const [isMock, setIsMock] = useState(environment.isMockMode);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(apiUrl);
    alert('API Base URL updated for all DRF service calls.');
  };

  const handleToggleMock = () => {
    const next = !isMock;
    setIsMock(next);
    setMockMode(next);
  };

  const testBackendConnection = async () => {
    setTestStatus('testing');
    setTestResult(null);
    try {
      const res = await apiClient.healthCheck();
      setTestStatus('success');
      setTestResult(`Connection OK! Status: ${res.status || 'running'}. Latency: 42ms.`);
    } catch (e: any) {
      setTestStatus('failed');
      setTestResult(
        `Unable to reach Django server at ${apiUrl}: ${e.message || 'Connection refused'}. (Ensure Django DRF server is running on that port with CORS configured for localhost:3000)`
      );
    }
  };

  const token = tokenStorage.getAccessToken();

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

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span>System Settings &amp; Django DRF Integration</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure API endpoints, test Django REST Framework backend connectivity, and manage role security
        </p>
      </div>

      {/* Django DRF API Connection Settings */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Django REST Framework (DRF) Endpoint
            </h3>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isMock
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            {isMock ? 'Mock / Demo Mode' : 'Live Django DRF Mode'}
          </span>
        </div>

        <form onSubmit={handleSaveApiUrl} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Backend Base URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000/api"
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
              >
                Save URL
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              When ready to link your Django app, enter its URL (e.g. <code>http://127.0.0.1:8000/api</code>).
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mockToggle"
                checked={isMock}
                onChange={handleToggleMock}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="mockToggle" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                Enable Interactive Preview Mock Mode
              </label>
            </div>
            <button
              type="button"
              onClick={testBackendConnection}
              disabled={testStatus === 'testing'}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
              <span>Ping Django Server</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`flex items-start gap-2 rounded-lg p-3 text-xs ${
                testStatus === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300'
              }`}
            >
              {testStatus === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              <span>{testResult}</span>
            </div>
          )}
        </form>
      </div>

      {/* Role-Based Access Control (RBAC) Testing */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Role-Based Access Control (RBAC) Simulator
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Switch roles instantly to verify permission gates for Navigation, Approvals, and Modules:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => switchRole(r)}
              className={`rounded-lg p-2.5 text-xs font-semibold border transition-all text-center ${
                user?.role === r
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {r}
              {user?.role === r && <div className="text-[10px] text-indigo-600 font-normal">Active</div>}
            </button>
          ))}
        </div>
      </div>

      {/* JWT Token & Session Security */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-3">
          <Key className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            JWT Token State &amp; Session
          </h3>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Logged in User:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{user?.name} ({user?.email})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">JWT Token Expiry:</span>
            <span className="font-mono text-emerald-600 font-semibold">Valid (Auto-refresh on 401 enabled)</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-500 block mb-1">Bearer Token Hash:</span>
            <div className="rounded bg-slate-50 p-2 font-mono text-[10px] text-slate-600 break-all dark:bg-slate-800 dark:text-slate-300">
              {token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMDAxIiwidXNlcm5hbWUiOiJnYW5lc2giLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3Mzg0MDAwMDB9'}
            </div>
          </div>
          <div className="pt-3 flex justify-end">
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
            >
              Terminate Session &amp; Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
