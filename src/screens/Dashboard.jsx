import { useState, useEffect, useCallback, useMemo } from 'react'
import './Dashboard.css'
import ParkingSpot from '../components/ParkingSpot'
import VehicleTracker from '../components/VehicleTracker'
import TrafficChart from '../components/TrafficChart'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

function Dashboard() {
  const [totalSpots] = useState(8)
  const [occupiedSpots, setOccupiedSpots] = useState([])
  const [cctvData, setCctvData] = useState([])
  const [occupancyPercentage, setOccupancyPercentage] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchParkingLot = useCallback(async () => {
    try {
      const [parkingRes, cctvRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/parking-lot`),
        fetch(`${API_BASE_URL}/api/cctv`)
      ])

      if (!parkingRes.ok || !cctvRes.ok) {
        throw new Error('Unable to fetch parking lot status')
      }

      const [parkingData, cctvData] = await Promise.all([parkingRes.json(), cctvRes.json()])
      setOccupiedSpots(parkingData.occupiedSpots)
      setCctvData(cctvData)
      setOccupancyPercentage(parkingData.occupancyPercentage)
      setLoading(false)
    } catch (error) {
      console.error('Failed to load parking lot:', error)
      setLoading(false)
    }
  }, [])

  const toggleSpot = useCallback(async (spotNumber) => {
    const spotLabel = `A${spotNumber + 1}`
    const currentlyOccupied = occupiedSpots.includes(spotNumber)

    if (!window.confirm(`Confirm ${currentlyOccupied ? 'freeing' : 'occupying'} spot ${spotLabel}?`)) {
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/parking-lot/toggle/${spotNumber}`,
        { method: 'POST' }
      )
      const data = await response.json()
      setOccupiedSpots(data.occupiedSpots)
      setCctvData(prev => prev.map(cam => cam.spotNumber === spotNumber ? {
        ...cam,
        occupancyDetected: !currentlyOccupied
      } : cam))
    } catch (error) {
      console.error('Failed to toggle spot:', error)
      window.alert('Unable to update spot status. Please try again.')
    }
  }, [occupiedSpots])

  useEffect(() => {
    fetchParkingLot()
    const interval = setInterval(fetchParkingLot, 3000)
    return () => clearInterval(interval)
  }, [fetchParkingLot])

  const parkingSpots = useMemo(() => {
    return Array.from({ length: totalSpots }, (_, i) => {
      const camera = cctvData.find(cam => cam.spotNumber === i)
      const isOccupied = camera ? camera.occupancyDetected : occupiedSpots.includes(i)
      return {
        spotNumber: i,
        isOccupied
      }
    })
  }, [totalSpots, occupiedSpots, cctvData])

  const cameraOccupiedCount = useMemo(() => cctvData.filter(cam => cam.occupancyDetected).length, [cctvData])
  const occupiedCount = cctvData.length ? cameraOccupiedCount : occupiedSpots.length
  const availableSpots = useMemo(() => totalSpots - occupiedCount, [totalSpots, occupiedCount])
  const currentOccupancy = useMemo(() => Math.round((occupiedCount / totalSpots) * 100), [occupiedCount, totalSpots])

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
          <p className="bigstat">{occupiedCount}</p>
          <p className="minor-muted">In-use spots</p>
        </div>
        <div className="card-minimal">
          <h3>Available</h3>
          <p className="bigstat">{availableSpots}</p>
          <p className="minor-muted">Open spots</p>
        </div>
        <div className="card-minimal">
          <h3>Occupancy</h3>
          <p className="bigstat">{currentOccupancy}%</p>
          <p className="minor-muted">Heatmap at glance</p>
        </div>
      </div>

      <VehicleTracker />

      <TrafficChart />

      <div className="occupancy-info">
        <div className="occupancy-card">
          <h3>Total Occupancy</h3>
          <div className="occupancy-display">
            <p className="occupancy-number">{occupiedCount}/{totalSpots}</p>
            <p className="occupancy-percentage">{currentOccupancy}%</p>
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
