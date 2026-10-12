import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import { logAudit } from '../middleware/audit.js';

const generateAppointmentNumber = async () => {
  const count = await Appointment.countDocuments();
  const year = new Date().getFullYear();
  return `APT-${year}-${String(count + 1).padStart(4, '0')}`;
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res, next) => {
  try {
    const { doctorId, patientId, status, date, startDate, endDate, page = 1, limit = 15 } = req.query;

    const query = {};

    if (doctorId) query.doctor = doctorId;
    if (patientId) query.patient = patientId;
    if (status) query.status = status;

    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.appointmentDate = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      query.appointmentDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Role filtering: If user is a doctor, only show their appointments unless admin/receptionist
    if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: req.user._id });
      if (doctorProfile) {
        query.doctor = doctorProfile._id;
      }
    } else if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ user: req.user._id });
      if (patientProfile) {
        query.patient = patientProfile._id;
      }
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'patientId firstName lastName phone email bloodGroup')
      .populate({
        path: 'doctor',
        select: 'doctorCode specialization roomNumber consultationFee',
        populate: { path: 'user', select: 'name email phone avatar' },
      })
      .sort('-appointmentDate')
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      count: appointments.length,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone avatar' },
      });

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.status(200).json({ success: true, appointment });
  } catch (error) {
    next(error);
  }
};

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res, next) => {
  try {
    const { patient, doctor, appointmentDate, timeSlot, type, reasonForVisit, notes } = req.body;

    const patientExists = await Patient.findById(patient);
    if (!patientExists) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const doctorExists = await Doctor.findById(doctor);
    if (!doctorExists) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Check conflict for same doctor, date & timeSlot
    const conflictingApt = await Appointment.findOne({
      doctor,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ['Scheduled', 'Confirmed'] },
    });

    if (conflictingApt) {
      return res.status(400).json({
        success: false,
        message: 'This doctor is already booked for this specific time slot. Please choose another slot.',
      });
    }

    const appointmentNumber = await generateAppointmentNumber();

    const appointment = await Appointment.create({
      appointmentNumber,
      patient,
      doctor,
      appointmentDate,
      timeSlot,
      type: type || 'General Consultation',
      reasonForVisit,
      notes,
      bookedBy: req.user._id,
      status: 'Scheduled',
    });

    await logAudit({
      action: 'CREATE',
      entity: 'Appointment',
      entityId: appointment._id,
      req,
      details: { appointmentNumber, date: appointmentDate, timeSlot },
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName phone patientId')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (Cancel, Confirm, Complete)
// @route   PATCH /api/appointments/:id/status
// @access  Private
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status, cancelledReason } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    if (cancelledReason) appointment.cancelledReason = cancelledReason;
    await appointment.save();

    await logAudit({
      action: 'UPDATE',
      entity: 'Appointment',
      entityId: appointment._id,
      req,
      details: { status, appointmentNumber: appointment.appointmentNumber },
    });

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { appointmentDate, timeSlot, notes } = req.body;

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check conflict
    const conflictingApt = await Appointment.findOne({
      _id: { $ne: appointment._id },
      doctor: appointment.doctor,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      status: { $in: ['Scheduled', 'Confirmed'] },
    });

    if (conflictingApt) {
      return res.status(400).json({
        success: false,
        message: 'The requested time slot is not available.',
      });
    }

    appointment.appointmentDate = appointmentDate;
    appointment.timeSlot = timeSlot;
    if (notes) appointment.notes = notes;
    appointment.status = 'Scheduled';
    await appointment.save();

    await logAudit({
      action: 'UPDATE',
      entity: 'Appointment',
      entityId: appointment._id,
      req,
      details: { action: 'Rescheduled', newDate: appointmentDate, timeSlot },
    });

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};
