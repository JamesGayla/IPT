import { useState, useEffect } from 'react'
import './AdminDashboard.css'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [sensors, setSensors] = useState([])
  const [alerts, setAlerts] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [statsRes, sensorsRes, alertsRes] = await Promise.all([
        fetch('http://localhost:3001/api/stats'),
        fetch('http://localhost:3001/api/sensors'),
        fetch('http://localhost:3001/api/alerts')
      ])

      const statsData = await statsRes.json()
      const sensorsData = await sensorsRes.json()
      const alertsData = await alertsRes.json()

      setStats(statsData)
      setSensors(sensorsData)
      setAlerts(alertsData)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="admin-dashboard"><p>Loading...</p></div>
  }

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      <div className="admin-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'sensors' ? 'active' : ''}`}
          onClick={() => setActiveTab('sensors')}
        >
          IoT Sensors
        </button>
        <button 
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts
        </button>
      </div>

      {activeTab === 'overview' && stats && (
        <div className="admin-content">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Spots</h3>
              <p className="stat-value">{stats.totalSpots}</p>
            </div>
            <div className="stat-card">
              <h3>Occupied</h3>
              <p className="stat-value" style={{ color: '#dc3545' }}>{stats.occupiedSpots}</p>
            </div>
            <div className="stat-card">
              <h3>Available</h3>
              <p className="stat-value" style={{ color: '#27ae60' }}>{stats.availableSpots}</p>
            </div>
            <div className="stat-card">
              <h3>Occupancy</h3>
              <p className="stat-value">{stats.occupancyPercentage}%</p>
            </div>
            <div className="stat-card">
              <h3>Total Alerts</h3>
              <p className="stat-value">{stats.totalAlerts}</p>
            </div>
            <div className="stat-card">
              <h3>Sensors</h3>
              <p className="stat-value" style={{ color: '#667eea' }}>{stats.sensorCount}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sensors' && (
        <div className="admin-content">
          <h3>IoT Sensor Network</h3>
          <div className="sensors-grid">
            {sensors.map(sensor => (
              <div key={sensor.spotNumber} className="sensor-card">
                <h4>Spot {sensor.spotNumber + 1}</h4>
                <div className="sensor-data">
                  <div className="data-item">
                    <label>Temperature</label>
                    <p>{sensor.temperature}°C</p>
                  </div>
                  <div className="data-item">
                    <label>Humidity</label>
                    <p>{sensor.humidity}%</p>
                  </div>
                  <div className="data-item">
                    <label>Motion</label>
                    <p className={sensor.motionDetected ? 'detected' : 'none'}>
                      {sensor.motionDetected ? 'Detected' : 'No Motion'}
                    </p>
                  </div>
                </div>
                <small>{new Date(sensor.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="admin-content">
          <h3>System Alerts</h3>
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`alert-row alert-${alert.severity}`}>
                <div>
                  <strong>{alert.type.replace(/_/g, ' ')}</strong>
                  <p>{alert.message}</p>
                  <small>{new Date(alert.timestamp).toLocaleString()}</small>
                </div>
                <span className="severity-badge">{alert.severity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={fetchAll} className="refresh-btn">🔄 Refresh Data</button>
    </div>
  )
}

export default AdminDashboard
