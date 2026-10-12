import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { StatsCard } from '../components/common/StatsCard';
import {
  Pill,
  Plus,
  Search,
  AlertTriangle,
  Clock,
  DollarSign,
  PackageCheck,
  Send,
  AlertCircle,
} from 'lucide-react';

export const PharmacyPage = () => {
  const { isPharmacist, isAdmin } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [expiringFilter, setExpiringFilter] = useState(false);

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [dispenseMed, setDispenseMed] = useState(null);

  // Add Medicine Form
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: 'Antibiotic',
    dosageForm: 'Tablet',
    strength: '500mg',
    manufacturer: '',
    batchNumber: '',
    unitPrice: 10,
    stockQuantity: 100,
    reorderLevel: 25,
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    locationRack: 'A-01',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Dispense Form
  const [dispenseData, setDispenseData] = useState({
    quantity: 1,
    patientName: '',
    prescriptionRef: '',
  });

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        category: categoryFilter || undefined,
        lowStock: lowStockFilter ? 'true' : undefined,
        expiringSoon: expiringFilter ? 'true' : undefined,
      };
      const res = await api.get('/pharmacy', { params });
      if (res.data.success) {
        setMedicines(res.data.medicines);
        setSummary(res.data.inventorySummary || {});
      }
    } catch (err) {
      console.error('Failed to load pharmacy medicines:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedicines();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, lowStockFilter, expiringFilter]);

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await api.post('/pharmacy', formData);
      setIsAddOpen(false);
      setFormData({
        name: '',
        genericName: '',
        category: 'Antibiotic',
        dosageForm: 'Tablet',
        strength: '500mg',
        manufacturer: '',
        batchNumber: '',
        unitPrice: 10,
        stockQuantity: 100,
        reorderLevel: 25,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        locationRack: 'A-01',
      });
      fetchMedicines();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add medicine');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDispense = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/pharmacy/${dispenseMed._id}/dispense`, dispenseData);
      setDispenseMed(null);
      setDispenseData({ quantity: 1, patientName: '', prescriptionRef: '' });
      fetchMedicines();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispense medication');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pharmacy & Medicine Inventory</h2>
          <p className="text-sm text-slate-500">
            Stock level monitoring, batches, expiry alerts, and prescription fulfillment
          </p>
        </div>

        {(isPharmacist || isAdmin) && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center space-x-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-sm font-bold shadow-lg shadow-teal-600/25 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Add Medicine to Inventory</span>
          </button>
        )}
      </div>

      {/* Pharmacy Inventory KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Catalog Medicines"
          value={summary.totalItems || 0}
          subtext="Active line items"
          icon={Pill}
          color="teal"
        />
        <StatsCard
          title="Stock Units"
          value={summary.totalQuantity || 0}
          subtext={`Valued at $${(summary.totalInventoryValue || 0).toLocaleString()}`}
          icon={PackageCheck}
          color="blue"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={summary.lowStockAlerts || 0}
          subtext="Under reorder point"
          icon={AlertTriangle}
          color={summary.lowStockAlerts > 0 ? 'rose' : 'emerald'}
        />
        <StatsCard
          title="Expiring Soon"
          value={summary.expiringSoonAlerts || 0}
          subtext="Within 60 days"
          icon={Clock}
          color={summary.expiringSoonAlerts > 0 ? 'amber' : 'emerald'}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by medicine name, generic, or batch..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All Categories</option>
          <option value="Antibiotic">Antibiotic</option>
          <option value="Analgesic">Analgesic</option>
          <option value="Antihypertensive">Antihypertensive</option>
          <option value="Antidiabetic">Antidiabetic</option>
          <option value="Antacid">Antacid</option>
          <option value="Vitamin/Supplement">Vitamin/Supplement</option>
        </select>

        <button
          onClick={() => setLowStockFilter(!lowStockFilter)}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
            lowStockFilter
              ? 'bg-rose-50 text-rose-700 border-rose-300'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          ⚠️ Low Stock Only
        </button>

        <button
          onClick={() => setExpiringFilter(!expiringFilter)}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
            expiringFilter
              ? 'bg-amber-50 text-amber-700 border-amber-300'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          ⏳ Expiring Soon
        </button>
      </div>

      {/* Medicines Table */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Medicine Code & Name</th>
                <th className="py-3.5 px-6">Generic & Category</th>
                <th className="py-3.5 px-6">Batch & Expiry</th>
                <th className="py-3.5 px-6">Unit Price</th>
                <th className="py-3.5 px-6">Stock Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                  </td>
                </tr>
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    No medicines match the inventory search criteria.
                  </td>
                </tr>
              ) : (
                medicines.map((med) => {
                  const isLow = med.stockQuantity <= med.reorderLevel;
                  const isExpiring = new Date(med.expiryDate) <= new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

                  return (
                    <tr key={med._id} className="hover:bg-teal-50/30 transition">
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{med.name}</p>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 font-bold">
                          {med.code} • {med.dosageForm} ({med.strength})
                        </span>
                      </td>

                      <td className="py-4 px-6 text-xs">
                        <p className="font-semibold text-slate-700">{med.genericName || 'N/A'}</p>
                        <span className="text-[11px] text-teal-600 font-bold">{med.category}</span>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-600">
                        <p className="font-mono">{med.batchNumber}</p>
                        <p className={`mt-0.5 font-semibold ${isExpiring ? 'text-amber-600' : 'text-slate-500'}`}>
                          Exp: {new Date(med.expiryDate).toLocaleDateString()}
                          {isExpiring && ' ⚠️'}
                        </p>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-800">
                        ${med.unitPrice.toFixed(2)}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              isLow
                                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {med.stockQuantity} units
                          </span>
                          {isLow && <span className="text-[10px] font-bold text-rose-600">Reorder!</span>}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        {(isPharmacist || isAdmin) && (
                          <button
                            onClick={() => setDispenseMed(med)}
                            className="inline-flex items-center space-x-1.5 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 px-3 py-1.5 text-xs font-bold transition"
                          >
                            <Send className="h-3 w-3" />
                            <span>Dispense</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Medicine to Pharmacy Inventory">
        {formError && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleAddMedicine} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amoxicillin Trihydrate"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Generic Chemical Name</label>
              <input
                type="text"
                placeholder="e.g. Amoxicillin"
                value={formData.genericName}
                onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Therapeutic Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="Antibiotic">Antibiotic</option>
                <option value="Analgesic">Analgesic</option>
                <option value="Antihypertensive">Antihypertensive</option>
                <option value="Antidiabetic">Antidiabetic</option>
                <option value="Antacid">Antacid</option>
                <option value="Vitamin/Supplement">Vitamin/Supplement</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Dosage Form</label>
              <select
                value={formData.dosageForm}
                onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
              >
                <option value="Tablet">Tablet</option>
                <option value="Capsule">Capsule</option>
                <option value="Syrup">Syrup</option>
                <option value="Injection">Injection</option>
                <option value="Ointment">Ointment</option>
                <option value="Drops">Drops</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Strength</label>
              <input
                type="text"
                placeholder="500mg"
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Batch Number *</label>
              <input
                type="text"
                required
                placeholder="BAT-2026-X1"
                value={formData.batchNumber}
                onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Reorder Point</label>
              <input
                type="number"
                min="0"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Expiry Date *</label>
              <input
                type="date"
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Storage Rack Location</label>
              <input
                type="text"
                placeholder="A-01"
                value={formData.locationRack}
                onChange={(e) => setFormData({ ...formData, locationRack: e.target.value })}
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
              {submitting ? 'Adding...' : 'Add to Inventory'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Dispense Medicine Modal */}
      <Modal
        isOpen={Boolean(dispenseMed)}
        onClose={() => setDispenseMed(null)}
        title={`Dispense Medication: ${dispenseMed?.name}`}
      >
        <form onSubmit={handleDispense} className="space-y-4">
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-xs text-teal-800 flex justify-between font-bold">
            <span>Available In Stock: {dispenseMed?.stockQuantity} units</span>
            <span>Unit Price: ${dispenseMed?.unitPrice?.toFixed(2)}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Units to Dispense *</label>
            <input
              type="number"
              min="1"
              max={dispenseMed?.stockQuantity || 1}
              required
              value={dispenseData.quantity}
              onChange={(e) => setDispenseData({ ...dispenseData, quantity: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Patient Name</label>
            <input
              type="text"
              placeholder="e.g. Robert Taylor"
              value={dispenseData.patientName}
              onChange={(e) => setDispenseData({ ...dispenseData, patientName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Prescription Reference</label>
            <input
              type="text"
              placeholder="e.g. EMR-2026-0001"
              value={dispenseData.prescriptionRef}
              onChange={(e) => setDispenseData({ ...dispenseData, prescriptionRef: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDispenseMed(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/30"
            >
              Confirm Dispensation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
