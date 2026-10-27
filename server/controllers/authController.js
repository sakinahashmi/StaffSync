const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to sign JWT token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'staffsync_secret_jwt_key_2026_modern_hrms',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Check for user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently inactive. Please contact HR.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.role);

    // Return user object without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      phone: user.phone,
      joinDate: user.joinDate,
      avatar: user.avatar,
      status: user.status,
    };

    res.json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Allowed fields for self-update
    const { phone, address, emergencyContact, skills, avatar } = req.body;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
    if (skills !== undefined) user.skills = skills;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pre-configured demo account hints for college project presentation
// @route   GET /api/auth/demo-credentials
// @access  Public
const getDemoCredentials = async (req, res) => {
  res.json({
    success: true,
    demoAccounts: [
      {
        role: 'HR Admin',
        email: 'admin@staffsync.com',
        description: 'Full administrative access: employee records, approvals, announcements, training, dashboards',
      },
      {
        role: 'Manager',
        email: 'manager@staffsync.com',
        description: 'Team management: review team leaves, attendance monitoring, announcements',
      },
      {
        role: 'Employee',
        email: 'employee@staffsync.com',
        description: 'Employee portal: check in/out, apply for leave, enroll in training, view announcements',
      },
    ],
    defaultPasswordNotice: 'Default password configured in seed: Password123!',
  });
};

module.exports = {
  login,
  getMe,
  updateProfile,
  changePassword,
  getDemoCredentials,
};
