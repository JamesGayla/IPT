# 🚀 Quick Setup Checklist

Run through this checklist to get your ParkFlow mobile app on your phone in minutes!

## Prerequisites (Do once)
- [ ] Install **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- [ ] Phone and computer on same WiFi network
- [ ] Node.js & npm installed (check: `node --version`)

## Step 1: Find Your IP Address (2 min)

**Windows PowerShell:**
```powershell
ipconfig
```

Look for your IPv4 address (e.g., `192.168.1.100`)
⬜ Found IP: `____________`

## Step 2: Update Code (1 min)

Edit `mobile/screens/Login.jsx` line 21:

**Change this:**
```javascript
const response = await fetch('http://192.168.1.100:5000/api/login', {
```

**To this (use YOUR IP):**
```javascript
const response = await fetch('http://YOUR_IP:5000/api/login', {
```

- [ ] IP address updated in Login.jsx

## Step 3: Install Dependencies (2-3 min)

```powershell
cd c:\Users\W\Downloads\2\IPT\mobile
npm install
```

- [ ] Dependencies installed (wait for "added X packages")

## Step 4: Start Expo Server (1 min)

```powershell
npm start
```

Wait for the QR code to appear. You should see:
```
Expo DevTools is running at http://localhost:19002
```

- [ ] Server started and QR code visible

## Step 5: Open on Your Phone (30 sec)

**Method 1 - QR Code (Recommended):**
1. Open **Expo Go** on your phone
2. Tap the **QR Code icon**
3. Point camera at the QR code in your terminal
4. App loads automatically

- [ ] QR code scanned

**Method 2 - Manual:**
1. Press `w` in terminal to open web preview
2. Or press `a` for Android emulator / `i` for iOS simulator

- [ ] App opened on phone

## Test the App

- [ ] **Login Screen**: Appears when you open the app
  - Enter any email and password
  - Tap "Sign In" to log in

- [ ] **Camera Screen**: Shows after login
  - See camera preview (or mock image if no permission)
  - Tap "Capture Snapshot" to take a photo

- [ ] **Profile Tab**: Shows your user info
  - Can logout from here

- [ ] **Tap profile icon** in top right
  - Logout button appears

## If Something Goes Wrong

| Issue | Solution |
|-------|----------|
| "Failed to connect to server" | Check IP address in Login.jsx matches your computer |
| Blank screen | Press `r` in terminal to reload |
| "SDK not installed" | Let Expo install it (or run `npm install expo@^54.0.0`) |
| App doesn't load | Make sure you're on same WiFi as computer |
| Camera won't open | Allow permissions in phone settings for Expo Go |

See `SETUP_PHONE.md` for detailed troubleshooting.

## Continue Development

**Hot reload** works - just save files and app updates automatically!

Useful commands:
- `r` - Reload app
- `m` - Menu
- `Ctrl+C` - Stop server

---

✅ **All Done!** Your mobile app is now running on your phone with Expo Go!

🎉 **Next**: Try taking photos with the camera feature!
