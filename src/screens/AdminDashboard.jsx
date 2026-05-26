import { useState, useCallback, useMemo, useEffect } from 'react'
import CameraPlayer from '../components/CameraPlayer'
import './AdminDashboard.css'

const API_BASE_URL = 'http://localhost:3001'
const LIVE_CAMERA_URL = 'http://127.0.0.1:4747/video'
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
  const [occupiedSpots, setOccupiedSpots] = useState(INITIAL_OCCUPANCY_MAP[1])
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'HIGH_OCCUPANCY', message: 'Parking lot at 50% capacity', timestamp: new Date(), severity: 'warning' },
    { id: 2, type: 'SPACE_AVAILABLE', message: 'New parking spaces now available on Floor 2', timestamp: DEFAULT_ALERT_TIMESTAMP, severity: 'info' }
  ])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [selectedFloor, setSelectedFloor] = useState(1)

  const calculateStats = useCallback((occupiedSpots) => {
    const occupied = occupiedSpots.length
    const totalSpots = 12

    return {
      totalSpots,
      occupiedSpots: occupied,
      availableSpots: Math.max(0, totalSpots - occupied),
      occupancyPercentage: Math.round((occupied / totalSpots) * 100)
    }
  }, [])

  const fetchParkingStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parking-lot`)
      if (!response.ok) {
        throw new Error('Failed to load parking status')
      }
      const data = await response.json()
      setOccupiedSpots(data.occupiedSpots)
      setStats(prev => ({
        ...prev,
        ...calculateStats(data.occupiedSpots)
      }))
    } catch (error) {
      console.error('Unable to fetch parking status:', error)
    }
  }, [calculateStats])

  const fetchCctvStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cctv`)
      if (!response.ok) return
      const cameras = await response.json()
      setCctvCameras(cameras.map(cam => ({
        ...cam,
        lastUpdate: cam.lastUpdate ? new Date(cam.lastUpdate) : new Date()
      })))
      setStats(prev => ({
        ...prev,
        cameraCount: cameras.length
      }))
    } catch (error) {
      console.error('Unable to fetch CCTV status:', error)
    }
  }, [])

  const fetchAll = useCallback(() => {
    fetchParkingStatus()
    fetchCctvStatus()
    setAlerts(prev => prev.map(alert => ({
      ...alert,
      timestamp: new Date()
    })))
  }, [fetchParkingStatus, fetchCctvStatus])

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

  const handleLogout = useCallback(() => {
    setActiveTab('overview')
  }, [])

  const toggleSpotOccupancy = useCallback(async (floor, spotIndex) => {
    const spotLabel = `A${spotIndex + 1}`
    const currentlyOccupied = occupiedSpots.includes(spotIndex)

    if (!window.confirm(`Confirm ${currentlyOccupied ? 'freeing' : 'occupying'} spot ${spotLabel}?`)) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/parking-lot/toggle/${spotIndex}`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Unable to update parking spot')
      }

      const data = await response.json()
      setOccupiedSpots(data.occupiedSpots)
      setStats(prevStats => ({
        ...prevStats,
        ...calculateStats(data.occupiedSpots)
      }))
    } catch (error) {
      console.error('Failed to update parking spot:', error)
      window.alert('Unable to update parking spot. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [calculateStats, occupiedSpots])

  const getFloorOccupancy = useCallback((floor, spotIndex) => {
    return occupiedSpots.includes(spotIndex)
  }, [occupiedSpots])

  const floorCameraUrlMap = useMemo(() => ({
    1: LIVE_CAMERA_URL,
    2: LIVE_CAMERA_URL,
    3: LIVE_CAMERA_URL,
    4: LIVE_CAMERA_URL
  }), [])

  if (loading) {
    return <div className="admin-dashboard"><p>Loading...</p></div>
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="sidebar-title">Admin Menu</div>
          <button
            className={`sidebar-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`sidebar-button ${activeTab === 'cctv' ? 'active' : ''}`}
            onClick={() => setActiveTab('cctv')}
          >
            Monitoring
          </button>
          <button
            className={`sidebar-button ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            Alerts
          </button>
        </aside>

        <div className="admin-main-content">
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
                        onClick={() => toggleSpotOccupancy(selectedFloor, i)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            toggleSpotOccupancy(selectedFloor, i)
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
    </div>
  </div>
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
