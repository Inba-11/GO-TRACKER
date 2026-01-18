@echo off
REM Go Tracker - Simple Start Script
REM Starts Backend and Frontend in separate windows

echo.
echo ========================================
echo   GO TRACKER - STARTING SERVICES
echo ========================================
echo.

REM Check if MongoDB is running
echo Checking MongoDB...
mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  WARNING: MongoDB is not running!
    echo Please start MongoDB first:
    echo   net start MongoDB
    echo.
    pause
    exit /b 1
)
echo ✅ MongoDB is running
echo.

REM Start Backend
echo Starting Backend API (Port 5000)...
start "Go Tracker Backend" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo Starting Frontend (Port 8084)...
start "Go Tracker Frontend" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   ✅ SERVICES STARTED
echo ========================================
echo.
echo Access Points:
echo   Frontend:     http://localhost:8084
echo   Backend API:  http://localhost:5000
echo   API Health:   http://localhost:5000/health
echo.
echo Note: Python scraper runs automatically when you click refresh button
echo.
echo To stop services, close the terminal windows.
echo.
pause
