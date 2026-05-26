import { useState, useCallback, useMemo, useEffect } from 'react'
import CameraPlayer from '../components/CameraPlayer'
import './AdminDashboard.css'

const API_BASE_URL = 'http://localhost:3001'
const LIVE_CAMERA_URL = 'http://127.0.0.1:4747/video'
const DEFAULT_ALERT_TIMESTAMP = new Date(Date.now() - 60000)
const INITIAL_OCCUPANCY_MAP = {
  1: [0, 2, 4, 7]
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSpots: 8,
    occupiedSpots: INITIAL_OCCUPANCY_MAP[1].length,
    availableSpots: 8 - INITIAL_OCCUPANCY_MAP[1].length,
    occupancyPercentage: Math.round((INITIAL_OCCUPANCY_MAP[1].length / 8) * 100),
    totalAlerts: 2,
    cameraCount: 8
  })
  const [cctvCameras, setCctvCameras] = useState([
    { spotNumber: 0, status: 'active', occupancyDetected: true, confidence: 98, lastUpdate: new Date() },
    { spotNumber: 1, status: 'active', occupancyDetected: false, confidence: 97, lastUpdate: new Date() },
    { spotNumber: 2, status: 'active', occupancyDetected: true, confidence: 95, lastUpdate: new Date() },
    { spotNumber: 3, status: 'active', occupancyDetected: false, confidence: 99, lastUpdate: new Date() },
    { spotNumber: 4, status: 'active', occupancyDetected: false, confidence: 96, lastUpdate: new Date() },
    { spotNumber: 5, status: 'active', occupancyDetected: true, confidence: 94, lastUpdate: new Date() },
    { spotNumber: 6, status: 'active', occupancyDetected: false, confidence: 98, lastUpdate: new Date() },
    { spotNumber: 7, status: 'active', occupancyDetected: true, confidence: 92, lastUpdate: new Date() }
  ])
  const [occupiedSpots, setOccupiedSpots] = useState(INITIAL_OCCUPANCY_MAP[1])
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'HIGH_OCCUPANCY', message: 'Parking lot at 50% capacity', timestamp: new Date(), severity: 'warning' },
    { id: 2, type: 'SPACE_AVAILABLE', message: 'New parking spaces now available on Floor 2', timestamp: DEFAULT_ALERT_TIMESTAMP, severity: 'info' }
  ])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState(null)
  const [selectedSpotInfo, setSelectedSpotInfo] = useState(null)
  const [spotModalOpen, setSpotModalOpen] = useState(false)

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

  const calculateStats = useCallback((occupiedSpots) => {
    const occupied = occupiedSpots.length
    const totalSpots = 8

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
    const interval = setInterval(fetchAll, 3000)

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
    const currentlyOccupied = getFloorOccupancy(spotIndex)

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
      setCctvCameras(prev => prev.map(cam => cam.spotNumber === spotIndex ? {
        ...cam,
        occupancyDetected: !currentlyOccupied
      } : cam))
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
  }, [calculateStats, occupiedSpots, getFloorOccupancy])

  const getFloorOccupancy = useCallback((spotIndex) => {
    const camera = cctvCameras.find(cam => cam.spotNumber === spotIndex)
    if (camera) {
      return camera.occupancyDetected
    }
    return occupiedSpots.includes(spotIndex)
  }, [occupiedSpots, cctvCameras])

  const openSpotDetails = useCallback((spotIndex) => {
    const isOccupied = getFloorOccupancy(spotIndex)
    const metadata = spotDetailsMap[1]?.[spotIndex] || {}

    setSelectedSpotInfo({
      floor: 1,
      spotNumber: spotIndex,
      isOccupied,
      ...metadata
    })
    setSpotModalOpen(true)
  }, [getFloorOccupancy, spotDetailsMap])

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
            <CameraPlayer initialUrl={LIVE_CAMERA_URL} />
          </div>
          
          <div className="floor-selector">
            <p>Floor 1 only — directly synced with the OpenCV camera feed.</p>
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
            <p>Active Floor 1 Camera</p>
          </div>

          <div className="floor-view">
            <h4>Floor 1 - Slot Overview</h4>
            <p className="muted-text">Click a spot to toggle occupancy for Floor 1.</p>
            <div className="floor-map">
              <div className="floor-content">
                <p>Floor 1 Layout</p>
                <div className="spot-grid-preview">
                  {Array.from({ length: 8 }, (_, i) => {
                    const isOccupied = getFloorOccupancy(i)
                    return (
                      <div
                        key={i}
                        className={`spot-preview ${isOccupied ? 'occupied' : 'empty'}`}
                        onClick={() => openSpotDetails(i)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            openSpotDetails(i)
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
              <CameraPlayer initialUrl={LIVE_CAMERA_URL} />
            </div>

            <button className="close-modal-btn" onClick={() => setSelectedCamera(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
