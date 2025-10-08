// health-index-backend/server.js - FINAL INTEGRATED BACKEND CODE

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dns = require('dns');
require('dotenv').config();

// Force public DNS to reduce SRV lookup failures
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    console.log('Using DNS servers:', dns.getServers());
} catch (e) {
    console.warn('Failed to set DNS servers:', e && e.message ? e.message : e);
}

// --- Configuration and Initialization ---
const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_secret_key'; 

// Middleware
app.use(cors()); 
app.use(express.json()); 

// --- Database Connection ---
const buildMongoUri = () => {
    if (process.env.MONGO_URI) return process.env.MONGO_URI;
    if (process.env.MONGO_USER && process.env.MONGO_PASS) {
        const user = process.env.MONGO_USER;
        const pass = encodeURIComponent(process.env.MONGO_PASS);
        const host = process.env.MONGO_HOST || 'cluster0.fam36iz.mongodb.net';
        const db = process.env.MONGO_DB || '';
        return `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority`;
    }
    return null;
};

const mongoUri = buildMongoUri();
if (!mongoUri) {
    console.warn('No MongoDB URI found in env; skipping connection. Set MONGO_URI or MONGO_USER/MONGO_PASS.');
} else {
    mongoose.connect(mongoUri)
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('MongoDB connection error:', err && err.message ? err.message : err));
}

// --- Mongoose Model ---
const Submission = require('./models/Submission'); 

// --- 1. AUTHENTICATION MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET); 
        req.user = decoded.user;
        next(); 
    } catch (e) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};


// ---------------------------------
// --- 2. ROUTES (API Endpoints) ---
// ---------------------------------

// @route   POST /api/login (Public)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Hardcoded admin check
    if (username === 'admin' && password === 'securepassword123') {
        const payload = { user: { id: 'admin_id', username: 'admin' } };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } else {
        res.status(401).json({ msg: 'Invalid Credentials' });
    }
});


// @route   POST /api/submit (Public)
app.post('/api/submit', async (req, res) => {
    try {
        const newSubmission = new Submission(req.body);
        await newSubmission.save();
        res.status(201).json({ message: 'Submission successful' });
    } catch (err) {
        console.error('Submission Error:', err.message);
        res.status(400).json({ error: 'Failed to save submission. Check required fields.' });
    }
});


// @route   GET /api/submissions (PROTECTED - Read)
app.get('/api/submissions', authMiddleware, async (req, res) => {
    try {
        const submissions = await Submission.find().sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (err) {
        console.error('Fetch Submissions Error:', err.message);
        res.status(500).json({ error: 'Server error fetching submissions.' });
    }
});


// @route   PUT /api/submissions/:id (PROTECTED - Update)
app.put('/api/submissions/:id', authMiddleware, async (req, res) => {
    try {
        // Load the existing document, apply allowed updates, then save to ensure validators run
        const submission = await Submission.findById(req.params.id);
        if (!submission) return res.status(404).json({ msg: 'Submission not found' });

        // Copy fields from req.body onto the document (only existing schema keys will be saved)
        Object.keys(req.body).forEach(key => {
            submission[key] = req.body[key];
        });

        const saved = await submission.save();
        res.json(saved);
    } catch (err) {
        console.error('Update Submission Error:', err);
        if (err && err.stack) console.error(err.stack);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message, details: err.message });
        }
        // include message temporarily for debugging
        return res.status(500).json({ error: 'Server error updating submission.', details: err.message });
    }
});


// @route   DELETE /api/submissions/:id (PROTECTED - Delete)
app.delete('/api/submissions/:id', authMiddleware, async (req, res) => {
    try {
        const submission = await Submission.findByIdAndDelete(req.params.id);
        if (!submission) {
            return res.status(404).json({ msg: 'Submission not found' });
        }
        res.json({ msg: 'Submission deleted successfully' });
    } catch (err) {
        console.error('Delete Submission Error:', err);
        if (err && err.stack) console.error(err.stack);
        // include message temporarily for debugging
        res.status(500).json({ error: 'Server error deleting submission.', details: err.message });
    }
});


// --- Server Listener ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));