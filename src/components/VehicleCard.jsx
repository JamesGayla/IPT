
import './Components.css'

function VehicleCard({ plateNumber, owner, spotNumber, entryTime, exitTime }) {
  return (
    <div className="vehicle-card">
      <div className="vehicle-header">
        <h4 className="plate-number">{plateNumber}</h4>
        <span className="vehicle-status">Active</span>
      </div>
      <div className="vehicle-details">
        <p><strong>Owner:</strong> {owner}</p>
        <p><strong>Spot:</strong> A{spotNumber + 1}</p>
        <p><strong>Entry:</strong> {new Date(entryTime).toLocaleTimeString()}</p>
        {exitTime && <p><strong>Exit:</strong> {new Date(exitTime).toLocaleTimeString()}</p>}
      </div>
    </div>
  )
}

export default VehicleCard
