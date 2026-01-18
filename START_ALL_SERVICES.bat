@echo off
echo ========================================
echo    GO TRACKER - Starting All Services
echo ========================================
echo.

echo Starting MongoDB...
net start MongoDB
echo.

echo Starting Backend API (Port 5000)...
start "Backend API" cmd /k "cd /d %~dp0backend && npm run dev"
timeout /t 3 /nobreak >nul

echo Starting Frontend (Port 8080)...
start "Frontend" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 3 /nobreak >nul

echo Starting Python Scraper...
start "Python Scraper" cmd /k "cd /d %~dp0scraper && python production_scheduler.py"
timeout /t 3 /nobreak >nul

echo Starting Scraper API (Port 5001)...
start "Scraper API" cmd /k "cd /d %~dp0scraper && node api_server.js"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo    All Services Started Successfully!
echo ========================================
echo.
echo Access Points:
echo - Frontend:     http://localhost:8080
echo - Backend API:  http://localhost:5000
echo - Scraper API:  http://localhost:5001
echo - Health Check: http://localhost:5000/health
echo.
echo Login Credentials:
echo - Student: AADHAM SHARIEF A / 711523BCB001
echo - Staff:   Pandiyarajan / Mentor@123
echo - Admin:   admin@college.edu / admin123
echo.
echo Press any key to open the frontend...
pause >nul
start http://localhost:8080