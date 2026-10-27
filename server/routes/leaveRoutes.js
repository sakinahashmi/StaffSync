const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, applyLeave);
router.get('/my-leaves', protect, getMyLeaves);
router.get('/', protect, authorize('hr', 'manager'), getAllLeaves);
router.patch('/:id/review', protect, authorize('hr', 'manager'), reviewLeave);
router.delete('/:id', protect, cancelLeave);

module.exports = router;
