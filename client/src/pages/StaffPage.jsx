import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  Briefcase,
  Clock,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export const StaffPage = () => {
  const { isAdmin } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Add Staff Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'receptionist',
    department: 'Administration',
    designation: 'Front Desk Officer',
    qualification: 'Bachelor of Healthcare Admin',
    salary: 45000,
    shift: 'Morning',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        department: deptFilter || undefined,
      };
      const res = await api.get('/staff', { params });
      if (res.data.success) {
        setStaffList(res.data.staff);
      }
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStaff();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, deptFilter]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await api.post('/staff', formData);
      setIsAddOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: 'receptionist',
        department: 'Administration',
        designation: 'Front Desk Officer',
        qualification: 'Bachelor of Healthcare Admin',
        salary: 45000,
        shift: 'Morning',
      });
      fetchStaff();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add staff member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Hospital Staff Administration</h2>
          <p className="text-sm text-slate-500">
            Employee profiles, departmental rosters, work shifts, and access role management
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center space-x-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-sm font-bold shadow-lg shadow-teal-600/25 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Onboard Staff Member</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by staff name, ID, or designation..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All Departments</option>
          <option value="Administration">Administration</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Neurology">Neurology</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Pharmacy">Pharmacy</option>
          <option value="Laboratory">Laboratory</option>
          <option value="Billing">Billing</option>
        </select>
      </div>

      {/* Staff Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Employee ID & Name</th>
                <th className="py-3.5 px-6">Department & Role</th>
                <th className="py-3.5 px-6">Designation</th>
                <th className="py-3.5 px-6">Shift & Contact</th>
                <th className="py-3.5 px-6">Annual Salary</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                  </td>
                </tr>
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No staff members found matching criteria.
                  </td>
                </tr>
              ) : (
                staffList.map((st) => (
                  <tr key={st._id} className="hover:bg-teal-50/30 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {st.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{st.user?.name}</p>
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 font-bold">
                            {st.employeeId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs">
                      <p className="font-bold text-slate-800">{st.department}</p>
                      <span className="text-[11px] font-semibold text-teal-600 capitalize">
                        {st.user?.role?.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs font-semibold text-slate-700">
                      {st.designation}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">{st.shift} Shift</p>
                      <p className="text-slate-400">{st.user?.email}</p>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-800 text-xs">
                      ${st.salary?.toLocaleString()}/yr
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={st.user?.isActive ? 'Active' : 'Deactivated'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Onboard New Hospital Staff Member">
        {formError && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleAddStaff} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">System Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="receptionist">Receptionist</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="lab_staff">Lab Staff</option>
                <option value="billing_staff">Billing Staff</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Department *</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="Administration">Administration</option>
                <option value="Cardiology">Cardiology</option>
                <option value="Neurology">Neurology</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Billing">Billing</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Shift</label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="Morning">Morning</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
                <option value="Rotational">Rotational</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Job Designation *</label>
              <input
                type="text"
                required
                placeholder="Senior Operations Lead"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Annual Salary ($)</label>
              <input
                type="number"
                min="0"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/30 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Onboard Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
