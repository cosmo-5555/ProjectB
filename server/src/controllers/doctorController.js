import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import { logAudit } from '../middleware/audit.js';

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public (or authenticated)
export const getDoctors = async (req, res, next) => {
  try {
    const { specialization, isAvailable, search } = req.query;

    const query = {};
    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }
    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true';
    }

    const doctors = await Doctor.find(query)
      .populate('user', 'name email phone avatar isActive')
      .sort('user.name');

    // Filter by doctor name if search query is passed
    let results = doctors;
    if (search) {
      const searchLower = search.toLowerCase();
      results = doctors.filter(
        (doc) =>
          doc.user?.name?.toLowerCase().includes(searchLower) ||
          doc.specialization?.toLowerCase().includes(searchLower) ||
          doc.doctorCode?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({
      success: true,
      count: results.length,
      doctors: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public / Private
export const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone avatar isActive');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    res.status(200).json({ success: true, doctor });
  } catch (error) {
    next(error);
  }
};

// @desc    Create doctor profile
// @route   POST /api/doctors
// @access  Private (Admin)
export const createDoctor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password = 'Doctor@123',
      phone,
      specialization,
      licenseNumber,
      experienceYears,
      consultationFee,
      roomNumber,
      availableDays,
      workingHours,
      bio,
    } = req.body;

    // Check if user already exists or create new
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password,
        role: 'doctor',
        phone,
      });
    } else {
      user.role = 'doctor';
      await user.save();
    }

    const doctorCount = await Doctor.countDocuments();
    const doctorCode = `DOC-${String(doctorCount + 1).padStart(3, '0')}`;

    const doctor = await Doctor.create({
      user: user._id,
      doctorCode,
      specialization,
      licenseNumber,
      experienceYears,
      consultationFee,
      roomNumber,
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      workingHours: workingHours || { start: '09:00', end: '17:00' },
      bio,
    });

    await logAudit({
      action: 'CREATE',
      entity: 'Doctor',
      entityId: doctor._id,
      req,
      details: { doctorCode, specialization, name },
    });

    const populatedDoctor = await Doctor.findById(doctor._id).populate('user', 'name email phone avatar isActive');

    res.status(201).json({
      success: true,
      message: 'Doctor profile created successfully',
      doctor: populatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/:id
// @access  Private (Admin, Doctor themselves)
export const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Role check: Only admin or the doctor themselves can update
    if (req.user.role === 'doctor' && String(doctor.user) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized to modify this doctor profile' });
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('user', 'name email phone avatar isActive');

    if (req.body.name || req.body.phone) {
      await User.findByIdAndUpdate(doctor.user, {
        name: req.body.name || undefined,
        phone: req.body.phone || undefined,
      });
    }

    await logAudit({
      action: 'UPDATE',
      entity: 'Doctor',
      entityId: doctor._id,
      req,
      details: { doctorCode: doctor.doctorCode },
    });

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated',
      doctor: updatedDoctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private (Admin)
export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    await Doctor.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(doctor.user, { isActive: false });

    await logAudit({
      action: 'DELETE',
      entity: 'Doctor',
      entityId: doctor._id,
      req,
      details: { doctorCode: doctor.doctorCode },
    });

    res.status(200).json({ success: true, message: 'Doctor deleted and user account disabled' });
  } catch (error) {
    next(error);
  }
};
