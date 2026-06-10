
const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roadmap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    required: true,
  },
  completedSteps: [{
    stepId: mongoose.Schema.Types.ObjectId,
    completedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  currentStep: Number,
  xpEarned: {
    type: Number,
    default: 0,
  },
  streak: {
    type: Number,
    default: 0,
  },
  lastActive: Date,
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: Date,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UserProgress', userProgressSchema);
