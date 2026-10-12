import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';
import { StatsCard } from '../components/common/StatsCard';
import { StatusBadge } from '../components/common/Badge';
import {
  Receipt,
  Plus,
  DollarSign,
  CreditCard,
  CheckCircle,
  FileText,
  AlertCircle,
  PlusCircle,
  Trash2,
  Printer,
  Eye,
} from 'lucide-react';

export const BillingPage = () => {
  const { isBillingStaff, isAdmin } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({});
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [receiptInvoice, setReceiptInvoice] = useState(null);

  // Create Invoice Form
  const [invoiceData, setInvoiceData] = useState({
    patient: '',
    taxAmount: 0,
    discountAmount: 0,
    notes: '',
    items: [{ description: 'Specialist Medical Consultation', category: 'Consultation', quantity: 1, unitPrice: 100 }],
  });
  const [submittingInvoice, setSubmittingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');

  // Payment Form
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'Credit Card',
    transactionReference: '',
  });

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter || undefined,
      };
      const res = await api.get('/billing', { params });
      if (res.data.success) {
        setInvoices(res.data.invoices);
        setSummary(res.data.financialSummary || {});
      }
    } catch (err) {
      console.error('Failed to load billing invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get('/patients?limit=50');
      if (res.data.success) setPatients(res.data.patients);
    } catch (err) {
      console.error('Failed to load patients for billing:', err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  useEffect(() => {
    fetchPatients();
  }, []);

  const addLineItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        { description: '', category: 'Medication', quantity: 1, unitPrice: 20 },
      ],
    });
  };

  const removeLineItem = (idx) => {
    const updated = invoiceData.items.filter((_, i) => i !== idx);
    setInvoiceData({ ...invoiceData, items: updated });
  };

  const updateLineItem = (idx, field, value) => {
    const updated = [...invoiceData.items];
    updated[idx][field] = value;
    setInvoiceData({ ...invoiceData, items: updated });
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      0
    );
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setInvoiceError('');
    setSubmittingInvoice(true);

    try {
      await api.post('/billing', invoiceData);
      setIsCreateOpen(false);
      setInvoiceData({
        patient: '',
        taxAmount: 0,
        discountAmount: 0,
        notes: '',
        items: [{ description: 'Specialist Medical Consultation', category: 'Consultation', quantity: 1, unitPrice: 100 }],
      });
      fetchInvoices();
    } catch (err) {
      setInvoiceError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSubmittingInvoice(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/billing/${paymentInvoice._id}/payment`, paymentData);
      setPaymentInvoice(null);
      setPaymentData({ amount: 0, paymentMethod: 'Credit Card', transactionReference: '' });
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment recording failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Invoicing</h2>
          <p className="text-sm text-slate-500">
            Hospital charges, payment transactions, copays, insurance billing, and receipts
          </p>
        </div>

        {(isBillingStaff || isAdmin) && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center space-x-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 text-sm font-bold shadow-lg shadow-teal-600/25 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Patient Invoice</span>
          </button>
        )}
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Total Billed"
          value={`$${(summary.totalBilled || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext="Cumulative hospital billings"
          icon={Receipt}
          color="blue"
        />
        <StatsCard
          title="Total Collected"
          value={`$${(summary.totalPaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext="Cleared cash, card & online"
          icon={CheckCircle}
          color="emerald"
        />
        <StatsCard
          title="Outstanding Due"
          value={`$${(summary.totalDue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtext="Pending patient balance"
          icon={DollarSign}
          color={summary.totalDue > 0 ? 'rose' : 'teal'}
        />
      </div>

      {/* Filter and Status Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200/80 flex flex-wrap gap-3 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="">All Payment Statuses</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Partially Paid">Partially Paid</option>
          <option value="Paid">Paid</option>
        </select>
      </div>

      {/* Invoices List */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Invoice #</th>
                <th className="py-3.5 px-6">Patient</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Billed Amount</th>
                <th className="py-3.5 px-6">Paid / Balance</th>
                <th className="py-3.5 px-6">Status</th>
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
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No invoices recorded.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-teal-50/30 transition">
                    <td className="py-4 px-6 font-mono font-bold text-teal-700 text-xs">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">
                        {inv.patient?.firstName} {inv.patient?.lastName}
                      </p>
                      <span className="text-[11px] text-slate-400">{inv.patient?.patientId}</span>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-800">
                      ${inv.totalAmount.toFixed(2)}
                    </td>

                    <td className="py-4 px-6 text-xs">
                      <p className="font-semibold text-emerald-600">Paid: ${inv.paidAmount.toFixed(2)}</p>
                      <p className={`font-semibold ${inv.balanceDue > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        Due: ${inv.balanceDue.toFixed(2)}
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={inv.status} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {(isBillingStaff || isAdmin) && inv.status !== 'Paid' && (
                          <button
                            onClick={() => {
                              setPaymentInvoice(inv);
                              setPaymentData({
                                amount: inv.balanceDue,
                                paymentMethod: 'Credit Card',
                                transactionReference: '',
                              });
                            }}
                            className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 text-xs font-bold transition"
                          >
                            <CreditCard className="h-3 w-3" />
                            <span>Collect</span>
                          </button>
                        )}
                        <button
                          onClick={() => setReceiptInvoice(inv)}
                          className="p-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition"
                          title="View Official Receipt"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Invoice Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Generate Itemized Patient Invoice"
        maxWidth="max-w-3xl"
      >
        {invoiceError && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-rose-700 text-xs font-semibold border border-rose-200 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{invoiceError}</span>
          </div>
        )}

        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Select Patient *</label>
            <select
              required
              value={invoiceData.patient}
              onChange={(e) => setInvoiceData({ ...invoiceData, patient: e.target.value })}
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

          {/* Line items table */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Line Items & Hospital Charges</label>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center space-x-1 text-xs font-bold text-teal-600 hover:text-teal-700"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add Charge Item</span>
              </button>
            </div>

            {invoiceData.items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <select
                  value={item.category}
                  onChange={(e) => updateLineItem(idx, 'category', e.target.value)}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Medication">Medication</option>
                  <option value="Lab Test">Lab Test</option>
                  <option value="Procedure">Procedure</option>
                  <option value="Room Charge">Room Charge</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="text"
                  placeholder="Service / Item Description"
                  required
                  value={item.description}
                  onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                  className="flex-2 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                />

                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  required
                  value={item.quantity}
                  onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value))}
                  className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                />

                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  min="0"
                  required
                  value={item.unitPrice}
                  onChange={(e) => updateLineItem(idx, 'unitPrice', Number(e.target.value))}
                  className="w-24 px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                />

                <span className="w-20 text-xs font-bold text-slate-800 text-right">
                  ${((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}
                </span>

                {invoiceData.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(idx)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tax Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={invoiceData.taxAmount}
                onChange={(e) => setInvoiceData({ ...invoiceData, taxAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Discount Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={invoiceData.discountAmount}
                onChange={(e) => setInvoiceData({ ...invoiceData, discountAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-teal-50 rounded-2xl flex justify-between items-center text-sm font-bold text-teal-900">
            <span>Estimated Total:</span>
            <span className="text-lg">
              $
              {(
                calculateSubtotal() +
                Number(invoiceData.taxAmount || 0) -
                Number(invoiceData.discountAmount || 0)
              ).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingInvoice}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold shadow-md shadow-teal-600/30 disabled:opacity-50"
            >
              {submittingInvoice ? 'Generating...' : 'Issue Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Collect Payment Modal */}
      <Modal
        isOpen={Boolean(paymentInvoice)}
        onClose={() => setPaymentInvoice(null)}
        title={`Record Payment for ${paymentInvoice?.invoiceNumber}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs flex justify-between font-bold">
            <span>Total Bill: ${paymentInvoice?.totalAmount.toFixed(2)}</span>
            <span className="text-rose-600">Balance Due: ${paymentInvoice?.balanceDue.toFixed(2)}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Payment Amount ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={paymentInvoice?.balanceDue}
              required
              value={paymentData.amount}
              onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Payment Method *</label>
            <select
              value={paymentData.paymentMethod}
              onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash</option>
              <option value="UPI / Online">UPI / Online</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Transaction Ref / Cheque #</label>
            <input
              type="text"
              placeholder="e.g. TXN-VISA-9921"
              value={paymentData.transactionReference}
              onChange={(e) => setPaymentData({ ...paymentData, transactionReference: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPaymentInvoice(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/30"
            >
              Confirm Payment & Print Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Receipt Modal */}
      <Modal
        isOpen={Boolean(receiptInvoice)}
        onClose={() => setReceiptInvoice(null)}
        title="Official Hospital Payment Receipt"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 text-xs">
          <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
            <div>
              <h4 className="text-base font-black text-slate-900">CarePulse Hospital</h4>
              <p className="text-[11px] text-slate-500">123 Health Ave, Medical District • +1 555-0100</p>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-teal-700 text-sm">{receiptInvoice?.invoiceNumber}</span>
              <p className="text-[10px] text-slate-400">
                {receiptInvoice && new Date(receiptInvoice.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <p>
              <span className="font-bold text-slate-700">Patient:</span> {receiptInvoice?.patient?.firstName}{' '}
              {receiptInvoice?.patient?.lastName} ({receiptInvoice?.patient?.patientId})
            </p>
            <p>
              <span className="font-bold text-slate-700">Contact:</span> {receiptInvoice?.patient?.phone}
            </p>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-1.5">Description</th>
                <th className="py-1.5 text-center">Qty</th>
                <th className="py-1.5 text-right">Price</th>
                <th className="py-1.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receiptInvoice?.items?.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-2 font-medium text-slate-800">{it.description}</td>
                  <td className="py-2 text-center">{it.quantity}</td>
                  <td className="py-2 text-right">${it.unitPrice.toFixed(2)}</td>
                  <td className="py-2 text-right font-bold">${it.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t border-slate-200 pt-3 space-y-1.5 text-right">
            <p className="text-slate-500">Subtotal: ${receiptInvoice?.subtotal.toFixed(2)}</p>
            {receiptInvoice?.taxAmount > 0 && <p className="text-slate-500">Tax: +${receiptInvoice.taxAmount.toFixed(2)}</p>}
            {receiptInvoice?.discountAmount > 0 && (
              <p className="text-emerald-600">Discount: -${receiptInvoice.discountAmount.toFixed(2)}</p>
            )}
            <p className="text-sm font-black text-slate-900 border-t border-slate-200 pt-1">
              Total Amount: ${receiptInvoice?.totalAmount.toFixed(2)}
            </p>
            <p className="text-emerald-600 font-bold">Amount Paid: ${receiptInvoice?.paidAmount.toFixed(2)}</p>
            <p className="text-rose-600 font-bold">Remaining Balance Due: ${receiptInvoice?.balanceDue.toFixed(2)}</p>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
