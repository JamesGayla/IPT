import { useState, useCallback, useMemo, useEffect } from 'react'
import CameraPlayer from '../components/CameraPlayer'
import './AdminDashboard.css'

const DEFAULT_ALERT_TIMESTAMP = new Date(Date.now() - 60000)
const INITIAL_OCCUPANCY_MAP = {
  1: [0, 2, 4, 7, 9],
  2: [1, 3, 5, 8, 10],
  3: [0, 3, 6, 9, 11],
  4: [1, 4, 7]
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSpots: 12,
    occupiedSpots: INITIAL_OCCUPANCY_MAP[1].length,
    availableSpots: 12 - INITIAL_OCCUPANCY_MAP[1].length,
    occupancyPercentage: Math.round((INITIAL_OCCUPANCY_MAP[1].length / 12) * 100),
    totalAlerts: 2,
    cameraCount: 12
  })
  const [cctvCameras, setCctvCameras] = useState([
    { spotNumber: 0, status: 'active', occupancyDetected: true, confidence: 98, lastUpdate: new Date() },
    { spotNumber: 1, status: 'active', occupancyDetected: false, confidence: 97, lastUpdate: new Date() },
    { spotNumber: 2, status: 'active', occupancyDetected: true, confidence: 95, lastUpdate: new Date() },
    { spotNumber: 3, status: 'active', occupancyDetected: false, confidence: 99, lastUpdate: new Date() },
    { spotNumber: 4, status: 'active', occupancyDetected: false, confidence: 96, lastUpdate: new Date() },
    { spotNumber: 5, status: 'active', occupancyDetected: true, confidence: 94, lastUpdate: new Date() },
    { spotNumber: 6, status: 'active', occupancyDetected: false, confidence: 98, lastUpdate: new Date() },
    { spotNumber: 7, status: 'active', occupancyDetected: true, confidence: 92, lastUpdate: new Date() },
    { spotNumber: 8, status: 'active', occupancyDetected: false, confidence: 95, lastUpdate: new Date() },
    { spotNumber: 9, status: 'active', occupancyDetected: true, confidence: 97, lastUpdate: new Date() },
    { spotNumber: 10, status: 'active', occupancyDetected: false, confidence: 96, lastUpdate: new Date() },
    { spotNumber: 11, status: 'active', occupancyDetected: true, confidence: 99, lastUpdate: new Date() }
  ])
  const [occupancyMap, setOccupancyMap] = useState({
    1: [0, 2, 4, 7, 9],
    2: [1, 3, 5, 8, 10],
    3: [0, 3, 6, 9, 11],
    4: [1, 4, 7]
  })
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'HIGH_OCCUPANCY', message: 'Parking lot at 50% capacity', timestamp: new Date(), severity: 'warning' },
    { id: 2, type: 'SPACE_AVAILABLE', message: 'New parking spaces now available on Floor 2', timestamp: DEFAULT_ALERT_TIMESTAMP, severity: 'info' }
  ])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [selectedSpotInfo, setSelectedSpotInfo] = useState(null)
  const [spotModalOpen, setSpotModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const spotDetailsMap = useMemo(() => ({
    1: {
      0: { driverName: 'Maria Cruz', plateNumber: 'ABC-1234', vehicleType: 'Sedan' },
      2: { driverName: 'John Dela Cruz', plateNumber: 'XYZ-5678', vehicleType: 'SUV' },
      4: { driverName: 'June Santos', plateNumber: 'PQR-9012', vehicleType: 'Motorbike' },
      7: { driverName: 'Mark Reyes', plateNumber: 'LMN-3456', vehicleType: 'Pickup' },
      9: { driverName: 'Anna Velasquez', plateNumber: 'GHI-7890', vehicleType: 'Sedan' }
    },
    2: {
      1: { driverName: 'Carl Ramos', plateNumber: 'JKL-2345', vehicleType: 'Van' },
      3: { driverName: 'Nina Bautista', plateNumber: 'STU-5678', vehicleType: 'SUV' },
      5: { driverName: 'Rico Morales', plateNumber: 'DEF-9012', vehicleType: 'Sedan' },
      8: { driverName: 'Paula Cruz', plateNumber: 'HJK-6543', vehicleType: 'Hatchback' },
      10: { driverName: 'Leo Santos', plateNumber: 'VWX-4321', vehicleType: 'Pickup' }
    },
    3: {
      0: { driverName: 'Ana Lopez', plateNumber: 'ZXC-7890', vehicleType: 'Coupe' },
      3: { driverName: 'Tom Reyes', plateNumber: 'QWE-1234', vehicleType: 'SUV' },
      6: { driverName: 'Gina Fernandez', plateNumber: 'IOP-4567', vehicleType: 'Sedan' },
      9: { driverName: 'Jake Torres', plateNumber: 'ASD-8901', vehicleType: 'Van' },
      11: { driverName: 'Mia Antonio', plateNumber: 'FGH-2345', vehicleType: 'Pickup' }
    },
    4: {
      1: { driverName: 'Erik Ramos', plateNumber: 'RTY-6789', vehicleType: 'Sedan' },
      4: { driverName: 'Vera Dizon', plateNumber: 'UIO-1234', vehicleType: 'SUV' },
      7: { driverName: 'Joel Navarro', plateNumber: 'PAS-5678', vehicleType: 'Cargo Van' }
    }
  }), [])

  const calculateStats = useCallback((map, floor) => {
    const occupiedSpots = (map[floor] || []).length
    const totalSpots = 12

    return {
      totalSpots,
      occupiedSpots,
      availableSpots: Math.max(0, totalSpots - occupiedSpots),
      occupancyPercentage: Math.round((occupiedSpots / totalSpots) * 100)
    }
  }, [])

  const fetchAll = useCallback(() => {
    // In a real app this would call APIs.
    setStats(prev => ({
      ...prev,
      ...calculateStats(occupancyMap, selectedFloor),
      totalAlerts: Math.max(0, prev.totalAlerts + (Math.random() > 0.67 ? 1 : 0))
    }))

    setCctvCameras(prev => prev.map(cam => ({
      ...cam,
      lastUpdate: new Date(),
      confidence: Math.round(90 + Math.random() * 10)
    })))

    setAlerts(prev => prev.map(alert => ({
      ...alert,
      timestamp: new Date()
    })))
  }, [calculateStats, occupancyMap])

  useEffect(() => {
    const startRefresh = () => {
      fetchAll()
    }

    const timer = setTimeout(startRefresh, 100)
    const interval = setInterval(fetchAll, 15000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [fetchAll])

  useEffect(() => {
    setStats(prev => ({
      ...prev,
      ...calculateStats(occupancyMap, selectedFloor)
    }))
  }, [occupancyMap, selectedFloor, calculateStats])

  const handleLogin = useCallback(async (e) => {
    e.preventDefault()
    setLoginError('')
    
    const ADMIN_USERNAME = 'admin'
    const ADMIN_PASSWORD = 'admin123'
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setUsername('')
      setPassword('')
      setLoading(true)

      // Simulate async data load, then render dashboard
      setTimeout(() => setLoading(false), 250)
    } else {
      setLoginError('Invalid username or password')
    }
  }, [username, password])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    setActiveTab('overview')
  }, [])

  const toggleSpotOccupancy = useCallback((floor, spotIndex) => {
    setOccupancyMap(prev => {
      const currentFloor = new Set(prev[floor] || [])
      if (currentFloor.has(spotIndex)) {
        currentFloor.delete(spotIndex)
      } else {
        currentFloor.add(spotIndex)
      }

      const nextMap = {
        ...prev,
        [floor]: Array.from(currentFloor).sort((a, b) => a - b)
      }

      setStats(prevStats => ({
        ...prevStats,
        ...calculateStats(nextMap, floor)
      }))

      return nextMap
    })
  }, [calculateStats])

  const getFloorOccupancy = useCallback((floor, spotIndex) => {
    return occupancyMap[floor]?.includes(spotIndex) || false
  }, [occupancyMap])

  const openSpotDetails = useCallback((floor, spotIndex) => {
    const isOccupied = getFloorOccupancy(floor, spotIndex)
    const metadata = spotDetailsMap[floor]?.[spotIndex] || {}

    setSelectedSpotInfo({
      floor,
      spotNumber: spotIndex,
      isOccupied,
      ...metadata
    })
    setSpotModalOpen(true)
  }, [getFloorOccupancy, spotDetailsMap])

  const floorCameraUrlMap = useMemo(() => ({
    1: '/Mockup%20Camera.mp4',
    2: '/Mockup%20Camera%202.mp4',
    3: '/Mockup%20Camera%203.mp4',
    4: '/Mockup%20Camera%204.mp4'
  }), [])

  if (!isAuthenticated) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>ParkFlow</h1>
            <h2>Admin Login</h2>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            {loginError && <div className="login-error">{loginError}</div>}
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button type="submit" className="login-btn">Sign In</button>
          </form>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="admin-dashboard"><p>Loading...</p></div>
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'cctv' ? 'active' : ''}`}
          onClick={() => setActiveTab('cctv')}
        >
          Monitoring
        </button>
        <button 
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <div className="admin-content">
          <div className="stats-grid">
            <div className="card-minimal">
              <h3>Total Spots</h3>
              <p className="bigstat">{stats.totalSpots}</p>
            </div>
            <div className="card-minimal">
              <h3>Occupied</h3>
              <p className="bigstat" style={{ color: '#ef4444' }}>{stats.occupiedSpots}</p>
            </div>
            <div className="card-minimal">
              <h3>Available</h3>
              <p className="bigstat" style={{ color: '#10b981' }}>{stats.availableSpots}</p>
            </div>
            <div className="card-minimal">
              <h3>Occupancy</h3>
              <p className="bigstat">{stats.occupancyPercentage}%</p>
            </div>
            <div className="card-minimal">
              <h3>Total Alerts</h3>
              <p className="bigstat">{stats.totalAlerts}</p>
            </div>
            <div className="card-minimal">
              <h3>CCTV Cameras</h3>
              <p className="bigstat">{stats.cameraCount}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cctv' && (
        <div className="admin-content">
          <h3>CCTV Camera Network</h3>
          <div style={{ marginBottom: '20px' }}>
            <CameraPlayer initialUrl={floorCameraUrlMap[selectedFloor] || '/Mockup%20Camera.mp4'} />
          </div>
          
          <div className="floor-selector">
            <p>Select Parking Floor:</p>
            <div className="floor-buttons">
              {[1, 2, 3, 4].map(floor => (
                <button
                  key={floor}
                  className={`floor-btn ${selectedFloor === floor ? 'active' : ''}`}
                  onClick={() => setSelectedFloor(floor)}
                >
                  Floor {floor}
                </button>
              ))}
            </div>
          </div>

          <div className="cctv-summary" style={{ marginBottom: '16px' }}>
            <h4>CCTV Camera Status</h4>
            <ul>
              {cctvCameras.map(cam => (
                <li key={cam.spotNumber}>
                  Spot {cam.spotNumber + 1}: {cam.status} - {cam.occupancyDetected ? 'Occupied' : 'Available'}
                </li>
              ))}
            </ul>
          </div>

          <div className="floor-dedicated-camera" style={{ marginBottom: '16px' }}>
            <p>Active Floor {selectedFloor} Camera</p>
          </div>

          <div className="floor-view">
            <h4>Floor {selectedFloor} - Slot Overview</h4>
            <p className="muted-text">Click a spot to toggle occupancy for the selected floor.</p>
            <div className="floor-map">
              <div className="floor-content">
                <p>Floor {selectedFloor} Layout</p>
                <div className="spot-grid-preview">
                  {Array.from({ length: 12 }, (_, i) => {
                    const isOccupied = getFloorOccupancy(selectedFloor, i)
                    return (
                      <div
                        key={i}
                        className={`spot-preview ${isOccupied ? 'occupied' : 'empty'}`}
                        onClick={() => openSpotDetails(selectedFloor, i)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            openSpotDetails(selectedFloor, i)
                          }
                        }}
                      >
                        <span>{i + 1}</span>
                        {isOccupied ? 'Occupied' : 'Empty'}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="admin-content">
          <h3>System Alerts</h3>
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-row alert-${alert.severity}`}>
                <div>
                  <strong>{alert.type.replace(/_/g, ' ')}</strong>
                  <p>{alert.message}</p>
                  <small>{new Date(alert.timestamp).toLocaleString()}</small>
                </div>
                <span className="severity-badge">{alert.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {spotModalOpen && selectedSpotInfo && (
        <div className="camera-modal-overlay" onClick={() => setSpotModalOpen(false)}>
          <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSpotModalOpen(false)}>×</button>
            <h2>Spot A{selectedSpotInfo.spotNumber + 1} Details</h2>
            <p>Floor {selectedSpotInfo.floor}</p>
            <p>Status: <strong>{selectedSpotInfo.isOccupied ? 'Occupied' : 'Available'}</strong></p>

            {selectedSpotInfo.isOccupied ? (
              <div style={{ marginTop: 12 }}>
                <p><strong>Driver Name:</strong> {selectedSpotInfo.driverName || 'Unknown'}</p>
                <p><strong>Plate Number:</strong> {selectedSpotInfo.plateNumber || 'Unknown'}</p>
                <p><strong>Vehicle Type:</strong> {selectedSpotInfo.vehicleType || 'Unknown'}</p>
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <p>This parking spot is currently available.</p>
              </div>
            )}

            <button
              className="close-modal-btn"
              onClick={() => {
                toggleSpotOccupancy(selectedSpotInfo.floor, selectedSpotInfo.spotNumber)
                setSpotModalOpen(false)
              }}
            >
              {selectedSpotInfo.isOccupied ? 'Free Spot' : 'Mark Occupied'}
            </button>

            <button
              className="close-modal-btn"
              onClick={() => {
                setSpotModalOpen(false)
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedCamera && (
        <div className="camera-modal-overlay" onClick={() => setSelectedCamera(null)}>
          <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCamera(null)}>×</button>
            <h2>Floor {selectedCamera.floor} - Camera View</h2>

            <div style={{ marginTop: 12 }}>
              <CameraPlayer initialUrl={floorCameraUrlMap[selectedCamera.floor] || '/Mockup%20Camera.mp4'} />
            </div>

            <button className="close-modal-btn" onClick={() => setSelectedCamera(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
