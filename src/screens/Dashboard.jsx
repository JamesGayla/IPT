import { useState, useEffect, useCallback, useMemo } from 'react'
import './Dashboard.css'
import ParkingSpot from '../components/ParkingSpot'

function Dashboard() {
  const [totalSpots, setTotalSpots] = useState(12)
  const [occupiedSpots, setOccupiedSpots] = useState([])
  const [occupancyPercentage, setOccupancyPercentage] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchParkingStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/parking-lot')
      const data = await response.json()
      setTotalSpots(data.totalSpots)
      setOccupiedSpots(data.occupiedSpots)
      setOccupancyPercentage(data.occupancyPercentage)
      setLoading(false) 
    } catch (error) {
      console.error('Failed to fetch parking status:', error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchParkingStatus()
  }, [fetchParkingStatus])

  const toggleSpot = useCallback(async (spotNumber) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/parking-lot/toggle/${spotNumber}`,
        { method: 'POST' }
      )
      const data = await response.json()
      setOccupiedSpots(data.occupiedSpots)
      setOccupancyPercentage(Math.round((data.occupiedSpots.length / totalSpots) * 100))
    } catch (error) {
      console.error('Failed to toggle spot:', error)
    }
  }, [totalSpots])

  const parkingSpots = useMemo(() => {
    return Array.from({ length: totalSpots }, (_, i) => ({
      spotNumber: i,
      isOccupied: occupiedSpots.includes(i)
    }))
  }, [totalSpots, occupiedSpots])

  const availableSpots = useMemo(() => totalSpots - occupiedSpots.length, [totalSpots, occupiedSpots.length])

  if (loading) {
    return <section className="dashboard"><p>Loading parking lot data...</p></section>
  }

  return (
    <section className="dashboard">
      <h2>Parking Lot Status of SM Downtown CDO</h2>
      
      <div className="occupancy-info">
        <div className="occupancy-card">
          <h3>Total Occupancy</h3>
          <div className="occupancy-display">
            <p className="occupancy-number">{occupiedSpots.length}/{totalSpots}</p>
            <p className="occupancy-percentage">{occupancyPercentage}%</p>
          </div>
        </div>
        <div className="occupancy-card">
          <h3>Available Spots</h3>
          <p className="available-number">{availableSpots}</p>
        </div>
      </div>

      <div className="parking-grid">
        {parkingSpots.map(spot => (
          <ParkingSpot 
            key={spot.spotNumber} 
            spotNumber={spot.spotNumber}
            isOccupied={spot.isOccupied}
            onToggle={toggleSpot}
          />
        ))}
      </div>

      <footer>
        <p>All rights reserved</p>
      </footer>
    </section>
  )
}

export default Dashboard
