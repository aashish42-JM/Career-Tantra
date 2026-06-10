
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
const ROADMAPS_FILE = path.join(DATA_DIR, 'roadmaps.json');
const USER_PROGRESS_FILE = path.join(DATA_DIR, 'userProgress.json');
const SKILLS_FILE = path.join(DATA_DIR, 'skills.json');
const USER_SKILL_PROGRESS_FILE = path.join(DATA_DIR, 'userSkillProgress.json');
const OPPORTUNITIES_FILE = path.join(DATA_DIR, 'opportunities.json');
const USER_OPPORTUNITIES_FILE = path.join(DATA_DIR, 'userOpportunities.json');

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
let roadmaps = readJSONFile(ROADMAPS_FILE, []);
let userProgress = readJSONFile(USER_PROGRESS_FILE, []);
let skills = readJSONFile(SKILLS_FILE, []);
let userSkillProgress = readJSONFile(USER_SKILL_PROGRESS_FILE, []);
let opportunities = readJSONFile(OPPORTUNITIES_FILE, []);
let userOpportunities = readJSONFile(USER_OPPORTUNITIES_FILE, []);

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

// Generate a slug from title
function generateSlug(title) {
  return title.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');
}

// Create default roadmaps if not exists
const createDefaultRoadmaps = () => {
  if (roadmaps.length === 0) {
    const defaultRoadmaps = [
      {
        _id: 'roadmap-1',
        title: 'Full Stack Web Development',
        slug: 'full-stack-web-development',
        description: 'Master full stack development from basics to advanced. Build real-world projects.',
        category: 'Full Stack Development',
        difficultyLevel: 'Beginner',
        estimatedDuration: '3 months',
        icon: 'fa-laptop-code',
        tags: ['web', 'javascript', 'react', 'nodejs'],
        careerPath: 'Full Stack Developer',
        createdBy: 'System',
        isFeatured: true,
        steps: [
          {
            _id: 'step-1-1',
            title: 'HTML & CSS Fundamentals',
            description: 'Learn basic HTML tags, semantic HTML, CSS selectors, flexbox, and grid.',
            unlockOrder: 1,
            xpPoints: 50,
            estimatedTime: '1 week',
            resources: [
              { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', type: 'documentation' },
              { title: 'FreeCodeCamp', url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/', type: 'course' },
            ],
            youtubeLinks: [
              { title: 'HTML & CSS Crash Course', url: 'https://www.youtube.com/watch?v=HGTJBJ98h4I' },
            ],
            projects: [
              { title: 'Personal Portfolio', description: 'Build a simple portfolio website using HTML and CSS', difficulty: 'Beginner', isMilestone: false },
            ],
          },
          {
            _id: 'step-1-2',
            title: 'JavaScript Essentials',
            description: 'Master variables, data types, functions, arrays, objects, and DOM.',
            unlockOrder: 2,
            xpPoints: 100,
            estimatedTime: '1.5 weeks',
            resources: [
              { title: 'JavaScript.info', url: 'https://javascript.info/', type: 'article' },
            ],
            projects: [
              { title: 'Todo List App', description: 'Build a todo app with CRUD operations', difficulty: 'Beginner', isMilestone: true },
            ],
          },
          {
            _id: 'step-1-3',
            title: 'React Basics',
            description: 'Learn React, components, props, state, and hooks.',
            unlockOrder: 3,
            xpPoints: 150,
            estimatedTime: '2 weeks',
            projects: [
              { title: 'React Calculator', description: 'Create a calculator in React', difficulty: 'Intermediate', isMilestone: false },
            ],
          },
          {
            _id: 'step-1-4',
            title: 'Node.js & Express',
            description: 'Build REST APIs using Node.js and Express.',
            unlockOrder: 4,
            xpPoints: 200,
            estimatedTime: '2.5 weeks',
            projects: [
              { title: 'Backend API', description: 'Create a REST API for a simple app', difficulty: 'Intermediate', isMilestone: true },
            ],
          },
        ],
        createdAt: new Date(),
      },
      {
        _id: 'roadmap-2',
        title: 'Frontend Development',
        slug: 'frontend-development',
        description: 'Become a frontend developer: HTML, CSS, JS, React, and more.',
        category: 'Frontend Development',
        difficultyLevel: 'Beginner',
        estimatedDuration: '2 months',
        icon: 'fa-desktop',
        tags: ['frontend', 'react', 'css'],
        careerPath: 'Frontend Developer',
        isFeatured: true,
        steps: [
          { _id: 'step-2-1', title: 'HTML & CSS', description: 'Foundation of frontend', unlockOrder:1, xpPoints:50, estimatedTime:'1 week', projects:[{title:'Landing Page', difficulty:'Beginner'}] },
          { _id: 'step-2-2', title: 'JavaScript & DOM', description: 'Dynamic frontend coding', unlockOrder:2, xpPoints:100, estimatedTime:'1.5 weeks', projects:[{title:'Interactive Form', difficulty:'Intermediate', isMilestone:true}] },
        ],
        createdAt: new Date(),
      },
      {
        _id: 'roadmap-3',
        title: 'Backend Development',
        slug: 'backend-development',
        description: 'Build robust server-side apps with Node.js, Express, and databases.',
        category: 'Backend Development',
        difficultyLevel: 'Beginner',
        estimatedDuration: '3 months',
        icon: 'fa-server',
        tags: ['backend', 'nodejs', 'api'],
        careerPath: 'Backend Developer',
        steps: [
          { _id: 'step-3-1', title: 'Node.js Basics', description: 'Server-side JavaScript', unlockOrder:1, xpPoints:80, estimatedTime:'1 week' },
        ],
        createdAt: new Date(),
      },
      {
        _id: 'roadmap-4',
        title: 'AI & Machine Learning Fundamentals',
        slug: 'ai-ml-fundamentals',
        description: 'Start your AI/ML journey: Python, stats, ML algorithms.',
        category: 'AI/ML',
        difficultyLevel: 'Beginner',
        estimatedDuration: '4 months',
        icon: 'fa-robot',
        tags: ['ai', 'ml', 'python', 'tensorflow'],
        careerPath: 'AI/ML Engineer',
        isFeatured: true,
        steps: [
          {
            _id: 'step-4-1', title: 'Python for Beginners', description: 'Learn Python basics', unlockOrder:1, xpPoints:60, estimatedTime:'1 week',
            projects: [{ title: 'Number Guessing Game', difficulty: 'Beginner' }]
          },
          {
            _id: 'step-4-2', title: 'Introduction to ML', description: 'Learn scikit-learn and basic ML', unlockOrder:2, xpPoints:120, estimatedTime:'2 weeks',
            projects: [{ title: 'Iris Flower Classification', difficulty: 'Intermediate', isMilestone:true }]
          },
        ],
        createdAt: new Date(),
      },
      {
        _id: 'roadmap-5',
        title: 'Cybersecurity Fundamentals',
        slug: 'cybersecurity-fundamentals',
        description: 'Learn core cybersecurity concepts and basics of ethical hacking.',
        category: 'Cybersecurity',
        difficultyLevel: 'Beginner',
        estimatedDuration: '3 months',
        icon: 'fa-shield-halved',
        tags: ['security', 'hacking', 'network'],
        careerPath: 'Cybersecurity Specialist',
        steps: [ { _id:'step-5-1', title:'Networking Basics', description:'Learn TCP/IP, DNS, etc.', unlockOrder:1, xpPoints:70 } ],
        createdAt: new Date(),
      },
      {
        _id: 'roadmap-6',
        title: 'Data Science Essentials',
        slug: 'data-science-essentials',
        description: 'Learn data analysis, visualization, and pandas.',
        category: 'Data Science',
        difficultyLevel: 'Beginner',
        estimatedDuration: '2.5 months',
        icon: 'fa-chart-simple',
        tags: ['data', 'pandas', 'visualization'],
        careerPath: 'Data Scientist',
        steps: [ { _id:'step-6-1', title:'Python for Data Analysis', unlockOrder:1, xpPoints:90 } ],
        createdAt: new Date(),
      },
      {
        _id: 'roadmap-7',
        title: 'UI/UX Design Fundamentals',
        slug: 'ui-ux-design-fundamentals',
        description: 'Learn design principles, Figma, and user research.',
        category: 'UI/UX Design',
        difficultyLevel: 'Beginner',
        estimatedDuration: '2 months',
        icon: 'fa-palette',
        tags: ['design', 'figma', 'ux'],
        careerPath: 'UI/UX Designer',
        steps: [ { _id:'step-7-1', title:'Design Principles', unlockOrder:1, xpPoints:40 } ],
        createdAt: new Date(),
      },
      {
        _id: 'roadmap-8',
        title: 'Mobile App Development (React Native)',
        slug: 'mobile-app-development-react-native',
        description: 'Build Android & iOS apps using React Native.',
        category: 'Mobile App Development',
        difficultyLevel: 'Intermediate',
        estimatedDuration: '3 months',
        icon: 'fa-mobile-screen',
        tags: ['mobile', 'react-native', 'ios', 'android'],
        careerPath: 'Mobile Developer',
        steps: [ { _id:'step-8-1', title:'React Native Setup', unlockOrder:1, xpPoints:80 } ],
        createdAt: new Date(),
      },
      {
        _id: 'roadmap-9',
        title: 'DevOps & Cloud Basics',
        slug: 'devops-cloud-basics',
        description: 'Learn Docker, CI/CD, and AWS fundamentals.',
        category: 'DevOps',
        difficultyLevel: 'Intermediate',
        estimatedDuration: '3 months',
        icon: 'fa-cloud-arrow-up',
        tags: ['devops', 'docker', 'aws'],
        careerPath: 'DevOps Engineer',
        steps: [ { _id:'step-9-1', title:'Docker Basics', unlockOrder:1, xpPoints:100 } ],
        createdAt: new Date(),
      },
      {
        _id: 'roadmap-10',
        title: 'Freelancing & Career Preparation',
        slug: 'freelancing-career-preparation',
        description: 'Build portfolio, learn soft skills, and prepare for job interviews.',
        category: 'Freelancing & Career Prep',
        difficultyLevel: 'Beginner',
        estimatedDuration: '1 month',
        icon: 'fa-briefcase',
        tags: ['career', 'interview', 'portfolio'],
        careerPath: 'Freelancer / Job Seeker',
        isFeatured: true,
        steps: [
          { _id:'step-10-1', title:'Building Portfolio', unlockOrder:1, xpPoints:70 },
          { _id:'step-10-2', title:'Interview Prep', unlockOrder:2, xpPoints:100 },
        ],
        createdAt: new Date(),
      },
    ];
    roadmaps = defaultRoadmaps;
    writeJSONFile(ROADMAPS_FILE, roadmaps);
    console.log('✅ Default roadmaps created!');
  }
};

// Create default skills if not exists
const createDefaultSkills = () => {
  if (skills.length === 0) {
    const defaultSkills = [
      // FRONTEND SKILLS
      {
        _id: 'skill-html',
        name: 'HTML',
        category: 'Frontend Development',
        description: 'The standard markup language for creating web pages.',
        icon: 'fa-html5',
        color: '#e34f26',
        topics: [
          { _id: 'html-basics', name: 'HTML Basics', xp: 20, description: 'Learn the fundamental tags and structure of HTML.' },
          { _id: 'html-semantic', name: 'Semantic HTML', xp: 25, description: 'Use semantic tags for better accessibility and SEO.' },
          { _id: 'html-forms', name: 'Forms & Inputs', xp: 30, description: 'Create and validate HTML forms.' },
          { _id: 'html-advanced', name: 'Advanced HTML', xp: 35, description: 'Learn HTML5 features like canvas, video, and audio.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 50, Advanced: 150, Expert: 300 },
        createdAt: new Date(),
      },
      {
        _id: 'skill-css',
        name: 'CSS',
        category: 'Frontend Development',
        description: 'Cascading Style Sheets for styling web pages.',
        icon: 'fa-css3-alt',
        color: '#1572b6',
        topics: [
          { _id: 'css-basics', name: 'CSS Basics', xp: 20, description: 'Learn selectors, properties, and values.' },
          { _id: 'css-box', name: 'Box Model', xp: 25, description: 'Understand margin, padding, and border.' },
          { _id: 'css-flex', name: 'Flexbox', xp: 30, description: 'Create flexible layouts with Flexbox.' },
          { _id: 'css-grid', name: 'Grid', xp: 35, description: 'Build responsive grids with CSS Grid.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 50, Advanced: 150, Expert: 300 },
        createdAt: new Date(),
      },
      {
        _id: 'skill-javascript',
        name: 'JavaScript',
        category: 'Frontend Development',
        description: 'The programming language of the web.',
        icon: 'fa-js',
        color: '#f7df1e',
        topics: [
          { _id: 'js-basics', name: 'JS Fundamentals', xp: 25, description: 'Variables, data types, and basic syntax.' },
          { _id: 'js-functions', name: 'Functions', xp: 30, description: 'Learn function declaration and arrow functions.' },
          { _id: 'js-dom', name: 'DOM Manipulation', xp: 35, description: 'Interact with the HTML DOM.' },
          { _id: 'js-async', name: 'Async JavaScript', xp: 40, description: 'Promises, async/await, and fetch API.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 70, Advanced: 200, Expert: 400 },
        createdAt: new Date(),
      },
      {
        _id: 'skill-react',
        name: 'React',
        category: 'Frontend Development',
        description: 'A JavaScript library for building user interfaces.',
        icon: 'fa-react',
        color: '#61dafb',
        topics: [
          { _id: 'react-basics', name: 'React Basics', xp: 30, description: 'Components, JSX, and props.' },
          { _id: 'react-state', name: 'State Management', xp: 35, description: 'useState and useEffect hooks.' },
          { _id: 'react-router', name: 'React Router', xp: 35, description: 'Client-side routing with React Router.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 80, Advanced: 250, Expert: 500 },
        createdAt: new Date(),
      },
      // BACKEND SKILLS
      {
        _id: 'skill-nodejs',
        name: 'Node.js',
        category: 'Backend Development',
        description: 'JavaScript runtime environment.',
        icon: 'fa-node-js',
        color: '#339933',
        topics: [
          { _id: 'node-basics', name: 'Node.js Basics', xp: 25, description: 'Introduction to Node.js and NPM.' },
          { _id: 'node-express', name: 'Express.js', xp: 35, description: 'Web framework for Node.js.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 70, Advanced: 200, Expert: 400 },
        createdAt: new Date(),
      },
      {
        _id: 'skill-python',
        name: 'Python',
        category: 'Backend Development',
        description: 'A versatile programming language for backend.',
        icon: 'fa-python',
        color: '#3776ab',
        topics: [
          { _id: 'python-basics', name: 'Python Basics', xp: 25, description: 'Variables, loops, and conditionals.' },
          { _id: 'python-flask', name: 'Flask', xp: 35, description: 'Lightweight Python web framework.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 70, Advanced: 200, Expert: 400 },
        createdAt: new Date(),
      },
      // DATABASES
      {
        _id: 'skill-mongodb',
        name: 'MongoDB',
        category: 'Databases',
        description: 'NoSQL database for modern applications.',
        icon: 'fa-database',
        color: '#47a248',
        topics: [
          { _id: 'mongo-basics', name: 'MongoDB Basics', xp: 25, description: 'Collections, documents, and CRUD.' },
          { _id: 'mongo-mongoose', name: 'Mongoose', xp: 35, description: 'ODM for Node.js.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 60, Advanced: 180, Expert: 350 },
        createdAt: new Date(),
      },
      {
        _id: 'skill-sql',
        name: 'SQL',
        category: 'Databases',
        description: 'Structured Query Language for relational databases.',
        icon: 'fa-database',
        color: '#00758f',
        topics: [
          { _id: 'sql-basics', name: 'SQL Basics', xp: 25, description: 'SELECT, INSERT, UPDATE, DELETE.' },
          { _id: 'sql-joins', name: 'SQL Joins', xp: 35, description: 'Inner, left, right, and full joins.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 60, Advanced: 180, Expert: 350 },
        createdAt: new Date(),
      },
      // PROGRAMMING & DSA
      {
        _id: 'skill-dsa',
        name: 'Data Structures & Algorithms',
        category: 'Programming',
        description: 'Foundational coding concepts for problem solving.',
        icon: 'fa-code',
        color: '#68a063',
        topics: [
          { _id: 'dsa-arrays', name: 'Arrays & Strings', xp: 30, description: 'Basic array and string problems.' },
          { _id: 'dsa-linked', name: 'Linked Lists', xp: 35, description: 'Singly and doubly linked lists.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 80, Advanced: 250, Expert: 500 },
        createdAt: new Date(),
      },
      // AI/ML & DATA SCIENCE
      {
        _id: 'skill-ai',
        name: 'AI/ML',
        category: 'AI & Data Science',
        description: 'Artificial Intelligence and Machine Learning basics.',
        icon: 'fa-brain',
        color: '#ff6f61',
        topics: [
          { _id: 'ai-intro', name: 'Introduction to AI', xp: 30, description: 'What is AI and machine learning?' },
          { _id: 'ml-basics', name: 'ML Fundamentals', xp: 40, description: 'Supervised and unsupervised learning.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 80, Advanced: 250, Expert: 500 },
        createdAt: new Date(),
      },
      // UI/UX & DESIGN
      {
        _id: 'skill-uiux',
        name: 'UI/UX Design',
        category: 'Design',
        description: 'User Interface and User Experience design.',
        icon: 'fa-paint-brush',
        color: '#ff69b4',
        topics: [
          { _id: 'ui-basics', name: 'UI Design Basics', xp: 25, description: 'Color, typography, and layout.' },
          { _id: 'ux-research', name: 'UX Research', xp: 30, description: 'User research and testing.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 60, Advanced: 180, Expert: 350 },
        createdAt: new Date(),
      },
      {
        _id: 'skill-figma',
        name: 'Figma',
        category: 'Design',
        description: 'Design tool for creating user interfaces.',
        icon: 'fa-palette',
        color: '#f24e1e',
        topics: [
          { _id: 'figma-basics', name: 'Figma Basics', xp: 20, description: 'Frames, shapes, and text.' },
          { _id: 'figma-components', name: 'Components', xp: 30, description: 'Reusable UI components.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 50, Advanced: 150, Expert: 300 },
        createdAt: new Date(),
      },
      // CYBERSECURITY
      {
        _id: 'skill-cyber',
        name: 'Cybersecurity',
        category: 'Cybersecurity',
        description: 'Protecting systems from digital attacks.',
        icon: 'fa-shield-halved',
        color: '#0d5c75',
        topics: [
          { _id: 'cyber-basics', name: 'Cybersecurity Basics', xp: 25, description: 'Introduction to security concepts.' },
          { _id: 'cyber-network', name: 'Network Security', xp: 35, description: 'Firewalls, VPNs, and encryption.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 70, Advanced: 200, Expert: 400 },
        createdAt: new Date(),
      },
      // NETWORKING
      {
        _id: 'skill-networking',
        name: 'Computer Networking',
        category: 'Networking',
        description: 'Fundamentals of how computers communicate.',
        icon: 'fa-wifi',
        color: '#009688',
        topics: [
          { _id: 'network-basics', name: 'Networking Basics', xp: 25, description: 'OSI model and protocols.' },
          { _id: 'network-tcp', name: 'TCP/IP', xp: 35, description: 'Internet protocol suite.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 60, Advanced: 180, Expert: 350 },
        createdAt: new Date(),
      },
      // MOBILE DEVELOPMENT
      {
        _id: 'skill-flutter',
        name: 'Flutter',
        category: 'Mobile Development',
        description: 'Build cross-platform mobile apps with Flutter.',
        icon: 'fa-mobile-screen',
        color: '#02569b',
        topics: [
          { _id: 'flutter-basics', name: 'Flutter Basics', xp: 25, description: 'Widgets and state.' },
          { _id: 'flutter-layouts', name: 'Layouts', xp: 30, description: 'Building responsive UIs in Flutter.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 70, Advanced: 200, Expert: 400 },
        createdAt: new Date(),
      },
      // DEVOPS & CLOUD
      {
        _id: 'skill-docker',
        name: 'Docker',
        category: 'DevOps & Cloud',
        description: 'Containerization for applications.',
        icon: 'fa-cube',
        color: '#2496ed',
        topics: [
          { _id: 'docker-basics', name: 'Docker Basics', xp: 30, description: 'Images and containers.' },
          { _id: 'docker-compose', name: 'Docker Compose', xp: 35, description: 'Multi-container apps.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 80, Advanced: 250, Expert: 500 },
        createdAt: new Date(),
      },
      // GIT & VERSION CONTROL
      {
        _id: 'skill-git',
        name: 'Git',
        category: 'Version Control',
        description: 'Distributed version control system.',
        icon: 'fa-code-branch',
        color: '#f1502f',
        topics: [
          { _id: 'git-basics', name: 'Git Basics', xp: 20, description: 'Add, commit, push, pull.' },
          { _id: 'git-branches', name: 'Branching', xp: 30, description: 'Feature branches and merging.' },
        ],
        levelThresholds: { Beginner: 0, Intermediate: 50, Advanced: 150, Expert: 300 },
        createdAt: new Date(),
      },
    ];
    skills = defaultSkills;
    writeJSONFile(SKILLS_FILE, skills);
    console.log('✅ Default skills created!');
  }
};

const createDefaultOpportunities = () => {
  if (opportunities.length === 0) {
    const defaultOpportunities = [
      {
        _id: 'opp-1',
        title: 'Frontend Developer Intern',
        company: 'Leapfrog Technology',
        location: 'Kathmandu, Nepal',
        type: 'internship',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        description: 'Join our team as a frontend developer intern and work on real-world projects using React.js.',
        applicationLink: 'https://leapfrog.tech/careers',
        tags: ['React', 'HTML', 'CSS', 'JavaScript'],
        isFeatured: true,
        createdAt: new Date()
      },
      {
        _id: 'opp-2',
        title: 'Nepal AI Hackathon 2024',
        company: 'AI Nepal',
        location: 'Virtual',
        type: 'hackathon',
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        description: 'Build AI-powered solutions for real-world problems in Nepal.',
        applicationLink: 'https://ainepal.org/hackathon',
        tags: ['AI', 'Machine Learning', 'Python'],
        isFeatured: true,
        createdAt: new Date()
      },
      {
        _id: 'opp-3',
        title: 'Scholarship for CSIT Students',
        company: 'Nepal Education Foundation',
        location: 'Nepal',
        type: 'scholarship',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: 'Full scholarship for deserving CSIT students in Nepal.',
        applicationLink: 'https://nef.org.np/scholarship',
        tags: ['Scholarship', 'CSIT', 'Education'],
        isFeatured: false,
        createdAt: new Date()
      },
      {
        _id: 'opp-4',
        title: 'Web Development Workshop',
        company: 'Kathmandu Tech Hub',
        location: 'Lalitpur, Nepal',
        type: 'workshop',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        description: 'Learn full-stack web development from industry experts.',
        applicationLink: 'https://ktmtechhub.com/workshop',
        tags: ['Web Development', 'Workshop', 'React'],
        isFeatured: false,
        createdAt: new Date()
      },
      {
        _id: 'opp-5',
        title: 'Nepal Tech Summit 2024',
        company: 'Tech Nepal Association',
        location: 'Bhrikutimandap, Kathmandu',
        type: 'tech-event',
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        description: 'Join the biggest tech event in Nepal with speakers from around the world.',
        applicationLink: 'https://techsummitnepal.com',
        tags: ['Tech', 'Event', 'Networking'],
        isFeatured: true,
        createdAt: new Date()
      },
      {
        _id: 'opp-6',
        title: 'Coding Competition - Code Ninja',
        company: 'Code Academy Nepal',
        location: 'Virtual',
        type: 'competition',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        description: 'Participate in the national coding competition and win exciting prizes.',
        applicationLink: 'https://codeacademynp.com/competition',
        tags: ['Competition', 'Coding', 'DSA'],
        isFeatured: false,
        createdAt: new Date()
      }
    ];
    opportunities = defaultOpportunities;
    writeJSONFile(OPPORTUNITIES_FILE, opportunities);
    console.log('✅ Default opportunities created!');
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

// -------------------
// ROADMAP ROUTES
// -------------------

// Get all roadmaps
app.get('/api/roadmaps', (req, res) => {
  // Support query params for filtering: category, difficultyLevel
  let filtered = [...roadmaps];
  if (req.query.category) {
    filtered = filtered.filter(r => r.category === req.query.category);
  }
  if (req.query.difficultyLevel) {
    filtered = filtered.filter(r => r.difficultyLevel === req.query.difficultyLevel);
  }
  res.status(200).json({ success: true, data: filtered });
});

// Get recommended roadmaps for user
app.get('/api/roadmaps/recommended', (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      // If not logged in, return featured roadmaps
      return res.status(200).json({ success: true, data: roadmaps.filter(r => r.isFeatured) });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u._id === decoded.id);
    if (!user) {
      return res.status(200).json({ success: true, data: roadmaps.filter(r => r.isFeatured) });
    }

    // Personalize based on user interests and skill levels
    let recommended = [];
    const userInterests = user.interests || [];
    const userSkillLevels = user.skillLevels || {};

    // First find roadmaps matching interests
    roadmaps.forEach(r => {
      // Check if tags match interests
      const matchesInterests = r.tags.some(tag => 
        userInterests.some(interest => interest.toLowerCase().includes(tag.toLowerCase()) || tag.toLowerCase().includes(interest.toLowerCase()))
      );
      if (matchesInterests) {
        recommended.push(r);
      }
    });

    // If no matches, use featured roadmaps
    if (recommended.length === 0) {
      recommended = roadmaps.filter(r => r.isFeatured);
    }

    res.status(200).json({ success: true, data: recommended });
  } catch (error) {
    res.status(200).json({ success: true, data: roadmaps.filter(r => r.isFeatured) });
  }
});

// Get single roadmap
app.get('/api/roadmaps/:id', (req, res) => {
  const roadmap = roadmaps.find(r => r._id === req.params.id);
  if (!roadmap) {
    return res.status(404).json({ success: false, message: 'Roadmap not found' });
  }
  res.status(200).json({ success: true, data: roadmap });
});

// Enroll user in a roadmap
app.post('/api/roadmaps/:id/enroll', (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u._id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const roadmap = roadmaps.find(r => r._id === req.params.id);
    if (!roadmap) {
      return res.status(404).json({ success: false, message: 'Roadmap not found' });
    }

    const existingProgress = userProgress.find(p => p.user === user._id && p.roadmap === req.params.id);
    if (existingProgress) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this roadmap' });
    }

    const newProgress = {
      _id: `progress-${Date.now()}`,
      user: user._id,
      roadmap: req.params.id,
      roadmapData: roadmap, // Store roadmap data for easy access
      completedSteps: [],
      currentStep: 1,
      xpEarned: 0,
      streak: 1,
      lastActive: new Date(),
      badges: [],
      createdAt: new Date(),
    };
    userProgress.push(newProgress);
    writeJSONFile(USER_PROGRESS_FILE, userProgress);
    res.status(201).json({ success: true, data: newProgress });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
});

// Get user's enrolled roadmaps/progress
app.get('/api/roadmaps/progress', (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u._id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const userEnrolled = userProgress.filter(p => p.user === user._id);
    res.status(200).json({ success: true, data: userEnrolled });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
});

// Mark step complete
app.put('/api/roadmaps/progress/:progressId/complete', (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u._id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const progressIndex = userProgress.findIndex(p => p._id === req.params.progressId);
    if (progressIndex === -1) {
      return res.status(404).json({ success: false, message: 'Progress not found' });
    }
    const progress = userProgress[progressIndex];
    if (progress.user !== user._id) {
      return res.status(403).json({ success: false, message: 'Not your progress' });
    }

    const { stepId } = req.body;
    const roadmap = progress.roadmapData;
    const step = roadmap.steps.find(s => s._id === stepId);
    if (!step) {
      return res.status(404).json({ success: false, message: 'Step not found' });
    }

    if (progress.completedSteps.some(s => s.stepId === stepId)) {
      return res.status(400).json({ success: false, message: 'Step already completed' });
    }

    // Add completed step
    progress.completedSteps.push({
      stepId,
      completedAt: new Date(),
    });

    // Add XP
    progress.xpEarned += step.xpPoints;

    // Update current step
    const nextStepOrder = step.unlockOrder + 1;
    const nextStepExists = roadmap.steps.some(s => s.unlockOrder === nextStepOrder);
    if (nextStepExists) {
      progress.currentStep = nextStepOrder;
    }

    // Update streak
    const today = new Date();
    const lastActive = new Date(progress.lastActive);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (lastActive.toDateString() === yesterday.toDateString()) {
      progress.streak += 1;
    } else if (lastActive.toDateString() !== today.toDateString()) {
      progress.streak = 1;
    }
    progress.lastActive = today;

    // Check for badges
    const completionPercent = Math.round((progress.completedSteps.length / roadmap.steps.length) * 100);
    progress.completionPercentage = completionPercent; // Add completion percentage
    progress.lastUpdated = new Date(); // Update last updated time
    if (!progress.startedAt) {
      progress.startedAt = new Date(); // Set startedAt if not already set
    }

    if (completionPercent >= 25 && !progress.badges.some(b => b.name === 'First Steps')) {
      progress.badges.push({ name: 'First Steps', description: 'Complete 25% of a roadmap', icon: '🎯', earnedAt: new Date() });
    }
    if (completionPercent >= 50 && !progress.badges.some(b => b.name === 'Halfway There')) {
      progress.badges.push({ name: 'Halfway There', description: 'Complete 50% of a roadmap', icon: '⭐', earnedAt: new Date() });
    }
    if (completionPercent >= 100 && !progress.badges.some(b => b.name === 'Roadmap Master')) {
      progress.badges.push({ name: 'Roadmap Master', description: 'Complete 100% of a roadmap', icon: '🏆', earnedAt: new Date() });
    }
    if (progress.streak >= 7 && !progress.badges.some(b => b.name === '7-Day Streak')) {
      progress.badges.push({ name: '7-Day Streak', description: 'Learn 7 days in a row', icon: '🔥', earnedAt: new Date() });
    }

    userProgress[progressIndex] = progress;
    writeJSONFile(USER_PROGRESS_FILE, userProgress);
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    console.error('Error completing step:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------
// SKILL ROUTES
// -------------------

// Get all skills
app.get('/api/skills', (req, res) => {
  res.status(200).json({ success: true, data: skills });
});

// Get user's skill progress
app.get('/api/skills/progress', (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u._id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const userProgress = userSkillProgress.filter(p => p.user === user._id);
    res.status(200).json({ success: true, data: userProgress });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
});

// Complete a skill topic
app.put('/api/skills/:skillId/complete-topic', (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u._id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const skill = skills.find(s => s._id === req.params.skillId);
    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    const { topicId } = req.body;
    const topic = skill.topics.find(t => t._id === topicId);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    let progress = userSkillProgress.find(p => p.user === user._id && p.skill === req.params.skillId);
    
    if (!progress) {
      // Create new progress if none exists
      progress = {
        _id: `skill-progress-${Date.now()}`,
        user: user._id,
        skill: req.params.skillId,
        skillName: skill.name,
        xp: 0,
        level: 'Beginner',
        completedTopics: [],
        lastUpdated: new Date(),
        learningStreak: 1,
        lastPracticed: new Date(),
        createdAt: new Date(),
      };
      userSkillProgress.push(progress);
    }

    // Check if topic already completed
    if (progress.completedTopics.some(t => t.topicId === topicId)) {
      return res.status(400).json({ success: false, message: 'Topic already completed' });
    }

    // Add completed topic
    progress.completedTopics.push({
      topicId,
      completedAt: new Date(),
    });

    // Add XP
    progress.xp += topic.xp;

    // Update skill level
    if (progress.xp >= skill.levelThresholds.Expert) {
      progress.level = 'Expert';
    } else if (progress.xp >= skill.levelThresholds.Advanced) {
      progress.level = 'Advanced';
    } else if (progress.xp >= skill.levelThresholds.Intermediate) {
      progress.level = 'Intermediate';
    }

    // Update streak
    const today = new Date();
    const lastPracticed = new Date(progress.lastPracticed);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (lastPracticed.toDateString() === yesterday.toDateString()) {
      progress.learningStreak += 1;
    } else if (lastPracticed.toDateString() !== today.toDateString()) {
      progress.learningStreak = 1;
    }

    progress.lastPracticed = today;
    progress.lastUpdated = today;

    // Save to file
    writeJSONFile(USER_SKILL_PROGRESS_FILE, userSkillProgress);
    res.status(200).json({ success: true, data: progress });
  } catch (error) {
    console.error('Error completing topic:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// -------------------
// OPPORTUNITY ROUTES
// -------------------

// Get all opportunities (with filters)
app.get('/api/opportunities', (req, res) => {
  try {
    let filtered = [...opportunities];
    
    // Filter by type
    if (req.query.type) {
      filtered = filtered.filter(o => o.type === req.query.type);
    }
    
    // Search by title, company, or tags
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filtered = filtered.filter(o => 
        o.title.toLowerCase().includes(searchTerm) || 
        o.company.toLowerCase().includes(searchTerm) || 
        o.tags.some(t => t.toLowerCase().includes(searchTerm))
      );
    }
    
    // Sort by deadline
    if (req.query.sort === 'deadline') {
      filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }
    
    res.status(200).json({ success: true, data: filtered });
  } catch (error) {
    console.error('Error getting opportunities:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get featured opportunities
app.get('/api/opportunities/featured', (req, res) => {
  try {
    const featured = opportunities.filter(o => o.isFeatured);
    res.status(200).json({ success: true, data: featured });
  } catch (error) {
    console.error('Error getting featured opportunities:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's saved opportunities
app.get('/api/opportunities/user/saved', (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u._id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const saved = userOpportunities.filter(u => u.user === user._id && u.isSaved);
    // Add opportunity details
    const savedWithDetails = saved.map(s => {
      const opp = opportunities.find(o => o._id === s.opportunity);
      return { ...s, opportunityData: opp };
    });
    res.status(200).json({ success: true, data: savedWithDetails });
  } catch (error) {
    console.error('Error getting saved opportunities:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save/unsave opportunity
app.post('/api/opportunities/:opportunityId/save', (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.find(u => u._id === decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const opportunity = opportunities.find(o => o._id === req.params.opportunityId);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    let userOpp = userOpportunities.find(u => u.user === user._id && u.opportunity === req.params.opportunityId);
    
    if (!userOpp) {
      // Create new
      userOpp = {
        _id: `user-opp-${Date.now()}`,
        user: user._id,
        opportunity: req.params.opportunityId,
        isSaved: true,
        savedAt: new Date(),
        status: 'saved',
        createdAt: new Date()
      };
      userOpportunities.push(userOpp);
    } else {
      // Toggle saved
      userOpp.isSaved = !userOpp.isSaved;
      if (userOpp.isSaved) {
        userOpp.savedAt = new Date();
      }
    }

    writeJSONFile(USER_OPPORTUNITIES_FILE, userOpportunities);
    res.status(200).json({ success: true, data: userOpp });
  } catch (error) {
    console.error('Error saving opportunity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Create opportunity
app.post('/api/opportunities', (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = admins.find(a => a._id === decoded.id);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, company, location, type, deadline, description, applicationLink, tags, isFeatured } = req.body;
    const newOpp = {
      _id: `opp-${Date.now()}`,
      title,
      company,
      location,
      type,
      deadline: new Date(deadline),
      description,
      applicationLink,
      tags: tags || [],
      isFeatured: isFeatured || false,
      createdAt: new Date()
    };
    opportunities.push(newOpp);
    writeJSONFile(OPPORTUNITIES_FILE, opportunities);
    res.status(201).json({ success: true, data: newOpp });
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Update opportunity
app.put('/api/opportunities/:opportunityId', (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = admins.find(a => a._id === decoded.id);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const index = opportunities.findIndex(o => o._id === req.params.opportunityId);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    opportunities[index] = {
      ...opportunities[index],
      ...req.body,
      deadline: req.body.deadline ? new Date(req.body.deadline) : opportunities[index].deadline
    };
    writeJSONFile(OPPORTUNITIES_FILE, opportunities);
    res.status(200).json({ success: true, data: opportunities[index] });
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Admin: Delete opportunity
app.delete('/api/opportunities/:opportunityId', (req, res) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const admin = admins.find(a => a._id === decoded.id);
    if (!admin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    opportunities = opportunities.filter(o => o._id !== req.params.opportunityId);
    userOpportunities = userOpportunities.filter(u => u.opportunity !== req.params.opportunityId);
    writeJSONFile(OPPORTUNITIES_FILE, opportunities);
    writeJSONFile(USER_OPPORTUNITIES_FILE, userOpportunities);
    res.status(200).json({ success: true, message: 'Opportunity deleted' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start server
const startServer = async () => {
  await createDefaultAdmin();
  await createDefaultUser();
  createDefaultRoadmaps();
  createDefaultSkills();
  createDefaultOpportunities();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`💾 Data stored in: ${DATA_DIR}`);
  });
};

startServer();
