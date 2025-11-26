<<<<<<< HEAD
# 🚀 LensLink AI - Server Startup Guide

## **Quick Start (For Returning Users)**

```bash
# Navigate to project directory
cd C:\Users\User\Downloads\Porject\lenslink-ai3

# Start the server
npm start

# Open in browser
# http://localhost:3000
```

**That's it!** Server should be running on port 3000.

---

## **First Time Setup**

If you haven't set up Node.js and the project yet, follow these steps:

### **Step 1: Install Node.js** (if not installed)

1. Download Node.js from: https://nodejs.org/
2. Run the installer (choose LTS version)
3. Restart your terminal/PowerShell after installation
4. Verify installation:
```bash
node -v
npm -v
```

### **Step 2: Install Project Dependencies**

```bash
# Navigate to project directory
cd C:\Users\User\Downloads\Porject\lenslink-ai3

# Install dependencies
npm install
```

This will install:
- `express` - Web server framework
- `express-session` - Session management

### **Step 3: Configure API Keys (optional)**

Power the AI search by setting these environment variables **before** running `npm start`:

```powershell
# PowerShell (current session only)
$env:GEMINI_API_KEY = "your_gemini_flash_api_key"
$env:SEARXNG_URL = "https://xng.quest.ac"  # optional override
```

Create `env.example` ➜ `.env` for reference (requires manual export or a loader such as `dotenv`).

### **Step 4: Start the Server**

```bash
npm start
```

You should see:
```
Server running on http://localhost:3000
```

---

## **Accessing the Site**

Once the server is running, open your browser and visit:

### **Main Pages:**
- **Home (Landing):** http://localhost:3000/
- **Register (First page for new users):** http://localhost:3000/register.html
- **Login:** http://localhost:3000/login.html
- **Browse Cameras:** http://localhost:3000/cameras.html
- **Favorites:** http://localhost:3000/favorites.html (requires login)
- **Profile:** http://localhost:3000/profile.html (requires login)
- **Admin Dashboard:** http://localhost:3000/admin.html (requires admin login)

### **Content Pages:**
- **About:** http://localhost:3000/about.html
- **Guides:** http://localhost:3000/guides.html
- **Contact:** http://localhost:3000/contact.html

---

## **Default Accounts**

### **Admin Account:**
```
Username: admin
Email: admin@lenslink.ai
Password: admin123
```

### **Regular User:**
```
Username: Karnkrit Us
Email: karnkritapi@gmail.com
Password: Zei5g2m9gYnxegU
```

**Or create your own account** by registering at: http://localhost:3000/register.html

---

## **Testing Features**

### **1. Test AI Chatbot:**
1. Go to http://localhost:3000/
2. In the chat, try:
   - "I need a budget camera for travel"
   - "Best professional camera for sports"
   - "Affordable beginner camera under $800"
3. Watch Ahri recommend cameras based on your needs!

### **2. Test AI Search (requires Gemini API key):**
1. On the home page, scroll to the **AI Camera Search** section
2. Try queries such as:
   - "Best mirrorless camera under $1500 for travel"
   - "Compare Sony a7 IV vs Canon R6 for hybrid shooting"
3. Review the AI summary and live web results powered by SearxNG

### **3. Test Camera Browse:**
1. Go to http://localhost:3000/cameras.html
2. Try filters (brand, price, sensor type, use case)
3. Use search bar to find specific cameras
4. Sort by price, rating, or newest
5. Click any camera for details

### **4. Test Comparison:**
1. On home page, compare two cameras
2. Click "Table View" to see side-by-side specs
3. Click "Export" to download as JSON or CSV

### **5. Test Favorites:**
1. Login or register
2. Browse cameras
3. Click heart icon (🤍) on any camera
4. Go to http://localhost:3000/favorites.html
5. See your saved cameras!

### **6. Test Admin Features:**
1. Login as admin (credentials above)
2. Go to http://localhost:3000/admin.html
3. View all users
4. Edit user roles
5. Manage accounts

---

## **Troubleshooting**

