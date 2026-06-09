# Career-Tantra Backend

## Description
Backend API for Career-Tantra - AI Career Navigator for Nepali students. Built with Node.js, Express, and MongoDB.

## Features
- User authentication with JWT
- User registration and login
- User profile management
- Profile picture upload
- Admin dashboard
- Role-based access control (user/admin)
- Password hashing with bcrypt
- Helmet security headers
- Rate limiting
- CORS enabled

## Tech Stack
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **multer** - File upload
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing
- **express-rate-limit** - Rate limiting

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Steps
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (already provided, but you can modify):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/careerTantraDB
   JWT_SECRET=your_super_secret_jwt_key_keep_it_secret_and_change_in_production
   JWT_EXPIRE=30d
   ```

4. Seed admin user (optional):
   ```bash
   cd utils
   node seedAdmin.js
   ```
   This creates an admin with:
   - Email: admin@careertantra.com
   - Password: Admin123456
   **Important:** Change this password in production!

5. Start the server:
   - Development mode (auto-reload):
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

The server will start on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/admin/login` - Login admin
- `GET /api/auth/me` - Get current logged in user (Private)

### User
- `GET /api/users/profile` - Get user profile (Private)
- `PUT /api/users/profile` - Update user profile (Private)
- `POST /api/users/profile-picture` - Upload profile picture (Private)

### Admin (Admin only)
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get single user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get dashboard stats

## Project Structure
```
backend/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── authController.js  # Auth logic
│   ├── userController.js  # User logic
│   └── adminController.js # Admin logic
├── middleware/
│   ├── auth.js            # JWT auth middleware
│   └── error.js           # Error handling middleware
├── models/
│   ├── User.js            # User model
│   └── Admin.js           # Admin model
├── routes/
│   ├── authRoutes.js      # Auth routes
│   ├── userRoutes.js      # User routes
│   └── adminRoutes.js     # Admin routes
├── uploads/               # Uploaded files
├── utils/
│   └── seedAdmin.js       # Seed admin user
├── .env                   # Environment variables
├── .env.example           # Example env file
├── package.json           # Dependencies
└── server.js              # Entry point
```

## Security Notes
- Always change the default JWT_SECRET and admin password in production
- Use HTTPS in production
- Keep your .env file secure and never commit it to version control
- Rate limiting is enabled (100 requests/15 minutes per IP)

## License
MIT
