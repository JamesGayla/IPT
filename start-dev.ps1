#!/usr/bin/env powershell
# ParkFlow Mobile - Quick Start Script (Windows PowerShell)

Write-Host @"
╔════════════════════════════════════════════════════════════╗
║          ParkFlow Mobile - Quick Start                     ║
║          User-Only Version (Admin Removed)                ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host ""
Write-Host "Step 1: Starting Backend Server..." -ForegroundColor Yellow
Push-Location server
Start-Job -ScriptBlock { npm start } -Name "BackendServer" | Out-Null
Write-Host "✓ Backend started (Port 3001)" -ForegroundColor Green
Start-Sleep -Seconds 2

Pop-Location
Push-Location mobile

Write-Host ""
Write-Host "Step 2: Configuring Frontend..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "⚠️  Created .env file from template" -ForegroundColor Yellow
    Write-Host "    UPDATE .env with your computer IP address:" -ForegroundColor Yellow
    Write-Host "    Get IP: ipconfig (look for IPv4)" -ForegroundColor Yellow
    Write-Host "    Edit .env: EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:3001" -ForegroundColor Yellow
}
Write-Host "✓ Frontend configured" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Starting Expo Development Server..." -ForegroundColor Yellow
Write-Host ""
npm start

Pop-Location
