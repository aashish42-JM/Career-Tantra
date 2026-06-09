const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

// Load environment variables
dotenv.config({ path: '../.env' });

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Seed admin user
const seedAdmin = async () => {
  await connectDB();

  try {
    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: 'admin@careertantra.com' });
    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create admin
    const admin = await Admin.create({
      name: 'Admin',
      email: 'admin@careertantra.com',
      password: 'Admin123456' // Change this immediately in production!
    });

    console.log('Admin user created successfully!');
    console.log('Email: admin@careertantra.com');
    console.log('Password: Admin123456');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
