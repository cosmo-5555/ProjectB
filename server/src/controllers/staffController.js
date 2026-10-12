import Staff from '../models/Staff.js';
import User from '../models/User.js';
import { logAudit } from '../middleware/audit.js';

// @desc    Get all staff
// @route   GET /api/staff
// @access  Private (Admin)
export const getStaff = async (req, res, next) => {
  try {
    const { department, shift, search, page = 1, limit = 15 } = req.query;

    const query = {};
    if (department) query.department = department;
    if (shift) query.shift = shift;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Staff.countDocuments(query);
    const staffList = await Staff.find(query)
      .populate('user', 'name email role phone avatar isActive lastLogin')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    let filtered = staffList;
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = staffList.filter(
        (st) =>
          st.user?.name?.toLowerCase().includes(searchLower) ||
          st.employeeId?.toLowerCase().includes(searchLower) ||
          st.designation?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({
      success: true,
      total,
      count: filtered.length,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      staff: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new staff member
// @route   POST /api/staff
// @access  Private (Admin)
export const createStaff = async (req, res, next) => {
  try {
    const { name, email, password = 'Staff@123', role = 'receptionist', phone, department, designation, qualification, salary, shift, emergencyContact } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    user = await User.create({
      name,
      email,
      password,
      role,
      phone,
    });

    const count = await Staff.countDocuments();
    const employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;

    const staff = await Staff.create({
      user: user._id,
      employeeId,
      department,
      designation,
      qualification,
      salary: salary || 0,
      shift: shift || 'Morning',
      emergencyContact,
    });

    await logAudit({
      action: 'CREATE',
      entity: 'Staff',
      entityId: staff._id,
      req,
      details: { employeeId, name, role, department },
    });

    const populated = await Staff.findById(staff._id).populate('user', 'name email role phone isActive');

    res.status(201).json({
      success: true,
      message: 'Staff member registered successfully',
      staff: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff
// @route   PUT /api/staff/:id
// @access  Private (Admin)
export const updateStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const { department, designation, qualification, salary, shift, emergencyContact, name, phone, role, isActive } = req.body;

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      { department, designation, qualification, salary, shift, emergencyContact },
      { new: true, runValidators: true }
    ).populate('user', 'name email role phone isActive');

    if (name || phone || role || isActive !== undefined) {
      await User.findByIdAndUpdate(staff.user, {
        name: name || undefined,
        phone: phone || undefined,
        role: role || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      });
    }

    await logAudit({
      action: 'UPDATE',
      entity: 'Staff',
      entityId: staff._id,
      req,
      details: { employeeId: staff.employeeId },
    });

    res.status(200).json({
      success: true,
      message: 'Staff profile updated successfully',
      staff: updatedStaff,
    });
  } catch (error) {
    next(error);
  }
};
