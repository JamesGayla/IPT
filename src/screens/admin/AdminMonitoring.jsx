import { useState, useEffect, useMemo, useCallback } from 'react'
import CameraPlayer from '../../components/CameraPlayer'
import '../AdminDashboard.css'

const API_BASE_URL = 'http://localhost:3001'
const LIVE_CAMERA_URL = 'http://127.0.0.1:4747/video' // OpenCV stream source for floor 1 detection

export default function AdminMonitoring() {
  const [cctvCameras, setCctvCameras] = useState([])
  const [occupiedSpots, setOccupiedSpots] = useState([])
  const [lastSync, setLastSync] = useState(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncError, setSyncError] = useState(null)

  const fetchStatus = useCallback(async () => {
    setIsSyncing(true)
    setSyncError(null)
    try {
      const [parkingRes, cctvRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/parking-lot`),
        fetch(`${API_BASE_URL}/api/cctv`)
      ])

      if (!parkingRes.ok || !cctvRes.ok) {
        throw new Error('Unable to load monitoring data')
      }

      const parking = await parkingRes.json()
      const cctv = await cctvRes.json()
      setOccupiedSpots(parking.occupiedSpots)
      setCctvCameras(cctv)
      setLastSync(new Date())
      setSyncError(null)
    } catch (error) {
      console.error('Sync error:', error)
      setSyncError(error.message)
    } finally {
      setIsSyncing(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    // Sync every 3 seconds as requested
    const interval = setInterval(fetchStatus, 3000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const getFloorOccupancy = useCallback((spotIndex) => {
    const camera = cctvCameras.find(cam => cam.spotNumber === spotIndex)
    if (camera) {
      return camera.occupancyDetected
    }
    return occupiedSpots.includes(spotIndex)
  }, [occupiedSpots, cctvCameras])

  const getCameraData = useCallback((spotIndex) => {
    return cctvCameras.find(cam => cam.spotNumber === spotIndex)
  }, [cctvCameras])

  const toggleSpotOccupancy = useCallback(async (spotIndex) => {
    const spotLabel = `A${spotIndex + 1}`
    const currentlyOccupied = getFloorOccupancy(spotIndex)

    if (!window.confirm(`Confirm ${currentlyOccupied ? 'freeing' : 'occupying'} spot ${spotLabel}?`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/parking-lot/toggle/${spotIndex}`, {
        method: 'POST'
      })
      if (!response.ok) {
        throw new Error('Unable to update spot')
      }
      const data = await response.json()
      setOccupiedSpots(data.occupiedSpots)
      setCctvCameras(prev => prev.map(cam => cam.spotNumber === spotIndex ? {
        ...cam,
        occupancyDetected: !currentlyOccupied
      } : cam))
    } catch (error) {
      console.error(error)
      window.alert('Unable to update spot. Please try again.')
    }
  }, [occupiedSpots, getFloorOccupancy])

  return (
    <div className="admin-content">
      <h3>CCTV Camera Network</h3>
      
      {/* Camera Stream */}
      <div style={{ marginBottom: '20px' }}>
        <CameraPlayer initialUrl={LIVE_CAMERA_URL} />
      </div>

      {/* Sync Status */}
      <div style={{ 
        padding: '12px', 
        background: 'var(--bg-tertiary)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <strong>Real-time Sync Status</strong>
          <p style={{ margin: '4px 0', fontSize: '0.9em', color: 'var(--text-secondary)' }}>
            Updates every 3 seconds from IP camera
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: isSyncing ? '#fbbf24' : lastSync ? '#10b981' : '#ef4444',
            animation: isSyncing ? 'pulse 0.5s infinite' : 'none'
          }} />
          <span style={{ fontSize: '0.9em' }}>
            {isSyncing ? 'Syncing...' : lastSync ? `Last sync: ${lastSync.toLocaleTimeString()}` : 'Waiting...'}
          </span>
        </div>
      </div>

      {syncError && (
        <div style={{ 
          padding: '12px', 
          background: '#fee2e2', 
          border: '1px solid #fca5a5', 
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#991b1b'
        }}>
          ⚠️ Sync Error: {syncError}
        </div>
      )}

      <div className="floor-selector">
        <p><strong>Camera-Based Detection:</strong> Occupancy status is detected from the live IP camera feed and synchronized to the admin panel with a 3-second delay.</p>
        <p style={{ marginTop: '8px', fontSize: '0.9em', color: 'var(--text-secondary)' }}>
          Total Cameras: {cctvCameras.length} | Connected: {cctvCameras.filter(c => c.status === 'active').length}
        </p>
      </div>

      <div className="floor-view">
        <h4>Floor 1 - Parking Spot Status (Synced from IP Camera)</h4>
        <p className="muted-text">Click a spot to manually toggle occupancy. Real-time camera detection updates every 3 seconds.</p>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {Array.from({ length: 8 }, (_, i) => {
              const isOccupied = getFloorOccupancy(i)
              const cameraData = getCameraData(i)
              
              return (
                <div
                  key={i}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: `2px solid ${isOccupied ? '#ef4444' : '#10b981'}`,
                    background: isOccupied ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => toggleSpotOccupancy(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleSpotOccupancy(i)
                    }
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ fontSize: '1.1em' }}>Spot A{i + 1}</strong>
                  </div>
                  <div style={{
                    padding: '8px',
                    borderRadius: '4px',
                    background: isOccupied ? '#ef4444' : '#10b981',
                    color: 'white',
                    textAlign: 'center',
                    marginBottom: '8px',
                    fontWeight: 'bold'
                  }}>
                    {isOccupied ? '🚗 OCCUPIED' : '✓ EMPTY'}
                  </div>
                  {cameraData && (
                    <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                      <p style={{ margin: '4px 0' }}>
                        Status: <span style={{ color: cameraData.status === 'active' ? '#10b981' : '#ef4444' }}>
                          {cameraData.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                        </span>
                      </p>
                      {cameraData.confidence !== undefined && (
                        <p style={{ margin: '4px 0' }}>
                          Confidence: <strong>{cameraData.confidence}%</strong>
                        </p>
                      )}
                      {cameraData.lastUpdate && (
                        <p style={{ margin: '4px 0', fontSize: '0.8em' }}>
                          Last: {new Date(cameraData.lastUpdate).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
