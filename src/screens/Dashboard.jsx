import { useState } from 'react'
import './Dashboard.css'
import VehicleCard from '../components/VehicleCard'

function Dashboard() {
  const vehicles = [
    { id: 'V-100', driver: 'Alice', status: 'active' },
    { id: 'V-101', driver: 'Bob', status: 'idle' },
    { id: 'V-102', driver: 'Carlos', status: 'maintenance' },
    { id: 'V-103', driver: 'Diana', status: 'active' },
  ]

  const [filter, setFilter] = useState('all')

  const filteredVehicles = filter === 'all' 
    ? vehicles 
    : vehicles.filter(v => v.status === filter)

  const statusCounts = {
    all: vehicles.length,
    active: vehicles.filter(v => v.status === 'active').length,
    idle: vehicles.filter(v => v.status === 'idle').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
  }

  return (
    <section className="dashboard">
      <h2>Fleet Status Dashboard</h2>
      
      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({statusCounts.all})
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({statusCounts.active})
        </button>
        <button 
          className={`filter-btn ${filter === 'idle' ? 'active' : ''}`}
          onClick={() => setFilter('idle')}
        >
          Idle ({statusCounts.idle})
        </button>
        <button 
          className={`filter-btn ${filter === 'maintenance' ? 'active' : ''}`}
          onClick={() => setFilter('maintenance')}
        >
          Maintenance ({statusCounts.maintenance})
        </button>
      </div>

      <div className="vehicles-grid">
        {filteredVehicles.length > 0 ? (
          filteredVehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} />
          ))
        ) : (
          <p className="no-results">No vehicles in this category</p>
        )}
      </div>
    </section>
  )
}

export default Dashboard
