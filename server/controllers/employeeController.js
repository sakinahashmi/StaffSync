const User = require('../models/User');

// @desc    Get all employees with search and filters
// @route   GET /api/employees
// @access  Private (All authenticated users can see the team directory, HR/Manager can see sensitive details like salary)
const getEmployees = async (req, res) => {
  try {
    const { search, department, role, status } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (role && role !== 'All') {
      query.role = role.toLowerCase();
    }

    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    // HR and Managers can see all fields; regular employees see public profile fields
    const isHrOrManager = req.user.role === 'hr' || req.user.role === 'manager';
    const projection = isHrOrManager ? '' : '-salary';

    const employees = await User.find(query)
      .select(projection)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const isHrOrManager = req.user.role === 'hr' || req.user.role === 'manager';
    const isSelf = req.user._id.toString() === req.params.id;

    const projection = isHrOrManager || isSelf ? '' : '-salary';

    const employee = await User.findById(req.params.id).select(projection);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new employee record
// @route   POST /api/employees
// @access  Private (HR Admin only)
const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      position,
      phone,
      salary,
      address,
      skills,
    } = req.body;

    if (!name || !email || !department || !position) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, department, and position are required fields',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email address already exists',
      });
    }

    const employee = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'Password123!',
      role: role || 'employee',
      department,
      position,
      phone: phone || '+1 (555) 000-0000',
      salary: salary || 60000,
      address: address || '123 Corporate Blvd, Suite 400',
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim())
        : ['Communication', 'Teamwork'],
      status: 'active',
      joinDate: new Date(),
    });

    const userResponse = employee.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee: userResponse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update employee record
// @route   PUT /api/employees/:id
// @access  Private (HR Admin only)
const updateEmployee = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const {
      name,
      department,
      position,
      role,
      phone,
      salary,
      status,
      address,
      skills,
    } = req.body;

    if (name !== undefined) employee.name = name;
    if (department !== undefined) employee.department = department;
    if (position !== undefined) employee.position = position;
    if (role !== undefined) employee.role = role.toLowerCase();
    if (phone !== undefined) employee.phone = phone;
    if (salary !== undefined) employee.salary = Number(salary);
    if (status !== undefined) employee.status = status.toLowerCase();
    if (address !== undefined) employee.address = address;
    if (skills !== undefined) {
      employee.skills = Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim())
        : employee.skills;
    }

    const updatedEmployee = await employee.save();
    const result = updatedEmployee.toObject();
    delete result.password;

    res.json({
      success: true,
      message: 'Employee updated successfully',
      employee: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle employee active/inactive status (Deactivate/Reactivate)
// @route   PATCH /api/employees/:id/toggle-status
// @access  Private (HR Admin only)
const toggleEmployeeStatus = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Prevent HR from deactivating themselves
    if (employee._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account',
      });
    }

    employee.status = employee.status === 'active' ? 'inactive' : 'active';
    await employee.save();

    res.json({
      success: true,
      message: `Employee successfully ${employee.status === 'active' ? 'reactivated' : 'deactivated'}`,
      status: employee.status,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
};
