# Parking Lot Manager - Full Stack Application

A comprehensive parking lot management system with web admin dashboard, mobile user app, backend API, and IoT sensor integration. Built according to the project proposal specifications.

## 🏗️ System Architecture

The application consists of **4 main components**:

### 1. **Web App Component** (Admin/Desktop)
- Centralized admin dashboard for parking lot monitoring
- IoT sensor data visualization
- Alert management system
- Real-time occupancy tracking
- Activity history logging
- **Location**: `/src`
- **Tech Stack**: React 19 + Vite + CSS Grid

### 2. **Mobile App Component** (User-Facing)
- User login and authentication
- Live parking availability status
- Alert/notification viewing
- Activity history
- Device control interface
- **Location**: `/mobile`
- **Tech Stack**: React 19 + Vite (mobile-optimized)

### 3. **Backend API Component**
- RESTful API for all system operations
- User authentication and authorization
- Data processing and sensor integration
- Alert generation and management
- Activity logging
- **Location**: `/server`
- **Tech Stack**: Express.js, CORS-enabled

### 4. **IoT Integration Component**
- Sensor data collection endpoints
- Temperature and humidity monitoring
- Motion detection for vehicles
- Real-time sensor data streaming
- **Endpoints**: `/api/sensors`

## 📁 Project Structure

```
parking-lot-manager/
├── src/                          # Web App (Admin)
│   ├── components/               
│   │   ├── Header.jsx
│   │   ├── ParkingSpot.jsx
│   │   ├── Status Badge.jsx
│   │   └── Components.css
│   ├── screens/
│   │   ├── Dashboard.jsx        # User parking view
│   │   ├── AdminDashboard.jsx   # Admin panel (stats, sensors, alerts)
│   │   ├── Dashboard.css
│   │   └── AdminDashboard.css
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
│
├── mobile/                       # Mobile App
│   ├── screens/
│   │   ├── Login.jsx            # User authentication
│   │   ├── LiveStatus.jsx       # Real-time parking status
│   │   ├── Alerts.jsx           # Alert notifications
│   │   ├── ActivityHistory.jsx  # Activity logs
│   │   └── Profile.jsx          # User profile
│   ├── styles/
│   │   ├── Login.css
│   │   ├── LiveStatus.css
│   │   ├── Alerts.css
│   │   ├── ActivityHistory.css
│   │   └── Profile.css
│   ├── MobileApp.jsx
│   ├── MobileApp.css
│   ├── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                      # Backend API
│   ├── index.js                # Express server with:
│   │                          # - Authentication endpoints
│   │                          # - Parking lot management
│   │                          # - Alert system
│   │                          # - Activity history
│   │                          # - IoT sensor integration
│   └── package.json
│
├── package.json                # Root configuration
├── vite.config.js             # Web app Vite config
├── postcss.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1. **Install root dependencies**:
```bash
npm install
```

2. **Install mobile app dependencies**:
```bash
npm run mobile:install
```

3. **Server dependencies** install automatically when first run.

## ▶️ Running the Application

### Option 1: Run Everything (Recommended)
```bash
npm start
```
This starts:
- **Backend API**: http://localhost:3001
- **Web App**: http://localhost:5173
- **Available after setup**: Mobile app on http://localhost:5174

### Option 2: Run Services Individually

**Web App only** (requires running backend separately):
```bash
npm run dev
```

**Mobile App only**:
```bash
npm run dev:mobile
```

**Backend API only**:
```bash
npm run server
```

**Backend API (production)**:
```bash
npm run server:start
```

## 🔐 Authentication

Default test users:
- **Admin**: user: `admin` / password: `admin123`
- **User**: user: `user1` / password: `user123`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Parking Management
- `GET /api/parking-lot` - Get parking status
- `POST /api/parking-lot/toggle/:spotNumber` - Toggle spot availability

### Alerts
- `GET /api/alerts` - Get all alerts
- `POST /api/alerts` - Create new alert
- `DELETE /api/alerts/:alertId` - Clear alert

### Activity History
- `GET /api/activity-history` - Get all activity logs
- `GET /api/activity-history/user/:userId` - Get user-specific activity

### IoT Sensors
- `GET /api/sensors` - Get all sensor data
- `GET /api/sensors/:spotNumber` - Get specific sensor data
- `POST /api/sensors/:spotNumber` - Update sensor data

### Dashboard Stats
- `GET /api/stats` - Get system statistics
- `GET /api/health` - Health check

## 🎯 Features

### Web App (Admin Dashboard)
✅ Real-time occupancy monitoring  
✅ Parking spot grid with status indicators  
✅ IoT sensor monitoring (temperature, humidity, motion)  
✅ Alert management and severity levels  
✅ System statistics dashboard  
✅ Activity history tracking  
✅ User and administrative controls  

### Mobile App (User Interface)
✅ User login/authentication  
✅ Live parking availability view  
✅ Alert notifications  
✅ Activity history  
✅ User profile management  
✅ Mobile-optimized responsive design  

### Backend API
✅ User authentication system  
✅ RESTful architecture  
✅ Data persistence (in-memory for demo)  
✅ CORS-enabled for frontend integration  
✅ IoT sensor data endpoints  
✅ Alert generation and management  
✅ Activity logging  

### IoT Integration
✅ Temperature monitoring  
✅ Humidity sensors  
✅ Motion/vehicle detection  
✅ Real-time sensor data streaming  
✅ Sensor status dashboard  

## 🔄 Data Flow

```
[Mobile Users] ──auth──→ [Backend API] ←──query── [Web Admin]
                            ↓
                      [IoT Sensors]
                            ↓
                     [Data Processing]
                            ↓
                    [Alerts & Logging]
