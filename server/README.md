# Parking Lot Manager API

This is the backend API for the Parking Lot Manager application, built with **FastAPI** (migrated from Express.js).

## Migration from Express.js

The original server was built with Node.js and Express.js. This version has been rewritten in Python using FastAPI, providing:

- **Type Safety**: Pydantic models ensure data validation
- **Auto Documentation**: Interactive API docs at `/docs`
- **Better Performance**: Async/await support out of the box
- **Modern Python**: Leveraging Python's ecosystem

## Setup

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   python main.py
   ```

   Or use the batch file:
   ```bash
   run_server.bat
   ```

The API will be available at `http://localhost:3001`

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info
- `GET /api/parking-lot` - Get parking lot status
- `POST /api/parking-lot/toggle/{spot_number}` - Toggle parking spot occupancy
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `DELETE /api/alerts/{alert_id}` - Delete alert
- `GET /api/activity-history` - Get activity history
- `GET /api/activity-history/user/{user_id}` - Get user activity history
- `GET /api/cctv` - Get CCTV camera data
- `GET /api/cctv/{spot_number}` - Get specific camera data
- `POST /api/cctv/{spot_number}` - Update camera data
- `GET /api/stats` - Get system statistics
- `GET /api/health` - Health check

## Development

For development with auto-reload:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 3001
```

## API Documentation

When running, visit `http://localhost:3001/docs` for interactive API documentation powered by Swagger UI, or `http://localhost:3001/redoc` for ReDoc documentation.