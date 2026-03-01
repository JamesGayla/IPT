import { memo } from 'react'
import './Components.css'

const VehicleCard = memo(function VehicleCard({ plateNumber, owner, spotNumber, entryTime, exitTime }) {
  const formatTime = (time) => new Date(time).toLocaleTimeString()

  return (
    <div className="vehicle-card">
      <div className="vehicle-header">
        <h4 className="plate-number">{plateNumber}</h4>
        <span className="vehicle-status">Active</span>
      </div>
      <div className="vehicle-details">
        <p><strong>Owner:</strong> {owner}</p>
        <p><strong>Spot:</strong> A{spotNumber + 1}</p>
        <p><strong>Entry:</strong> {formatTime(entryTime)}</p>
        {exitTime && <p><strong>Exit:</strong> {formatTime(exitTime)}</p>}
      </div>
    </div>
  )
})

export default VehicleCard
