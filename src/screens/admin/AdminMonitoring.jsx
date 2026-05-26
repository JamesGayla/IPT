import { useState, useEffect, useMemo, useCallback } from 'react'
import CameraPlayer from '../../components/CameraPlayer'
import '../AdminDashboard.css'

const API_BASE_URL = 'http://localhost:3001'
const LIVE_CAMERA_URL = 'http://127.0.0.1:4747/video' // OpenCV stream source for floor 1 detection

export default function AdminMonitoring() {
  const [cctvCameras, setCctvCameras] = useState([])
  const [occupiedSpots, setOccupiedSpots] = useState([])
  const [lastSync, setLastSync] = useState(null)

  const fetchStatus = useCallback(async () => {
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
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
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
      <div style={{ marginBottom: '20px' }}>
        <CameraPlayer initialUrl={LIVE_CAMERA_URL} />
      </div>

      <div className="floor-selector">
        <p>Floor 1 only — directly synced with the OpenCV camera.
          If slot 1 is empty in the camera, it will show empty here.</p>
        {lastSync && (
          <p className="muted-text">Last sync: {lastSync.toLocaleTimeString()}</p>
        )}
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
                    onClick={() => toggleSpotOccupancy(i)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        toggleSpotOccupancy(i)
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
  )
}
