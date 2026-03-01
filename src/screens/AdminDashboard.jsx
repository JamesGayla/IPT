import { useState, useEffect, useCallback, useMemo } from 'react'
import './AdminDashboard.css'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [cctvCameras, setCCTVCameras] = useState([])
  const [alerts, setAlerts] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const fetchAll = useCallback(async () => {
    const mockStats = {
      totalSpots: 12,
      occupiedSpots: 6,
      availableSpots: 6,
      occupancyPercentage: 50,
      totalAlerts: 2,
      cameraCount: 12
    }

    const mockCCTVData = [
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
    ]

    const mockAlerts = [
      { id: 1, type: 'HIGH_OCCUPANCY', message: 'Parking lot at 50% capacity', timestamp: new Date(), severity: 'warning' },
      { id: 2, type: 'SPACE_AVAILABLE', message: 'New parking spaces now available on Floor 2', timestamp: new Date(Date.now() - 60000), severity: 'info' }
    ]

    setStats(mockStats)
    setCCTVCameras(mockCCTVData)
    setAlerts(mockAlerts)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isAuthenticated && loading) {
      fetchAll()
    }
  }, [isAuthenticated, loading, fetchAll])

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
    } else {
      setLoginError('Invalid username or password')
    }
  }, [username, password])

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false)
    setActiveTab('overview')
  }, [])

  const occupancyMap = useMemo(() => ({
    1: [0, 2, 4, 7, 9],
    2: [1, 3, 5, 8, 10],
    3: [0, 3, 6, 9, 11],
    4: [1, 4, 7]
  }), [])

  const getFloorOccupancy = useCallback((floor, spotIndex) => {
    return occupancyMap[floor]?.includes(spotIndex) || false
  }, [occupancyMap])

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
            <div className="stat-card">
              <h3>Total Spots</h3>
              <p className="stat-value">{stats.totalSpots}</p>
            </div>
            <div className="stat-card">
              <h3>Occupied</h3>
              <p className="stat-value" style={{ color: '#dc3545' }}>{stats.occupiedSpots}</p>
            </div>
            <div className="stat-card">
              <h3>Available</h3>
              <p className="stat-value" style={{ color: '#27ae60' }}>{stats.availableSpots}</p>
            </div>
            <div className="stat-card">
              <h3>Occupancy</h3>
              <p className="stat-value">{stats.occupancyPercentage}%</p>
            </div>
            <div className="stat-card">
              <h3>Total Alerts</h3>
              <p className="stat-value">{stats.totalAlerts}</p>
            </div>
            <div className="stat-card">
              <h3>CCTV Cameras</h3>
              <p className="stat-value" style={{ color: '#667eea' }}>{stats.cameraCount}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cctv' && (
        <div className="admin-content">
          <h3>CCTV Camera Network</h3>
          
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

          <div className="floor-view">
            <h4>Floor {selectedFloor} - Slot Overview</h4>
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
                        onClick={() => setSelectedCamera({spotNumber: i, floor: selectedFloor})}
                      >
                        <span>{i + 1}</span>
                        {isOccupied ? '●' : '○'}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSelectedCamera({floor: selectedFloor, spotNumber: null})}
              className="view-camera-btn"
              style={{ marginTop: '20px', width: '100%' }}
            >
              View Floor Camera
            </button>
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

      {selectedCamera && (
        <div className="camera-modal-overlay" onClick={() => setSelectedCamera(null)}>
          <div className="camera-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCamera(null)}>×</button>
            <h2>Floor {selectedCamera.floor} - Camera View</h2>
            
            <div className="mock-camera-feed">
              <div className="camera-placeholder">
                <p>Camera Feed</p>
                <p>Floor {selectedCamera.floor}</p>
              </div>
            </div>

            <button className="close-modal-btn" onClick={() => setSelectedCamera(null)}>Close</button>
          </div>
        </div>
      )}

      <button onClick={fetchAll} className="refresh-btn">Refresh Data</button>
    </div>
  )
}

export default AdminDashboard
