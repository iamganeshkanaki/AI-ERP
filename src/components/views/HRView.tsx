import React from 'react';
import { Users, Plus, Calendar, Clock, Award } from 'lucide-react';
import { KPICard } from '../common/KPICard';
import { Badge } from '../common/Badge';

interface HRViewProps {
  onOpenQuickCreate: (type: string) => void;
  onAskAI: (prompt: string) => void;
}

export const HRView: React.FC<HRViewProps> = ({ onOpenQuickCreate, onAskAI }) => {
  const employees = [
    { id: 'EMP-101', name: 'Ganesh Kanaki', role: 'Head of Operations / ERP Admin', dept: 'Executive', status: 'Active', email: 'ganesh@apexglobals.com' },
    { id: 'EMP-102', name: 'Priya Sharma', role: 'Finance Controller', dept: 'Finance', status: 'Active', email: 'priya.s@apexglobals.com' },
    { id: 'EMP-103', name: 'Rajesh Nair', role: 'Supply Chain & Procurement Lead', dept: 'Procurement', status: 'Active', email: 'rajesh.n@apexglobals.com' },
    { id: 'EMP-104', name: 'Anita Desai', role: 'Inventory Officer', dept: 'Warehouse', status: 'Active', email: 'anita.d@apexglobals.com' },
    { id: 'EMP-105', name: 'Vikram Mehta', role: 'Enterprise Account Executive', dept: 'Sales', status: 'Active', email: 'vikram.m@apexglobals.com' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>HR Personnel &amp; Workforce Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Employee records, department rosters, attendance, and leave management
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAskAI('Show pending leave requests for HR approval')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>AI Leave Audit</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenQuickCreate('employee')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Active Headcount"
          value={128}
          growth={3.5}
          subtext="Across 4 facilities"
        />
        <KPICard
          title="Daily Attendance"
          value={96.8}
          subtext="% present today"
        />
        <KPICard
          title="Open Leave Applications"
          value={3}
          subtext="2 awaiting manager review"
        />
      </div>

      {/* Employees Directory Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
          Employee Roster
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-400 dark:border-slate-700">
              <tr>
                <th className="pb-2">Employee ID</th>
                <th className="pb-2">Full Name</th>
                <th className="pb-2">Designation</th>
                <th className="pb-2">Department</th>
                <th className="pb-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {emp.id}
                  </td>
                  <td className="py-2.5 font-semibold text-slate-900 dark:text-white">
                    {emp.name}
                  </td>
                  <td className="py-2.5 text-slate-600 dark:text-slate-300">{emp.role}</td>
                  <td className="py-2.5">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {emp.dept}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    <Badge variant="success">{emp.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
