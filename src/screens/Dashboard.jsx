import { useState, useCallback, useMemo } from 'react'
import './Dashboard.css'
import ParkingSpot from '../components/ParkingSpot'
import VehicleTracker from '../components/VehicleTracker'
import TrafficChart from '../components/TrafficChart'

function Dashboard() {
  const [totalSpots] = useState(12)
  const [occupiedSpots, setOccupiedSpots] = useState([1, 3, 4, 5, 7, 8])
  const [occupancyPercentage, setOccupancyPercentage] = useState(50)
  const [loading] = useState(false)


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
      <h2>Parking Lot Status (Minimal Dashboard)</h2>

      <div className="stats-grid">
        <div className="card-minimal">
          <h3>Total Spots</h3>
          <p className="bigstat">{totalSpots}</p>
          <p className="minor-muted">Current occupancy data</p>
        </div>
        <div className="card-minimal">
          <h3>Occupied</h3>
          <p className="bigstat">{occupiedSpots.length}</p>
          <p className="minor-muted">In-use spots</p>
        </div>
        <div className="card-minimal">
          <h3>Available</h3>
          <p className="bigstat">{availableSpots}</p>
          <p className="minor-muted">Open spots</p>
        </div>
        <div className="card-minimal">
          <h3>Occupancy</h3>
          <p className="bigstat">{occupancyPercentage}%</p>
          <p className="minor-muted">Heatmap at glance</p>
        </div>
      </div>

      <VehicleTracker />

      <TrafficChart />

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
