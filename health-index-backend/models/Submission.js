// health-index-backend/models/Submission.js
const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    // --- Contact and Business Info ---
    name: { type: String, required: true },
    companyName: { type: String, required: true },
    address: { type: String },
    phoneNumber: { type: String },
    email: { type: String, required: true },
    website: { type: String },
    businessType: { type: String, required: true },
    businessCategories: [{ type: String }],
    
    // --- Performance Metrics (1-10 Scores) ---
    qualityIndex: { type: Number, min: 1, max: 10, required: true },
    costEfficiency: { type: Number, min: 1, max: 10, required: true },
    deliveryTimeliness: { type: Number, min: 1, max: 10, required: true },
    customerSatisfaction: { type: Number, min: 1, max: 10, required: true },
    processStability: { type: Number, min: 1, max: 10, required: true },
    employeeHealth: { type: Number, min: 1, max: 10, required: true },

    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', SubmissionSchema);