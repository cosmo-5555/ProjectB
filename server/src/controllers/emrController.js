import MedicalRecord from '../models/MedicalRecord.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { logAudit } from '../middleware/audit.js';

const generateRecordNumber = async () => {
  const count = await MedicalRecord.countDocuments();
  const year = new Date().getFullYear();
  return `EMR-${year}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Get medical records (filtered by patient or doctor)
// @route   GET /api/emr
// @access  Private (Doctor, Admin, Receptionist)
export const getMedicalRecords = async (req, res, next) => {
  try {
    const { patientId, doctorId, page = 1, limit = 10 } = req.query;

    const query = {};
    if (patientId) query.patient = patientId;
    if (doctorId) query.doctor = doctorId;

    // Patient role can only view their own EMR
    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ user: req.user._id });
      if (!patientProfile) {
        return res.status(200).json({ success: true, count: 0, records: [] });
      }
      query.patient = patientProfile._id;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await MedicalRecord.countDocuments(query);
    const records = await MedicalRecord.find(query)
      .populate('patient', 'firstName lastName patientId dob gender bloodGroup')
      .populate({
        path: 'doctor',
        select: 'doctorCode specialization',
        populate: { path: 'user', select: 'name' },
      })
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      count: records.length,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single medical record by ID
// @route   GET /api/emr/:id
// @access  Private
export const getMedicalRecordById = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email' },
      })
      .populate('appointment');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    await logAudit({
      action: 'READ',
      entity: 'MedicalRecord',
      entityId: record._id,
      req,
      details: { recordNumber: record.recordNumber },
    });

    res.status(200).json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new medical record / consultation note
// @route   POST /api/emr
// @access  Private (Doctor, Admin)
export const createMedicalRecord = async (req, res, next) => {
  try {
    const {
      patient,
      doctor,
      appointment,
      vitals,
      chiefComplaints,
      diagnosis,
      clinicalNotes,
      treatmentPlan,
      prescriptions,
      followUpDate,
    } = req.body;

    let doctorId = doctor;
    // If not supplied and user is doctor, auto-assign
    if (!doctorId && req.user.role === 'doctor') {
      const docProfile = await Doctor.findOne({ user: req.user._id });
      if (docProfile) doctorId = docProfile._id;
    }

    if (!doctorId) {
      return res.status(400).json({ success: false, message: 'Doctor ID is required' });
    }

    const recordNumber = await generateRecordNumber();

    const record = await MedicalRecord.create({
      recordNumber,
      patient,
      doctor: doctorId,
      appointment: appointment || null,
      vitals: vitals || {},
      chiefComplaints: Array.isArray(chiefComplaints) ? chiefComplaints : [chiefComplaints],
      diagnosis: Array.isArray(diagnosis) ? diagnosis : [diagnosis],
      clinicalNotes,
      treatmentPlan,
      prescriptions: prescriptions || [],
      followUpDate,
    });

    // Mark appointment as Completed if linked
    if (appointment) {
      await Appointment.findByIdAndUpdate(appointment, { status: 'Completed' });
    }

    await logAudit({
      action: 'CREATE',
      entity: 'MedicalRecord',
      entityId: record._id,
      req,
      details: { recordNumber, patientId: patient },
    });

    const populated = await MedicalRecord.findById(record._id)
      .populate('patient', 'firstName lastName patientId')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      });

    res.status(201).json({
      success: true,
      message: 'Medical record documented successfully',
      record: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update medical record
// @route   PUT /api/emr/:id
// @access  Private (Doctor, Admin)
export const updateMedicalRecord = async (req, res, next) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Medical record not found' });
    }

    const updated = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      });

    await logAudit({
      action: 'UPDATE',
      entity: 'MedicalRecord',
      entityId: record._id,
      req,
      details: { recordNumber: record.recordNumber },
    });

    res.status(200).json({
      success: true,
      message: 'Medical record updated successfully',
      record: updated,
    });
  } catch (error) {
    next(error);
  }
};
