const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const User = require('./models/User');
const Admin = require('./models/Admin');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Body parser middleware
app.use(express.json());

// Enable CORS
app.use(cors());

// Helmet security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', chatRoutes);

// Error handling middleware (must be after all routes)
app.use(errorHandler);

// Create default regular user if not exists
const createDefaultUser = async () => {
  try {
    const defaultUserExists = await User.findOne({ username: 'admin' });
    if (!defaultUserExists) {
      await User.create({
        name: 'Default Admin',
        username: 'admin',
        email: 'admin@careertantra.com',
        password: 'admin', // Will be hashed automatically by model
        degree: 'BSc CSIT',
        semester: '8th',
        interests: ['Web Development', 'AI'],
        role: 'admin'
      });
      console.log('✅ Default user created!');
      console.log('Username: admin');
      console.log('Password: admin');
    }
  } catch (error) {
    console.error('❌ Error creating default user:', error);
  }
};

// Create default admin account if not exists (id=loginadmin, pwd=adminlogin)
const createDefaultAdmin = async () => {
  try {
    const defaultAdminExists = await Admin.findOne({ email: 'loginadmin@careertantra.com' });
    if (!defaultAdminExists) {
      await Admin.create({
        name: 'Super Admin',
        email: 'loginadmin@careertantra.com',
        password: 'adminlogin', // Will be hashed automatically by model
        role: 'admin'
      });
      console.log('✅ Default Admin created!');
      console.log('Admin ID/Email: loginadmin@careertantra.com');
      console.log('Admin Password: adminlogin');
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error);
  }
};

// Connect to database and create default user, then start server
const startServer = async () => {
  await connectDB();
  await createDefaultUser();
  await createDefaultAdmin();

  // Start server
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
  });
};

startServer();

module.exports = app;
