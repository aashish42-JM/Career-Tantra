
const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: { // renamed to match requirements
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  roadmapId: { // renamed to match requirements
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
  currentStep: {
    type: Number,
    default: 1,
  },
  xpEarned: {
    type: Number,
    default: 0,
  },
  completionPercentage: {
    type: Number,
    default: 0,
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: Date,
  }],
  streak: {
    type: Number,
    default: 0,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UserProgress', userProgressSchema);
