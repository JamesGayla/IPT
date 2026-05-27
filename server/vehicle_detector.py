import argparse
import time
import requests
import cv2
import numpy as np
import threading
from stream_server import push_frame, create_app
import os


# Start streaming server in background thread
def start_streaming_server():
    app = create_app()
    server_thread = threading.Thread(
        target=lambda: app.run(
            host='127.0.0.1',
            port=4747,
            threaded=True,
            debug=False,
            use_reloader=False
        ),
        daemon=True
    )
    server_thread.start()


class ParkingSlot:
    def __init__(self, spot_number, roi, name=None):
        self.spot_number = spot_number
        self.roi = roi
        self.name = name or f"Spot {spot_number + 1}"
        self.occupied = False
        self.motion_count = 0
        self.no_motion_frames = 0


class CarDetector:
    """YOLO-based car detection for parking slots"""
    def __init__(self, model_name='yolov8n.pt', device='cpu'):
        print(f"Loading YOLO model: {model_name}...")
        from ultralytics import YOLO
        self.model = YOLO(model_name)
        self.model.to(device)
        self.device = device
        self.car_class_id = 2  # COCO dataset: car class ID
        print("YOLO model loaded successfully")
    
    def detect_car_in_roi(self, frame, slot, conf_threshold=0.45):
        """
        Detect cars in a parking slot ROI using YOLO
        
        Args:
            frame: Full frame
            slot: ParkingSlot object
            conf_threshold: Confidence threshold for detection
            
        Returns:
            (detected: bool, confidence: float)
        """
        x, y, w, h = slot.roi
        roi = frame[y:y + h, x:x + w]
        
        if roi.size == 0:
            return False, 0
        
        # Run YOLO inference on ROI
        results = self.model(roi, verbose=False, conf=conf_threshold, device=self.device)
        
        max_confidence = 0
        for result in results:
            for box in result.boxes:
                if int(box.cls) == self.car_class_id:
                    confidence = float(box.conf)
                    max_confidence = max(max_confidence, confidence)
        
        return max_confidence > 0, int(max_confidence * 100)


DEFAULT_SLOTS = [
    # Coordinates in 2x4 grid layout (all fit within 800x600 frame)
    # Format: (x, y, width, height)
    (20, 120, 180, 140),   # spot 0 (row 1, col 1)
    (210, 120, 180, 140),  # spot 1 (row 1, col 2)
    (400, 120, 180, 140),  # spot 2 (row 1, col 3)
    (590, 120, 180, 140),  # spot 3 (row 1, col 4)
    (20, 280, 180, 140),   # spot 4 (row 2, col 1)
    (210, 280, 180, 140),  # spot 5 (row 2, col 2)
    (400, 280, 180, 140),  # spot 6 (row 2, col 3)
    (590, 280, 180, 140)   # spot 7 (row 2, col 4)
]


def draw_slot_overlay(frame, slot, motion_detected):
    x, y, w, h = slot.roi
    color = (0, 255, 0) if not slot.occupied else (0, 0, 255)
    if motion_detected:
        color = (0, 255, 255)

    cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
    label = f"{slot.name}: {'OCCUPIED' if slot.occupied else 'EMPTY'}"
    cv2.putText(frame, label, (x, y - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.55, color, 2)


def detect_motion_in_roi(frame, slot, back_sub, min_area=700):
    x, y, w, h = slot.roi
    roi = frame[y:y + h, x:x + w]
    if roi.size == 0:
        return False, 0

    fg_mask = back_sub.apply(roi)
    _, thresh = cv2.threshold(fg_mask, 250, 255, cv2.THRESH_BINARY)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=1)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    for contour in contours:
        if cv2.contourArea(contour) > min_area:
            return True, int(cv2.contourArea(contour))

    return False, 0


def send_backend_update(base_url, slot_number, occupied, confidence):
    payload = {
        "occupancyDetected": occupied,
        "confidence": confidence
    }
    url = f"{base_url}/api/parking-lot/occupancy/{slot_number}"

    try:
        response = requests.post(url, json=payload, timeout=5)
        response.raise_for_status()
        data = response.json()
        print(f"[Backend] Updated spot {slot_number}: occupied={occupied}, confidence={confidence}")
        return data
    except requests.RequestException as exc:
        print(f"[Backend] Failed to update spot {slot_number}: {exc}")
        return None


def is_http_source(source):
    return isinstance(source, str) and source.startswith(('http://', 'https://'))


def mjpeg_frame_generator(url, timeout=5, reconnect_delay=2):
    while True:
        try:
            response = requests.get(url, stream=True, timeout=timeout)
            response.raise_for_status()
            bytes_buffer = b''

            for chunk in response.iter_content(chunk_size=1024):
                if not chunk:
                    continue
                bytes_buffer += chunk
                start = bytes_buffer.find(b'\xff\xd8')
                end = bytes_buffer.find(b'\xff\xd9')
                if start != -1 and end != -1 and end > start:
                    jpg = bytes_buffer[start:end + 2]
                    bytes_buffer = bytes_buffer[end + 2:]
                    frame = cv2.imdecode(np.frombuffer(jpg, dtype=np.uint8), cv2.IMREAD_COLOR)
                    if frame is not None:
                        yield frame
        except requests.RequestException as exc:
            print(f"MJPEG stream error: {exc}. Reconnecting in {reconnect_delay}s...")
            time.sleep(reconnect_delay)
            continue


