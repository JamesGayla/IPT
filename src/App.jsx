import './App.css'
import { Suspense, lazy } from 'react'
import Header from './components/Header'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'

const Dashboard = lazy(() => import('./screens/Dashboard'))
const AdminDashboard = lazy(() => import('./screens/AdminDashboard'))
const Profile = lazy(() => import('./screens/Profile'))

const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
)

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
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}

