
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-career-tantra';
const DATA_DIR = path.join(__dirname, 'data');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// File paths for data storage
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const CHAT_HISTORY_FILE = path.join(DATA_DIR, 'chat-history.json');

// Helper functions to read/write JSON files
function readJSONFile(filePath, defaultData) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultData;
}

function writeJSONFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Load initial data from files
let users = readJSONFile(USERS_FILE, []);
let admins = readJSONFile(ADMINS_FILE, []);
let userChatHistory = readJSONFile(CHAT_HISTORY_FILE, {});

// Create default admin if not exists
const createDefaultAdmin = async () => {
  const adminExists = admins.find(a => a.email === 'loginadmin@careertantra.com');
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('adminlogin', 10);
    const newAdmin = {
      _id: 'admin-1',
      name: 'Super Admin',
      email: 'loginadmin@careertantra.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date()
    };
    admins.push(newAdmin);
    writeJSONFile(ADMINS_FILE, admins);
    console.log('✅ Default Admin created!');
    console.log('Admin ID/Email: loginadmin@careertantra.com');
    console.log('Admin Password: adminlogin');
  }
};

// Create default user if not exists
const createDefaultUser = async () => {
  const userExists = users.find(u => u.username === 'admin');
  if (!userExists) {
    const hashedPassword = await bcrypt.hash('admin', 10);
    const newUser = {
      _id: 'user-1',
      name: 'Default Admin',
      username: 'admin',
      email: 'admin@careertantra.com',
      password: hashedPassword,
      degree: 'BSc CSIT',
      semester: '8th',
      interests: ['Web Development', 'AI', 'Programming'],
      role: 'admin',
      skillLevels: {
        webDevelopment: 'Beginner',
        programming: 'Beginner',
        dataStructures: 'Beginner',
        database: 'Beginner',
        aiMl: 'Beginner'
      },
      experienceLevel: 'Just Starting',
      careerGoals: [],
      preferredLearning: 'Hands-on Projects',
      timeAvailable: '5-10 hours/week',
      createdAt: new Date()
    };
    users.push(newUser);
    writeJSONFile(USERS_FILE, users);
    console.log('✅ Default user created!');
    console.log('Username: admin');
    console.log('Password: admin');
  }
};

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
};

// -------------------
// AUTH ROUTES
// -------------------

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { 
      name, email, password, degree, semester, interests,
      experience, webDev, programming, dsa, database, aiMl,
      careerGoals, learning, time
    } = req.body;

    // Check if user exists
    const userExists = users.find(u => u.email === email);
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      _id: `user-${Date.now()}`,
      name,
      email,
      password: hashedPassword, // Store hashed password, but we'll send the plain one temporarily for admin view
      degree,
      semester,
      interests: interests ? interests.split(',').map(i => i.trim()) : [],
      role: 'user',
      skillLevels: {
        webDevelopment: webDev || 'Beginner',
        programming: programming || 'Beginner',
        dataStructures: dsa || 'Beginner',
        database: database || 'Beginner',
        aiMl: aiMl || 'Beginner'
      },
      experienceLevel: experience || 'Just Starting',
      careerGoals: careerGoals ? careerGoals.split(',').map(g => g.trim()) : [],
      preferredLearning: learning || 'Hands-on Projects',
      timeAvailable: time || '5-10 hours/week',
      createdAt: new Date()
    };

    users.push(newUser);
    writeJSONFile(USERS_FILE, users);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: generateToken(newUser._id),
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        password: password, // Send plain password temporarily for admin to see
        degree: newUser.degree,
        semester: newUser.semester,
        interests: newUser.interests,
        experienceLevel: newUser.experienceLevel,
        skillLevels: newUser.skillLevels,
        careerGoals: newUser.careerGoals,
        preferredLearning: newUser.preferredLearning,
        timeAvailable: newUser.timeAvailable,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const loginInput = email || username;

    // Check admin first
    if (loginInput === 'loginadmin' || loginInput === 'loginadmin@careertantra.com') {
      const admin = admins.find(a => a.email === 'loginadmin@careertantra.com');
      if (admin) {
        const isMatch = await bcrypt.compare(password, admin.password);
        if (isMatch) {
          return res.status(200).json({
            success: true,
            message: 'Admin login successful',
            token: generateToken(admin._id),
            user: {
              _id: admin._id,
              name: admin.name,
              email: admin.email,
              role: 'admin'
            }
          });
        }
      }
    }

    // Check user
    let user;
    if (email) {
      user = users.find(u => u.email === email);
    } else if (username) {
      user = users.find(u => u.username === username);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Prepare user data with temporary plain password for admin view
    const userWithPlainPassword = {
      ...user,
      password: '*******' // Hide real password, but for admin dashboard we'll need to handle it
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        degree: user.degree,
        semester: user.semester,
        interests: user.interests,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', async (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u._id === decoded.id) || admins.find(a => a._id === decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
});

