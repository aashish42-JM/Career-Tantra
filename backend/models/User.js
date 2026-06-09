const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  username: {
    type: String,
    unique: true,
    sparse: true // Optional but unique if provided
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 3,
    select: true // Temporarily show password in API responses
  },
  degree: {
    type: String,
    required: [true, 'Please add your degree']
  },
  semester: {
    type: String,
    required: [true, 'Please add your semester']
  },
  interests: {
    type: [String],
    required: [true, 'Please add your interests']
  },
  profilePicture: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // NEW: TECH SKILLS & PREFERENCES
  skillLevels: {
    webDevelopment: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    },
    programming: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    },
    dataStructures: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    },
    database: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    },
    aiMl: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Beginner'
    }
  },
  experienceLevel: {
    type: String,
    enum: ['Just Starting', 'Learning Basics', 'Building Projects', 'Job Ready'],
    default: 'Just Starting'
  },
  careerGoals: {
    type: [String],
    default: []
  },
  preferredLearning: {
    type: String,
    enum: ['Video Tutorials', 'Reading Docs', 'Hands-on Projects', 'Live Classes', 'All of the Above'],
    default: 'Hands-on Projects'
  },
  timeAvailable: {
    type: String,
    enum: ['Less than 5 hours/week', '5-10 hours/week', '10-20 hours/week', 'More than 20 hours/week'],
    default: '5-10 hours/week'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if modified or new
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
