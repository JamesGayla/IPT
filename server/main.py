from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uvicorn

app = FastAPI(title="Parking Lot Manager API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    email: str

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class ParkingLotResponse(BaseModel):
    totalSpots: int
    occupiedSpots: List[int]
    availableSpots: int
    occupancyPercentage: int

class ToggleSpotResponse(BaseModel):
    spotNumber: int
    isOccupied: bool
    occupiedSpots: List[int]

class AlertBase(BaseModel):
    type: str
    message: str
    severity: str = "info"

class AlertResponse(AlertBase):
    id: int
    timestamp: datetime

class ActivityHistoryResponse(BaseModel):
    id: int
    userId: int
    action: str
    timestamp: datetime
    details: str

class CCTVCameraBase(BaseModel):
    status: str = "active"
    occupancyDetected: bool = False
    confidence: int = 0

class CCTVCameraResponse(CCTVCameraBase):
    spotNumber: int
    lastUpdate: datetime

class CCTVCameraUpdate(BaseModel):
    status: Optional[str] = None
    occupancyDetected: Optional[bool] = None
    confidence: Optional[int] = None

class StatsResponse(BaseModel):
    totalSpots: int
    occupiedSpots: int
    availableSpots: int
    occupancyPercentage: int
    totalAlerts: int
    totalUsers: int
    activeUsers: int
    cameraCount: int

# In-memory data storage (in production, use a database)
parking_lot = {
    "totalSpots": 12,
    "occupiedSpots": [0, 2, 3, 5, 7, 9]
}

users = [
    {"id": 1, "username": "admin", "password": "admin123", "role": "admin", "email": "admin@parking.com"},
    {"id": 2, "username": "user1", "password": "user123", "role": "user", "email": "user1@parking.com"}
]

alerts = [
    {"id": 1, "type": "HIGH_OCCUPANCY", "message": "Parking lot at 50% capacity", "timestamp": datetime.now(), "severity": "warning"},
    {"id": 2, "type": "SPACE_AVAILABLE", "message": "New parking space available", "timestamp": datetime.now(), "severity": "info"}
]

activity_history = [
    {"id": 1, "userId": 1, "action": "LOGIN", "timestamp": datetime.now(), "details": "Admin logged in"},
    {"id": 2, "userId": 2, "action": "VIEW_PARKING", "timestamp": datetime.now(), "details": "User viewed parking status"},
    {"id": 3, "userId": 2, "action": "BOOK_SPACE", "timestamp": datetime.now(), "details": "User booked spot 5"}
]

cctv_camera_data = [
    {"spotNumber": 0, "status": "active", "occupancyDetected": True, "confidence": 98, "lastUpdate": datetime.now()},
    {"spotNumber": 1, "status": "active", "occupancyDetected": False, "confidence": 97, "lastUpdate": datetime.now()},
    {"spotNumber": 2, "status": "active", "occupancyDetected": True, "confidence": 95, "lastUpdate": datetime.now()},
    {"spotNumber": 3, "status": "active", "occupancyDetected": False, "confidence": 99, "lastUpdate": datetime.now()},
    {"spotNumber": 4, "status": "active", "occupancyDetected": False, "confidence": 96, "lastUpdate": datetime.now()},
    {"spotNumber": 5, "status": "active", "occupancyDetected": True, "confidence": 94, "lastUpdate": datetime.now()}
]

current_user_session = None

# Helper functions
def get_current_user():
    if current_user_session is None:
        raise HTTPException(status_code=401, detail="Not logged in")
    return current_user_session

# API Routes
@app.post("/api/auth/login", response_model=AuthResponse)
async def login(request: LoginRequest):
    global current_user_session

    user = next((u for u in users if u["username"] == request.username and u["password"] == request.password), None)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    current_user_session = user

    # Log activity
    activity_history.append({
        "id": len(activity_history) + 1,
        "userId": user["id"],
        "action": "LOGIN",
        "timestamp": datetime.now(),
        "details": f"{user['role']} logged in"
    })

    return {
        "token": "fake-jwt-token",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "role": user["role"],
            "email": user["email"]
        }
    }

@app.post("/api/auth/logout")
async def logout():
    global current_user_session

    if current_user_session:
        activity_history.append({
            "id": len(activity_history) + 1,
            "userId": current_user_session["id"],
            "action": "LOGOUT",
            "timestamp": datetime.now(),
            "details": "User logged out"
        })
        current_user_session = None

    return {"message": "Logged out successfully"}

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info():
    user = get_current_user()
    return user

