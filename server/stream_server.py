"""
MJPEG Streaming Server for Vehicle Detector
Streams processed parking lot camera feed to web clients
"""
import threading
import time
import cv2
import queue
from flask import Flask, Response, jsonify
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global frame queue and lock
frame_queue = queue.Queue(maxsize=2)  # Keep only 2 frames to reduce lag
frame_lock = threading.Lock()
latest_frame = None
stream_active = False


def create_app():
    """Create and configure Flask app for streaming"""
    app = Flask(__name__)
    CORS(app)
    
    @app.route('/video')
    def video_feed():
        """MJPEG video stream endpoint"""
        return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
    
    @app.route('/health')
    def health():
        """Health check endpoint"""
        return jsonify({'status': 'active', 'streaming': stream_active})
    
    @app.route('/stats')
    def stats():
        """Stream statistics"""
        return jsonify({
            'queue_size': frame_queue.qsize(),
            'active': stream_active
        })
    
    return app


def generate_frames():
    """Generator function for MJPEG streaming"""
    global latest_frame
    
    while True:
        try:
            # Get frame with timeout to prevent blocking
            frame = frame_queue.get(timeout=1)
            
            if frame is None:
                continue
            
            with frame_lock:
                latest_frame = frame
            
            # Encode frame to JPEG
            ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
            
            if not ret:
                continue
            
            frame_data = buffer.tobytes()
            
            # Yield frame in MJPEG format
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n'
                   b'Content-Length: ' + str(len(frame_data)).encode() + b'\r\n\r\n' +
                   frame_data + b'\r\n')
            
        except queue.Empty:
            # No frame available, continue waiting
            continue
        except Exception as e:
            logger.error(f"Frame generation error: {e}")
            continue


def push_frame(frame):
    """
    Add a frame to the streaming queue
    
    Args:
        frame: OpenCV frame (numpy array)
    """
    global stream_active
    
    if frame is None:
        return
    
    stream_active = True
    
    # Remove old frame if queue is full (FIFO with size limit)
    try:
        frame_queue.put_nowait(frame)
    except queue.Full:
        try:
            # Remove oldest frame
            frame_queue.get_nowait()
            frame_queue.put_nowait(frame)
        except queue.Empty:
            pass


def get_latest_frame():
    """Get the latest frame that was pushed"""
    with frame_lock:
        return latest_frame.copy() if latest_frame is not None else None


if __name__ == '__main__':
    app = create_app()
    app.run(host='127.0.0.1', port=4747, threaded=True, debug=False)
