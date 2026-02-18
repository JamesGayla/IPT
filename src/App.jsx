import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Dashboard from './screens/Dashboard'
import AdminDashboard from './screens/AdminDashboard'

export default function App() {
  const [view, setView] = useState('user')

  return (
    <div className="app-root">
      <Header view={view} setView={setView} />
      <div className="app-container">
        <aside className="sidebar">
          <nav className="nav-menu">
            <h3 className="nav-title">Menu</h3>
            <button 
              className={`nav-item ${view === 'user' ? 'active' : ''}`}
              onClick={() => setView('user')}
            >
  
              <span className="nav-label">Parking Status</span>
            </button>
            <button 
              className={`nav-item ${view === 'admin' ? 'active' : ''}`}
              onClick={() => setView('admin')}
            >
              <span className="nav-label">Admin Panel</span>
            </button>
          </nav>
        </aside>
        <main className="main-content">
          {view === 'user' ? <Dashboard /> : <AdminDashboard />}
        </main>
      </div>
    </div>
  )
}

