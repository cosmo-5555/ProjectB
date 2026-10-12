import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import {
  FileText,
  Plus,
  Search,
  Activity,
  HeartPulse,
  Pill,
  Calendar,
  AlertCircle,
  Eye,
  Trash2,
  PlusCircle,
} from 'lucide-react';

export const EMRPage = () => {
  const { user, isDoctor, isAdmin } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // New Consultation Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    bp: '120/80 mmHg',
    hr: 72,
    temp: 98.6,
    spo2: 99,
    weight: 70,
    height: 175,
    chiefComplaints: '',
    diagnosis: '',
    clinicalNotes: '',
    treatmentPlan: '',
    followUpDate: '',
    prescriptions: [{ medicineName: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: '' }],
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get('/emr');
      if (res.data.success) {
        setRecords(res.data.records);
      }
    } catch (err) {
      console.error('Failed to load EMR records:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [patRes, docRes] = await Promise.all([
        api.get('/patients?limit=50'),
        api.get('/doctors'),
      ]);
      if (patRes.data.success) setPatients(patRes.data.patients);
      if (docRes.data.success) setDoctors(docRes.data.doctors);
    } catch (err) {
      console.error('Failed to load dependencies:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchDependencies();
  }, []);

  const addPrescriptionRow = () => {
    setFormData({
      ...formData,
      prescriptions: [
        ...formData.prescriptions,
        { medicineName: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: '' },
      ],
    });
  };

  const removePrescriptionRow = (index) => {
    const updated = formData.prescriptions.filter((_, i) => i !== index);
    setFormData({ ...formData, prescriptions: updated });
  };

  const updatePrescriptionRow = (index, field, value) => {
    const updated = [...formData.prescriptions];
    updated[index][field] = value;
    setFormData({ ...formData, prescriptions: updated });
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        patient: formData.patient,
        doctor: formData.doctor || undefined,
        vitals: {
          bloodPressure: formData.bp,
          heartRate: Number(formData.hr) || null,
          temperature: Number(formData.temp) || null,
          oxygenSaturation: Number(formData.spo2) || null,
          weightKg: Number(formData.weight) || null,
          heightCm: Number(formData.height) || null,
        },
        chiefComplaints: formData.chiefComplaints.split(',').map((s) => s.trim()),
        diagnosis: formData.diagnosis.split(',').map((s) => s.trim()),
        clinicalNotes: formData.clinicalNotes,
        treatmentPlan: formData.treatmentPlan,
        followUpDate: formData.followUpDate || null,
        prescriptions: formData.prescriptions.filter((p) => p.medicineName.trim().length > 0),
      };

      await api.post('/emr', payload);
      setIsCreateOpen(false);
      setFormData({
        patient: '',
        doctor: '',
        bp: '120/80 mmHg',
        hr: 72,
        temp: 98.6,
        spo2: 99,
        weight: 70,
        height: 175,
        chiefComplaints: '',
        diagnosis: '',
        clinicalNotes: '',
        treatmentPlan: '',
        followUpDate: '',
        prescriptions: [{ medicineName: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: '' }],
      });
      fetchRecords();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to document medical record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Electronic Medical Records (EMR)</h2>
          <p className="text-sm text-slate-500">
            Clinical consultations, vitals telemetry, diagnostic notes, and medication orders
          </p>
        </div>

        {(isDoctor || isAdmin) && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center space-x-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-sm font-bold shadow-lg shadow-teal-600/25 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Document New Consultation</span>
          </button>
        )}
      </div>

      {/* EMR Records Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-teal-500 border-t-transparent" />
          <p className="mt-2 text-xs font-semibold text-slate-500">Loading Medical Records...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400 border border-slate-200">
          No medical records found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((rec) => (
            <div
              key={rec._id}
              className="glass-card rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="font-mono text-xs font-bold text-teal-700">{rec.recordNumber}</span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(rec.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3">
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {rec.patient?.firstName} {rec.patient?.lastName}
                  </h3>
                  <p className="text-xs text-slate-400">ID: {rec.patient?.patientId}</p>
                </div>

                {/* Vitals Bar */}
                {rec.vitals && (
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-50 p-2 rounded-xl">
                    {rec.vitals.bloodPressure && (
                      <span className="bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-100">
                        BP: {rec.vitals.bloodPressure}
                      </span>
                    )}
                    {rec.vitals.heartRate && (
                      <span className="bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-100">
                        HR: {rec.vitals.heartRate} bpm
                      </span>
                    )}
                    {rec.vitals.oxygenSaturation && (
                      <span className="bg-white px-2 py-0.5 rounded shadow-2xs border border-slate-100">
                        SpO2: {rec.vitals.oxygenSaturation}%
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3 space-y-1 text-xs">
                  <p>
                    <span className="font-bold text-slate-700">Diagnosis:</span>{' '}
                    <span className="text-rose-600 font-semibold">{rec.diagnosis?.join(', ')}</span>
                  </p>
                  <p className="text-slate-600 line-clamp-2">
                    <span className="font-bold text-slate-700">Notes:</span> {rec.clinicalNotes}
                  </p>
                </div>

                {/* Prescriptions snippet */}
                {rec.prescriptions && rec.prescriptions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                      Rx Prescribed ({rec.prescriptions.length} items)
                    </span>
                    <p className="text-xs text-slate-700 font-medium truncate mt-0.5">
                      {rec.prescriptions.map((p) => p.medicineName).join(', ')}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  By {rec.doctor?.user?.name || 'Physician'}
                </span>
                <button
                  onClick={() => setSelectedRecord(rec)}
                  className="inline-flex items-center space-x-1 font-bold text-teal-600 hover:text-teal-700"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Full Record</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Consultation Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Document Clinical Consultation & EMR"
        maxWidth="max-w-3xl"
      >
        {formError && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreateRecord} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Patient *</label>
              <select
                required
                value={formData.patient}
                onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="">-- Select Patient --</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.firstName} {p.lastName} ({p.patientId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Attending Physician *</label>
              <select
                required
                value={formData.doctor}
                onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="">-- Select Doctor --</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.user?.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vitals Telemetry Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Vitals & Biometrics
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">BP (mmHg)</label>
                <input
                  type="text"
                  value={formData.bp}
                  onChange={(e) => setFormData({ ...formData, bp: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">Heart Rate</label>
                <input
                  type="number"
                  value={formData.hr}
                  onChange={(e) => setFormData({ ...formData, hr: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">Temp (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temp}
                  onChange={(e) => setFormData({ ...formData, temp: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">SpO2 (%)</label>
                <input
                  type="number"
                  value={formData.spo2}
                  onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 font-semibold">Height (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Chief Complaints *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dizziness, acute migraine"
                value={formData.chiefComplaints}
                onChange={(e) => setFormData({ ...formData, chiefComplaints: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Clinical Diagnosis *</label>
              <input
                type="text"
                required
                placeholder="e.g. Essential Hypertension Stage 1"
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Clinical Consultation Notes</label>
            <textarea
              rows="2"
              placeholder="Detailed physical exam observations, assessment and plan..."
              value={formData.clinicalNotes}
              onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Treatment Plan</label>
            <input
              type="text"
              placeholder="e.g. Low sodium diet, 30m aerobic exercise, review in 4 weeks"
              value={formData.treatmentPlan}
              onChange={(e) => setFormData({ ...formData, treatmentPlan: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          {/* Structured Prescription Rows */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Prescription Orders (Rx)</label>
              <button
                type="button"
                onClick={addPrescriptionRow}
                className="inline-flex items-center space-x-1 text-xs font-bold text-teal-600 hover:text-teal-700"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add Medicine</span>
              </button>
            </div>

            {formData.prescriptions.map((rx, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                <input
                  type="text"
                  placeholder="Medicine Name (e.g. Amoxicillin)"
                  value={rx.medicineName}
                  onChange={(e) => updatePrescriptionRow(idx, 'medicineName', e.target.value)}
                  className="flex-2 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Dosage (500mg)"
                  value={rx.dosage}
                  onChange={(e) => updatePrescriptionRow(idx, 'dosage', e.target.value)}
                  className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Frequency"
                  value={rx.frequency}
                  onChange={(e) => updatePrescriptionRow(idx, 'frequency', e.target.value)}
                  className="w-28 px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Duration (5 days)"
                  value={rx.duration}
                  onChange={(e) => updatePrescriptionRow(idx, 'duration', e.target.value)}
                  className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                />
                {formData.prescriptions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePrescriptionRow(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/30 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Consultation Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record View Modal */}
      <Modal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title={`Clinical Record: ${selectedRecord?.recordNumber}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 text-xs">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="font-bold text-slate-800 text-sm">
                {selectedRecord?.patient?.firstName} {selectedRecord?.patient?.lastName}
              </p>
              <p className="text-slate-400">ID: {selectedRecord?.patient?.patientId}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-teal-600">{selectedRecord?.doctor?.specialization}</p>
              <p className="text-slate-400">
                {selectedRecord && new Date(selectedRecord.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {selectedRecord?.vitals && (
            <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 text-teal-900 grid grid-cols-3 gap-2 font-semibold">
              <p>BP: {selectedRecord.vitals.bloodPressure || 'N/A'}</p>
              <p>Heart Rate: {selectedRecord.vitals.heartRate} bpm</p>
              <p>Temp: {selectedRecord.vitals.temperature}°F</p>
              <p>SpO2: {selectedRecord.vitals.oxygenSaturation}%</p>
              <p>Weight: {selectedRecord.vitals.weightKg} kg</p>
              <p>Height: {selectedRecord.vitals.heightCm} cm</p>
            </div>
          )}

          <div>
            <span className="font-bold text-slate-700 block mb-0.5">Diagnoses:</span>
            <p className="text-rose-700 font-bold">{selectedRecord?.diagnosis?.join(', ')}</p>
          </div>

          <div>
            <span className="font-bold text-slate-700 block mb-0.5">Clinical Examination Notes:</span>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {selectedRecord?.clinicalNotes}
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-700 block mb-0.5">Treatment Plan:</span>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {selectedRecord?.treatmentPlan}
            </p>
          </div>

          {selectedRecord?.prescriptions && selectedRecord.prescriptions.length > 0 && (
            <div>
              <span className="font-bold text-slate-700 block mb-1">Prescription Items:</span>
              <div className="space-y-1">
                {selectedRecord.prescriptions.map((p, idx) => (
                  <div key={idx} className="p-2 bg-slate-50 rounded-lg flex justify-between border border-slate-200">
                    <span className="font-bold text-slate-800">
                      {p.medicineName} ({p.dosage})
                    </span>
                    <span className="text-slate-600">
                      {p.frequency} • {p.duration}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
