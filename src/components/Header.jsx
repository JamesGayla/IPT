import './Header.css'
import parkingLogo from '../assets/parking_PNG81.png'

function Header({ view }) {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand">
          <img src={parkingLogo} alt="Parking Logo" className="brand-icon" />
          <h1>Parking Space Manager</h1>
        </div>
        <div className="header-info">
          <span className="current-view">
            {view === 'user' ? 'Parking Status' : 'Admin Panel'}
          </span>
        </div>
      </div>  
    </header>
  )
}

export default Header
