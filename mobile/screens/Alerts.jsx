import { useState, useEffect } from 'react'
import '../styles/Alerts.css'

function Alerts({ user }) {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/alerts')
      const data = await response.json()
      setAlerts(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
      setLoading(false)
    }
  }

  const dismissAlert = async (alertId) => {
    try {
      await fetch(`http://localhost:3001/api/alerts/${alertId}`, {
        method: 'DELETE'
      })
      setAlerts(alerts.filter(a => a.id !== alertId))
    } catch (error) {
      console.error('Failed to dismiss alert:', error)
    }
  }

  if (loading) {
    return <div className="alerts-container"><p>Loading alerts...</p></div>
  }

  return (
    <div className="alerts-container">
      <h2>Notifications</h2>
      
      {alerts.length === 0 ? (
        <p className="no-alerts">No alerts at the moment</p>
      ) : (
        <div className="alerts-list">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert-item alert-${alert.severity}`}>
              <div className="alert-content">
                <h3>{alert.type.replace(/_/g, ' ')}</h3>
                <p>{alert.message}</p>
                <small>{new Date(alert.timestamp).toLocaleString()}</small>
              </div>
              <button 
                onClick={() => dismissAlert(alert.id)}
                className="dismiss-btn"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <button onClick={fetchAlerts} className="refresh-btn">🔄 Refresh</button>
    </div>
  )
}

export default Alerts
