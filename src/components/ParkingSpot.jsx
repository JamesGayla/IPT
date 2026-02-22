import './Components.css'

function ParkingSpot({ spotNumber, isOccupied, onToggle }) {
  return (
    <div 
      className={`parking-spot ${isOccupied ? 'occupied' : 'available'}`}
      onClick={() => onToggle(spotNumber)}
    >
      <p className="spot-number">A{spotNumber + 1}</p>
      <p className="spot-status">{isOccupied ? 'Occupied' : 'Empty'}</p>
    </div>
  )
}

<footer>
  <p>Parkflow</p>
</footer>

export default ParkingSpot
