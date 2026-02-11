import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Dashboard from './screens/Dashboard'
import AdminDashboard from './screens/AdminDashboard'

export default function App() {
  const [view, setView] = useState('user')

  return (
    <div className="app-root">
      <Header />
      <div className="view-switcher">
        <button 
          className={`view-btn ${view === 'user' ? 'active' : ''}`}
          onClick={() => setView('user')}
        >
          User View
        </button>
        <button 
          className={`view-btn ${view === 'admin' ? 'active' : ''}`}
          onClick={() => setView('admin')}
        >
          Admin View
        </button>
      </div>
      <main className="main-content">
        {view === 'user' ? <Dashboard /> : <AdminDashboard />}
      </main>
    </div>
  )
}

