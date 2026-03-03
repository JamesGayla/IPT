import { useState, useCallback } from 'react'
import './Dashboard.css'
import { useNavigate } from 'react-router-dom'

function Profile() {
  const [name, setName] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    setSaved(true)
  }, [])

  const handleNavigateBack = useCallback(() => {
    navigate('/')
  }, [navigate])

  return (
    <section className="dashboard">
      <h2>User Profile</h2>
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" required />
        </div>

        <div className="form-group">
          <label htmlFor="vehicle">Vehicle Plate</label>
          <input id="vehicle" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} placeholder="ABC-1234" required />
        </div>

        <button type="submit" className="login-btn">Save Profile</button>
      </form>

      {saved && (
        <div className="saved-card">
          <h3>Saved Profile</h3>
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Vehicle Plate:</strong> {vehiclePlate}</p>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button onClick={handleNavigateBack} className="login-btn">Back to Dashboard</button>
      </div>
    </section>
  )
}

export default Profile
