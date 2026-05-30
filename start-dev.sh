#!/usr/bin/env bash
# ParkFlow Mobile - Quick Start Script

echo "╔════════════════════════════════════════════════════════════╗"
echo "║          ParkFlow Mobile - Quick Start                     ║"
echo "║          User-Only Version (Admin Removed)                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Start Backend
echo "Step 1: Starting Backend Server..."
cd server
npm start &
SERVER_PID=$!
echo "✓ Backend started (PID: $SERVER_PID)"
sleep 2

# Step 2: Configure Frontend
cd ../mobile
echo ""
echo "Step 2: Configuring Frontend..."
if [ ! -f .env ]; then
    echo "Creating .env from template..."
    cp .env.example .env
    echo "⚠️  Update .env with your computer IP address:"
    echo "   Get IP: ipconfig (Windows) or ifconfig (Mac/Linux)"
    echo "   Edit .env and set: EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:3001"
fi
echo "✓ Frontend configured"

# Step 3: Start Expo
echo ""
echo "Step 3: Starting Expo Development Server..."
echo "npm start"
npm start

# Cleanup on exit
trap "kill $SERVER_PID" EXIT
