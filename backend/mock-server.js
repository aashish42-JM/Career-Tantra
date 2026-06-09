const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'mock_jwt_secret_for_testing';

// In-memory user storage
let users = [];

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, degree, semester, interests } = req.body;

        // Check if user exists
        const userExists = users.find(u => u.email === email);
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            degree,
            semester,
            interests: typeof interests === 'string' ? interests.split(',') : interests,
            profilePicture: '',
            role: 'user',
            createdAt: new Date()
        };

        users.push(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: generateToken(user.id),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                degree: user.degree,
                semester: user.semester,
                interests: user.interests,
                profilePicture: user.profilePicture,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        res.json({
            success: true,
            message: 'Login successful',
            token: generateToken(user.id),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                degree: user.degree,
                semester: user.semester,
                interests: user.interests,
                profilePicture: user.profilePicture,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Mock server running on port ${PORT}`);
    console.log('(In-memory storage - data resets on restart)');
});
