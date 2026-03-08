import './App.css'
import { Suspense, lazy } from 'react'
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import Header from './components/Header'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'
import useAuth from './hooks/useAuth'

const Dashboard = lazy(() => import('./screens/Dashboard'))
const AdminDashboard = lazy(() => import('./screens/AdminDashboard'))
const Profile = lazy(() => import('./screens/Profile'))
const Analytics = lazy(() => import('./screens/Analytics'))
const Auth = lazy(() => import('./screens/Auth'))

export default function App() {
  const location = useLocation()
  const { isAuthenticated, user, authLoading, handleLogin, handleLogout } = useAuth()

  const view = location.pathname.startsWith('/admin') ? 'admin' : 'user'

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="app-root">
        <LoadingSpinner />
      </div>
    )
  }

  // If not authenticated and not on auth page, redirect to auth
  if (!isAuthenticated && location.pathname !== '/auth') {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Auth onLogin={handleLogin} />
      </Suspense>
    )
  }

  // If authenticated and on auth page, redirect to dashboard
  if (isAuthenticated && location.pathname === '/auth') {
    return <Navigate to="/" replace />
  }

  return (
    <div className="app-root">
      <Header view={view} onLogout={handleLogout} user={user} />
      <div className="app-container">
        <aside className="sidebar">
          <nav className="nav-menu">
            <h3 className="nav-title">Menu</h3>
            <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-label">Parking Status</span>
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-label">Analytics</span>
            </NavLink>
            <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-label">Admin Panel</span>
            </NavLink>
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-label">Profile</span>
            </NavLink>
          </nav>
        </aside>
        <main className="main-content">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Profile user={user} />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}

