import LabTest from '../models/LabTest.js';
import LabRequest from '../models/LabRequest.js';
import Patient from '../models/Patient.js';
import { logAudit } from '../middleware/audit.js';

const generateLabRequestNumber = async () => {
  const count = await LabRequest.countDocuments();
  const year = new Date().getFullYear();
  return `LAB-${year}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Get all available lab tests catalog
// @route   GET /api/lab/tests
// @access  Private
export const getLabTests = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ testName: regex }, { testCode: regex }];
    }

    const tests = await LabTest.find(query).sort('category testName');
    res.status(200).json({ success: true, count: tests.length, tests });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new lab test in catalog
// @route   POST /api/lab/tests
// @access  Private (Admin, Lab Staff)
export const createLabTest = async (req, res, next) => {
  try {
    const { testName, category, price, sampleType, turnaroundHours, referenceRange, unit, description } = req.body;

    const count = await LabTest.countDocuments();
    const testCode = `TST-${String(count + 1).padStart(3, '0')}`;

    const test = await LabTest.create({
      testCode,
      testName,
      category,
      price,
      sampleType,
      turnaroundHours,
      referenceRange,
      unit,
      description,
    });

    res.status(201).json({ success: true, message: 'Lab test created', test });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lab requests / orders
// @route   GET /api/lab/requests
// @access  Private
export const getLabRequests = async (req, res, next) => {
  try {
    const { status, priority, patientId, page = 1, limit = 15 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (patientId) query.patient = patientId;

    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient) return res.status(200).json({ success: true, count: 0, requests: [] });
      query.patient = patient._id;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await LabRequest.countDocuments(query);
    const requests = await LabRequest.find(query)
      .populate('patient', 'firstName lastName patientId phone bloodGroup')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      })
      .populate('test')
      .populate('performedBy', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      count: requests.length,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Order/Request a lab test
// @route   POST /api/lab/requests
// @access  Private (Doctor, Admin)
export const createLabRequest = async (req, res, next) => {
  try {
    const { patient, doctor, test, priority, remarks } = req.body;

    const requestNumber = await generateLabRequestNumber();

    const request = await LabRequest.create({
      requestNumber,
      patient,
      doctor,
      test,
      priority: priority || 'Normal',
      remarks: remarks || '',
      status: 'Requested',
    });

    await logAudit({
      action: 'CREATE',
      entity: 'LabRequest',
      entityId: request._id,
      req,
      details: { requestNumber, patient, test },
    });

    const populated = await LabRequest.findById(request._id)
      .populate('patient', 'firstName lastName patientId')
      .populate('test');

    res.status(201).json({
      success: true,
      message: 'Lab test ordered successfully',
      request: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lab test request status & record test results
// @route   PATCH /api/lab/requests/:id
// @access  Private (Lab Staff, Admin)
export const updateLabRequest = async (req, res, next) => {
  try {
    const { status, resultValue, remarks, sampleCollectionDate } = req.body;

    const request = await LabRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Lab request not found' });
    }

    if (status) request.status = status;
    if (resultValue !== undefined) request.resultValue = resultValue;
    if (remarks !== undefined) request.remarks = remarks;
    if (sampleCollectionDate) request.sampleCollectionDate = sampleCollectionDate;

    if (status === 'Completed') {
      request.completedDate = new Date();
      request.performedBy = req.user._id;
    }

    await request.save();

    await logAudit({
      action: 'UPDATE',
      entity: 'LabRequest',
      entityId: request._id,
      req,
      details: { requestNumber: request.requestNumber, status: request.status },
    });

    const populated = await LabRequest.findById(request._id)
      .populate('patient', 'firstName lastName patientId')
      .populate('test')
      .populate('performedBy', 'name');

    res.status(200).json({
      success: true,
      message: 'Lab request updated successfully',
      request: populated,
    });
  } catch (error) {
    next(error);
  }
};
