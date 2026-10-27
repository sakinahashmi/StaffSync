const express = require('express');
const router = express.Router();
const {
  getTrainings,
  createTraining,
  updateTraining,
  deleteTraining,
  enrollInTraining,
  getMyEnrollments,
  updateEnrollmentStatus,
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getTrainings);
router.post('/', protect, authorize('hr'), createTraining);
router.put('/:id', protect, authorize('hr'), updateTraining);
router.delete('/:id', protect, authorize('hr'), deleteTraining);
router.post('/:id/enroll', protect, enrollInTraining);
router.get('/my-enrollments', protect, getMyEnrollments);
router.patch('/enrollments/:enrollmentId', protect, updateEnrollmentStatus);

module.exports = router;
