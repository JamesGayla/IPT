import { memo } from 'react'
import './Components.css'

const ParkingSpot = memo(function ParkingSpot({ spotNumber, isOccupied, onToggle }) {
  return (
    <div 
      className={`parking-spot ${isOccupied ? 'occupied' : 'available'}`}
      onClick={() => onToggle(spotNumber)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onToggle(spotNumber)
        }
      }}
      aria-label={`Parking spot A${spotNumber + 1}, ${isOccupied ? 'occupied' : 'empty'}`}
    >
      <p className="spot-number">A{spotNumber + 1}</p>
      <p className="spot-status">{isOccupied ? 'Occupied' : 'Empty'}</p>
    </div>
  )
})

export default ParkingSpot