### **Problem: "npm is not recognized"**
**Solution:** Node.js not installed or PATH not updated
1. Install Node.js from https://nodejs.org/
2. Restart PowerShell/terminal
3. Try again

### **Problem: "Port 3000 already in use"**
**Solution:** Another process is using port 3000
```bash
# Windows: Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Then restart server
npm start
```

### **Problem: "Cannot find module 'express'"**
**Solution:** Dependencies not installed
```bash
npm install
```

### **Problem: "admin.html can't be reached"**
**Solution:** Server not running
1. Make sure you ran `npm start`
2. Check terminal for "Server running" message
3. Try accessing http://localhost:3000/ first

### **Problem: "Favorites not saving"**
**Solution:** Not logged in
1. Click "Login" or "Register" in navigation
2. Create/login to account
3. Try favoriting again

---

## **Stopping the Server**

To stop the server:
- Press `Ctrl + C` in the terminal where server is running
- Or close the terminal window

---

## **File Locations**

### **Important Files:**
- **Server:** `server.js`
- **Camera Data:** `cameras.json` (32 cameras)
- **User Data:** `users.json` (accounts & favorites)
- **HTML Pages:** Root directory (*.html)
- **JavaScript Modules:** `public/js/`
- **CSS:** `public/css/`

### **Documentation:**
- `README.md` - Full project documentation
- `QUICKSTART.md` - Quick start guide
- `PRIORITY1_COMPLETE.md` - Priority 1 features summary
- `PRIORITY2_COMPLETE.md` - Priority 2 features summary
- `COMPLETE_FEATURES_SUMMARY.md` - All features overview
- `START_SERVER_GUIDE.md` - This file

---

## **Development Workflow**

### **Making Changes:**

1. **Edit HTML/CSS/JS files**
   - Changes to `.html` files: Refresh browser
   - Changes to `.css` files: Refresh browser
   - Changes to `public/js/*.js`: Refresh browser

2. **Edit server.js or data files**
   - Stop server (`Ctrl + C`)
   - Restart server (`npm start`)
   - Refresh browser

### **Adding New Cameras:**
1. Open `cameras.json`
2. Add new camera object following the existing format
3. Restart server
4. Refresh browser

