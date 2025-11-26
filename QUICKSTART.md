<<<<<<< HEAD
# 🚀 Quick Start Guide

Get LensLink AI running in 3 simple steps!

## Prerequisites

You need Node.js installed. Check if you have it:
```bash
node -v
```

If not installed, download from: https://nodejs.org/

## Installation & Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

You should see:
```
Successfully loaded and indexed 7 cameras.
Successfully loaded 1 users.
Server is running successfully on http://localhost:3000
LensLink AI back-end is active!
```

### Step 3: Open Your Browser
Navigate to: **http://localhost:3000**

## 🎉 You're Ready!

### Test the Application

1. **Browse Cameras**: The home page shows camera comparisons
2. **Try the AI Chat**: Ask about travel cameras, sports cameras, etc.
3. **Register**: Click "Register" to create a new account
4. **Login as Admin**: 
   - Click "Login"
   - Username: `admin`
   - Password: `admin123`
5. **Admin Dashboard**: Manage users, edit roles, etc.

## 📁 Project Structure

```
lenslink-ai3/
├── index.html              # Home page (camera comparison)
├── login.html              # Login page
├── register.html           # Registration page
├── admin.html              # Admin dashboard
├── server.js               # Express server with API
├── users.json              # User database
├── cameras.json            # Camera database
├── package.json            # Dependencies
├── public/js/auth.js       # Auth utilities
└── README.md               # Full documentation
```

## 🔐 Default Credentials

**Admin Account:**
- Username: `admin`
- Email: `admin@lenslink.ai`
- Password: `admin123`

## 🛠️ Common Commands

Start server:
```bash
npm start
```

Stop server:
```
Press Ctrl+C in the terminal
```

## ❓ Troubleshooting

**Port already in use?**
```bash
# Windows: Find and kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Module not found?**
```bash
npm install
```

**Need to reset?**
Delete `users.json` and restart server (will recreate with default admin).

## 📚 Learn More

- **Full Documentation**: See `README.md`
- **Setup Instructions**: See `SETUP_INSTRUCTIONS.txt`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

## ⚠️ Important Note

This is a **prototype** with simplified security:
- Plain text passwords
- In-memory sessions
- Not for production use

Perfect for learning and development! 🎓






=======
# 🚀 Quick Start Guide

Get LensLink AI running in 3 simple steps!

## Prerequisites

You need Node.js installed. Check if you have it:
```bash
node -v
```

If not installed, download from: https://nodejs.org/

## Installation & Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

You should see:
```
Successfully loaded and indexed 7 cameras.
Successfully loaded 1 users.
Server is running successfully on http://localhost:3000
LensLink AI back-end is active!
```

### Step 3: Open Your Browser
Navigate to: **http://localhost:3000**

## 🎉 You're Ready!

### Test the Application

1. **Browse Cameras**: The home page shows camera comparisons
2. **Try the AI Chat**: Ask about travel cameras, sports cameras, etc.
3. **Register**: Click "Register" to create a new account
4. **Login as Admin**: 
   - Click "Login"
   - Username: `admin`
   - Password: `admin123`
5. **Admin Dashboard**: Manage users, edit roles, etc.

## 📁 Project Structure

```
lenslink-ai3/
├── index.html              # Home page (camera comparison)
├── login.html              # Login page
├── register.html           # Registration page
├── admin.html              # Admin dashboard
├── server.js               # Express server with API
├── users.json              # User database
├── cameras.json            # Camera database
├── package.json            # Dependencies
├── public/js/auth.js       # Auth utilities
└── README.md               # Full documentation
```

## 🔐 Default Credentials

**Admin Account:**
- Username: `admin`
- Email: `admin@lenslink.ai`
- Password: `admin123`

## 🛠️ Common Commands

Start server:
```bash
npm start
```

Stop server:
```
Press Ctrl+C in the terminal
```

## ❓ Troubleshooting

**Port already in use?**
```bash
# Windows: Find and kill process using port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Module not found?**
```bash
npm install
```

**Need to reset?**
Delete `users.json` and restart server (will recreate with default admin).

## 📚 Learn More

- **Full Documentation**: See `README.md`
- **Setup Instructions**: See `SETUP_INSTRUCTIONS.txt`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`

## ⚠️ Important Note

This is a **prototype** with simplified security:
- Plain text passwords
- In-memory sessions
- Not for production use

Perfect for learning and development! 🎓






>>>>>>> 855b85887c1b5502b7ae3c8a5a50561dfbe34d77
