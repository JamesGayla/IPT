import './Header.css'
import parkingLogo from '../assets/parking_PNG81.png'
import { Link } from 'react-router-dom'
import { useState, useEffect, useCallback, memo } from 'react'

const Header = memo(function Header({ view }) {
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

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand">
          <img src={parkingLogo} alt="Parking Logo" className="brand-icon" />
          <h1>Parkflow</h1>
        </div>
        <div className="header-info">
          <span className="current-view">
            {view === 'user' ? 'Parking Status' : 'Admin Panel'}
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
            <Link to="/profile" className="profile-link">Profile</Link>
          </nav>
        </div>
      </div>  
    </header>
  )
})

export default Header
