import { useState, useEffect, useCallback, useMemo } from 'react'
import '../styles/LiveStatus.css'

function LiveStatus() {
  const [parkingData, setParkingData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchParkingStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/parking-lot')
      const data = await response.json()
      setParkingData(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch:', error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchParkingStatus()
  }, [fetchParkingStatus])

  const spotsList = useMemo(() => {
    if (!parkingData) return []
    return Array.from({ length: parkingData.totalSpots }, (_, i) => ({
      index: i,
      isOccupied: parkingData.occupiedSpots.includes(i)
    }))
  }, [parkingData])

  if (loading) {
    return <div className="status-container"><p>Loading...</p></div>
  }

  if (!parkingData) {
    return <div className="status-container"><p>Error loading data</p></div>
  }

  return (
    <div className="status-container">
      <div className="status-card">
        <h2>Parking Availability</h2>
        <div className="occupancy-bar">
          <div className="occupancy-fill" style={{ width: `${parkingData.occupancyPercentage}%` }}></div>
        </div>
        <div className="occupancy-stats">
          <div className="stat">
            <span className="label">Occupied</span>
            <span className="value">{parkingData.occupiedSpots.length}/{parkingData.totalSpots}</span>
          </div>
          <div className="stat">
            <span className="label">Available</span>
            <span className="value" style={{ color: '#27ae60' }}>{parkingData.availableSpots}</span>
          </div>
        </div>
        <p className="percentage">{parkingData.occupancyPercentage}% Full</p>
      </div>

      <div className="available-section">
        <h3>Available Spots</h3>
        <div className="spots-list">
          {spotsList.map(spot => (
            <div 
              key={spot.index}
              className={`spot-badge ${spot.isOccupied ? 'occupied' : 'available'}`}
            >
              A{spot.index + 1}
            </div>
          ))}
        </div>
      </div>

      <button onClick={fetchParkingStatus} className="refresh-btn">🔄 Refresh</button>
    </div>
  )
}

export default LiveStatus
