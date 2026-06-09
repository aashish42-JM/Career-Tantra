
# Career-Tantra 🚀

**AI-Powered Career Guidance Platform for Nepali Students**

---

## 📖 Project Overview

Career-Tantra is a comprehensive AI-powered platform designed to guide Nepali students through their career journey. From personalized learning roadmaps to AI-driven mentorship, Career-Tantra provides everything a student needs to succeed in the tech industry and beyond.

---

## 🎯 Vision & Mission

### Vision
To become the go-to career companion for every Nepali student, empowering them to build successful, fulfilling careers.

### Mission
- Provide accessible, AI-driven career guidance to students across Nepal
- Bridge the gap between academic learning and industry requirements
- Foster a community of learners and mentors
- Help students develop practical, job-ready skills

---

## ✨ Key Features

### 🧠 AI Mentor
- Personalized AI guidance powered by Groq API
- Career advice, coding help, and project recommendations
- Context-aware conversations with chat history
- Nepal-specific industry insights

### 📚 Learning Roadmaps
- Personalized learning paths based on user skills and goals
- Step-by-step guidance from beginner to advanced levels
- Curated resources and project ideas

### 💻 Skill Development
- Skill assessment and tracking
- Interactive skill visualization (radar/bar charts)
- Progress monitoring over time

### 👥 User Authentication
- Secure login/signup with JWT tokens
- Role-based access (Student/Admin)
- Profile management with skill levels

### 🛡️ Admin Dashboard
- User management and analytics
- View and manage registered students
- User details with skill visualization
- Delete user accounts when needed

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Markup language
- **CSS3** - Styling with modern design
- **JavaScript** - Interactive functionality
- **Chart.js** - Data visualization for skills

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP requests
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Express Rate Limit** - API rate limiting

### AI Integration
- **Groq API** - AI mentor with Llama 3.1 model

### Database
- **In-Memory + JSON Files** - Persistent data storage (for current version)
- **MongoDB** - Ready for integration (original backend available)

---

## 📁 Folder Structure

```
Career-Tantra/
├── backend/
│   ├── config/
│   │   └── db.js              # Database configuration
│   ├── controllers/
│   │   ├── adminController.js # Admin-related logic
│   │   ├── authController.js  # Authentication logic
│   │   ├── chatController.js  # AI chat logic
│   │   └── userController.js  # User-related logic
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── error.js           # Error handling middleware
│   ├── models/
│   │   ├── Admin.js           # Admin model schema
│   │   └── User.js            # User model schema
│   ├── routes/
│   │   ├── adminRoutes.js     # Admin API routes
│   │   ├── authRoutes.js      # Auth API routes
│   │   ├── chatRoutes.js      # AI chat API routes
│   │   └── userRoutes.js      # User API routes
│   ├── utils/
│   │   └── seedAdmin.js       # Admin seeding utility
│   ├── data/                  # JSON data storage (generated automatically)
│   ├── .env                   # Environment variables
│   ├── .env.example           # Example env file
│   ├── package.json           # Dependencies
│   ├── server.js              # MongoDB-backed server
│   └── server-inmemory.js     # In-memory + JSON file server (current default)
├── index.html                 # Landing page
├── login.html                 # Login/Signup page
├── dashboard.html             # User dashboard
├── admin-dashboard.html       # Admin dashboard
├── script.js                  # Landing page interactivity
├── auth.js                    # Login/Signup functionality
├── dashboard.js               # Dashboard functionality
├── styles.css                 # Global styling
└── README.md                  # This file!
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/aashish42-JM/Career-Tantra.git
cd Career-Tantra
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Set Up Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
cd backend
# Copy the example file and edit it
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/careerTantraDB
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRE=30d
GROQ_API_KEY=your_groq_api_key_here
```

### Step 4: Get Your Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in
3. Create a new API key
4. Paste it in your `.env` file as `GROQ_API_KEY`

---

## 🚀 Running the Application

### Option 1: Using Persistent JSON File Storage (Recommended for Demo)
This is the default and easiest way to run the app without needing MongoDB:

```bash
# Backend (Terminal 1)
cd backend
npm run persistent

# Frontend (Terminal 2 - in project root)
node frontend-server.js
# Then open http://localhost:3000 in your browser
```

### Option 2: Using MongoDB (For Production/Scaling)
Make sure MongoDB is running locally or use a cloud MongoDB service (like MongoDB Atlas):

```bash
# Backend
cd backend
npm start
# Or with nodemon for development:
npm run dev

# Frontend
node frontend-server.js
```

### Default Credentials
- **Admin User**: `username: admin`, `password: admin`
- **Super Admin**: `username: loginadmin`, `password: adminlogin`

---

## 🧠 How the AI Mentor Works

Career-Tantra's AI Mentor is powered by Groq's Llama 3.1-8B model:

1. **Contextual Conversations**: Remembers the last 10 messages for context
2. **Personalized Advice**: Uses the student's profile (skills, interests, goals)
3. **Topic Filtering**: Strictly focuses only on career-related topics
4. **Nepal-Specific**: Tailored advice for the Nepali tech industry
5. **Relevance Check**: Automatically rejects off-topic questions

### Topics the AI Mentor Covers:
- Coding help (JavaScript, Python, etc.)
- Career guidance and planning
- Project ideas and recommendations
- Interview preparation
- Resume building tips
- Internship guidance
- Learning resource suggestions
- Skill development strategies

---

## 🛡️ Admin Dashboard Features

The admin dashboard provides powerful management capabilities:

1. **User List**: View all registered students with search functionality
2. **User Details**: Click on any user to view their complete profile
3. **Skill Visualization**: See a user's skill levels in radar chart format
4. **User Management**: Delete user accounts when necessary
5. **Profile Information**: View name, email, degree, semester, interests, skills, and more

---

## 🚀 Future Scope

- [ ] **Full MongoDB Integration**: Complete transition from JSON files to MongoDB
- [ ] **Real Database**: Add PostgreSQL support
- [ ] **Admin Analytics**: Detailed platform usage statistics
- [ ] **Project Library**: Curated collection of student projects
- [ ] **Internship Portal**: Direct internship listings and applications
- [ ] **Video Lessons**: Integrated video content for learning
- [ ] **Community Forum**: Student discussion and collaboration platform
- [ ] **Mobile App**: React Native or Flutter mobile application
- [ ] **Nepali Language Support**: Multilingual UI and AI responses
- [ ] **Skill Assessments**: Interactive quizzes and tests
- [ ] **Certificate Generation**: Course completion certificates
- [ ] **Mentorship Matching**: Connect students with industry mentors
- [ ] **Deployment**: Cloud deployment on Vercel, AWS, or similar platforms

---

## 📸 Screenshots

Add screenshots of your application here to showcase the UI:

### Landing Page
![Landing Page](screenshots/landing-page.png)

### Login Page
![Login Page](screenshots/login-page.png)

### User Dashboard
![User Dashboard](screenshots/dashboard.png)

### AI Chat Interface
![AI Chat](screenshots/ai-chat.png)

### Admin Dashboard
![Admin Dashboard](screenshots/admin-dashboard.png)

---

## 👥 Contributors

<a href="https://github.com/aashish42-JM/Career-Tantra/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=aashish42-JM/Career-Tantra" />
</a>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Contact

For questions or feedback, feel free to reach out:

- **GitHub**: [aashish42-JM](https://github.com/aashish42-JM)
- **Project Link**: [Career-Tantra](https://github.com/aashish42-JM/Career-Tantra)

---

<div align="center">
  Made with ❤️ for Nepali Students
</div>

