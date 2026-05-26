import { useState, useEffect, useMemo, useCallback } from 'react'
import CameraPlayer from '../../components/CameraPlayer'
import '../AdminDashboard.css'

const API_BASE_URL = 'http://localhost:3001'
const LIVE_CAMERA_URL = 'webcam' // use browser camera directly in the admin monitoring page

export default function AdminMonitoring() {
  const [cctvCameras, setCctvCameras] = useState([])
  const [selectedFloor, setSelectedFloor] = useState(1)
  const [occupiedSpots, setOccupiedSpots] = useState([])

  const floorCameraUrlMap = useMemo(() => ({
    1: LIVE_CAMERA_URL,
    2: LIVE_CAMERA_URL,
    3: LIVE_CAMERA_URL,
    4: LIVE_CAMERA_URL
  }), [])

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
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 15000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const getFloorOccupancy = useCallback((floor, spotIndex) => {
    return occupiedSpots.includes(spotIndex)
  }, [occupiedSpots])

  const toggleSpotOccupancy = useCallback(async (floor, spotIndex) => {
    const spotLabel = `A${spotIndex + 1}`
    const currentlyOccupied = occupiedSpots.includes(spotIndex)

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
    } catch (error) {
      console.error(error)
      window.alert('Unable to update spot. Please try again.')
    }
  }, [occupiedSpots])

  return (
    <div className="admin-content">
      <h3>CCTV Camera Network</h3>
      <div style={{ marginBottom: '20px' }}>
        <CameraPlayer initialUrl={floorCameraUrlMap[selectedFloor]} />
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
  )
}
