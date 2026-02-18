import { useState, useEffect } from 'react'
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

  const handleLogin = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    setActiveTab('status')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUser(null)
    setActiveTab('status')
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="mobile-app">
      <header className="mobile-header">
        <h1>Parking Lot</h1>
        <p className="user-name">{user?.username}</p>
      </header>

      <main className="mobile-content">
        {activeTab === 'status' && <LiveStatus />}
        {activeTab === 'alerts' && <Alerts user={user} />}
        {activeTab === 'history' && <ActivityHistory user={user} />}
        {activeTab === 'profile' && <Profile user={user} onLogout={handleLogout} />}
      </main>

      <nav className="mobile-nav">
        <button 
          className={`nav-item ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          <span className="icon">📍</span>
          <span className="label">Status</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <span className="icon">🔔</span>
          <span className="label">Alerts</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="icon">📋</span>
          <span className="label">History</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span className="icon">👤</span>
          <span className="label">Profile</span>
        </button>
      </nav>
    </div>
  )
}

export default MobileApp
