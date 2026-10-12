import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';
import {
  Users,
  Search,
  Plus,
  Eye,
  Phone,
  Mail,
  Calendar,
  HeartPulse,
  AlertCircle,
  FileText,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const PatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bloodFilter, setBloodFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Register Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '',
    email: '',
    street: '',
    city: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelation: '',
    allergies: '',
    chronicConditions: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 8,
        search: search || undefined,
        status: statusFilter || undefined,
        bloodGroup: bloodFilter || undefined,
      };
      const res = await api.get('/patients', { params });
      if (res.data.success) {
        setPatients(res.data.patients);
        setTotalPages(res.data.totalPages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter, bloodFilter, currentPage]);

  const viewPatientProfile = async (patient) => {
    setSelectedPatient(patient);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/patients/${patient._id}`);
      if (res.data.success) {
        setPatientDetails(res.data);
      }
    } catch (err) {
      console.error('Failed to load patient history:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        dob: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        phone: formData.phone,
        email: formData.email,
        address: { street: formData.street, city: formData.city },
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone,
          relation: formData.emergencyRelation,
        },
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        chronicConditions: formData.chronicConditions
          ? formData.chronicConditions.split(',').map((s) => s.trim())
          : [],
      };

      await api.post('/patients', payload);
      setIsRegisterOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        dob: '',
        gender: 'Male',
        bloodGroup: 'O+',
        phone: '',
        email: '',
        street: '',
        city: '',
        emergencyName: '',
        emergencyPhone: '',
        emergencyRelation: '',
        allergies: '',
        chronicConditions: '',
      });
      fetchPatients();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Patient Management</h2>
          <p className="text-sm text-slate-500">
            Registered patients, comprehensive medical records, and clinical history ({totalCount} total)
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center space-x-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-sm font-bold shadow-lg shadow-teal-600/25 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, ID, phone, or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">All Blood Groups</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inpatient">Inpatient</option>
            <option value="Discharged">Discharged</option>
          </select>
        </div>
      </div>

      {/* Patients Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Patient</th>
                <th className="py-3.5 px-6">Contact & Demographics</th>
                <th className="py-3.5 px-6">Blood & Allergies</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    No patients found matching the criteria.
                  </td>
                </tr>
              ) : (
                patients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-teal-50/30 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
                          {pat.firstName?.charAt(0)}
                          {pat.lastName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {pat.firstName} {pat.lastName}
                          </p>
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 font-bold">
                            {pat.patientId}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600">
                      <div className="flex items-center space-x-1.5 font-medium">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{pat.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 mt-1 text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {pat.gender} • {new Date().getFullYear() - new Date(pat.dob).getFullYear()} yrs
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {pat.bloodGroup}
                      </span>
                      {pat.allergies && pat.allergies.length > 0 ? (
                        <p className="text-[11px] text-amber-700 mt-1 font-semibold truncate max-w-[150px]">
                          ⚠️ {pat.allergies.join(', ')}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-1">No allergies</p>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={pat.status || 'Active'} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => viewPatientProfile(pat)}
                        className="inline-flex items-center space-x-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 px-3 py-1.5 text-xs font-bold text-slate-700 transition"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View Chart</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs">
          <p className="text-slate-500">
            Page <span className="font-bold text-slate-800">{currentPage}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span>
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Patient Registration Modal */}
      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} title="Register New Patient Profile">
        {formError && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleRegisterPatient} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Blood Group *</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Primary Phone *</label>
              <input
                type="text"
                required
                placeholder="+1 555-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="patient@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Residential Street</label>
              <input
                type="text"
                placeholder="123 Hospital Blvd"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">City / Region</label>
              <input
                type="text"
                placeholder="Cityville"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Emergency Contact</p>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Contact Name"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Relationship (e.g. Spouse)"
                value={formData.emergencyRelation}
                onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
              />
              <input
                type="text"
                placeholder="Emergency Phone"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Known Allergies (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Peanuts, Sulfa"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/30 disabled:opacity-50"
            >
              {formSubmitting ? 'Registering...' : 'Save & Register Patient'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Patient Profile & Medical History Modal */}
      <Modal
        isOpen={Boolean(selectedPatient)}
        onClose={() => {
          setSelectedPatient(null);
          setPatientDetails(null);
        }}
        title={`Medical Chart: ${selectedPatient?.firstName} ${selectedPatient?.lastName} (${selectedPatient?.patientId})`}
        maxWidth="max-w-4xl"
      >
        {loadingDetails ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-teal-500 border-t-transparent" />
            <p className="mt-2 text-xs font-semibold text-slate-500">Loading Clinical Timeline...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Demographics Pill */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">DOB & Age</span>
                <span className="font-bold text-slate-800">
                  {selectedPatient && new Date(selectedPatient.dob).toLocaleDateString()} (
                  {selectedPatient && new Date().getFullYear() - new Date(selectedPatient.dob).getFullYear()}{' '}
                  yrs)
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Blood Group</span>
                <span className="font-bold text-rose-600">{selectedPatient?.bloodGroup}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Contact Phone</span>
                <span className="font-bold text-slate-800">{selectedPatient?.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Emergency Contact</span>
                <span className="font-bold text-slate-800">
                  {selectedPatient?.emergencyContact?.name || 'N/A'} (
                  {selectedPatient?.emergencyContact?.phone || 'N/A'})
                </span>
              </div>
            </div>

            {/* Past Consultations (EMR) */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="h-4 w-4 text-teal-600" />
                <span>Clinical Notes & Diagnoses ({patientDetails?.medicalRecords?.length || 0})</span>
              </h4>

              {patientDetails?.medicalRecords?.length > 0 ? (
                <div className="space-y-3">
                  {patientDetails.medicalRecords.map((rec) => (
                    <div key={rec._id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                        <span className="font-mono font-bold text-teal-700">{rec.recordNumber}</span>
                        <span className="text-slate-400">
                          {new Date(rec.createdAt).toLocaleDateString()} by {rec.doctor?.specialization || 'Doctor'}
                        </span>
                      </div>

                      {/* Vitals summary */}
                      {rec.vitals && (
                        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl">
                          {rec.vitals.bloodPressure && <span>BP: {rec.vitals.bloodPressure}</span>}
                          {rec.vitals.heartRate && <span>• HR: {rec.vitals.heartRate} bpm</span>}
                          {rec.vitals.temperature && <span>• Temp: {rec.vitals.temperature}°F</span>}
                          {rec.vitals.oxygenSaturation && <span>• SpO2: {rec.vitals.oxygenSaturation}%</span>}
                        </div>
                      )}

                      <div className="text-xs space-y-1">
                        <p>
                          <span className="font-bold text-slate-700">Diagnosis:</span>{' '}
                          <span className="text-rose-700 font-semibold">{rec.diagnosis?.join(', ')}</span>
                        </p>
                        <p className="text-slate-600">
                          <span className="font-bold text-slate-700">Notes:</span> {rec.clinicalNotes}
                        </p>
                      </div>

                      {/* Prescriptions */}
                      {rec.prescriptions && rec.prescriptions.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                            Prescribed Medications:
                          </p>
                          <div className="space-y-1">
                            {rec.prescriptions.map((med, idx) => (
                              <div
                                key={idx}
                                className="text-xs bg-teal-50/50 p-1.5 rounded-lg border border-teal-100 text-teal-900 flex justify-between"
                              >
                                <span className="font-bold">
                                  {med.medicineName} ({med.dosage})
                                </span>
                                <span className="text-teal-700">
                                  {med.frequency} • {med.duration}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                  No EMR consultation notes on record yet.
                </p>
              )}
            </div>

            {/* Invoices & Financial Account */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span>Billing Invoices ({patientDetails?.invoices?.length || 0})</span>
              </h4>

              {patientDetails?.invoices?.length > 0 ? (
                <div className="space-y-2">
                  {patientDetails.invoices.map((inv) => (
                    <div
                      key={inv._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-slate-800">{inv.invoiceNumber}</span>
                        <span className="text-slate-400 ml-2">{new Date(inv.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-slate-800">${inv.totalAmount.toFixed(2)}</span>
                        <StatusBadge status={inv.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                  No billing history recorded.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
