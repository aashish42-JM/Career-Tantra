const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadProfilePicture,
  upload
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes are private
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/profile-picture', protect, upload.single('profilePicture'), uploadProfilePicture);

module.exports = router;
