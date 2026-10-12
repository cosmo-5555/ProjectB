import Patient from '../models/Patient.js';
import MedicalRecord from '../models/MedicalRecord.js';
import Appointment from '../models/Appointment.js';
import Invoice from '../models/Invoice.js';
import { logAudit } from '../middleware/audit.js';

// Helper to generate unique Patient ID
const generatePatientId = async () => {
  const count = await Patient.countDocuments();
  const year = new Date().getFullYear();
  return `PAT-${year}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Get all patients with search, filtering, and pagination
// @route   GET /api/patients
// @access  Private (Staff/Admin)
export const getPatients = async (req, res, next) => {
  try {
    const { search, status, bloodGroup, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { patientId: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: patients.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      patients,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient by ID with full medical history
// @route   GET /api/patients/:id
// @access  Private
export const getPatientById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Role check: If role is patient, they can only view their own record
    if (req.user.role === 'patient' && String(patient.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this patient profile' });
    }

    // Fetch related records in parallel
    const [medicalRecords, appointments, invoices] = await Promise.all([
      MedicalRecord.find({ patient: patient._id }).populate('doctor', 'doctorCode specialization').sort('-createdAt'),
      Appointment.find({ patient: patient._id }).populate('doctor', 'doctorCode specialization').sort('-appointmentDate'),
      Invoice.find({ patient: patient._id }).sort('-createdAt'),
    ]);

    await logAudit({
      action: 'READ',
      entity: 'Patient',
      entityId: patient._id,
      req,
      details: { patientId: patient.patientId },
    });

    res.status(200).json({
      success: true,
      patient,
      medicalRecords,
      appointments,
      invoices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new patient
// @route   POST /api/patients
// @access  Private (Admin, Receptionist, Doctor)
export const createPatient = async (req, res, next) => {
  try {
    const patientId = req.body.patientId || (await generatePatientId());

    const patient = await Patient.create({
      ...req.body,
      patientId,
      registeredBy: req.user._id,
    });

    await logAudit({
      action: 'CREATE',
      entity: 'Patient',
      entityId: patient._id,
      req,
      details: { patientId: patient.patientId, name: `${patient.firstName} ${patient.lastName}` },
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private (Admin, Receptionist, Doctor)
export const updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await logAudit({
      action: 'UPDATE',
      entity: 'Patient',
      entityId: patient._id,
      req,
      details: { patientId: patient.patientId },
    });

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully',
      patient,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private (Admin only)
export const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    await Patient.findByIdAndDelete(req.params.id);

    await logAudit({
      action: 'DELETE',
      entity: 'Patient',
      entityId: patient._id,
      req,
      details: { patientId: patient.patientId, name: `${patient.firstName} ${patient.lastName}` },
    });

    res.status(200).json({
      success: true,
      message: 'Patient record removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
