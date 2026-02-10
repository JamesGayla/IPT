import './App.css'
import Header from './components/Header'
import Dashboard from './screens/Dashboard'

export default function App() {
  return (
    <div className="app-root">
      <Header />
      <main className="main-content">
        <Dashboard />
      </main>
    </div>
  )
}
