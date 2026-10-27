const Leave = require('../models/Leave');

// Helper to calculate working days between two dates
const calculateDays = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = e.getTime() - s.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
};

// @desc    Apply for a leave
// @route   POST /api/leaves
// @access  Private (Employee, Manager, HR)
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Leave type, start date, end date, and reason are required',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided',
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Leave start date cannot be after end date',
      });
    }

    const daysCount = calculateDays(start, end);

    const leave = await Leave.create({
      user: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason,
      status: 'Pending',
    });

    const populated = await Leave.findById(leave._id).populate(
      'user',
      'name email department position'
    );

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's leaves
// @route   GET /api/leaves/my-leaves
// @access  Private
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user._id })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    const totalLeaves = leaves.length;
    const pendingCount = leaves.filter((l) => l.status === 'Pending').length;
    const approvedCount = leaves.filter((l) => l.status === 'Approved').length;
    const rejectedCount = leaves.filter((l) => l.status === 'Rejected').length;

    res.json({
      success: true,
      stats: {
        totalLeaves,
        pendingCount,
        approvedCount,
        rejectedCount,
      },
      leaves,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all leave requests (HR and Managers)
// @route   GET /api/leaves
// @access  Private (HR & Manager)
const getAllLeaves = async (req, res) => {
  try {
    const { status, leaveType } = req.query;

    const query = {};
    if (status && status !== 'All') {
      query.status = status;
    }
    if (leaveType && leaveType !== 'All') {
      query.leaveType = leaveType;
    }

    const leaves = await Leave.find(query)
      .populate('user', 'name email department position avatar')
      .populate('reviewedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Review (Approve or Reject) leave request
// @route   PATCH /api/leaves/:id/review
// @access  Private (HR & Manager only)
const reviewLeave = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected',
      });
    }

    const leave = await Leave.findById(req.params.id).populate('user', 'name email');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    leave.reviewNotes = reviewNotes || `Decision marked as ${status} by ${req.user.name}`;

    await leave.save();

    const populated = await Leave.findById(leave._id)
      .populate('user', 'name email department position')
      .populate('reviewedBy', 'name email role');

    res.json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}`,
      leave: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel pending leave request by employee
// @route   DELETE /api/leaves/:id
// @access  Private
const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Only owner or HR can delete
    if (
      leave.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'hr'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this leave request',
      });
    }

    if (leave.status !== 'Pending' && req.user.role !== 'hr') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leave requests can be cancelled',
      });
    }

    await leave.deleteOne();

    res.json({
      success: true,
      message: 'Leave request cancelled successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
};
