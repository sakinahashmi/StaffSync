const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getEmployees);
router.get('/:id', protect, getEmployeeById);
router.post('/', protect, authorize('hr'), createEmployee);
router.put('/:id', protect, authorize('hr'), updateEmployee);
router.patch('/:id/toggle-status', protect, authorize('hr'), toggleEmployeeStatus);

module.exports = router;
