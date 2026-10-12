import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { StatsCard } from '../components/common/StatsCard';
import { StatusBadge } from '../components/common/Badge';
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  AlertTriangle,
  FlaskConical,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Shield,
  PlusCircle,
  FileText,
} from 'lucide-react';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Loading Hospital Metrics...</p>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const activities = data?.recentActivities || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-sky-700 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 opacity-15">
          <Activity className="h-72 w-72" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>Hospital Operations Dashboard</span>
          </span>
          <h2 className="mt-3 text-2xl md:text-3xl font-black tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="mt-1 text-teal-100 text-sm md:text-base">
            CarePulse live command center. Real-time patient flow, appointments, clinical records, and financial balance.
          </p>

          {/* Quick Actions Bar */}
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              to="/patients"
              className="inline-flex items-center space-x-1.5 rounded-xl bg-white text-teal-900 px-4 py-2 text-xs font-bold shadow-md hover:bg-teal-50 transition"
            >
              <Users className="h-3.5 w-3.5 text-teal-600" />
              <span>Register Patient</span>
            </Link>
            <Link
              to="/appointments"
              className="inline-flex items-center space-x-1.5 rounded-xl bg-teal-800/80 hover:bg-teal-800 text-white px-4 py-2 text-xs font-bold shadow-md backdrop-blur-md transition border border-teal-500/30"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>Book Appointment</span>
            </Link>
            <Link
              to="/billing"
              className="inline-flex items-center space-x-1.5 rounded-xl bg-teal-800/80 hover:bg-teal-800 text-white px-4 py-2 text-xs font-bold shadow-md backdrop-blur-md transition border border-teal-500/30"
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>Generate Invoice</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="Total Patients"
          value={stats.totalPatients || 0}
          subtext="Registered in EMR"
          icon={Users}
          color="teal"
        />
        <StatsCard
          title="Active Doctors"
          value={stats.activeDoctors || 0}
          subtext="On duty roster"
          icon={Stethoscope}
          color="blue"
        />
        <StatsCard
          title="Today's Appts"
          value={stats.todayAppointments || 0}
          subtext={`${stats.completedAppointments || 0} completed`}
          icon={Calendar}
          color="emerald"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${(stats.totalRevenue || 0).toLocaleString()}`}
          subtext={`$${(stats.pendingBilling || 0).toLocaleString()} pending`}
          icon={DollarSign}
          color="purple"
        />
        <StatsCard
          title="Low Stock Meds"
          value={stats.lowStockMedicines || 0}
          subtext="Reorder threshold"
          icon={AlertTriangle}
          color={stats.lowStockMedicines > 0 ? 'rose' : 'emerald'}
        />
        <StatsCard
          title="Pending Labs"
          value={stats.pendingLabOrders || 0}
          subtext="Diagnostic queue"
          icon={FlaskConical}
          color="amber"
        />
      </div>

      {/* Analytics & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Department Distribution & Revenue Trend */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Consultation Distribution */}
          <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Clinical Department Influx</h3>
                <p className="text-xs text-slate-500">Live patient volume by medical specialty</p>
              </div>
              <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>

            <div className="space-y-3.5">
              {(charts.appointmentsByDept || []).length > 0 ? (
                charts.appointmentsByDept.map((dept, idx) => {
                  const maxCount = Math.max(...charts.appointmentsByDept.map((d) => d.count), 1);
                  const percentage = Math.round((dept.count / maxCount) * 100);
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700">{dept._id || 'General OPD'}</span>
                        <span className="text-teal-600 font-bold">{dept.count} consults</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-teal-500 to-sky-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No appointment statistics available yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts to Modules */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              to="/emr"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-500 shadow-xs hover:shadow-sm transition text-center group"
            >
              <div className="mx-auto h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition">
                <FileText className="h-5 w-5" />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-800">EMR Records</p>
              <p className="text-[10px] text-slate-400">Clinical notes</p>
            </Link>

            <Link
              to="/pharmacy"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-500 shadow-xs hover:shadow-sm transition text-center group"
            >
              <div className="mx-auto h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-800">Pharmacy</p>
              <p className="text-[10px] text-slate-400">Stock & Alerts</p>
            </Link>

            <Link
              to="/lab"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-500 shadow-xs hover:shadow-sm transition text-center group"
            >
              <div className="mx-auto h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
                <FlaskConical className="h-5 w-5" />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-800">Diagnostics</p>
              <p className="text-[10px] text-slate-400">Lab Orders</p>
            </Link>

            <Link
              to="/billing"
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-teal-500 shadow-xs hover:shadow-sm transition text-center group"
            >
              <div className="mx-auto h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
                <DollarSign className="h-5 w-5" />
              </div>
              <p className="mt-2 text-xs font-bold text-slate-800">Invoices</p>
              <p className="text-[10px] text-slate-400">Payments</p>
            </Link>
          </div>
        </div>

        {/* Right Column: Hospital Audit & Activity Stream */}
        <div className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Activity Feed</h3>
              <p className="text-xs text-slate-500">Live operational & audit events</p>
            </div>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Shield className="h-4 w-4" />
            </span>
          </div>

          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((act) => (
                <div key={act._id} className="flex items-start space-x-3 text-xs pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                    {act.action?.charAt(0) || 'A'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800 truncate">
                        {act.userName} <span className="font-normal text-slate-500">({act.userRole})</span>
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-0.5">
                      <span className="font-semibold text-teal-600">{act.action}</span> on {act.entity}
                      {act.details?.patientId && ` (ID: ${act.details.patientId})`}
                      {act.details?.invoiceNumber && ` (${act.details.invoiceNumber})`}
                      {act.details?.name && ` (${act.details.name})`}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No recent activity logged</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
