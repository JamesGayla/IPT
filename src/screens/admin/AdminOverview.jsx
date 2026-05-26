import { useEffect, useState } from 'react'
import '../AdminDashboard.css'

const API_BASE_URL = 'http://localhost:3001'

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalSpots: 8,
    occupiedSpots: 0,
    availableSpots: 8,
    occupancyPercentage: 0,
    totalAlerts: 0,
    cameraCount: 0
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [lotRes, cctvRes, alertsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/parking-lot`),
          fetch(`${API_BASE_URL}/api/cctv`),
          fetch(`${API_BASE_URL}/api/alerts`)
        ])

        if (!lotRes.ok || !cctvRes.ok || !alertsRes.ok) {
          throw new Error('Unable to load admin overview data')
        }

        const lot = await lotRes.json()
        const cctv = await cctvRes.json()
        const alerts = await alertsRes.json()

        setStats({
          totalSpots: lot.totalSpots,
          occupiedSpots: lot.occupiedSpots.length,
          availableSpots: lot.availableSpots,
          occupancyPercentage: lot.occupancyPercentage,
          totalAlerts: alerts.length,
          cameraCount: cctv.length
        })
      } catch (error) {
        console.error(error)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="admin-content">
      <h3>Parking Status</h3>
      <div className="stats-grid">
        <div className="card-minimal">
          <h3>Total Spots</h3>
          <p className="bigstat">{stats.totalSpots}</p>
        </div>
        <div className="card-minimal">
          <h3>Occupied</h3>
          <p className="bigstat" style={{ color: '#ef4444' }}>{stats.occupiedSpots}</p>
        </div>
        <div className="card-minimal">
          <h3>Available</h3>
          <p className="bigstat" style={{ color: '#10b981' }}>{stats.availableSpots}</p>
        </div>
        <div className="card-minimal">
          <h3>Occupancy</h3>
          <p className="bigstat">{stats.occupancyPercentage}%</p>
        </div>
        <div className="card-minimal">
          <h3>Total Alerts</h3>
          <p className="bigstat">{stats.totalAlerts}</p>
        </div>
        <div className="card-minimal">
          <h3>CCTV Cameras</h3>
          <p className="bigstat">{stats.cameraCount}</p>
        </div>
      </div>
    </div>
  )
}
