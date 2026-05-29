# Mobile App Quick Start

## What Was Fixed

✅ **Converted all screens from Web to React Native**
- Login.jsx - Now uses TextInput, TouchableOpacity instead of HTML form elements
- Camera.jsx - Already using React Native components correctly
- Profile.jsx - Converted from HTML divs to React Native Views
- ActivityHistory.jsx - Removed CSS imports, added React Native styles
- Alerts.jsx - Removed CSS imports, added React Native styles

✅ **Removed CSS imports** - React Native doesn't support CSS
✅ **Updated API URLs** - Changed from localhost to 192.168.1.100 (update to your IP!)
✅ **Fixed component imports** - Profile screen now properly imported and used
✅ **Removed Vite config** - Mobile uses Expo, not Vite

## Get Started in 2 Minutes

### 1. Update your IP address
Edit `mobile/screens/Login.jsx` line 21:
```javascript
const response = await fetch('http://YOUR_IP:5000/api/login', {
```

Replace `YOUR_IP` with your computer's IP (e.g., 192.168.1.100)

### 2. Install & start
```powershell
cd mobile
npm install
npm start
```

### 3. Open on your phone
- Install **Expo Go** app on your phone
- Scan the QR code from terminal
- Done! App loads on your phone

## Key Files Modified

- `mobile/screens/Login.jsx` - Full React Native rewrite
- `mobile/screens/Profile.jsx` - Converted to React Native
- `mobile/screens/ActivityHistory.jsx` - Converted to React Native  
- `mobile/screens/Alerts.jsx` - Converted to React Native
- `mobile/MobileApp.jsx` - Added Profile component import
- `mobile/SETUP_PHONE.md` - Detailed setup guide

## For Debugging

Check terminal output - it shows detailed errors. Most common issues:
1. **Can't connect to backend**: Update IP address in Login.jsx
2. **"SDK version not installed"**: Let Expo install it automatically
3. **Blank screen**: Press `r` in terminal to reload

## File Structure Now

```
mobile/
├── app.json (Expo config - DO NOT EDIT unless needed)
├── babel.config.js (Babel presets)
├── package.json (Dependencies)
├── main.jsx (Entry point)
├── MobileApp.jsx (Main app component)
├── SETUP_PHONE.md (Detailed guide)
├── screens/
│   ├── Login.jsx ✅ FIXED
│   ├── Camera.jsx ✅ ALREADY GOOD
│   ├── Profile.jsx ✅ FIXED
│   ├── ActivityHistory.jsx ✅ FIXED
│   └── Alerts.jsx ✅ FIXED
└── styles/ (CSS files - NOT USED by mobile)
```

## What You Need to Do

1. **Update the IP address** in `mobile/screens/Login.jsx` (line 21)
2. Make sure your Flask backend is running on `http://YOUR_IP:5000`
3. Run `cd mobile && npm start`
4. Scan QR code with Expo Go app
5. Test login, camera, and profile screens

That's it! The app will now work on your phone.

---

See `SETUP_PHONE.md` for complete troubleshooting and advanced options.
