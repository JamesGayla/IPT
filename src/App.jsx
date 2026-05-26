import './App.css'
import { Suspense, lazy } from 'react'
import { Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import Header from './components/Header'
import LoadingSpinner from './components/LoadingSpinner'
import ProtectedRoute from './components/ProtectedRoute'
import useAuth from './hooks/useAuth'

const UserDashboard = lazy(() => import('./screens/user/Dashboard'))
const AdminLayout = lazy(() => import('./screens/admin/AdminLayout'))
const UserProfile = lazy(() => import('./screens/user/Profile'))
const UserAnalytics = lazy(() => import('./screens/user/Analytics'))
const Auth = lazy(() => import('./screens/Auth'))

export default function App() {
  const location = useLocation()
  const { isAuthenticated, user, authLoading, handleLogin, handleLogout } = useAuth()

  const view = location.pathname.startsWith('/admin') ? 'admin' : 'user'
  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === 'admin@parking.com'

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

  // If authenticated and on auth page, redirect to the correct dashboard
  if (isAuthenticated && location.pathname === '/auth') {
    return <Navigate to={isAdmin ? '/admin' : '/'} replace />
  }

  return (
    <div className="app-root">
      <Header view={view} onLogout={handleLogout} user={user} />
      <div className="app-container">
        {view !== 'admin' && (
          <aside className="sidebar">
            <nav className="nav-menu">
              <h3 className="nav-title">Menu</h3>
              <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-label">Parking Status</span>
              </NavLink>
              <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-label">Analytics</span>
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-label">Profile</span>
              </NavLink>
            </nav>
          </aside>
        )}
        <main className="main-content">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/auth" element={<Auth onLogin={handleLogin} />} />
              <Route
                path="/"
                element={
                  isAdmin ? (
                    <Navigate to="/admin/overview" replace />
                  ) : (
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <UserDashboard />
                    </ProtectedRoute>
                  )
                }
              />
              <Route
                path="/analytics"
                element={
                  isAdmin ? (
                    <Navigate to="/admin/analytics" replace />
                  ) : (
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <UserAnalytics />
                    </ProtectedRoute>
                  )
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    {isAdmin ? <AdminLayout /> : <Navigate to="/" replace />}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  isAdmin ? (
                    <Navigate to="/admin/profile" replace />
                  ) : (
                    <ProtectedRoute isAuthenticated={isAuthenticated}>
                      <UserProfile />
                    </ProtectedRoute>
                  )
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  )
}

