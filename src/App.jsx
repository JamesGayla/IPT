import './App.css'
import Header from './components/Header'
import Dashboard from './screens/Dashboard'
import AdminDashboard from './screens/AdminDashboard'
import Profile from './screens/Profile'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'

export default function App() {
  const location = useLocation()
  const view = location.pathname.startsWith('/admin') ? 'admin' : 'user'

  return (
    <div className="app-root">
      <Header view={view} />
      <div className="app-container">
        <aside className="sidebar">
          <nav className="nav-menu">
            <h3 className="nav-title">Menu</h3>
            <NavLink to="/" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-label">Parking Status</span>
            </NavLink>
            <NavLink to="/admin" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-label">Admin Panel</span>
            </NavLink>
            <NavLink to="/profile" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-label">Profile</span>
            </NavLink>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

