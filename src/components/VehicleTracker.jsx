import { useEffect, useState } from 'react'
import './VehicleTracker.css'

function VehicleTracker() {
  const [vehicleData, setVehicleData] = useState({
    carsIn: 0,
    carsOut: 0,
    totalToday: 0
  })

  useEffect(() => {
    // Mock data - in a real app, this would come from your backend
    const mockData = {
      carsIn: 50,
      carsOut: 0,
      totalToday: 50
    }
    setVehicleData(mockData)
  }, [])

  return (
    <div className="vehicle-tracker">
      <div className="tracker-header">
        <h3>Vehicle Traffic</h3>
        <span className="status-badge online">● Online</span>
      </div>

      <div className="traffic-stats">
        <div className="stat-card cars-in">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14m7-7H5"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">IN</div>
            <div className="stat-value">{vehicleData.carsIn}</div>
          </div>
        </div>

        <div className="stat-card cars-out">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14m-7-7h14"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">OUT</div>
            <div className="stat-value">{vehicleData.carsOut}</div>
          </div>
        </div>

        <div className="stat-card total-today">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Today</div>
            <div className="stat-value">{vehicleData.totalToday}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VehicleTracker
