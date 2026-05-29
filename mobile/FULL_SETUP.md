# Mobile App Setup - Full Server Integration

## What's New
The mobile app now has full integration with your backend servers:

✅ **Dashboard** - Real-time parking lot status with live polling (3s updates)
✅ **Camera** - Capture photos from your device camera
✅ **Alerts** - View and dismiss system alerts in real-time
✅ **Activity History** - See all system activities and user actions
✅ **Profile** - View your account information

## Configuration

### Step 1: Update .env File
Edit `mobile/.env` and replace the IP addresses with your computer's IP:

```
EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:5000
EXPO_PUBLIC_DATA_API_BASE_URL=http://YOUR_IP:3001
```

Get your IP with `ipconfig` in PowerShell (look for IPv4 Address)

Example:
```
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:5000
EXPO_PUBLIC_DATA_API_BASE_URL=http://192.168.1.100:3001
```

### Step 2: Ensure Servers Are Running

**Python API Server (Port 5000)** - for authentication:
```powershell
cd c:\Users\W\Downloads\2\IPT\api
python main.py
```

**Node.js Data Server (Port 3001)** - for parking/alerts/activity:
```powershell
cd c:\Users\W\Downloads\2\IPT\server
npm start
# or
node index.js
```

### Step 3: Start Mobile Dev Server

```powershell
cd c:\Users\W\Downloads\2\IPT\mobile
npm start -- -c
```

Scan the QR code with Expo Go on your phone.

## Features by Tab

### 1. Dashboard Tab
- **Real-time parking status** - Updates every 3 seconds
- **Occupancy bar** - Visual representation of lot capacity
- **Stat cards** - Total, occupied, and available spots
- **Parking grid** - Tap spots to toggle occupancy (if admin)
- **Refresh button** - Manual data refresh

**APIs Used:**
- `GET /api/parking-lot` - Fetch parking status
- `POST /api/parking-lot/toggle/{spotNumber}` - Toggle spot status

### 2. Camera Tab
- **Device camera access** - Uses your phone's native camera
- **Photo capture** - Take snapshots of parking areas
- **Fallback images** - Shows mock image if camera unavailable

**APIs Used:** None (native device camera)

### 3. Alerts Tab
- **Real-time notifications** - Updates every 3 seconds
- **Severity color coding** - Critical (red), Warning (yellow), Info (blue)
- **Dismiss alerts** - Remove individual alerts
- **Pull to refresh** - Swipe down to manual refresh

**APIs Used:**
- `GET /api/alerts` - Fetch all alerts
- `DELETE /api/alerts/{alertId}` - Dismiss alert

### 4. Activity History Tab
- **Activity timeline** - All system events in chronological order
- **Timestamps** - Exact time of each action
- **Activity details** - What happened and when
- **Pull to refresh** - Swipe down for manual update

**APIs Used:**
- `GET /api/activity-history` - Fetch activity log

### 5. Profile Tab
- **User information** - Email, username, role
- **Logout button** - Securely logout

**APIs Used:**
- `POST /api/auth/logout` - Logout user

## API Endpoints

### Authentication (Port 5000)
```
POST /api/login - User login (email + password)
POST /api/auth/logout - User logout
```

### Parking Data (Port 3001)
```
GET /api/parking-lot - Get parking status
POST /api/parking-lot/toggle/{spotNumber} - Toggle spot occupancy
GET /api/alerts - Get all alerts
DELETE /api/alerts/{alertId} - Dismiss alert
GET /api/activity-history - Get activity log
GET /api/stats - Get system statistics
GET /api/health - Health check
```

## Troubleshooting

### "Unable to reach server"
- Check that both servers are running
- Verify IP address in `.env` matches your computer
- Both phone and computer must be on same WiFi
- Try pinging your computer from your phone

### Endpoints not working
- Ensure you updated `.env` with correct IP
- Run `npm start -- -c` to force reload with cache cleared
- Check server console for errors

### Real-time updates not working
- Make sure your phone has stable internet connection
- Dashboard and Alerts auto-update every 3 seconds
- Use pull-to-refresh (swipe down) to manually update

## Development Tips

### Hot Reload
- Save any file and it auto-reloads on your phone
- Press `r` in terminal to force reload
- Press `m` to toggle menu

### Debugging
- Check phone for error messages
- View dev console: press `m` → Debug remote JS
- Check terminal output for server errors

## File Structure

```
mobile/
├── .env (Configuration with IP addresses)
├── services/
│   └── api.js (Centralized API service)
├── screens/
│   ├── Login.jsx
│   ├── Dashboard.jsx ⭐ NEW - Real-time parking status
│   ├── Camera.jsx
│   ├── Alerts.jsx
│   ├── ActivityHistory.jsx
│   └── Profile.jsx
└── MobileApp.jsx (5 tabs: Dashboard, Camera, Alerts, History, Profile)
```

## Key Architecture

**Before:**
- Mobile had scattered hardcoded IP addresses
- Limited screens (only camera and profile)
- No real-time updates

**After:**
- Centralized API service (`services/api.js`)
- All servers use environment variables
- Real-time polling like web app (3s updates)
- Full feature parity with web dashboard
- All APIs properly connected

## Web vs Mobile Feature Comparison

| Feature | Web | Mobile |
|---------|-----|--------|
| Dashboard | ✅ | ✅ NEW |
| Parking grid | ✅ | ✅ NEW |
| Alerts | ✅ | ✅ |
| Activity history | ✅ | ✅ |
| Camera | ✅ (stream) | ✅ (capture) |
| Profile | ✅ | ✅ |
| Real-time (3s) | ✅ | ✅ NEW |
| Admin interface | ✅ | (mobile-first design) |

---

**Everything is now connected! Your mobile app mirrors the web dashboard with real-time updates from your backend servers.**
