# Running ParkFlow Mobile App on Your Phone with Expo Go

This guide will help you run the mobile app on your physical phone using the Expo Go app.

## Prerequisites

1. **Expo Go App**: Install on your phone from:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Node.js & npm**: Already installed on your computer

3. **Same Network**: Your phone and computer must be on the same WiFi network

## Step 1: Find Your Computer's IP Address

### On Windows (PowerShell):
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x)

Example: `192.168.1.100`

## Step 2: Update the IP Address in the Code

Edit `mobile/screens/Login.jsx` and update this line with your IP:

```javascript
const response = await fetch('http://YOUR_IP:5000/api/login', {
```

Replace `YOUR_IP` with the IP address from Step 1. For example:
```javascript
const response = await fetch('http://192.168.1.100:5000/api/login', {
```

**Note**: All API calls in the app already use `192.168.1.100` by default. Adjust if needed.

## Step 3: Install Dependencies

```powershell
cd mobile
npm install
```

## Step 4: Start the Expo Development Server

```powershell
npm start
```

You should see output like:
```
Expo Go requires an SDK version that you don't have installed: SDK 54.
Install it with: expo install expo@^54.0.0
```

If prompted, allow the installation. You'll then see:
```
Expo DevTools is running at http://localhost:19002
```

And a QR code will be displayed in your terminal.

## Step 5: Scan QR Code with Your Phone

### Option A: Using Expo Go App
1. Open **Expo Go** on your phone
2. Tap the **QR Code** icon (usually in the bottom or top menu)
3. Point your phone camera at the QR code in your terminal
4. The app will load automatically

### Option B: Manual Connection
1. In your terminal, press `w` to open in web
2. Or press `a` for Android / `i` for iOS (if you have simulators installed)
3. Or use the Expo DevTools web interface at `http://localhost:19002`

## Step 6: Make Sure the Backend Server is Running

The app needs your Flask/Python API server running:

```powershell
# In a separate terminal, from the api/ folder
python main.py
```

The app will try to connect to `http://192.168.1.100:5000` for login.

## Troubleshooting

### "Failed to connect to server"
- Verify your backend server is running
- Check that your IP address in the code matches your computer's IP
- Ensure both phone and computer are on the same WiFi network
- Try pinging your computer from the phone to verify connectivity

### Camera permission denied
- On iOS: Go to Settings > Expo Go > Camera, enable it
- On Android: Go to App Info > Permissions > Camera, enable it

### Blank screen or loading forever
- Check your terminal for error messages
- Try pressing `r` in the terminal to reload the app
- Kill the dev server (Ctrl+C) and restart with `npm start`

### "SDK version not installed"
- Let Expo install the required SDK version when prompted
- Or manually run: `npm install expo@^54.0.0`

### Network issues
- Disable VPN if you have one enabled
- Try restarting your router
- Check WiFi is actually connected on both devices

## Hot Reload & Development

While your app is running on your phone:
- **Save a file** → The app reloads automatically (Fast Refresh)
- **Press `r`** in your terminal to manually reload
- **Press `m`** to toggle the menu

## Useful Commands

```powershell
npm start          # Start development server
npm start -- -c    # Clear cache
npm run android    # Open in Android emulator (if installed)
npm run ios        # Open in iOS simulator (if on Mac)
```

## File Edits That Require Reset

If you edit these, restart the server:
- `app.json`
- `babel.config.js`
- Package dependencies

For other files (components, screens), hot reload works fine.

## Next Steps

1. Test login with any credentials (the backend will validate)
2. Allow camera permissions when prompted
3. Take photos and test the camera feature
4. Check profile and other screens

## API Endpoint Reference

The app expects these endpoints at `http://YOUR_IP:5000`:
- `POST /api/login` - User authentication
- `GET /api/alerts` - Fetch alerts
- `GET /api/activity-history` - Fetch activity
- `POST /api/auth/logout` - User logout

Make sure your backend implements these endpoints!

---

**Having issues?** Check the terminal output for error messages. Most errors provide helpful hints about what's wrong.
