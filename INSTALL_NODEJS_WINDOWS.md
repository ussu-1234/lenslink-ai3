# How to Install Node.js and Run LensLink AI on Windows

## 🚨 Node.js is Not Installed

Your system doesn't have Node.js installed yet. Follow these steps to get everything running.

---

## Step 1: Download Node.js

1. Open your web browser
2. Go to: **https://nodejs.org/**
3. You'll see two download buttons:
   - **LTS (Recommended for Most Users)** ← Click this one
   - Current (Latest Features)

4. Click the **LTS** button to download the Windows installer
5. The file will be named something like: `node-v20.x.x-x64.msi`

---

## Step 2: Install Node.js

1. Locate the downloaded `.msi` file (usually in your Downloads folder)
2. **Double-click** the installer file
3. Follow the installation wizard:
   - Click **Next**
   - Accept the license agreement
   - Keep the default installation location
   - ✅ Make sure "Automatically install necessary tools" is **checked**
   - Click **Next** → **Next** → **Install**
   - Wait for installation to complete (2-3 minutes)
   - Click **Finish**

---

## Step 3: Verify Installation

1. **Close ALL existing PowerShell/Command Prompt windows**
2. Open a **NEW PowerShell** window:
   - Press `Windows Key + X`
   - Select "Windows PowerShell" or "Terminal"

3. Type these commands to verify:
   ```powershell
   node -v
   ```
   You should see: `v20.x.x` or similar

   ```powershell
   npm -v
   ```
   You should see: `10.x.x` or similar

If you see version numbers, **Node.js is installed successfully!** ✅

---

## Step 4: Navigate to Your Project

In PowerShell, navigate to your project folder:

```powershell
cd "C:\Users\User\Downloads\Porject\lenslink-ai3"
```

---

## Step 5: Install Dependencies

Install the required packages (express and express-session):

```powershell
npm install
```

You should see:
```
added 57 packages, and audited 58 packages in 3s
```

---

## Step 6: Start the Server

Run the server:

```powershell
npm start
```

You should see:
```
Successfully loaded and indexed 7 cameras.
Successfully loaded 1 users.
Server is running successfully on http://localhost:3000
LensLink AI back-end is active!
```

---

## Step 7: Open in Browser

1. Open your web browser (Chrome, Firefox, Edge)
2. Go to: **http://localhost:3000**
3. You should see the LensLink AI homepage! 🎉

---

## 🎮 Quick Reference Commands

### Start the Server
```powershell
npm start
```

### Stop the Server
Press `Ctrl + C` in the PowerShell window

### Restart the Server
1. Stop it with `Ctrl + C`
2. Start again with `npm start`

---

## 🔐 Test Login

After the server is running:

1. Go to: http://localhost:3000
2. Click **Login** in the navigation
3. Use these credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
4. You'll be logged in as admin!

---

## ❓ Troubleshooting

### Problem: "npm is not recognized" after installation

**Solution:**
1. **Restart your computer**
2. Node.js needs to update your PATH environment variable
3. After restart, open a fresh PowerShell window and try again

---

### Problem: Port 3000 is already in use

**Error message:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace <PID> with the number you see)
taskkill /PID <PID> /F
```

---

### Problem: "Cannot find module 'express'"

**Solution:**
```powershell
# Make sure you're in the right directory
cd "C:\Users\User\Downloads\Porject\lenslink-ai3"

# Install dependencies
npm install
```

---

### Problem: Server starts but browser shows "Cannot connect"

**Solution:**
- Make sure the server is still running (check PowerShell window)
- Try: http://localhost:3000 (not https)
- Check Windows Firewall isn't blocking Node.js

---

## 🎯 Complete Setup Process (Summary)

```
1. Download Node.js from nodejs.org (LTS version)
   ↓
2. Install Node.js (close PowerShell after)
   ↓
3. Open NEW PowerShell window
   ↓
4. Navigate to project: cd "C:\Users\User\Downloads\Porject\lenslink-ai3"
   ↓
5. Install dependencies: npm install
   ↓
6. Start server: npm start
   ↓
7. Open browser: http://localhost:3000
   ↓
8. 🎉 Enjoy LensLink AI!
```

---

## 📝 Notes

- **Keep PowerShell window open** while using the website
- The server runs locally on your computer
- No internet connection needed after setup
- Sessions are lost when you stop the server
- Default admin password: `admin123` (change it after first login!)

---

## 🆘 Need More Help?

If you're stuck:

1. **Check Node.js version**: Make sure you downloaded the Windows version
2. **Check installation path**: Node.js should install to `C:\Program Files\nodejs\`
3. **Check PATH**: Node.js should be in your system PATH (happens automatically)
4. **Restart**: Sometimes Windows needs a restart for PATH changes to take effect

---

## ✅ What You'll Have After Setup

- ✅ Node.js installed on your computer
- ✅ LensLink AI running locally
- ✅ Access to all features:
  - Camera comparison tool
  - AI chatbot assistant
  - User registration
  - User login
  - Admin dashboard
- ✅ Full control of your development environment

---

## 🚀 Ready?

Follow the steps above, and you'll have LensLink AI running in about **10 minutes**!

**Start here:** https://nodejs.org/ → Download LTS version

Good luck! 🎉






