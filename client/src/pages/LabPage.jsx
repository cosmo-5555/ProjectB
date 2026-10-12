import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/Badge';
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle,
  FileText,
  Clock,
  AlertCircle,
  AlertTriangle,
  Send,
  Eye,
} from 'lucide-react';

export const LabPage = () => {
  const { isLabStaff, isDoctor, isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [testsCatalog, setTestsCatalog] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modals
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isResultOpen, setIsResultOpen] = useState(false);

  // Order Test Form
  const [orderData, setOrderData] = useState({
    patient: '',
    doctor: '',
    test: '',
    priority: 'Normal',
    remarks: '',
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Enter Result Form
  const [resultData, setResultData] = useState({
    status: 'Completed',
    resultValue: '',
    remarks: '',
    sampleCollectionDate: new Date().toISOString().split('T')[0],
  });
  const [submittingResult, setSubmittingResult] = useState(false);

  const fetchLabData = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      };
      const [reqRes, catalogRes] = await Promise.all([
        api.get('/lab/requests', { params }),
        api.get('/lab/tests'),
      ]);

      if (reqRes.data.success) setRequests(reqRes.data.requests);
      if (catalogRes.data.success) setTestsCatalog(catalogRes.data.tests);
    } catch (err) {
      console.error('Failed to load lab data:', err);
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
    fetchLabData();
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchDependencies();
  }, []);

  const handleOrderTest = async (e) => {
    e.preventDefault();
    setOrderError('');
    setSubmittingOrder(true);

    try {
      await api.post('/lab/requests', orderData);
      setIsOrderOpen(false);
      setOrderData({ patient: '', doctor: '', test: '', priority: 'Normal', remarks: '' });
      fetchLabData();
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to order lab test');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    setSubmittingResult(true);

    try {
      await api.patch(`/lab/requests/${selectedRequest._id}`, resultData);
      setIsResultOpen(false);
      setSelectedRequest(null);
      fetchLabData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update test findings');
    } finally {
      setSubmittingResult(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Diagnostic Laboratory & Pathology</h2>
          <p className="text-sm text-slate-500">
            Pathology tests, diagnostic specimen queue, specimen intake, and electronic reports
          </p>
        </div>

        {(isDoctor || isAdmin) && (
          <button
            onClick={() => setIsOrderOpen(true)}
            className="inline-flex items-center space-x-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-sm font-bold shadow-lg shadow-teal-600/25 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Order Diagnostic Test</span>
          </button>
        )}
      </div>

      {/* Filter and Status Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 flex flex-wrap gap-3 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All Test Statuses</option>
          <option value="Requested">Requested</option>
          <option value="Sample Collected">Sample Collected</option>
          <option value="In Testing">In Testing</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All Priorities</option>
          <option value="Normal">Normal</option>
          <option value="Urgent">Urgent</option>
          <option value="STAT (Emergency)">STAT (Emergency)</option>
        </select>
      </div>

      {/* Lab Requests List */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Patient</th>
                <th className="py-3.5 px-6">Test Ordered</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Diagnostic Results</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No laboratory requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-teal-50/30 transition">
                    <td className="py-4 px-6 font-mono font-bold text-teal-700 text-xs">
                      {req.requestNumber}
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">
                        {req.patient?.firstName} {req.patient?.lastName}
                      </p>
                      <span className="text-[11px] text-slate-400">{req.patient?.patientId}</span>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{req.test?.testName}</p>
                      <span className="text-xs text-teal-600 font-semibold">{req.test?.category}</span>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          req.priority === 'STAT (Emergency)'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                            : req.priority === 'Urgent'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.priority}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={req.status} />
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 max-w-xs">
                      {req.resultValue ? (
                        <p className="font-medium text-emerald-800 bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                          {req.resultValue}
                        </p>
                      ) : (
                        <p className="text-slate-400 italic">Awaiting specimen results</p>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      {(isLabStaff || isAdmin) && req.status !== 'Completed' ? (
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setResultData({
                              status: 'Completed',
                              resultValue: req.resultValue || '',
                              remarks: req.remarks || '',
                              sampleCollectionDate: new Date().toISOString().split('T')[0],
                            });
                            setIsResultOpen(true);
                          }}
                          className="inline-flex items-center space-x-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 text-xs font-bold transition"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>Enter Findings</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Lab Test Modal */}
      <Modal isOpen={isOrderOpen} onClose={() => setIsOrderOpen(false)} title="Order Diagnostic Laboratory Test">
        {orderError && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{orderError}</span>
          </div>
        )}

        <form onSubmit={handleOrderTest} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Select Patient *</label>
              <select
                required
                value={orderData.patient}
                onChange={(e) => setOrderData({ ...orderData, patient: e.target.value })}
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
              <label className="block text-xs font-bold text-slate-600 mb-1">Ordering Physician *</label>
              <select
                required
                value={orderData.doctor}
                onChange={(e) => setOrderData({ ...orderData, doctor: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="">-- Choose Doctor --</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.user?.name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Laboratory Test *</label>
              <select
                required
                value={orderData.test}
                onChange={(e) => setOrderData({ ...orderData, test: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="">-- Select Diagnostic Test --</option>
                {testsCatalog.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.testName} (${t.price}) - {t.category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Clinical Priority</label>
              <select
                value={orderData.priority}
                onChange={(e) => setOrderData({ ...orderData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="STAT (Emergency)">STAT (Emergency)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Doctor Remarks / Instructions</label>
            <textarea
              rows="2"
              placeholder="e.g. Fasting 8 hours required, patient experiencing acute symptoms..."
              value={orderData.remarks}
              onChange={(e) => setOrderData({ ...orderData, remarks: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOrderOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingOrder}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/30 disabled:opacity-50"
            >
              {submittingOrder ? 'Submitting...' : 'Issue Lab Order'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Enter Test Findings Modal */}
      <Modal
        isOpen={isResultOpen}
        onClose={() => {
          setIsResultOpen(false);
          setSelectedRequest(null);
        }}
        title={`Enter Laboratory Findings: ${selectedRequest?.test?.testName}`}
      >
        <form onSubmit={handleSaveResult} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
            <p>
              <span className="font-bold text-slate-700">Patient:</span> {selectedRequest?.patient?.firstName}{' '}
              {selectedRequest?.patient?.lastName} ({selectedRequest?.patient?.patientId})
            </p>
            <p>
              <span className="font-bold text-slate-700">Reference Range:</span>{' '}
              {selectedRequest?.test?.referenceRange || 'Standard clinical normal limits'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Workflow Status</label>
              <select
                value={resultData.status}
                onChange={(e) => setResultData({ ...resultData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="Sample Collected">Sample Collected</option>
                <option value="In Testing">In Testing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Specimen Collection Date</label>
              <input
                type="date"
                value={resultData.sampleCollectionDate}
                onChange={(e) => setResultData({ ...resultData, sampleCollectionDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Result Findings & Values *</label>
            <textarea
              rows="3"
              required
              placeholder="e.g. Total Cholesterol: 210 mg/dL, HDL: 45 mg/dL, LDL: 135 mg/dL (Borderline elevated)"
              value={resultData.resultValue}
              onChange={(e) => setResultData({ ...resultData, resultValue: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Technologist Remarks</label>
            <input
              type="text"
              placeholder="e.g. Sample processed within 2h of intake, calibration validated"
              value={resultData.remarks}
              onChange={(e) => setResultData({ ...resultData, remarks: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsResultOpen(false);
                setSelectedRequest(null);
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingResult}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/30 disabled:opacity-50"
            >
              {submittingResult ? 'Saving...' : 'Finalize & Record Findings'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
