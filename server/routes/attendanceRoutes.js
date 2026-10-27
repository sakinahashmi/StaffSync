const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayStatus,
  getMyAttendance,
  getAllAttendance,
  manualAttendanceEntry,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/today', protect, getTodayStatus);
router.get('/my-history', protect, getMyAttendance);
router.get('/', protect, authorize('hr', 'manager'), getAllAttendance);
router.post('/manual', protect, authorize('hr'), manualAttendanceEntry);

module.exports = router;
