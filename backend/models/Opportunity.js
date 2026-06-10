
const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: {
        type: String,
        enum: ['internship', 'hackathon', 'scholarship', 'workshop', 'tech-event', 'competition'],
        required: true
    },
    deadline: { type: Date, required: true },
    description: { type: String, required: true },
    applicationLink: { type: String, required: true },
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
