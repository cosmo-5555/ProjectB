import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Stethoscope,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  FileCheck,
} from 'lucide-react';

export const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Book Modal
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    timeSlot: '09:00 AM',
    type: 'General Consultation',
    reasonForVisit: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter || undefined,
        date: dateFilter || undefined,
      };
      const res = await api.get('/appointments', { params });
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [docRes, patRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/patients?limit=50'),
      ]);
      if (docRes.data.success) setDoctors(docRes.data.doctors);
      if (patRes.data.success) setPatients(patRes.data.patients);
    } catch (err) {
      console.error('Failed to fetch dependencies:', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    fetchDependencies();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await api.post('/appointments', formData);
      setIsBookOpen(false);
      setFormData({
        patient: '',
        doctor: '',
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: '09:00 AM',
        type: 'General Consultation',
        reasonForVisit: '',
        notes: '',
      });
      fetchAppointments();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Appointment Scheduling</h2>
          <p className="text-sm text-slate-500">
            Manage consultations, follow-ups, clinical check-ins, and doctor rosters
          </p>
        </div>

        <button
          onClick={() => setIsBookOpen(true)}
          className="inline-flex items-center space-x-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-sm font-bold shadow-lg shadow-teal-600/25 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Filter and Date Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 flex flex-wrap gap-3 items-center">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Clear Date
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Appointments List */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Appt #</th>
                <th className="py-3.5 px-6">Patient</th>
                <th className="py-3.5 px-6">Attending Doctor</th>
                <th className="py-3.5 px-6">Date & Time</th>
                <th className="py-3.5 px-6">Reason for Visit</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt._id} className="hover:bg-teal-50/30 transition">
                    <td className="py-4 px-6 font-mono font-bold text-teal-700 text-xs">
                      {apt.appointmentNumber}
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">
                        {apt.patient?.firstName} {apt.patient?.lastName}
                      </p>
                      <span className="text-[11px] text-slate-400">{apt.patient?.patientId}</span>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{apt.doctor?.user?.name}</p>
                      <span className="text-xs text-teal-600 font-semibold">{apt.doctor?.specialization}</span>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600">
                      <p className="font-semibold text-slate-800">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </p>
                      <p className="text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{apt.timeSlot}</span>
                      </p>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 max-w-xs">
                      <p className="font-medium truncate">{apt.reasonForVisit}</p>
                      <span className="text-[10px] text-slate-400">{apt.type}</span>
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={apt.status} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {apt.status === 'Scheduled' && (
                          <button
                            onClick={() => handleUpdateStatus(apt._id, 'Confirmed')}
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition"
                            title="Confirm Appointment"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                          <button
                            onClick={() => handleUpdateStatus(apt._id, 'Completed')}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                            title="Mark as Completed"
                          >
                            <FileCheck className="h-4 w-4" />
                          </button>
                        )}
                        {apt.status !== 'Cancelled' && apt.status !== 'Completed' && (
                          <button
                            onClick={() => handleUpdateStatus(apt._id, 'Cancelled')}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                            title="Cancel Appointment"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <Modal isOpen={isBookOpen} onClose={() => setIsBookOpen(false)} title="Book Clinical Appointment">
        {formError && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleBookAppointment} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Select Patient *</label>
              <select
                required
                value={formData.patient}
                onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.firstName} {p.lastName} ({p.patientId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Select Physician *</label>
              <select
                required
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.user?.name} - {d.specialization} (${d.consultationFee})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Appointment Date *</label>
              <input
                type="date"
                required
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Time Slot *</label>
              <select
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="09:30 AM">09:30 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="10:30 AM">10:30 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="11:30 AM">11:30 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="02:30 PM">02:30 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
                <option value="04:00 PM">04:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Visit Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="General Consultation">General Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Routine Checkup">Routine Checkup</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Reason for Visit *</label>
            <input
              type="text"
              required
              placeholder="e.g. Chronic back pain, annual physical exam"
              value={formData.reasonForVisit}
              onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Internal Notes</label>
            <textarea
              rows="2"
              placeholder="Optional notes for physician review..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBookOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/30 disabled:opacity-50"
            >
              {submitting ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
