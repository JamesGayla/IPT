import { useState, useEffect } from 'react'
import '../styles/ActivityHistory.css'

function ActivityHistory({ user }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivity()
  }, [])

  const fetchActivity = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/activity-history')
      const data = await response.json()
      setActivities(data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch activity:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="history-container"><p>Loading history...</p></div>
  }

  return (
    <div className="history-container">
      <h2>Activity History</h2>

      {activities.length === 0 ? (
        <p className="no-history">No activity history</p>
      ) : (
        <div className="timeline">
          {activities.map((activity, index) => (
            <div key={activity.id} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <h4>{activity.action.replace(/_/g, ' ')}</h4>
                <p>{activity.details}</p>
                <small>{new Date(activity.timestamp).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={fetchActivity} className="refresh-btn">🔄 Refresh</button>
    </div>
  )
}

export default ActivityHistory