### **Managing Users:**
- **Option 1:** Use admin dashboard (http://localhost:3000/admin.html)
- **Option 2:** Edit `users.json` directly (requires server restart)

---

## **Port Configuration**

Default port: **3000**

To change port, edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your preferred port
```

Then restart server.

---

## **Features Summary**

### **✅ What Works:**
- AI chatbot with natural language understanding
- 32 camera database with detailed specs
- Advanced filtering & search
- Side-by-side comparison (card & table views)
- Export comparisons (JSON/CSV)
- User registration & login
- Favorites system
- User profiles
- Admin dashboard
- 6 educational guides
- Contact form
- Responsive design
- Loading animations
- Error handling (404 page)

### **🔐 Authentication Required:**
- Favorites
- Profile page
- Admin dashboard (admin role required)

### **🌐 Public Pages:**
- Home
- Browse cameras
- Camera details
- About
- Guides
- Contact
- Register
- Login

---

## **Quick Commands Reference**

```bash
# Start server
npm start

# Install dependencies
npm install

# Check Node version
node -v

# Check npm version
npm -v

# Navigate to project
cd C:\Users\User\Downloads\Porject\lenslink-ai3
```

---

## **Support**

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify Node.js is installed (`node -v`)
3. Ensure dependencies are installed (`npm install`)
4. Make sure port 3000 is available
5. Check terminal for error messages

---

## **Next Steps**

1. ✅ Start server (`npm start`)
2. ✅ Visit http://localhost:3000/
3. ✅ Register an account
4. ✅ Chat with Ahri
5. ✅ Browse cameras
6. ✅ Save favorites
7. ✅ Compare cameras
8. ✅ Read guides
9. ✅ Explore admin features (if admin)

---

**🎉 Enjoy using LensLink AI!**

Your intelligent camera recommendation platform is ready to use. Whether you're a beginner looking for your first camera or a pro upgrading gear, LensLink AI has you covered! 📸







=======
# 🚀 LensLink AI - Server Startup Guide

## **Quick Start (For Returning Users)**

```bash
# Navigate to project directory
cd C:\Users\User\Downloads\Porject\lenslink-ai3

# Start the server
npm start

# Open in browser
# http://localhost:3000
```

**That's it!** Server should be running on port 3000.

---

## **First Time Setup**

If you haven't set up Node.js and the project yet, follow these steps:

### **Step 1: Install Node.js** (if not installed)

1. Download Node.js from: https://nodejs.org/
2. Run the installer (choose LTS version)
3. Restart your terminal/PowerShell after installation
4. Verify installation:
```bash
node -v
npm -v
```

### **Step 2: Install Project Dependencies**

```bash
# Navigate to project directory
cd C:\Users\User\Downloads\Porject\lenslink-ai3

# Install dependencies
npm install
```

This will install:
- `express` - Web server framework
- `express-session` - Session management

### **Step 3: Configure API Keys (optional)**

Power the AI search by setting these environment variables **before** running `npm start`:

```powershell
# PowerShell (current session only)
$env:GEMINI_API_KEY = "your_gemini_flash_api_key"
$env:SEARXNG_URL = "https://xng.quest.ac"  # optional override
```

Create `env.example` ➜ `.env` for reference (requires manual export or a loader such as `dotenv`).

### **Step 4: Start the Server**

```bash
npm start
```

You should see:
```
Server running on http://localhost:3000
```

---

## **Accessing the Site**

Once the server is running, open your browser and visit:

### **Main Pages:**
- **Home (Landing):** http://localhost:3000/
- **Register (First page for new users):** http://localhost:3000/register.html
- **Login:** http://localhost:3000/login.html
- **Browse Cameras:** http://localhost:3000/cameras.html
- **Favorites:** http://localhost:3000/favorites.html (requires login)
- **Profile:** http://localhost:3000/profile.html (requires login)
- **Admin Dashboard:** http://localhost:3000/admin.html (requires admin login)

### **Content Pages:**
- **About:** http://localhost:3000/about.html
- **Guides:** http://localhost:3000/guides.html
- **Contact:** http://localhost:3000/contact.html

---

## **Default Accounts**

### **Admin Account:**
```
Username: admin
Email: admin@lenslink.ai
Password: admin123
```

### **Regular User:**
```
Username: Karnkrit Us
Email: karnkritapi@gmail.com
Password: Zei5g2m9gYnxegU
```

**Or create your own account** by registering at: http://localhost:3000/register.html

---

## **Testing Features**

### **1. Test AI Chatbot:**
1. Go to http://localhost:3000/
2. In the chat, try:
   - "I need a budget camera for travel"
   - "Best professional camera for sports"
   - "Affordable beginner camera under $800"
3. Watch Ahri recommend cameras based on your needs!

### **2. Test AI Search (requires Gemini API key):**
1. On the home page, scroll to the **AI Camera Search** section
2. Try queries such as:
   - "Best mirrorless camera under $1500 for travel"
   - "Compare Sony a7 IV vs Canon R6 for hybrid shooting"
3. Review the AI summary and live web results powered by SearxNG

### **3. Test Camera Browse:**
1. Go to http://localhost:3000/cameras.html
2. Try filters (brand, price, sensor type, use case)
3. Use search bar to find specific cameras
4. Sort by price, rating, or newest
5. Click any camera for details

### **4. Test Comparison:**
1. On home page, compare two cameras
2. Click "Table View" to see side-by-side specs
3. Click "Export" to download as JSON or CSV

### **5. Test Favorites:**
1. Login or register
2. Browse cameras
3. Click heart icon (🤍) on any camera
4. Go to http://localhost:3000/favorites.html
5. See your saved cameras!

### **6. Test Admin Features:**
1. Login as admin (credentials above)
2. Go to http://localhost:3000/admin.html
3. View all users
4. Edit user roles
5. Manage accounts

---

## **Troubleshooting**

### **Problem: "npm is not recognized"**
**Solution:** Node.js not installed or PATH not updated
1. Install Node.js from https://nodejs.org/
2. Restart PowerShell/terminal
3. Try again

### **Problem: "Port 3000 already in use"**
**Solution:** Another process is using port 3000
```bash
# Windows: Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# Then restart server
npm start
```

### **Problem: "Cannot find module 'express'"**
**Solution:** Dependencies not installed
```bash
npm install
```

### **Problem: "admin.html can't be reached"**
**Solution:** Server not running
1. Make sure you ran `npm start`
2. Check terminal for "Server running" message
3. Try accessing http://localhost:3000/ first

### **Problem: "Favorites not saving"**
**Solution:** Not logged in
1. Click "Login" or "Register" in navigation
2. Create/login to account
3. Try favoriting again

---

## **Stopping the Server**

To stop the server:
- Press `Ctrl + C` in the terminal where server is running
- Or close the terminal window

---

## **File Locations**

### **Important Files:**
- **Server:** `server.js`
- **Camera Data:** `cameras.json` (32 cameras)
- **User Data:** `users.json` (accounts & favorites)
- **HTML Pages:** Root directory (*.html)
- **JavaScript Modules:** `public/js/`
- **CSS:** `public/css/`

### **Documentation:**
- `README.md` - Full project documentation
- `QUICKSTART.md` - Quick start guide
- `PRIORITY1_COMPLETE.md` - Priority 1 features summary
- `PRIORITY2_COMPLETE.md` - Priority 2 features summary
- `COMPLETE_FEATURES_SUMMARY.md` - All features overview
- `START_SERVER_GUIDE.md` - This file

---

## **Development Workflow**

### **Making Changes:**

1. **Edit HTML/CSS/JS files**
   - Changes to `.html` files: Refresh browser
   - Changes to `.css` files: Refresh browser
   - Changes to `public/js/*.js`: Refresh browser

2. **Edit server.js or data files**
   - Stop server (`Ctrl + C`)
   - Restart server (`npm start`)
   - Refresh browser

### **Adding New Cameras:**
1. Open `cameras.json`
2. Add new camera object following the existing format
3. Restart server
4. Refresh browser

### **Managing Users:**
- **Option 1:** Use admin dashboard (http://localhost:3000/admin.html)
- **Option 2:** Edit `users.json` directly (requires server restart)

---

## **Port Configuration**

Default port: **3000**

To change port, edit `server.js`:
```javascript
const PORT = process.env.PORT || 3000; // Change 3000 to your preferred port
```

Then restart server.

---

## **Features Summary**

### **✅ What Works:**
- AI chatbot with natural language understanding
- 32 camera database with detailed specs
- Advanced filtering & search
- Side-by-side comparison (card & table views)
- Export comparisons (JSON/CSV)
- User registration & login
- Favorites system
- User profiles
- Admin dashboard
- 6 educational guides
- Contact form
- Responsive design
- Loading animations
- Error handling (404 page)

### **🔐 Authentication Required:**
- Favorites
- Profile page
- Admin dashboard (admin role required)

### **🌐 Public Pages:**
- Home
- Browse cameras
- Camera details
- About
- Guides
- Contact
- Register
- Login

---

## **Quick Commands Reference**

```bash
# Start server
npm start

# Install dependencies
npm install

# Check Node version
node -v

# Check npm version
npm -v

# Navigate to project
cd C:\Users\User\Downloads\Porject\lenslink-ai3
```

---

## **Support**

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify Node.js is installed (`node -v`)
3. Ensure dependencies are installed (`npm install`)
4. Make sure port 3000 is available
5. Check terminal for error messages

---

## **Next Steps**

1. ✅ Start server (`npm start`)
2. ✅ Visit http://localhost:3000/
3. ✅ Register an account
4. ✅ Chat with Ahri
5. ✅ Browse cameras
6. ✅ Save favorites
7. ✅ Compare cameras
8. ✅ Read guides
9. ✅ Explore admin features (if admin)

---

**🎉 Enjoy using LensLink AI!**

Your intelligent camera recommendation platform is ready to use. Whether you're a beginner looking for your first camera or a pro upgrading gear, LensLink AI has you covered! 📸







>>>>>>> 855b85887c1b5502b7ae3c8a5a50561dfbe34d77
