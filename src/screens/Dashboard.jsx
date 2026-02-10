import './Dashboard.css'

function Dashboard() {
  const vehicles = [
    { id: 'V-100', driver: 'Alice', status: 'active' },
    { id: 'V-101', driver: 'Bob', status: 'idle' },
    { id: 'V-102', driver: 'Carlos', status: 'maintenance' },
    { id: 'V-103', driver: 'Diana', status: 'active' },
  ]

  return (
    <section className="dashboard">
      <h2>Fleet Status</h2>
      <ul className="vehicle-list">
        {vehicles.map((v) => (
          <li key={v.id} className="vehicle-item">
            <span className="vehicle-id">{v.id}</span>
            <span className="driver-name">{v.driver}</span>
            <span className={`status status-${v.status}`}>{v.status}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Dashboard
