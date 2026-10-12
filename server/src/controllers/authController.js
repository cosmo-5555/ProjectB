import User from '../models/User.js';
import { sendTokenResponse } from '../utils/token.js';
import { logAudit } from '../middleware/audit.js';

// @desc    Register a new user (Staff or Admin)
// @route   POST /api/auth/register
// @access  Public (or Admin only in prod)
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone,
    });

    await logAudit({
      action: 'CREATE',
      entity: 'User',
      entityId: user._id,
      req,
      details: { email: user.email, role: user.role },
      performedBy: user._id,
      userName: user.name,
      userRole: user.role,
    });

    sendTokenResponse(user, 201, res, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token with cookie
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
    }

    user.lastLogin = new Date();
    await user.save();

    await logAudit({
      action: 'LOGIN',
      entity: 'Auth',
      entityId: user._id,
      req,
      details: { email: user.email },
      performedBy: user._id,
      userName: user.name,
      userRole: user.role,
    });

    sendTokenResponse(user, 200, res, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  if (req.user) {
    await logAudit({
      action: 'LOGOUT',
      entity: 'Auth',
      entityId: req.user._id,
      req,
      details: { email: req.user.email },
    });
  }

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: 'User logged out successfully' });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, user, message: 'Profile updated' });
  } catch (error) {
    next(error);
  }
};
