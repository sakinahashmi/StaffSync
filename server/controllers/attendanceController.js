const Attendance = require('../models/Attendance');

// Helper to get local YYYY-MM-DD string
const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Check-in for today
// @route   POST /api/attendance/check-in
// @access  Private
const checkIn = async (req, res) => {
  try {
    const today = getTodayDateString();
    const userId = req.user._id;

    let existing = await Attendance.findOne({ user: userId, date: today });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in for today',
        attendance: existing,
      });
    }

    const { location, notes } = req.body;
    const now = new Date();

    // Determine if late (after 09:30 AM)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const isLate = hours > 9 || (hours === 9 && minutes > 30);

    const record = await Attendance.create({
      user: userId,
      date: today,
      checkIn: now,
      status: isLate ? 'Late' : 'Present',
      location: location || 'Office (HQ)',
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      message: isLate ? 'Checked in successfully (marked Late)' : 'Checked in successfully',
      attendance: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check-out for today
// @route   POST /api/attendance/check-out
// @access  Private
const checkOut = async (req, res) => {
  try {
    const today = getTodayDateString();
    const userId = req.user._id;

    const record = await Attendance.findOne({ user: userId, date: today });
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today. You must check in first.',
      });
    }

    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out for today',
        attendance: record,
      });
    }

    const now = new Date();
    record.checkOut = now;

    // Calculate working hours in decimal format
    const diffMs = now.getTime() - new Date(record.checkIn).getTime();
    const hours = Math.max(0, diffMs / (1000 * 60 * 60));
    record.workingHours = Number(hours.toFixed(2));

    // If worked less than 4 hours, mark Half Day unless previously marked Late
    if (record.workingHours < 4 && record.status === 'Present') {
      record.status = 'Half Day';
    }

    await record.save();

    res.json({
      success: true,
      message: `Checked out successfully. Logged ${record.workingHours} working hours.`,
      attendance: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's today status
// @route   GET /api/attendance/today
// @access  Private
const getTodayStatus = async (req, res) => {
  try {
    const today = getTodayDateString();
    const record = await Attendance.findOne({ user: req.user._id, date: today });

    res.json({
      success: true,
      today,
      checkedIn: !!record,
      checkedOut: !!(record && record.checkOut),
      attendance: record || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's personal attendance history
// @route   GET /api/attendance/my-history
// @access  Private
const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(60);

    const totalDays = records.length;
    const presentDays = records.filter(
      (r) => r.status === 'Present' || r.status === 'Late'
    ).length;
    const totalHours = records.reduce((acc, r) => acc + (r.workingHours || 0), 0);

    res.json({
      success: true,
      stats: {
        totalDays,
        presentDays,
        attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100,
        averageHours: totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0,
      },
      records,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all attendance records (HR / Manager)
// @route   GET /api/attendance
// @access  Private (HR & Manager)
const getAllAttendance = async (req, res) => {
  try {
    const { date, department, status } = req.query;

    const query = {};
    if (date) {
      query.date = date;
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    const records = await Attendance.find(query)
      .populate('user', 'name email department position avatar')
      .sort({ date: -1, checkIn: -1 });

    // Filter by department if requested
    let filtered = records;
    if (department && department !== 'All') {
      filtered = records.filter(
        (r) => r.user && r.user.department === department
      );
    }

    res.json({
      success: true,
      count: filtered.length,
      records: filtered,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Manual attendance creation or adjustment by HR
// @route   POST /api/attendance/manual
// @access  Private (HR Admin only)
const manualAttendanceEntry = async (req, res) => {
  try {
    const { userId, date, checkIn, checkOut, status, notes, location } = req.body;

    if (!userId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Employee and date are required',
      });
    }

    const inTime = checkIn ? new Date(`${date}T${checkIn}`) : new Date(`${date}T09:00:00`);
    const outTime = checkOut ? new Date(`${date}T${checkOut}`) : null;

    let workingHours = 0;
    if (outTime) {
      const diffMs = outTime.getTime() - inTime.getTime();
      workingHours = Number(Math.max(0, diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    const record = await Attendance.findOneAndUpdate(
      { user: userId, date },
      {
        user: userId,
        date,
        checkIn: inTime,
        checkOut: outTime,
        workingHours,
        status: status || 'Present',
        notes: notes || 'Admin entry',
        location: location || 'Office (HQ)',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('user', 'name email department');

    res.json({
      success: true,
      message: 'Attendance record saved successfully',
      attendance: record,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendance,
  getAllAttendance,
  manualAttendanceEntry,
};
