import './Header.css'
import parkingLogo from '../assets/parking_PNG81.png'
import { useState, useEffect, useCallback, memo } from 'react'
import { useLocation } from 'react-router-dom'

const Header = memo(function Header() {
  const location = useLocation()
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

  const getViewLabel = useCallback(() => {
    const path = location.pathname
    if (path.includes('/profile')) return 'Profile'
    if (path.includes('/admin')) return 'Admin Panel'
    return 'Parking Status'
  }, [location.pathname])

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand">
          <img src={parkingLogo} alt="Parking Logo" className="brand-icon" />
          <h1>ParkFlow</h1>
        </div>
        <div className="header-info">
          <span className="current-view">
            {getViewLabel()}
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
          </nav>
        </div>
      </div>  
    </header>
  )
})

export default Header