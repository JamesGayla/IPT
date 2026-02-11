import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let parkingLot = {
  totalSpots: 12,
  occupiedSpots: [0, 2, 3, 5, 7, 9]
};

let users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: 'admin@parking.com' },
  { id: 2, username: 'user1', password: 'user123', role: 'user', email: 'user1@parking.com' }
];

let alerts = [
  { id: 1, type: 'HIGH_OCCUPANCY', message: 'Parking lot at 50% capacity', timestamp: new Date(), severity: 'warning' },
  { id: 2, type: 'SPACE_AVAILABLE', message: 'New parking space available', timestamp: new Date(Date.now() - 60000), severity: 'info' }
];

let activityHistory = [
  { id: 1, userId: 1, action: 'LOGIN', timestamp: new Date(), details: 'Admin logged in' },
  { id: 2, userId: 2, action: 'VIEW_PARKING', timestamp: new Date(Date.now() - 5000), details: 'User viewed parking status' },
  { id: 3, userId: 2, action: 'BOOK_SPACE', timestamp: new Date(Date.now() - 10000), details: 'User booked spot 5' }
];

let sensorData = [
  { spotNumber: 0, temperature: 28.5, humidity: 65, motionDetected: true, timestamp: new Date() },
  { spotNumber: 1, temperature: 27.2, humidity: 62, motionDetected: false, timestamp: new Date() },
  { spotNumber: 2, temperature: 29.1, humidity: 68, motionDetected: true, timestamp: new Date() }
];

let currentUserSession = null;

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  currentUserSession = user;
  
  activityHistory.push({
    id: activityHistory.length + 1,
    userId: user.id,
    action: 'LOGIN',
    timestamp: new Date(),
    details: `${user.role} logged in`
  });
  
  res.json({
    token: 'fake-jwt-token',
    user: { id: user.id, username: user.username, role: user.role, email: user.email }
  });
});

app.post('/api/auth/logout', (req, res) => {
  if (currentUserSession) {
    activityHistory.push({
      id: activityHistory.length + 1,
      userId: currentUserSession.id,
      action: 'LOGOUT',
      timestamp: new Date(),
      details: `User logged out`
    });
    currentUserSession = null;
  }
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req, res) => {
  if (currentUserSession) {
    res.json(currentUserSession);
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

app.get('/api/parking-lot', (req, res) => {
  const occupancyPercentage = Math.round(
    (parkingLot.occupiedSpots.length / parkingLot.totalSpots) * 100
  );
  
  res.json({
    totalSpots: parkingLot.totalSpots,
    occupiedSpots: parkingLot.occupiedSpots,
    availableSpots: parkingLot.totalSpots - parkingLot.occupiedSpots.length,
    occupancyPercentage
  });
});

app.post('/api/parking-lot/toggle/:spotNumber', (req, res) => {
  const spotNumber = parseInt(req.params.spotNumber);
  
  if (spotNumber < 0 || spotNumber >= parkingLot.totalSpots) {
    return res.status(400).json({ error: 'Invalid spot number' });
  }
  
  const index = parkingLot.occupiedSpots.indexOf(spotNumber);
  
  if (index > -1) {
    parkingLot.occupiedSpots.splice(index, 1);
  } else {
    parkingLot.occupiedSpots.push(spotNumber);
  }
  
  if (currentUserSession) {
    activityHistory.push({
      id: activityHistory.length + 1,
      userId: currentUserSession.id,
      action: 'TOGGLE_SPOT',
      timestamp: new Date(),
      details: `Spot ${spotNumber} toggled to ${parkingLot.occupiedSpots.includes(spotNumber) ? 'occupied' : 'available'}`
    });
  }
  
  res.json({
    spotNumber,
    isOccupied: parkingLot.occupiedSpots.includes(spotNumber),
    occupiedSpots: parkingLot.occupiedSpots
  });
});

app.get('/api/alerts', (req, res) => {
  res.json(alerts.sort((a, b) => b.timestamp - a.timestamp));
});

app.post('/api/alerts', (req, res) => {
  const { type, message, severity } = req.body;
  
  const alert = {
    id: alerts.length + 1,
    type,
    message,
    severity: severity || 'info',
    timestamp: new Date()
  };
  
  alerts.push(alert);
  res.status(201).json(alert);
});

app.delete('/api/alerts/:alertId', (req, res) => {
  const alertId = parseInt(req.params.alertId);
  alerts = alerts.filter(a => a.id !== alertId);
  res.json({ message: 'Alert cleared' });
});

app.get('/api/activity-history', (req, res) => {
  const limit = req.query.limit || 50;
  res.json(activityHistory.slice(-limit).reverse());
});

app.get('/api/activity-history/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userActivity = activityHistory.filter(a => a.userId === userId);
  res.json(userActivity.reverse());
});

app.get('/api/sensors', (req, res) => {
  res.json(sensorData);
});

app.get('/api/sensors/:spotNumber', (req, res) => {
  const spotNumber = parseInt(req.params.spotNumber);
  const sensor = sensorData.find(s => s.spotNumber === spotNumber);
  
  if (!sensor) {
    return res.status(404).json({ error: 'Sensor not found' });
  }
  
  res.json(sensor);
});

app.post('/api/sensors/:spotNumber', (req, res) => {
  const spotNumber = parseInt(req.params.spotNumber);
  const { temperature, humidity, motionDetected } = req.body;
  
  let sensor = sensorData.find(s => s.spotNumber === spotNumber);
  
  if (sensor) {
    sensor.temperature = temperature;
    sensor.humidity = humidity;
    sensor.motionDetected = motionDetected;
    sensor.timestamp = new Date();
  } else {
    sensor = {
      spotNumber,
      temperature,
      humidity,
      motionDetected,
      timestamp: new Date()
    };
    sensorData.push(sensor);
  }
  
  res.json(sensor);
});

app.get('/api/stats', (req, res) => {
  const occupancyPercentage = Math.round(
    (parkingLot.occupiedSpots.length / parkingLot.totalSpots) * 100
  );
  
  res.json({
    totalSpots: parkingLot.totalSpots,
    occupiedSpots: parkingLot.occupiedSpots.length,
    availableSpots: parkingLot.totalSpots - parkingLot.occupiedSpots.length,
    occupancyPercentage,
    totalAlerts: alerts.length,
    totalUsers: users.length,
    activeUsers: 1,
    sensorCount: sensorData.length
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Parking Lot API running on http://localhost:${PORT}`);
});

