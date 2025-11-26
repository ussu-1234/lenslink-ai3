<<<<<<< HEAD
@echo off
echo ========================================
echo Starting LensLink AI Server...
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Node.js installation...
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found!
echo.
echo Installing dependencies (if needed)...
call npm install

echo.
echo ========================================
echo Starting server on http://localhost:3000
echo ========================================
echo.
echo Keep this window open while using the site.
echo Press Ctrl+C to stop the server.
echo.

call npm start

pause





=======
@echo off
echo ========================================
echo Starting LensLink AI Server...
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Node.js installation...
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Node.js found!
echo.
echo Installing dependencies (if needed)...
call npm install

echo.
echo ========================================
echo Starting server on http://localhost:3000
echo ========================================
echo.
echo Keep this window open while using the site.
echo Press Ctrl+C to stop the server.
echo.

call npm start

pause





>>>>>>> 855b85887c1b5502b7ae3c8a5a50561dfbe34d77
