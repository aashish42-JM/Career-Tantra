const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        console.log('📥 Register request body:', req.body); // Log incoming data
        const { 
            name, 
            email, 
            password, 
            degree, 
            semester, 
            interests,
            experience,
            webDev,
            programming,
            dsa,
            database,
            aiMl,
            careerGoals,
            learning,
            time
        } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create user
        const userData = {
            name,
            email,
            password,
            degree,
            semester,
            interests: interests ? interests.split(',').map(i => i.trim()) : [], // Handle comma-separated interests
            // NEW FIELDS
            experienceLevel: experience,
            skillLevels: {
                webDevelopment: webDev,
                programming: programming,
                dataStructures: dsa,
                database: database,
                aiMl: aiMl
            },
            careerGoals: careerGoals ? careerGoals.split(',').map(g => g.trim()) : [],
            preferredLearning: learning,
            timeAvailable: time
        };
        console.log('📤 Creating user with data:', userData);

        const user = await User.create(userData);

        // Return success response with token
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                password: user.password, // Temporarily include password
                degree: user.degree,
                semester: user.semester,
                interests: user.interests,
                experienceLevel: user.experienceLevel,
                skillLevels: user.skillLevels,
                careerGoals: user.careerGoals,
                preferredLearning: user.preferredLearning,
                timeAvailable: user.timeAvailable,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        next(error);
    }
};

// @desc    Login user or admin
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    console.log('LOGIN REQUEST:', req.body);
    const { email, username, password } = req.body;
    const loginInput = email || username;
    console.log('LOGIN INPUT:', loginInput, 'PASSWORD:', password);

    // Check if (email or username) and password are provided
    if (!loginInput || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password'
      });
    }

    // First check if it's the admin (loginadmin or loginadmin@careertantra.com)
    if (loginInput === 'loginadmin' || loginInput === 'loginadmin@careertantra.com') {
      console.log('ADMIN LOGIN ATTEMPT');
      // Find or create the admin
      let admin = await Admin.findOne({ email: 'loginadmin@careertantra.com' }).select('+password');
      console.log('FOUND ADMIN:', admin);
      
      if (!admin) {
        console.log('CREATING NEW ADMIN');
        // Create admin if not exists (just in case)
        admin = await Admin.create({
          name: 'Super Admin',
          email: 'loginadmin@careertantra.com',
          password: 'adminlogin',
          role: 'admin'
        });
        console.log('CREATED ADMIN:', admin);
      }

      // Check if password matches
      const isMatch = await admin.matchPassword(password);
      console.log('PASSWORD MATCH:', isMatch);
      
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Return admin login response - EXPLICITLY SET role: 'admin' to be safe!
      return res.status(200).json({
        success: true,
        message: 'Admin login successful',
        token: generateToken(admin._id),
        user: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: 'admin' // EXPLICITLY set to 'admin'!
        }
      });
    }

    // Then check for regular user using either email or username
    let user;
    if (email) {
      user = await User.findOne({ email }).select('+password');
    } else if (username) {
      user = await User.findOne({ username }).select('+password');
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Return success response with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        degree: user.degree,
        semester: user.semester,
        interests: user.interests,
        profilePicture: user.profilePicture,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login admin
// @route   POST /api/auth/admin/login
// @access  Public
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for admin
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token: generateToken(admin._id),
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id) || await Admin.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