@app.get("/api/parking-lot", response_model=ParkingLotResponse)
async def get_parking_lot():
    occupied_count = len(parking_lot["occupiedSpots"])
    total_spots = parking_lot["totalSpots"]
    occupancy_percentage = round((occupied_count / total_spots) * 100)

    return {
        "totalSpots": total_spots,
        "occupiedSpots": parking_lot["occupiedSpots"],
        "availableSpots": total_spots - occupied_count,
        "occupancyPercentage": occupancy_percentage
    }

@app.post("/api/parking-lot/toggle/{spot_number}", response_model=ToggleSpotResponse)
async def toggle_parking_spot(spot_number: int):
    if spot_number < 0 or spot_number >= parking_lot["totalSpots"]:
        raise HTTPException(status_code=400, detail="Invalid spot number")

    if spot_number in parking_lot["occupiedSpots"]:
        parking_lot["occupiedSpots"].remove(spot_number)
        is_occupied = False
    else:
        parking_lot["occupiedSpots"].append(spot_number)
        is_occupied = True

    # Log activity
    if current_user_session:
        activity_history.append({
            "id": len(activity_history) + 1,
            "userId": current_user_session["id"],
            "action": "TOGGLE_SPOT",
            "timestamp": datetime.now(),
            "details": f"Spot {spot_number} toggled to {'occupied' if is_occupied else 'available'}"
        })

    return {
        "spotNumber": spot_number,
        "isOccupied": is_occupied,
        "occupiedSpots": parking_lot["occupiedSpots"]
    }

@app.get("/api/alerts", response_model=List[AlertResponse])
async def get_alerts():
    return sorted(alerts, key=lambda x: x["timestamp"], reverse=True)

@app.post("/api/alerts", response_model=AlertResponse)
async def create_alert(alert: AlertBase):
    new_alert = {
        "id": len(alerts) + 1,
        "type": alert.type,
        "message": alert.message,
        "severity": alert.severity,
        "timestamp": datetime.now()
    }
    alerts.append(new_alert)
    return new_alert

@app.delete("/api/alerts/{alert_id}")
async def delete_alert(alert_id: int):
    global alerts
    alerts = [a for a in alerts if a["id"] != alert_id]
    return {"message": "Alert cleared"}

@app.get("/api/activity-history", response_model=List[ActivityHistoryResponse])
async def get_activity_history(limit: int = 50):
    return activity_history[-limit:][::-1]

@app.get("/api/activity-history/user/{user_id}", response_model=List[ActivityHistoryResponse])
async def get_user_activity_history(user_id: int):
    user_activity = [a for a in activity_history if a["userId"] == user_id]
    return user_activity[::-1]

@app.get("/api/cctv", response_model=List[CCTVCameraResponse])
async def get_cctv_data():
    return cctv_camera_data

@app.get("/api/cctv/{spot_number}", response_model=CCTVCameraResponse)
async def get_cctv_camera(spot_number: int):
    camera = next((c for c in cctv_camera_data if c["spotNumber"] == spot_number), None)
    if not camera:
        raise HTTPException(status_code=404, detail="Camera not found")
    return camera

@app.post("/api/cctv/{spot_number}", response_model=CCTVCameraResponse)
async def update_cctv_camera(spot_number: int, update: CCTVCameraUpdate):
    camera = next((c for c in cctv_camera_data if c["spotNumber"] == spot_number), None)

    if camera:
        if update.status is not None:
            camera["status"] = update.status
        if update.occupancyDetected is not None:
            camera["occupancyDetected"] = update.occupancyDetected
        if update.confidence is not None:
            camera["confidence"] = update.confidence
        camera["lastUpdate"] = datetime.now()
    else:
        camera = {
            "spotNumber": spot_number,
            "status": update.status or "active",
            "occupancyDetected": update.occupancyDetected or False,
            "confidence": update.confidence or 0,
            "lastUpdate": datetime.now()
        }
        cctv_camera_data.append(camera)

    return camera

@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    occupied_count = len(parking_lot["occupiedSpots"])
    total_spots = parking_lot["totalSpots"]
    occupancy_percentage = round((occupied_count / total_spots) * 100)

    return {
        "totalSpots": total_spots,
        "occupiedSpots": occupied_count,
        "availableSpots": total_spots - occupied_count,
        "occupancyPercentage": occupancy_percentage,
        "totalAlerts": len(alerts),
        "totalUsers": len(users),
        "activeUsers": 1,
        "cameraCount": len(cctv_camera_data)
    }

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3001)