const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  updateProfile,
  changePassword,
  getDemoCredentials,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/demo-credentials', getDemoCredentials);

module.exports = router;
