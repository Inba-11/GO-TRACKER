# Go Tracker - Start All Services (PowerShell)
# This script starts MongoDB, Backend, Frontend, and Python Scheduler

Write-Host ""
Write-Host "========================================"
Write-Host "  GO TRACKER - SYSTEM STARTUP"
Write-Host "========================================"
Write-Host ""

# Check if MongoDB is running
Write-Host "Checking MongoDB..."
try {
    mongosh --eval "db.adminCommand('ping')" 2>$null | Out-Null
    Write-Host "✅ MongoDB is running"
} catch {
    Write-Host ""
    Write-Host "WARNING: MongoDB is not running!"
    Write-Host "Please start MongoDB first:"
    Write-Host "  mongod"
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Start Backend
Write-Host ""
Write-Host "Starting Backend API (Port 5000)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"
Start-Sleep -Seconds 3

# Start Frontend
Write-Host ""
Write-Host "Starting Frontend (Port 8084)..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Start-Sleep -Seconds 3

# Start Python Scheduler
Write-Host ""
Write-Host "Starting Python Scheduler..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd scraper; python production_scheduler.py"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "========================================"
Write-Host "  ✅ ALL SERVICES STARTED"
Write-Host "========================================"
Write-Host ""
Write-Host "Access Points:"
Write-Host "  Frontend:     http://localhost:8084"
Write-Host "  Admin:        http://localhost:8084/admin"
Write-Host "  Backend API:  http://localhost:5000"
Write-Host "  API Health:   http://localhost:5000/health"
Write-Host ""
Write-Host "Login Credentials:"
Write-Host "  Admin Email:    admin@college.edu"
Write-Host "  Admin Password: admin123"
Write-Host ""
Write-Host "Scheduler is running in background and will:"
Write-Host "  - Update LeetCode every 45 minutes"
Write-Host "  - Update CodeChef every 90 minutes"
Write-Host "  - Update Codeforces every 45 minutes"
Write-Host "  - Update GitHub every 30 minutes"
Write-Host "  - Update Codolio every 4 hours"
Write-Host "  - Full refresh daily at 2 AM"
Write-Host ""
Write-Host "To stop all services, close all terminal windows."
Write-Host ""
Read-Host "Press Enter to continue"
