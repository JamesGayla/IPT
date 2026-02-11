import StatusBadge from './StatusBadge'

function VehicleCard({ vehicle }) {
  return (
    <article className="vehicle-card">
      <div className="card-header">
        <h3 className="vehicle-id">{vehicle.id}</h3>
        <StatusBadge status={vehicle.status} />
      </div>
      <div className="card-body">
        <p className="driver-info">
          <span className="label">Driver:</span>
          <span className="value">{vehicle.driver}</span>
        </p>
      </div>
    </article>
  )
}

export default VehicleCard
