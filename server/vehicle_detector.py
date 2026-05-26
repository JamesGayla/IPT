import argparse
import time
import requests
import cv2
import numpy as np


class ParkingSlot:
    def __init__(self, spot_number, roi, name=None):
        self.spot_number = spot_number
        self.roi = roi
        self.name = name or f"Spot {spot_number + 1}"
        self.occupied = False
        self.motion_count = 0
        self.no_motion_frames = 0


DEFAULT_SLOTS = [
    # Coordinates must be adapted to your camera angle.
    # Format: (x, y, width, height)
    (50, 120, 220, 160),   # spot 0
    (300, 120, 220, 160),  # spot 1
    (550, 120, 220, 160),  # spot 2
    (800, 120, 220, 160),  # spot 3
    (50, 320, 220, 160),   # spot 4
    (300, 320, 220, 160),  # spot 5
    (550, 320, 220, 160),  # spot 6
    (800, 320, 220, 160)   # spot 7
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


def main(camera_source, backend_url, use_video_file):
    cap, stream_generator = open_video_source(camera_source, use_video_file)

    if cap is None and stream_generator is None:
        raise RuntimeError("Could not open video source. Check the camera index, file path, or stream URL.")

    back_sub = cv2.createBackgroundSubtractorMOG2(history=120, detectShadows=True)
    slots = [ParkingSlot(i, roi) for i, roi in enumerate(DEFAULT_SLOTS)]

    print("Starting vehicle detector. Press 'q' to quit.")

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

        frame = cv2.resize(frame, (1100, 720))
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (5, 5), 0)

        for slot in slots:
            motion_detected, area = detect_motion_in_roi(gray, slot, back_sub)

            if motion_detected and not slot.occupied:
                slot.motion_count += 1
            else:
                slot.motion_count = 0

            if slot.motion_count >= 5 and not slot.occupied:
                slot.occupied = True
                send_backend_update(backend_url, slot.spot_number, True, min(100, max(50, area // 10)))
                slot.no_motion_frames = 0

            if not motion_detected and slot.occupied:
                slot.no_motion_frames += 1
            else:
                slot.no_motion_frames = 0

            if slot.no_motion_frames > 90 and slot.occupied:
                slot.occupied = False
                send_backend_update(backend_url, slot.spot_number, False, 90)
                slot.motion_count = 0

            draw_slot_overlay(frame, slot, motion_detected)

        cv2.putText(frame, "Parking Slot Detector", (18, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.85, (255, 255, 255), 2)
        cv2.imshow("Parking Slot Detector", frame)

        if cv2.waitKey(30) & 0xFF == ord('q'):
            break

        if use_video_file and cap.get(cv2.CAP_PROP_POS_FRAMES) >= cap.get(cv2.CAP_PROP_FRAME_COUNT):
            break

    if cap is not None:
        cap.release()
    cv2.destroyAllWindows()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Vehicle detector for parking slot occupancy.')
    parser.add_argument('--source', default=0, help='Camera index, video file path, or stream URL')
    parser.add_argument('--backend-url', default='http://localhost:3001', help='Backend API base URL')
    parser.add_argument('--video-file', action='store_true', help='Use source as a video file instead of camera index')
    args = parser.parse_args()

    main(
        args.source,
        args.backend_url,
        args.video_file,
    )
