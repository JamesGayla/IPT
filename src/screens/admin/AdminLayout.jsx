import { useCallback } from 'react'
import { NavLink, Routes, Route, Navigate } from 'react-router-dom'
import AdminOverview from './AdminOverview'
import AdminAnalytics from './AdminAnalytics'
import AdminMonitoring from './AdminMonitoring'
import AdminProfile from './AdminProfile'
import '../AdminDashboard.css'

export default function AdminLayout() {
  const activeClassName = useCallback(
    ({ isActive }) => `sidebar-button ${isActive ? 'active' : ''}`,
    []
  )

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Console</h2>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="sidebar-title">Admin Menu</div>
          <NavLink to="/admin/overview" className={activeClassName}>
            Overview
          </NavLink>
          <NavLink to="/admin/monitoring" className={activeClassName}>
            Monitoring
          </NavLink>
          <NavLink to="/admin/analytics" className={activeClassName}>
            Analytics
          </NavLink>
          <NavLink to="/admin/profile" className={activeClassName}>
            Profile
          </NavLink>
        </aside>

        <div className="admin-main-content">
          <Routes>
            <Route path="" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="monitoring" element={<AdminMonitoring />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
