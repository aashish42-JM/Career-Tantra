
const mongoose = require('mongoose');

// Define Roadmap Step Schema
const roadmapStepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  unlockOrder: { // stepNumber
    type: Number,
    required: true,
  },
  xpPoints: {
    type: Number,
    default: 10,
  },
  estimatedTime: {
    type: String,
    default: '1 day',
  },
  resources: [{
    title: String,
    url: String,
    type: String, // 'youtube', 'article', 'course', 'documentation', 'practice'
  }],
  youtubeLinks: [{
    title: String,
    url: String,
  }],
  articleLinks: [{
    title: String,
    url: String,
  }],
  projects: [{
    title: String,
    description: String,
    difficulty: String,
    isMilestone: { type: Boolean, default: false },
  }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: Number,
  }],
  prerequisiteSteps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RoadmapStep' }],
  unlockCondition: {
    type: String,
    default: 'previous_step_completed',
  },
});

const roadmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'Full Stack Development',
      'Frontend Development',
      'Backend Development',
      'AI/ML',
      'Cybersecurity',
      'Data Science',
      'UI/UX Design',
      'Mobile App Development',
      'DevOps',
      'Freelancing & Career Prep',
    ],
    required: true,
  },
  difficultyLevel: { // renamed to match requirements
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner',
  },
  estimatedDuration: {
    type: String, // e.g., '2 weeks', '3 months'
    required: true,
  },
  icon: {
    type: String,
    default: 'fa-route',
  },
  thumbnail: {
    type: String,
  },
  tags: [String],
  careerPath: {
    type: String,
  },
  createdBy: {
    type: String,
    default: 'System',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  steps: [roadmapStepSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