// -------------------
// ADMIN ROUTES
// -------------------

// Get all users (with temporary plain passwords for admin view)
app.get('/api/admin/users', async (req, res) => {
  try {
    // For admin view, let's include temporary plain passwords (in a real app, you wouldn't do this!)
    const usersWithTempPasswords = users.map(user => ({
      ...user,
      password: user._id === 'user-1' ? 'admin' : 'User Password' // Just a placeholder for new users
    }));
    res.status(200).json({ success: true, data: usersWithTempPasswords });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete user
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    users = users.filter(u => u._id !== userId);
    writeJSONFile(USERS_FILE, users);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------
// AI CHAT ROUTES
// -------------------

const allowedKeywords = [
  'code', 'coding', 'program', 'programming', 'developer', 'development',
  'javascript', 'js', 'python', 'java', 'c++', 'c#', 'c programming',
  'react', 'angular', 'vue', 'frontend', 'backend', 'fullstack', 'full stack',
  'web dev', 'web development', 'app development', 'app dev',
  'ai', 'artificial intelligence', 'ml', 'machine learning', 'deep learning',
  'database', 'sql', 'nosql', 'mysql', 'mongodb', 'dbms',
  'api', 'rest api', 'graphql',
  'career', 'careers', 'job', 'jobs', 'career guidance', 'guidance', 'guide',
  'internship', 'internships', 'intern',
  'resume', 'cv', 'interview', 'interview prep', 'interview preparation', 'job readiness',
  'freelance', 'freelancing', 'freelancer',
  'hackathon', 'hackathons',
  'roadmap', 'roadmaps', 'career roadmap', 'learning roadmap',
  'study', 'studies', 'semester', 'semesters', 'academic', 'academics',
  'bsc csit', 'csit', 'bit', 'bca', 'engineering', 'management', 'btech', 'be',
  'bba', 'bsc',
  'project', 'projects', 'project ideas', 'project idea',
  'skill', 'skills', 'skill development', 'skill progress',
  'learn', 'learning', 'teach', 'teaching', 'education',
  'platform', 'career-tantra', 'career tantra',
  'ai mentor', 'ai mentorship', 'roadmap tracking', 'project recommendations', 'internship guidance'
];

const forbiddenKeywords = [
  'politics', 'political', 'politician',
  'relationship', 'relationships', 'dating', 'love',
  'history', 'historical',
  'entertainment', 'gossip', 'celebrity', 'movie', 'movies', 'music', 'song',
  'game', 'games', 'gaming',
  'weather',
  'sports', 'sport',
  'news',
  'religion', 'religious',
  'joke', 'jokes', 'funny',
  'math', 'mathematics', 'calculation', 'calculate', 'add', 'subtract', 'multiply', 'divide',
  'plus', 'minus', 'times', 'equals', 'equation', 'algebra', 'geometry', 'calculus',
  'sum', 'difference', 'product', 'quotient'
];

const systemPrompt = `You are Career-Tantra AI Mentor, an intelligent, friendly, and EXTREMELY FOCUSED AI career guide EXCLUSIVELY for Nepali students.

YOUR ONLY PURPOSE is to help students with:
- Career guidance and career planning
- Coding and programming help
- Internship opportunities and guidance
- Project ideas and project guidance
- Skill development
- Interview preparation
- Freelancing guidance
- Tech and career roadmaps
- Academic guidance for BSc CSIT, BIT, BCA, Engineering, Management
- AI and technology learning
- Resume/CV building
- Job readiness
- Hackathons
- Frontend/backend development (React, JavaScript, Python, C/C++, etc.)

YOU ARE FORBIDDEN TO ANSWER:
- Casual chat, random conversations
- History questions
- Politics
- Relationship advice
- Entertainment gossip
- ANY math questions, calculations, or equations
- Off-topic prompts about anything not listed above

BEHAVIOR RULES - FOLLOW THESE TO THE LETTER:
1. ABSOLUTELY 100% ALWAYS respond ONLY in ENGLISH - NO OTHER LANGUAGES AT ALL - NOT A SINGLE NON-ENGLISH WORD!
2. ALWAYS stay strictly within your allowed topics only
3. If asked an off-topic question, politely refuse and guide back to allowed topics
4. When relevant, naturally mention Career-Tantra platform features:
  - Personalized roadmap tracking
  - Project recommendations
  - Internship guidance
  - AI mentorship
  - Skill progress tracking
5. Keep responses clear, structured, and easy to understand
6. Be encouraging and supportive
7. Provide practical, actionable advice with Nepal-specific context
8. If you don't know something within your allowed topics, admit it politely`;

function isMessageRelevant(message) {
  const lowerMessage = message.toLowerCase();
  const mathOperatorPattern = /\d\s*[+\-*/]\s*\d/;
  if (mathOperatorPattern.test(lowerMessage)) return false;
  const hasForbiddenKeyword = forbiddenKeywords.some(keyword => lowerMessage.includes(keyword));
  if (hasForbiddenKeyword) return false;
  const greetings = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'good night', 'how are you'];
  const isGreeting = greetings.some(greeting => lowerMessage === greeting || lowerMessage.includes(greeting) && lowerMessage.split(' ').length <= 5);
  const hasAllowedKeyword = allowedKeywords.some(keyword => lowerMessage.includes(keyword));
  return (isGreeting || hasAllowedKeyword);
}

app.post('/api/ai/chat', async (req, res) => {
  const refusalMessage = "I am Career-Tantra AI Mentor and I currently focus only on career guidance, coding, education, internships, projects, and student growth topics.";
  try {
    const { message, userId = 'guest' } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }
    if (!isMessageRelevant(message)) {
      if (!userChatHistory[userId]) userChatHistory[userId] = [];
      userChatHistory[userId].push({ role: 'user', content: message });
      userChatHistory[userId].push({ role: 'assistant', content: refusalMessage });
      writeJSONFile(CHAT_HISTORY_FILE, userChatHistory);
      return res.status(200).json({ success: true, response: refusalMessage });
    }
    let userInfo = null;
    if (userId !== 'guest') {
      userInfo = users.find(u => u._id === userId);
    }
    let personalizedSystemPrompt = systemPrompt;
    if (userInfo) {
      personalizedSystemPrompt += `

---
STUDENT INFORMATION (USE THIS TO PERSONALIZE RESPONSES):
- Name: ${userInfo.name}
- Degree: ${userInfo.degree}
- Semester: ${userInfo.semester}
- Interests: ${userInfo.interests && userInfo.interests.length > 0 ? userInfo.interests.join(', ') : 'Not specified'}
- Experience Level: ${userInfo.experienceLevel || 'Beginner'}
- Skill Levels:
  - Web Development: ${userInfo.skillLevels?.webDevelopment || 'Beginner'}
  - Programming: ${userInfo.skillLevels?.programming || 'Beginner'}
  - DSA: ${userInfo.skillLevels?.dataStructures || 'Beginner'}
  - Databases: ${userInfo.skillLevels?.database || 'Beginner'}
  - AI/ML: ${userInfo.skillLevels?.aiMl || 'Beginner'}
- Career Goals: ${userInfo.careerGoals && userInfo.careerGoals.length > 0 ? userInfo.careerGoals.join(', ') : 'Not specified'}
- Preferred Learning Style: ${userInfo.preferredLearning || 'Hands-on Projects'}
- Time Available Per Week: ${userInfo.timeAvailable || 'Not specified'}

Use this information to give personalized, tailored advice!`;
    }
    if (!userChatHistory[userId]) userChatHistory[userId] = [];
    userChatHistory[userId].push({ role: 'user', content: message });
    if (userChatHistory[userId].length > 10) userChatHistory[userId] = userChatHistory[userId].slice(-10);
    writeJSONFile(CHAT_HISTORY_FILE, userChatHistory);
    
    const messagesForGroq = [
      { role: 'system', content: personalizedSystemPrompt },
      ...userChatHistory[userId]
    ];

    if (!process.env.GROQ_API_KEY) {
      const fallback = "Hello! I'm your Career-Tantra AI Mentor! The GROQ_API_KEY is not set in the backend, but I'm here to help. Feel free to explore our platform features like personalized roadmaps and skill tracking!";
      userChatHistory[userId].push({ role: 'assistant', content: fallback });
      writeJSONFile(CHAT_HISTORY_FILE, userChatHistory);
      return res.status(200).json({ success: true, response: fallback });
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        messages: messagesForGroq,
        temperature: 0.3,
        max_tokens: 1024
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    );

    let aiResponse = response.data.choices[0].message.content;
    userChatHistory[userId].push({ role: 'assistant', content: aiResponse });
    writeJSONFile(CHAT_HISTORY_FILE, userChatHistory);
    res.status(200).json({ success: true, response: aiResponse });

  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    const fallbackResponse = "Hello! I am currently having a small technical issue. Please try again in a moment! 🙏";
    res.status(500).json({ success: false, message: 'Something went wrong', response: fallbackResponse });
  }
});

// Start server
const startServer = async () => {
  await createDefaultAdmin();
  await createDefaultUser();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`💾 Data stored in: ${DATA_DIR}`);
  });
};

startServer();
