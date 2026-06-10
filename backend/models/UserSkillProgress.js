
const mongoose = require('mongoose');

const userSkillProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  skillName: { type: String, required: true },
  xp: { type: Number, default: 0 },
  level: { type: String, default: 'Beginner', enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
  completedTopics: [{ 
    topicId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now }
  }],
  lastUpdated: { type: Date, default: Date.now },
  learningStreak: { type: Number, default: 0 },
  lastPracticed: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserSkillProgress', userSkillProgressSchema);
