
const mongoose = require('mongoose');

const userOpportunityProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    opportunity: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity', required: true },
    isSaved: { type: Boolean, default: false },
    savedAt: { type: Date },
    appliedAt: { type: Date },
    status: {
        type: String,
        enum: ['saved', 'applied', 'interview', 'offer', 'rejected'],
        default: 'saved'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserOpportunityProgress', userOpportunityProgressSchema);