```

## 🛠️ Development

### Technology Stack

**Frontend**:
- React 19 with Hooks
- Vite (fast build tool)
- CSS Grid & Flexbox
- Responsive design

**Backend**:
- Express.js (Node.js)
- CORS middleware
- In-memory data storage
- RESTful API

**Tools**:
- ESLint for code quality
- Concurrently for parallel execution
- Vite for development server

## 📦 Building for Production

### Web App
```bash
npm run build
```

### Mobile App
```bash
npm run build:mobile
```

Output directories:
- Web: `dist/`
- Mobile: `mobile/dist/`

## 🎨 Customization

### Adding New Spots
Edit `server/index.js`:
```javascript
totalSpots: 12 // Change this number
```

### Adjusting Alert Rules
Modify alert endpoints in `server/index.js`:
```javascript
app.post('/api/alerts', (req, res) => {
  // Customize alert logic here
});
```

### Styling
- Web app: `src/**/*.css`
- Mobile app: `mobile/styles/*.css`
- Global header: `src/components/Header.css`

## 📱 Mobile App Usage

1. Launch: `npm run dev:mobile`
2. Open: http://localhost:5174
3. Login with test credentials
4. View features:
   - **Status tab**: Real-time parking availability
   - **Alerts tab**: Recent notifications
   - **History tab**: Activity logs
   - **Profile tab**: User information & logout

## 🐛 Troubleshooting

**Port already in use**:
- API: Change PORT in `server/index.js`
- Web: Vite auto-selects next available port
- Mobile: Modify `mobile/vite.config.js`

**CORS errors**:
- Backend already has CORS enabled
- Verify API URL in frontend code

**Module not found**:
- Run `npm install` in root and `npm run mobile:install`
- Clear `node_modules` and reinstall

## 📄 API Response Examples

### Get Parking Status
```json
{
  "totalSpots": 12,
  "occupiedSpots": [0, 2, 3, 5, 7, 9],
  "availableSpots": 6,
  "occupancyPercentage": 50
}
```

### Get Sensor Data
```json
{
  "spotNumber": 0,
  "temperature": 28.5,
  "humidity": 65,
  "motionDetected": true,
  "timestamp": "2026-02-11T10:30:00.000Z"
}
```

### Get Alerts
```json
[
  {
    "id": 1,
    "type": "HIGH_OCCUPANCY",
    "message": "Parking lot at 50% capacity",
    "severity": "warning",
    "timestamp": "2026-02-11T10:30:00.000Z"
  }
]
```

## 📈 System Metrics

- **Total Parking Spots**: 12
- **Sensors per Spot**: Temperature, Humidity, Motion detection
- **Update Frequency**: Real-time
- **Alert Types**: 10+ configurable
- **User Roles**: Admin, User

## 🔄 Next Steps for Enhancement

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Real IoT device integration
- [ ] Push notifications
- [ ] Real-time WebSocket updates
- [ ] Advanced reporting and analytics
- [ ] Machine learning for occupancy prediction
- [ ] Mobile app native deployment (iOS/Android)
- [ ] Payment integration for parking reservations

## 📞 Support

For issues or questions, refer to API endpoints and code comments in:
- `server/index.js` - Full API implementation
- `src/screens/AdminDashboard.jsx` - Admin features
- `mobile/screens/` - Mobile features

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: ✅ Fully Functional
