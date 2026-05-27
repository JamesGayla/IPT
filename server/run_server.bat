@echo off
REM Parking Lot Manager - Complete Server Startup
REM Starts both the FastAPI backend and Vehicle Detector with real-time camera sync
REM The admin panel updates every 3 seconds with latest camera occupancy data

echo.
echo ========================================
echo Parking Lot Manager - Server Startup
echo ========================================
echo.
echo This will start:
echo   1. FastAPI Backend Server (port 3001)
echo   2. Vehicle Detector + MJPEG Stream (port 4747)
echo.
echo The admin panel CCTV monitoring will sync with camera
echo data every 3 seconds (as configured).
echo.

REM Check if Python and pip are available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/
    pause
    exit /b 1
)

REM Install/update dependencies
echo [1/3] Checking Python dependencies...
python -m pip install -q flask flask-cors opencv-python requests fastapi uvicorn pydantic 2>nul
if errorlevel 1 (
    echo [WARNING] Some dependencies may not be installed
    echo Attempting to install requirements.txt...
    pip install -r requirements.txt
)

echo [2/3] Starting FastAPI Backend Server on http://localhost:3001...
start "Parking Lot API (FastAPI)" python main.py

REM Wait for API to start
timeout /t 2 /nobreak

echo [3/3] Starting Vehicle Detector with Camera Streaming...
echo.
echo OPTIONS:
echo   - Local webcam (0)
echo   - Video file: use --source "path/to/video.mp4" --video-file
echo   - IP Camera: use --source "http://192.168.1.100:8080/video"
echo.
echo Using: Camera index 0 (change below if needed)
echo.

REM Start vehicle detector
REM Change the --source parameter below for your camera:
REM   0 = local webcam
REM   "path/to/video.mp4" with --video-file flag = video file
REM   "http://ip:port/video" = IP camera/MJPEG stream
start "Vehicle Detector + MJPEG Stream" python vehicle_detector.py --source 0 --backend-url http://localhost:3001

echo.
echo ========================================
echo Servers Starting...
echo ========================================
echo.
echo Backend API: http://localhost:3001
echo Camera Stream: http://127.0.0.1:4747/video
echo Admin Panel: http://localhost:5173/admin
echo.
echo CCTV Monitoring Sync:
echo   - Updates every 3 seconds
echo   - Shows camera detection confidence
echo   - Real-time occupancy status
echo.
echo Press any key when ready, or close this window to stop servers...
echo.
pause