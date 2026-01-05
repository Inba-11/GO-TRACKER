@echo off
REM Go Tracker - Start All Services
REM This script starts MongoDB, Backend, Frontend, and Python Scheduler

echo.
echo ========================================
echo   GO TRACKER - SYSTEM STARTUP
echo ========================================
echo.

REM Check if MongoDB is running
echo Checking MongoDB...
mongosh --eval "db.adminCommand('ping')" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo WARNING: MongoDB is not running!
    echo Please start MongoDB first:
    echo   mongod
    echo.
    pause
    exit /b 1
)
echo ✅ MongoDB is running

REM Start Backend
echo.
echo Starting Backend API (Port 5000)...
start cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak

REM Start Frontend
echo.
echo Starting Frontend (Port 8084)...
start cmd /k "npm run dev"
timeout /t 3 /nobreak

REM Start Python Scheduler
echo.
echo Starting Python Scheduler...
start cmd /k "cd scraper && python production_scheduler.py"
timeout /t 3 /nobreak

echo.
echo ========================================
echo   ✅ ALL SERVICES STARTED
echo ========================================
echo.
echo Access Points:
echo   Frontend:     http://localhost:8084
echo   Admin:        http://localhost:8084/admin
echo   Backend API:  http://localhost:5000
echo   API Health:   http://localhost:5000/health
echo.
echo Login Credentials:
echo   Admin Email:    admin@college.edu
echo   Admin Password: admin123
echo.
echo Scheduler is running in background and will:
echo   - Update LeetCode every 45 minutes
echo   - Update CodeChef every 90 minutes
echo   - Update Codeforces every 45 minutes
echo   - Update GitHub every 30 minutes
echo   - Update Codolio every 4 hours
echo   - Full refresh daily at 2 AM
echo.
echo To stop all services, close all terminal windows.
echo.
pause
