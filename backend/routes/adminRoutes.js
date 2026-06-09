const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUser,
  deleteUser,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes are private and admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/stats', getDashboardStats);
router.get('/users/:id', getUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
