const User = require('../models/User');
const Admin = require('../models/Admin');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin Only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    // Search query
    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    };

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      totalUsers,
      page,
      totalPages: Math.ceil(totalUsers / limit),
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin Only)
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin Only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin Only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const today = new Date();
    const lastWeek = new Date(today - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(today - 30 * 24 * 60 * 60 * 1000);

    const recentUsers = await User.find({ createdAt: { $gte: lastWeek } })
      .sort({ createdAt: -1 })
      .limit(10);

    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: lastMonth }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        lastMonthUsers,
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};
