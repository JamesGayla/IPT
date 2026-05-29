@echo off
REM Quick setup script for IPT Mobile App
REM This script checks everything and starts the server

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   IPT Mobile App - Quick Setup
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo OK: Node.js is installed
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo.
    echo ERROR: Please run this script from c:\Users\W\Downloads\2\IPT\server
    pause
    exit /b 1
)

REM Show user's IP
echo.
echo [2/4] Your IP addresses:
echo.
for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /R "IPv4"') do (
    echo   %%A
)

echo.
echo IMPORTANT: Update mobile\.env with YOUR IPv4 address!
echo.
echo Example: 192.168.1.100 (the one from your WiFi adapter)
echo.

REM Start server
echo [3/4] Starting Node.js server on port 3001...
echo.
npm start

if errorlevel 1 (
    echo.
    echo ERROR: Failed to start server
    echo Make sure you ran: npm install
    pause
    exit /b 1
)
