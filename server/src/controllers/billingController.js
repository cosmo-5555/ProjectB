import Invoice from '../models/Invoice.js';
import Patient from '../models/Patient.js';
import { logAudit } from '../middleware/audit.js';

const generateInvoiceNumber = async () => {
  const count = await Invoice.countDocuments();
  const year = new Date().getFullYear();
  return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Get all invoices
// @route   GET /api/billing
// @access  Private (Admin, Billing Staff, Doctor, Receptionist)
export const getInvoices = async (req, res, next) => {
  try {
    const { status, patientId, search, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (patientId) query.patient = patientId;

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) return res.status(200).json({ success: true, count: 0, invoices: [] });
      query.patient = patient._id;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('patient', 'firstName lastName patientId phone email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    // Summary statistics
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDue: { $sum: '$balanceDue' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      total,
      count: invoices.length,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      financialSummary: stats[0] || { totalBilled: 0, totalPaid: 0, totalDue: 0 },
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single invoice
// @route   GET /api/billing/:id
// @access  Private
export const getInvoiceById = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('patient')
      .populate('appointment')
      .populate('createdBy', 'name');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, invoice });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate new invoice
// @route   POST /api/billing
// @access  Private (Admin, Billing Staff)
export const createInvoice = async (req, res, next) => {
  try {
    const { patient, appointment, items, taxAmount = 0, discountAmount = 0, notes, dueDate } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one line item is required' });
    }

    // Calculate subtotal
    const calculatedItems = items.map((item) => ({
      description: item.description,
      category: item.category || 'Other',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      total: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
    }));

    const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
    const totalAmount = Math.max(0, subtotal + Number(taxAmount) - Number(discountAmount));
    const balanceDue = totalAmount;

    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      patient,
      appointment: appointment || null,
      items: calculatedItems,
      subtotal,
      taxAmount: Number(taxAmount),
      discountAmount: Number(discountAmount),
      totalAmount,
      paidAmount: 0,
      balanceDue,
      status: 'Unpaid',
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: req.user._id,
      notes: notes || '',
    });

    await logAudit({
      action: 'CREATE',
      entity: 'Invoice',
      entityId: invoice._id,
      req,
      details: { invoiceNumber, totalAmount, patient },
    });

    const populated = await Invoice.findById(invoice._id).populate('patient', 'firstName lastName patientId');

    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      invoice: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record payment on invoice
// @route   POST /api/billing/:id/payment
// @access  Private (Admin, Billing Staff)
export const recordPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, transactionReference } = req.body;

    const paymentVal = Number(amount);
    if (!paymentVal || paymentVal <= 0) {
      return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'This invoice is already fully paid' });
    }

    invoice.transactions.push({
      amount: paymentVal,
      paymentMethod,
      transactionReference: transactionReference || '',
      paidAt: new Date(),
      receivedBy: req.user._id,
    });

    invoice.paidAmount += paymentVal;
    invoice.balanceDue = Math.max(0, invoice.totalAmount - invoice.paidAmount);

    if (invoice.balanceDue === 0) {
      invoice.status = 'Paid';
    } else {
      invoice.status = 'Partially Paid';
    }

    await invoice.save();

    await logAudit({
      action: 'PAYMENT',
      entity: 'Invoice',
      entityId: invoice._id,
      req,
      details: {
        invoiceNumber: invoice.invoiceNumber,
        amountPaid: paymentVal,
        method: paymentMethod,
        balanceRemaining: invoice.balanceDue,
      },
    });

    const populated = await Invoice.findById(invoice._id).populate('patient', 'firstName lastName patientId');

    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      invoice: populated,
    });
  } catch (error) {
    next(error);
  }
};
