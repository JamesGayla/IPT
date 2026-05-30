# ParkFlow Mobile - Build & Deployment Guide

## Updates Completed
✅ Admin panel removed - User-only mobile app
✅ Dependencies installed and configured
✅ React version conflicts resolved
✅ API endpoints verified and configured

## Prerequisites for Building Android

### Option 1: EAS Build (Recommended - Cloud-based)
1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo account:
   ```bash
   eas login
   ```

3. Build for Android:
   ```bash
   cd mobile
   eas build --platform android
   ```

### Option 2: Local Build (Android Studio Required)
1. Install Android Studio and configure SDK
2. Set ANDROID_HOME environment variable
3. Build locally:
   ```bash
   cd mobile
   npx expo run:android
   ```

## Development Setup

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure API URL
Create `.env` file in mobile directory:
```
EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:3001
```

Replace `YOUR_IP` with your computer's IP address.

### 3. Start Development Server
```bash
# Terminal 1 - Start Expo
cd mobile
npm start

# Terminal 2 - Start Backend (Node.js)
cd server
npm start

# Terminal 3 - Start Backend (Python) [Optional - for CCTV integration]
cd server
python main.py
```

## API Configuration

### Server Endpoints
- **Base URL**: `http://localhost:3001` (Node.js server)
- **Parking Status**: `GET /api/parking-lot`
- **Toggle Spot**: `POST /api/parking-lot/toggle/:spotNumber`
- **Login**: `POST /api/auth/login`
- **Logout**: `POST /api/auth/logout`

### Environment Setup for Android Device
For Android emulator or device:
- **Emulator**: API uses `http://10.0.2.2:3001` (special Android host)
- **Physical Device**: Update `.env` with your computer's IP: `http://192.168.x.x:3001`

## Testing the Mobile App

### Test Credentials (Backend provides these)
- Admin user removed ✓
- Users authenticate through local storage or API

### User Flows to Test
1. **Login/Register** → New user signup with email/password
2. **Dashboard** → View parking lot status in real-time
3. **Analytics** → View parking statistics
4. **Alerts** → View system notifications
5. **Profile** → Update user information
6. **Logout** → Secure session termination

## Running on Real Android Phone

### Step 1: Get Your Computer's IP
```powershell
ipconfig
```
Note the IPv4 address (e.g., 192.168.1.100)

### Step 2: Update .env
```
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3001
```

### Step 3: Start Expo Server
```bash
cd mobile
npm start
```

### Step 4: Install Expo Go App
- Android: Play Store - search "Expo Go"
- iOS: App Store - search "Expo Go"

### Step 5: Scan QR Code
- Open Expo Go app
- Tap "Scan QR Code"
- Scan the QR shown in terminal
- App loads on your phone

## Features Implemented

### User-Only Version ✓
- User authentication (email/password)
- Real-time parking lot status
- Parking spot occupancy visualization
- Analytics dashboard
- Profile management
- Activity history view
- Alert notifications

### Removed Features
- ❌ Admin panel
- ❌ Admin authentication
- ❌ System management controls

## Building for Production

### Android APK for Testing
```bash
cd mobile
eas build --platform android
```

### Android App Bundle for Play Store
```bash
cd mobile
eas build --platform android --app-variant release
```

## Troubleshooting

### Issue: "Unable to reach server"
**Solution**: 
- Check backend is running: `npm start` in server directory
- Verify IP address in .env matches your computer
- Ensure phone/computer on same WiFi

### Issue: "Permission denied"
**Solution**:
- Grant app permissions in Android settings
- Check asyncStorage permissions

### Issue: "Blank screen"
**Solution**:
- Check browser console for errors
- Verify API endpoints are responding
- Check network tab for failed requests

## Performance Optimization

- Real-time parking updates every 3 seconds
- Efficient state management with React hooks
- Optimized re-renders with useMemo/useCallback
- Async storage for offline support

## Mobile-Web Synchronization

The mobile app uses the same API endpoints as the web app:
- Both pull from `http://YOUR_IP:3001`
- Shared database for parking lot status
- Unified user authentication
- Real-time data synchronization

---

**Status**: ✅ Ready for Android Build
**Last Updated**: May 30, 2026
