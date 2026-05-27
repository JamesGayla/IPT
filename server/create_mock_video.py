"""
Generate a mock parking lot video for testing
Creates an MP4 file with simulated cars entering/leaving parking spots
"""

import cv2
import numpy as np
import os

def create_mock_parking_video(output_file='mock_parking.mp4', num_frames=900, fps=30):
    """
    Generate a synthetic parking lot video
    
    Args:
        output_file: Output video file path
        num_frames: Number of frames to generate
        fps: Frames per second
    """
    frame_width = 800
    frame_height = 600
    
    # Define parking spots in 2x4 grid (all fit within 800x600 frame)
    # Format: (x, y, width, height)
    parking_spots = [
        (20, 120, 180, 140),    # spot 0 (row 1, col 1)
        (210, 120, 180, 140),   # spot 1 (row 1, col 2)
        (400, 120, 180, 140),   # spot 2 (row 1, col 3)
        (590, 120, 180, 140),   # spot 3 (row 1, col 4)
        (20, 280, 180, 140),    # spot 4 (row 2, col 1)
        (210, 280, 180, 140),   # spot 5 (row 2, col 2)
        (400, 280, 180, 140),   # spot 6 (row 2, col 3)
        (590, 280, 180, 140)    # spot 7 (row 2, col 4)
    ]
    
    # Create video writer
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_file, fourcc, fps, (frame_width, frame_height))
    
    print(f"Generating mock parking video: {output_file}")
    print(f"Resolution: {frame_width}x{frame_height}, FPS: {fps}, Frames: {num_frames}")
    
    for frame_num in range(num_frames):
        # Create blank frame (parking lot background)
        frame = np.ones((frame_height, frame_width, 3), dtype=np.uint8) * 220  # Light gray
        
        # Draw background
        cv2.rectangle(frame, (0, 0), (frame_width, frame_height), (200, 200, 200), -1)
        
        # Draw title
        cv2.putText(frame, "Mock Parking Lot - Detection Test", (80, 40),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2)
        
        # Simulate cars cycling in/out of spots
        # Each spot has a different cycle timing to create varied activity
        cycle_lengths = [300, 300, 350, 280, 400, 320, 360, 250]
        
        for spot_idx, (x, y, w, h) in enumerate(parking_spots):
            # Draw spot outline
            cv2.rectangle(frame, (x, y), (x + w, y + h), (100, 100, 100), 2)
            
            # Determine if car is present (based on frame number and cycle)
            cycle = cycle_lengths[spot_idx]
            spot_frame = (frame_num + spot_idx * 50) % cycle
            car_present = spot_frame < (cycle // 2)  # Car present for half the cycle
            
            if car_present:
                # Draw car (dark blue filled rectangle)
                car_margin = 8
                cv2.rectangle(frame, (x + car_margin, y + car_margin),
                            (x + w - car_margin, y + h - car_margin),
                            (40, 40, 150), -1)  # Dark blue car
                
                # Draw windshield
                cv2.rectangle(frame, (x + 15, y + 15), (x + w - 15, y + 30),
                            (100, 150, 200), -1)  # Light blue
                
                # Draw headlights
                cv2.circle(frame, (x + 25, y + 20), 4, (255, 255, 0), -1)
                cv2.circle(frame, (x + w - 25, y + 20), 4, (255, 255, 0), -1)
                
                label = f"Spot {spot_idx + 1}: CAR"
                color = (0, 0, 255)  # Red text for occupied
            else:
                # Draw empty spot (light green)
                cv2.rectangle(frame, (x + 5, y + 5), (x + w - 5, y + h - 5),
                            (144, 238, 144), -1)  # Light green
                
                label = f"Spot {spot_idx + 1}: EMPTY"
                color = (0, 128, 0)  # Green text for empty
            
            # Draw label
            cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.4, color, 1)
        
        # Draw frame counter and status
        cv2.putText(frame, f"Frame: {frame_num}/{num_frames}", (10, frame_height - 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        cv2.putText(frame, f"FPS: {fps}", (frame_width - 100, frame_height - 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1)
        
        # Write frame
        out.write(frame)
        
        # Print progress
        if frame_num % 100 == 0:
            print(f"  Generated {frame_num}/{num_frames} frames...")
    
    out.release()
    print(f"✅ Video saved: {output_file}")
    print(f"   Duration: {num_frames / fps:.1f} seconds")
    
    return output_file


if __name__ == '__main__':
    # Generate video in server directory
    video_path = os.path.join(os.path.dirname(__file__), 'mock_parking.mp4')
    create_mock_parking_video(video_path, num_frames=900, fps=30)
    print(f"\nTo test with this video, run:")
    print(f"  python vehicle_detector.py --source {video_path} --video-file")
