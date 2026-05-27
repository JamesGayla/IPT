# Camera Integration & Performance Optimization Guide

## Overview

The camera streaming system has been integrated directly into the admin panel's camera monitoring page. The camera feed is now streamed via MJPEG (Motion JPEG) over HTTP and displayed on the website, eliminating the need for a separate app or tab.

## What Changed

### 1. **New Streaming Server** (`server/stream_server.py`)
- Creates an MJPEG streaming endpoint at `http://127.0.0.1:4747/video`
- Handles frame queuing efficiently (FIFO with size limit) to reduce lag
- Supports multiple concurrent clients
- Built with Flask for lightweight HTTP streaming

### 2. **Updated Vehicle Detector** (`server/vehicle_detector.py`)
- Now starts the streaming server in a background thread on startup
- Streams processed frames (with parking spot overlays) to the web
- **Performance optimizations:**
  - Reduced frame resolution from 1100x720 to **800x600** for faster processing and lower bandwidth
  - Limited to **15 FPS** instead of 30+ FPS to balance responsiveness and resource usage
  - Uses queue-based frame buffering to prevent lag accumulation
  - JPEG compression at 80% quality for smaller file sizes

### 3. **Enhanced CameraPlayer Component** (`src/components/CameraPlayer.jsx`)
- Improved MJPEG stream handling
- Added automatic reconnection with retry logic
- Cache-busting to ensure fresh frames
- Better error handling and user feedback
- Works seamlessly with both MJPEG streams and other video formats

### 4. **Admin Monitoring Integration** (`src/screens/admin/AdminMonitoring.jsx`)
- Now displays the vehicle detector's processed camera feed
- Shows parking spot detection overlays directly in the admin panel
- Real-time synchronization with backend occupancy data

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd server
pip install -r requirements.txt
```

The updated requirements include:
- `flask` - For MJPEG streaming server
- `flask-cors` - For CORS support
- Plus existing dependencies (opencv-python, fastapi, etc.)

### Step 2: Start the Servers

#### Option A: Using the batch file (Windows)
```bash
cd server
run_server.bat
```

This will automatically start:
- FastAPI server on http://localhost:3001
- Vehicle detector with streaming on http://127.0.0.1:4747

#### Option B: Manual startup (Linux/Mac/Windows)

Terminal 1 - Start the API server:
```bash
cd server
python main.py
```

Terminal 2 - Start the vehicle detector with streaming:
```bash
cd server
python vehicle_detector.py --source 0 --backend-url http://localhost:3001
```

### Step 3: Start the Frontend

```bash
npm install
npm run dev
```

Then navigate to the Admin Dashboard → Monitoring tab to see the camera feed.

## Camera Source Configuration

The vehicle detector can use different camera sources:

### Local Webcam
```bash
python vehicle_detector.py --source 0
```

### Video File
```bash
python vehicle_detector.py --source path/to/video.mp4 --video-file
```

### HTTP Stream (e.g., IP camera, RTSP)
```bash
python vehicle_detector.py --source http://192.168.1.100:8080/video
```

### Options
- `--source`: Camera index (0), file path, or HTTP/RTSP URL
- `--backend-url`: Backend API URL (default: http://localhost:3001)
- `--video-file`: Flag to treat source as video file instead of camera index

## Performance Improvements

### What's Faster:
1. **Lower Resolution (800x600)**: Faster processing and network transfer
2. **Reduced FPS (15)**: Eliminates unnecessary frame processing and bandwidth waste
3. **Efficient Queuing**: Prevents frame accumulation that causes lag
4. **Better JPEG Compression**: Smaller file sizes (80% quality)
5. **Server-side Processing**: Detection happens once, displayed on web (no client-side processing)

### Expected Results:
- **Latency**: 500-1000ms (typical for streaming) vs. previous browser camera lag
- **CPU Usage**: Reduced due to lower resolution and frame rate
- **Bandwidth**: ~10-15 Mbps for streaming vs. higher with unoptimized streams
- **Responsiveness**: Smooth 15 FPS display on the admin panel

## Architecture

```
┌──────────────────┐
│  Camera Source   │
│  (webcam/IP/file)│
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  vehicle_detector.py     │
│  - Process frames        │
│  - Detect parking spots  │
│  - Draw overlays         │
│  - Send to API           │
└────────┬─────────────────┘
         │
         ├──► stream_server.py (MJPEG) ◄─── Frontend (AdminMonitoring)
         │                               (http://127.0.0.1:4747/video)
         │
         ▼
┌──────────────────────────┐
│  main.py (API Server)    │
│  - Update occupancy      │
│  - Manage parking spots  │
└──────────────────────────┘
```

## Troubleshooting

### Camera Stream Not Loading

1. **Check if streaming server is running:**
   ```bash
   curl http://127.0.0.1:4747/health
   ```
   Should return: `{"status": "active", "streaming": true}`

2. **Check vehicle detector logs** for errors starting the streaming server

3. **Verify camera source:**
   - Local camera: Does it work with other apps?
   - IP camera: Is the URL correct? Can you ping it?

### High Latency / Lag

1. Check CPU usage - if high, reduce resolution further:
   ```python
   # In vehicle_detector.py, change:
   frame = cv2.resize(frame, (640, 480))  # Even lower
   ```

2. Reduce FPS further:
   ```python
   target_fps = 10  # Instead of 15
   ```

3. Lower JPEG quality:
   ```python
   cv2.IMWRITE_JPEG_QUALITY, 70  # Instead of 80
   ```

### Port Already in Use

If port 4747 or 3001 is already in use:
- Change the streaming server port in `stream_server.py` and `vehicle_detector.py`
- Or kill the process: `netstat -ano | findstr :4747` (Windows) or `lsof -i :4747` (Linux/Mac)

## Next Steps / Optional Enhancements

1. **Add Authentication**: Protect the streaming endpoint
2. **Multi-Camera Support**: Stream from multiple cameras simultaneously
3. **Recording**: Save video feed to disk
4. **Analytics**: Real-time parking statistics
5. **Mobile View**: Optimize for mobile devices
6. **WebRTC**: Lower latency alternative to MJPEG (more complex)

## Files Modified

- ✅ `server/stream_server.py` (NEW)
- ✅ `server/vehicle_detector.py` (Updated)
- ✅ `server/requirements.txt` (Updated)
- ✅ `server/run_server.bat` (Updated)
- ✅ `src/components/CameraPlayer.jsx` (Enhanced)
- ✅ `src/screens/admin/AdminMonitoring.jsx` (Already configured correctly)
