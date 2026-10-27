const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Training = require('../models/Training');
const TrainingEnrollment = require('../models/TrainingEnrollment');
const Announcement = require('../models/Announcement');

// Helper to format date YYYY-MM-DD
const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// @desc    Get consolidated HR / Executive Dashboard statistics & charts
// @route   GET /api/dashboard/summary
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const today = formatDate(new Date());

    // 1. Employee stats
    const totalEmployees = await User.countDocuments({ status: 'active' });
    const inactiveEmployees = await User.countDocuments({ status: 'inactive' });

    // 2. Today's Attendance stats
    const todayAttendance = await Attendance.find({ date: today });
    const presentToday = todayAttendance.filter(
      (a) => a.status === 'Present' || a.status === 'Late'
    ).length;
    const lateToday = todayAttendance.filter((a) => a.status === 'Late').length;
    const halfDayToday = todayAttendance.filter((a) => a.status === 'Half Day').length;

    // Attendance rate
    const attendanceRate =
      totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

    // 3. Pending leave requests
    const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

    // 4. Training statistics
    const totalTrainings = await Training.countDocuments();
    const activeTrainings = await Training.countDocuments({
      status: { $in: ['Upcoming', 'Ongoing'] },
    });
    const totalEnrollments = await TrainingEnrollment.countDocuments();
    const completedTrainings = await TrainingEnrollment.countDocuments({
      status: 'Completed',
    });

    // 5. Weekly Attendance Trend (Last 7 days for Recharts)
    const weeklyChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayRecords = await Attendance.find({ date: dateStr });
      const present = dayRecords.filter(
        (a) => a.status === 'Present' || a.status === 'Late'
      ).length;
      const late = dayRecords.filter((a) => a.status === 'Late').length;
      const absent = Math.max(0, totalEmployees - present);

      weeklyChartData.push({
        date: dateStr,
        day: dayName,
        present,
        late,
        absent,
      });
    }

    // 6. Department Distribution
    const departmentAggregation = await User.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const departmentStats = departmentAggregation.map((dept) => ({
      name: dept._id || 'Unassigned',
      value: dept.count,
    }));

    // 7. Recent Leave Requests (Last 5)
    const recentLeaves = await Leave.find()
      .populate('user', 'name email department position avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // 8. Latest Announcements
    const recentAnnouncements = await Announcement.find({ isPublished: true })
      .populate('createdBy', 'name position')
      .sort({ pinned: -1, createdAt: -1 })
      .limit(4);

    // 9. If user is a regular employee, also attach their personal snapshot
    let mySnapshot = null;
    if (req.user.role === 'employee') {
      const todayRecord = await Attendance.findOne({
        user: req.user._id,
        date: today,
      });
      const myPendingLeaves = await Leave.countDocuments({
        user: req.user._id,
        status: 'Pending',
      });
      const myTrainings = await TrainingEnrollment.countDocuments({
        user: req.user._id,
      });

      mySnapshot = {
        checkedIn: !!todayRecord,
        checkedOut: !!(todayRecord && todayRecord.checkOut),
        workingHours: todayRecord ? todayRecord.workingHours : 0,
        pendingLeaves: myPendingLeaves,
        enrolledTrainings: myTrainings,
      };
    }

    res.json({
      success: true,
      stats: {
        totalEmployees,
        inactiveEmployees,
        presentToday,
        lateToday,
        halfDayToday,
        attendanceRate,
        pendingLeaves,
        totalTrainings,
        activeTrainings,
        totalEnrollments,
        completedTrainings,
      },
      weeklyChartData,
      departmentStats,
      recentLeaves,
      recentAnnouncements,
      mySnapshot,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardSummary };
