
const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String },
  topics: [{ 
    name: { type: String, required: true },
    xp: { type: Number, default: 10 },
    description: { type: String }
  }],
  levelThresholds: {
    Beginner: { type: Number, default: 0 },
    Intermediate: { type: Number, default: 100 },
    Advanced: { type: Number, default: 300 },
    Expert: { type: Number, default: 600 }
  },
  icon: { type: String },
  color: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Skill', skillSchema);
