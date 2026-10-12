import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { StatusBadge } from '../components/common/Badge';
import {
  ShieldAlert,
  Search,
  Filter,
  Clock,
  User,
  Shield,
  Activity,
} from 'lucide-react';

export const AuditPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        action: actionFilter || undefined,
        entity: entityFilter || undefined,
        limit: 50,
      };
      const res = await api.get('/audit', { params });
      if (res.data.success) {
        setLogs(res.data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'READ':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'UPDATE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'LOGIN':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'LOGOUT':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'PAYMENT':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DISPENSE':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Security & HIPAA Audit Trail</h2>
          <p className="text-sm text-slate-500">
            Immutable forensic access logs, medical record access timestamps, and financial transactions
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1.5 rounded-2xl text-xs font-bold">
          <Shield className="h-4 w-4 text-emerald-600" />
          <span>HIPAA Compliance Active</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 flex flex-wrap gap-3 items-center">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All Action Types</option>
          <option value="CREATE">CREATE</option>
          <option value="READ">READ</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="LOGIN">LOGIN</option>
          <option value="PAYMENT">PAYMENT</option>
          <option value="DISPENSE">DISPENSE</option>
        </select>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All Clinical Entities</option>
          <option value="Patient">Patient</option>
          <option value="MedicalRecord">MedicalRecord (EMR)</option>
          <option value="Appointment">Appointment</option>
          <option value="Invoice">Invoice</option>
          <option value="Medicine">Medicine</option>
          <option value="LabRequest">LabRequest</option>
          <option value="Auth">Auth</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Action</th>
                <th className="py-3.5 px-6">Entity</th>
                <th className="py-3.5 px-6">Performed By</th>
                <th className="py-3.5 px-6">Audit Details & Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-teal-50/30 transition">
                    <td className="py-3.5 px-6 font-mono text-slate-600 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 font-bold text-slate-800">
                      {log.entity}
                    </td>

                    <td className="py-3.5 px-6 text-slate-700">
                      <p className="font-bold">{log.userName}</p>
                      <span className="text-[10px] text-teal-600 font-semibold uppercase">
                        {log.userRole}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-slate-600 max-w-md">
                      <div className="font-mono text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-200/80 truncate">
                        {JSON.stringify(log.details)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
