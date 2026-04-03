import './Header.css'
import parkingLogo from '../assets/parking_PNG81.png'
import { useState, useEffect, useCallback, memo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const Header = memo(function Header({ onLogout, user }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode)
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev)
  }, [])

  const handleLogout = useCallback(() => {
    if (onLogout) {
      onLogout()
    }
  }, [onLogout])

  const getUserGreeting = useCallback(() => {
    const path = location.pathname
    if (path.includes('/admin')) {
      return 'ADMIN OFFICER (COMMAND)'
    }
    if (user && user.fullName) {
      return `Welcome, ${user.fullName}`
    }
    return 'Welcome'
  }, [location.pathname, user])

  const getViewLabel = useCallback(() => {
    const path = location.pathname
    if (path.includes('/profile')) return 'Profile'
    if (path.includes('/admin')) return 'Admin Panel'
    if (path.includes('/analytics')) return 'Analytics'
    return 'Parking Status'
  }, [location.pathname])

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand" onClick={() => navigate('/') }>
          <img src={parkingLogo} alt="Parking Logo" className="brand-icon" />
          <h1>ParkFlow</h1>
        </div>
        <div className="header-info">
          <span className="current-view">
            {getViewLabel()}
          </span>

          <div className="user-info">
            <span className="user-greeting">
              {getUserGreeting()}
            </span>
            <nav className="header-nav">
              <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle dark mode"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              {onLogout && (
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                  aria-label="Logout"
                  title="Logout"
                >
                  Logout
                </button>
              )}
            </nav>
          </div>
        </div>
      </div>  
    </header>
  )
})

export default Header
