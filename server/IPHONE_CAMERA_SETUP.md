# iPhone 12 Pro Camera Setup for Parking Detection

This guide explains how to use your iPhone 12 Pro as a CCTV camera for the parking detection system.

## Quick Start (Recommended)

### Option 1: Using IP Webcam Pro (Most Reliable)

**For iPhone:**
1. Download **"IP Webcam Pro"** from the App Store ($4.99) or **"Codeshot Live"** (free version available)
2. Open the app and tap **"Start"**
3. Note the URL displayed (e.g., `http://192.168.x.x:8080/video`)
4. Keep the app running on your iPhone

**On your PC:**
```bash
cd server
pip install -r requirements.txt
python vehicle_detector.py --source "http://192.168.x.x:8080/video"
```

Replace `192.168.x.x` with your iPhone's actual IP address.

---

### Option 2: Using Streaming Cam (RTSP) - FREE

**For iPhone:**
1. Download **"Streaming Cam"** from App Store (free)
2. Open app → Enable camera streaming
3. Tap **"Start Server"**
4. Note the RTSP URL (e.g., `rtsp://192.168.x.x:5540/media/video1`)

**On your PC:**
```bash
python vehicle_detector.py --source "rtsp://192.168.x.x:5540/media/video1"
```

---

### Option 3: Using Homekit Secure Video (If Using Apple Homekit)

If you have an Apple TV or HomePod mini:
1. Add iPhone camera to HomeKit
2. Enable Secure Video
3. Use HomeKit RTSP bridge to get stream URL

---

## Finding Your iPhone's IP Address

1. Open **Settings** → **Wi-Fi**
2. Tap the **info icon (ⓘ)** next to your network
3. Look for **"IP Address"** (e.g., 192.168.1.100)

---

## Complete Startup Commands

### With YOLO Car Detection (Recommended):
```bash
cd server
python vehicle_detector.py --source "http://192.168.x.x:8080/video" --backend-url http://localhost:3001
```

### With Motion Detection Only (Faster, Less Accurate):
```bash
python vehicle_detector.py --source "http://192.168.x.x:8080/video" --motion-only --backend-url http://localhost:3001
```

---

## Positioning Your iPhone for Best Results

### Ideal Camera Angle:
- **Height**: 2-3 meters above ground
- **Angle**: 30-45 degrees downward
- **View**: Full coverage of all parking spots
- **Lighting**: Avoid backlighting (sun behind camera)

### Phone Mount Options:
- Wall-mounted bracket
- Tripod with adhesive base
- Weatherproof outdoor case (for external mounting)

---

## Calibrating Parking Spot ROIs

Once you have the camera in position:

1. Run the detector with your camera
2. Note the coordinates displayed on the preview
3. Edit `vehicle_detector.py` → `DEFAULT_SLOTS` with your actual parking spot coordinates:

```python
DEFAULT_SLOTS = [
    (50, 120, 220, 160),    # Spot 1 - adjust these
    (300, 120, 220, 160),   # Spot 2 - coordinates
    (550, 120, 220, 160),   # Spot 3 - based on your camera
    (800, 120, 220, 160),   # Spot 4 - view
]
```

Format: `(x, y, width, height)` in pixels

---

## Troubleshooting

### Camera Stream Not Connecting

1. **Check iPhone app**: Make sure the streaming app is running
2. **Check network**: iPhone and PC must be on same WiFi
3. **Check IP address**: Verify you're using the correct IP
4. **Test connection**: Try opening the URL in a browser:
   - `http://192.168.x.x:8080/video` (IP Webcam)
   - Or stream with VLC player

### Connection Timeout
```bash
# Add timeout to curl test
curl -v "http://192.168.x.x:8080/video" --max-time 5
```

### Low FPS or Laggy Detection

1. Reduce resolution in streaming app settings
2. Use `--motion-only` flag (faster but less accurate)
3. Ensure good WiFi signal (check signal strength on iPhone)

### False Positives (Empty Spots Showing as Occupied)

1. Adjust ROI coordinates to exclude non-parking areas
2. Increase `conf_threshold` in code (more selective):
```python
motion_detected, area = car_detector.detect_car_in_roi(frame, slot, conf_threshold=0.55)
```

### No Cars Detected When Car is Present

1. Decrease `conf_threshold` (more sensitive):
```python
motion_detected, area = car_detector.detect_car_in_roi(frame, slot, conf_threshold=0.35)
```
2. Ensure good lighting on parking area
3. Check if car is fully within the ROI

---

## Performance Notes

| Setting | FPS | Accuracy | Notes |
|---------|-----|----------|-------|
| YOLO (YOLOv8n) | 12-15 | 95%+ | Uses GPU if available |
| Motion Only | 20-30 | 70-80% | Faster, less accurate |
| RTSP Stream | Varies | Best | More reliable than HTTP |
| HTTP Stream | 10-15 | Good | Easier setup |

---

## Network Security Tips

- Only use this on your local network
- Don't expose IP addresses publicly
- Consider firewall rules
- For remote access, use VPN instead of direct IP exposure

---

## Next Steps

1. **Install streaming app** on iPhone
2. **Run the detector** with your camera URL
3. **Calibrate ROI coordinates** for your parking spots
4. **View results** in the admin dashboard at `http://localhost:3000/admin/monitoring`

For issues, check terminal output for error messages!
