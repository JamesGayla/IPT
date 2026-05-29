# Troubleshooting "Unable to Reach Server"

## Step 1: Find Your Computer's IP Address

Open PowerShell and run:
```powershell
ipconfig
```

Look for "IPv4 Address" under your WiFi adapter. Example: `192.168.1.100`

## Step 2: Update .env with Your Actual IP

Edit `mobile/.env`:
```
EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:5000
EXPO_PUBLIC_DATA_API_BASE_URL=http://YOUR_IP:3001
```

Replace `YOUR_IP` with your actual IPv4 address from Step 1.

## Step 3: Verify Servers Are Running

### Python Server (Port 5000)
```powershell
cd c:\Users\W\Downloads\2\IPT\api
python main.py
```

You should see: `Running on http://0.0.0.0:5000`

### Node.js Server (Port 3001)
In a NEW PowerShell window:
```powershell
cd c:\Users\W\Downloads\2\IPT\server
npm start
# or
node index.js
```

You should see: `listening on port 3001` or similar

### Check if ports are open:
```powershell
netstat -ano | findstr ":5000"
netstat -ano | findstr ":3001"
```

## Step 4: Test Connectivity from Phone

### Option A: Using Expo Dev Tools
1. Start the mobile dev server: `npm start -- -c` from `mobile/` folder
2. Scan the QR code with Expo Go
3. Open your phone's browser and try:
   - `http://YOUR_IP:5000/health` (should return OK)
   - `http://YOUR_IP:3001/api/health` (should return OK)

### Option B: Test from Computer
Open PowerShell and test:
```powershell
curl http://localhost:5000/health
curl http://localhost:3001/api/health
```

## Step 5: Restart Everything

If still getting errors:

1. **Kill processes** on ports:
```powershell
netstat -ano | findstr ":5000"
# Note the PID, then:
taskkill /PID <PID> /F

# Repeat for port 3001
netstat -ano | findstr ":3001"
taskkill /PID <PID> /F
```

2. **Restart servers** with correct ports

3. **Clear app cache** in Expo:
   - On phone: Force close Expo Go
   - On computer: Press `c` in terminal (clear cache)
   - Scan QR code again

## Common Issues

### Issue: "Connection refused" or "Unable to reach server"
- ❌ IP in .env doesn't match your computer's actual IP
- ❌ Servers aren't running
- ❌ Firewall blocking ports 5000 or 3001
- ❌ Phone on different network (hotspot vs WiFi)

**Fix:**
1. Run `ipconfig` and use the correct IPv4 address
2. Start both servers
3. Try pinging from phone: http://YOUR_IP:3001 should load

### Issue: Server running but phone still can't reach
- ❌ Phone and computer on different networks
- ❌ Firewall blocking incoming connections

**Fix:**
- Connect phone to same WiFi as computer
- Windows Firewall: Allow Python/Node.js through firewall

### Issue: All endpoints work except one
- ❌ That specific API endpoint doesn't exist on server
- ❌ Wrong port for that API

**Fix:**
- Check [port usage](#port-mapping-guide) below
- Verify server has that endpoint implemented

## Port Mapping Guide

| Service | Port | Endpoints |
|---------|------|-----------|
| **Python API** | 5000 | `/api/login`, `/health` |
| **Node.js Server** | 3001 | `/api/parking-lot`, `/api/alerts`, `/api/activity-history`, `/api/health` |

## Test Endpoints Directly

### From Phone Browser or `curl`:

**Test Python Server (Port 5000):**
```
http://YOUR_IP:5000/health
```

**Test Node.js Server (Port 3001):**
```
http://YOUR_IP:3001/api/health
http://YOUR_IP:3001/api/parking-lot
http://YOUR_IP:3001/api/alerts
```

All should return 200 OK.

## Emergency Checklist

- [ ] `ipconfig` shows your actual IP
- [ ] `.env` has correct IP and ports
- [ ] Python server running on port 5000
- [ ] Node.js server running on port 3001
- [ ] Phone and computer on SAME WiFi
- [ ] Endpoints respond to direct URL test
- [ ] Expo app restarted (force close + rescan)
- [ ] No firewall blocking ports

## Getting Help

If still stuck:
1. Check terminal output for error messages
2. Look at phone console: Press `m` in Expo, then "Debug remote JS"
3. Share error messages from both server terminals
4. Verify both servers show no errors when running

---

**Remember:** The error message now shows exactly what's wrong. Read it carefully!
