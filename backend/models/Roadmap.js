
const mongoose = require('mongoose');

const roadmapStepSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  unlockOrder: {
    type: Number,
    required: true,
  },
  xpPoints: {
    type: Number,
    default: 10,
  },
  resources: [{
    title: String,
    url: String,
    type: String, // 'video', 'article', 'course', 'documentation'
  }],
  projects: [{
    title: String,
    description: String,
    difficulty: String,
  }],
});

const roadmapSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: [
      'Full Stack Development',
      'AI/ML',
      'Cybersecurity',
      'UI/UX',
      'Data Science',
      'App Development'
    ],
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Beginner',
  },
  estimatedDuration: {
    type: String, // e.g., '2 weeks', '3 months'
    required: true,
  },
  steps: [roadmapStepSchema],
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Roadmap', roadmapSchema);
