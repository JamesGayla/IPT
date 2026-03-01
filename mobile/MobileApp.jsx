import { useState, useCallback, useMemo } from 'react'
import './MobileApp.css'
import Login from './screens/Login'
import LiveStatus from './screens/LiveStatus'
import Alerts from './screens/Alerts'
import ActivityHistory from './screens/ActivityHistory'
import Profile from './screens/Profile'

function MobileApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('status')

  const handleLogin = useCallback((userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    setActiveTab('status')
  }, [])

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false)
    setUser(null)
    setActiveTab('status')
  }, [])

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
  }, [])

  const activeContent = useMemo(() => {
    if (activeTab === 'status') return <LiveStatus />
    if (activeTab === 'alerts') return <Alerts user={user} />
    if (activeTab === 'history') return <ActivityHistory user={user} />
    if (activeTab === 'profile') return <Profile user={user} onLogout={handleLogout} />
    return null
  }, [activeTab, user, handleLogout])

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  const navItems = useMemo(() => [
    { id: 'status', icon: '📍', label: 'Status' },
    { id: 'alerts', icon: '🔔', label: 'Alerts' },
    { id: 'history', icon: '📋', label: 'History' },
    { id: 'profile', icon: '👤', label: 'Profile' }
  ], [])

  return (
    <div className="mobile-app">
      <header className="mobile-header">
        <h1>Parking Lot</h1>
        <p className="user-name">{user?.username}</p>
      </header>

      <main className="mobile-content">
        {activeContent}
      </main>

      <nav className="mobile-nav">
        {navItems.map(item => (
          <button 
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => handleTabChange(item.id)}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default MobileApp
