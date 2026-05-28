# ParkFlow - Start All Servers
# This script starts the Backend API, Frontend Dev Server, and Vehicle Detector in separate terminal windows

# Start Backend API (Port 3001)
Start-Process powershell -ArgumentList "-NoExit -Command { cd '$PSScriptRoot'; & .\.venv\Scripts\Activate.ps1; cd server; python main.py }"

# Start Frontend Dev Server (Port 5173)
Start-Process powershell -ArgumentList "-NoExit -Command { cd '$PSScriptRoot'; npm run dev }"

# Start Vehicle Detector + MJPEG Streaming (Port 4747)
Start-Process powershell -ArgumentList "-NoExit -Command { cd '$PSScriptRoot'; & .\.venv\Scripts\Activate.ps1; cd server; python vehicle_detector.py --source 'http://172.20.10.2:4747/video' --backend-url http://localhost:3001 }"

# Display startup info
Write-Host "========================================" -ForegroundColor Green
Write-Host "All 3 ParkFlow servers started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend API: http://localhost:3001" -ForegroundColor Yellow
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Streaming: http://localhost:4747/video" -ForegroundColor Yellow
Write-Host ""
