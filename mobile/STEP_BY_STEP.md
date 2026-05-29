# 🚀 Complete Setup Guide - NO MORE ERRORS

## What Was Fixed

❌ **Old Problem:** API trying to reach port 5000 (doesn't exist)  
✅ **Fixed:** All endpoints now on port 3001  

❌ **Old Problem:** Login using email field  
✅ **Fixed:** Login now uses username/password  

❌ **Old Problem:** Environment variables not updating  
✅ **Fixed:** Both `.env` and `api.js` now point to port 3001  

---

## Step-by-Step: Getting It Running

### STEP 1: Find Your Computer's IP Address

Open **PowerShell** and run:
```powershell
ipconfig
```

Look for **IPv4 Address** under your WiFi adapter. Example:
```
IPv4 Address . . . . . . . . . . . . : 192.168.1.100
```

**Remember this IP address** - you'll use it next.

---

### STEP 2: Update `.env` File with YOUR IP

Edit `c:\Users\W\Downloads\2\IPT\mobile\.env`:

```
EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:3001
EXPO_PUBLIC_DATA_API_BASE_URL=http://YOUR_IP:3001
```

Replace `YOUR_IP` with your actual IPv4 address from Step 1.

**Example:**
```
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3001
EXPO_PUBLIC_DATA_API_BASE_URL=http://192.168.1.100:3001
```

---

### STEP 3: Start the Node.js Server

Open a NEW PowerShell window and run:

```powershell
cd c:\Users\W\Downloads\2\IPT\server
npm start
```

**Expected output:**
```
listening on port 3001
```

**Leave this terminal open and running.**

---

### STEP 4: Start the Mobile Dev Server

Open ANOTHER NEW PowerShell window and run:

```powershell
cd c:\Users\W\Downloads\2\IPT\mobile
npm start -- -c
```

You'll see:
```
> Expo dev server started on http://192.168.x.x:19000
```

**Leave this terminal open.**

---

### STEP 5: Login on Your Phone

1. **Open Expo Go** on your phone
2. **Scan the QR code** from the terminal
3. **Wait** for the app to load (30-60 seconds)

When the Login screen appears:
- **Username:** `admin` (or `user1`)
- **Password:** `admin123` (or `user123`)
- **Tap** "Sign In"

---

### STEP 6: Navigate to Dashboard

After login:
1. Tap the **"Dashboard"** tab at the bottom
2. You should see the **Parking Lot Status**
3. It will automatically refresh every 3 seconds

---

## Test Checklist

- [ ] PowerShell shows `ipconfig` with IPv4 address
- [ ] `.env` file has YOUR IP (not 192.168.1.100 if that's not yours)
- [ ] Node.js server terminal shows `listening on port 3001`
- [ ] Mobile dev terminal shows QR code to scan
- [ ] Phone successfully scans QR and loads app
- [ ] Login works with `admin` / `admin123`
- [ ] Dashboard tab shows parking lot data
- [ ] Data updates every 3 seconds
- [ ] No "Unable to reach server" error

---

## Quick Port Reference

| Port | Server | Status |
|------|--------|--------|
| 3001 | Node.js (All APIs) | ✅ **ONLY PORT YOU NEED** |
| 5000 | Python (Deprecated) | ❌ Not used anymore |

---

## If You Still Get "Unable to Reach Server" Error

### Check 1: Servers Running?

In PowerShell, verify both are listening:
```powershell
netstat -ano | findstr ":3001"
```

If nothing shows up → Node.js server is NOT running. Go back to STEP 3.

### Check 2: Correct IP in .env?

Your computer's IP changed? Run `ipconfig` again and update `.env`.

### Check 3: WiFi Network?

- Phone must be on **SAME WiFi** as computer
- Cannot use hotspot if computer is on different network
- Check phone WiFi: Settings > WiFi > Connected to?

### Check 4: Try These Test URLs

From your phone's browser, try:
```
http://YOUR_IP:3001/api/parking-lot
http://YOUR_IP:3001/api/alerts
```

Should load JSON data. If blank/error → server issue.

### Check 5: Firewall?

Windows Firewall might be blocking:
1. Open **Windows Defender Firewall**
2. Click "Allow an app through firewall"
3. Find **Node.js** or **npm** in the list
4. Check **Private** networks checkbox
5. Click OK

---

## Successful Connection Signs

✅ Dashboard loads without error  
✅ Parking spots show (green=available, red=occupied)  
✅ Numbers update every 3 seconds  
✅ Alerts tab shows real-time alerts  
✅ Activity History shows recent events  
✅ Pull-to-refresh works (swipe down)  
✅ Tapping spots toggles occupancy  

---

## File Structure (What Changed)

```
mobile/
├── .env ← CHANGED: Both point to :3001
├── services/
│   └── api.js ← CHANGED: Fixed endpoints & login method
├── screens/
│   ├── Login.jsx ← CHANGED: Uses username not email
│   ├── Dashboard.jsx ← UNCHANGED
│   ├── Alerts.jsx ← UNCHANGED
│   └── ActivityHistory.jsx ← UNCHANGED
└── MobileApp.jsx ← UNCHANGED
```

---

## Summary

1. **Get IP:** `ipconfig`
2. **Update IP:** Edit `.env`
3. **Run Server:** `npm start` in `server/` folder
4. **Run Mobile:** `npm start -- -c` in `mobile/` folder
5. **Scan QR:** Use Expo Go on phone
6. **Login:** admin / admin123
7. **View Dashboard:** All data flows perfectly now

**That's it! No more errors.** 🎉

---

## Still Have Issues?

Share this info from your terminal:
- Output of `ipconfig | findstr IPv4`
- Content of `.env` file (hide IP)
- Full error message from phone
- Which terminal shows the error