def open_video_source(camera_source, use_video_file, reconnect_delay=2):
    if isinstance(camera_source, str) and camera_source.isdigit() and not use_video_file:
        camera_source = int(camera_source)

    if is_http_source(camera_source) and not use_video_file:
        cap = cv2.VideoCapture(camera_source)
        if cap.isOpened():
            return cap, None

        print(f"OpenCV failed to open HTTP source '{camera_source}'. Falling back to MJPEG reader.")
        return None, mjpeg_frame_generator(camera_source, reconnect_delay=reconnect_delay)

    return cv2.VideoCapture(camera_source), None


def main(camera_source, backend_url, use_video_file, use_yolo=True):
    # Start streaming server for web display
    print("Starting MJPEG streaming server on http://127.0.0.1:4747/video...")
    start_streaming_server()
    time.sleep(1)  # Give server time to start
    
    cap, stream_generator = open_video_source(camera_source, use_video_file)

    if cap is None and stream_generator is None:
        raise RuntimeError("Could not open video source. Check the camera index, file path, or stream URL.")

    # Initialize YOLO or MOG2 background subtraction
    car_detector = None
    back_sub = None
    
    if use_yolo:
        try:
            # Try to use GPU if available, fallback to CPU
            device = 'cuda' if os.environ.get('CUDA_VISIBLE_DEVICES') else 'cpu'
            car_detector = CarDetector(model_name='yolov8n.pt', device=device)
            print("Using YOLO car detection")
        except Exception as e:
            print(f"Warning: YOLO initialization failed ({e}). Falling back to motion detection.")
            car_detector = None
            back_sub = cv2.createBackgroundSubtractorMOG2(history=120, detectShadows=True)
    else:
        back_sub = cv2.createBackgroundSubtractorMOG2(history=120, detectShadows=True)
        print("Using motion detection (MOG2)")
    
    slots = [ParkingSlot(i, roi) for i, roi in enumerate(DEFAULT_SLOTS)]

    print("Starting vehicle detector. Press 'q' to quit.")
    
    # Frame timing for consistent FPS
    last_frame_time = time.time()
    target_fps = 15  # Reduce to 15 FPS for web streaming to reduce lag

    while True:
        if cap is not None:
            ret, frame = cap.read()
            if not ret:
                print("Frame read failed; reconnecting...")
                cap.release()
                cap, stream_generator = open_video_source(camera_source, use_video_file)
                time.sleep(1)
                continue
        else:
            try:
                frame = next(stream_generator)
                ret = frame is not None
            except StopIteration:
                print("MJPEG stream ended; reconnecting...")
                cap, stream_generator = open_video_source(camera_source, use_video_file)
                time.sleep(1)
                continue
            except Exception as exc:
                print(f"MJPEG stream error: {exc}. Reconnecting...")
                cap, stream_generator = open_video_source(camera_source, use_video_file)
                time.sleep(1)
                continue

        if not ret:
            print("No frame available; continuing...")
            time.sleep(0.05)
            continue

        # Optimize frame size for web streaming (reduce from 1100x720 to 800x600 for better performance)
        frame = cv2.resize(frame, (800, 600))
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (5, 5), 0)

        for slot in slots:
            # Use YOLO if available, otherwise fallback to motion detection
            if car_detector is not None:
                motion_detected, area = car_detector.detect_car_in_roi(frame, slot, conf_threshold=0.45)
            else:
                motion_detected, area = detect_motion_in_roi(gray, slot, back_sub)

            if motion_detected and not slot.occupied:
                slot.motion_count += 1
            else:
                slot.motion_count = 0

            if slot.motion_count >= 3 and not slot.occupied:  # YOLO is more accurate, fewer frames needed
                slot.occupied = True
                confidence = area if car_detector is not None else min(100, max(50, area // 10))
                send_backend_update(backend_url, slot.spot_number, True, confidence)
                slot.no_motion_frames = 0

            if not motion_detected and slot.occupied:
                slot.no_motion_frames += 1
            else:
                slot.no_motion_frames = 0

            if slot.no_motion_frames > 60 and slot.occupied:  # Fewer frames with YOLO
                slot.occupied = False
                send_backend_update(backend_url, slot.spot_number, False, 90)
                slot.motion_count = 0

            draw_slot_overlay(frame, slot, motion_detected)

        cv2.putText(frame, "Parking Slot Detector (YOLO)", (18, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (255, 255, 255), 2)
        
        # Push frame to streaming server for web display
        push_frame(frame)
        
        # Display locally only if needed (can be disabled in production)
        cv2.imshow("Parking Slot Detector", frame)

        # Control frame rate: target FPS
        elapsed = time.time() - last_frame_time
        wait_time = int((1.0 / target_fps - elapsed) * 1000)
        if cv2.waitKey(max(1, wait_time)) & 0xFF == ord('q'):
            break
        last_frame_time = time.time()

        if use_video_file and cap.get(cv2.CAP_PROP_POS_FRAMES) >= cap.get(cv2.CAP_PROP_FRAME_COUNT):
            break

    if cap is not None:
        cap.release()
    cv2.destroyAllWindows()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Vehicle detector for parking slot occupancy using YOLO.')
    parser.add_argument('--source', default=0, help='Camera index, video file path, or stream URL')
    parser.add_argument('--backend-url', default='http://localhost:3001', help='Backend API base URL')
    parser.add_argument('--video-file', action='store_true', help='Use source as a video file instead of camera index')
    parser.add_argument('--motion-only', action='store_true', help='Use motion detection instead of YOLO (fallback)')
    args = parser.parse_args()

    main(
        args.source,
        args.backend_url,
        args.video_file,
        use_yolo=not args.motion_only,
    )
