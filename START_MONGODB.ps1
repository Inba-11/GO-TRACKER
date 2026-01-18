# MongoDB Startup Script
# Run this as Administrator

Write-Host ""
Write-Host "========================================"
Write-Host "  MONGODB SERVICE MANAGER"
Write-Host "========================================"
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  This script requires Administrator privileges!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or use these commands manually:" -ForegroundColor Cyan
    Write-Host "  Check Status: sc query MongoDB" -ForegroundColor Gray
    Write-Host "  Start:        net start MongoDB" -ForegroundColor Gray
    Write-Host "  Stop:         net stop MongoDB" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check MongoDB service status
Write-Host "Checking MongoDB service status..." -ForegroundColor Cyan
$service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

if ($null -eq $service) {
    Write-Host "❌ MongoDB service not found!" -ForegroundColor Red
    Write-Host "   Please install MongoDB first." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Service Name: $($service.Name)" -ForegroundColor Green
Write-Host "Display Name: $($service.DisplayName)" -ForegroundColor Green
Write-Host "Status:       $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') { 'Green' } else { 'Yellow' })
Write-Host ""

if ($service.Status -eq 'Running') {
    Write-Host "✅ MongoDB is already running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To stop MongoDB, run:" -ForegroundColor Cyan
    Write-Host "  net stop MongoDB" -ForegroundColor Gray
} else {
    Write-Host "🔄 Starting MongoDB..." -ForegroundColor Cyan
    try {
        Start-Service -Name "MongoDB"
        Start-Sleep -Seconds 2
        $service.Refresh()
        
        if ($service.Status -eq 'Running') {
            Write-Host ""
            Write-Host "✅ MongoDB started successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "MongoDB is now running on:" -ForegroundColor Cyan
            Write-Host "  Connection: mongodb://localhost:27017" -ForegroundColor Gray
            Write-Host "  Database:   go-tracker" -ForegroundColor Gray
        } else {
            Write-Host ""
            Write-Host "⚠️  MongoDB failed to start. Status: $($service.Status)" -ForegroundColor Yellow
            Write-Host "   Check MongoDB logs for details." -ForegroundColor Yellow
        }
    } catch {
        Write-Host ""
        Write-Host "❌ Error starting MongoDB: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Try starting manually:" -ForegroundColor Cyan
        Write-Host "  net start MongoDB" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host ""
Read-Host "Press Enter to exit"

