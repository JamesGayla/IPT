import { useState, useCallback, useEffect } from 'react'
import './Dashboard.css'

function Profile({ user }) {
  const [name, setName] = useState('')
  const [vehiclePlate, setVehiclePlate] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load user profile data on component mount
  useEffect(() => {
    if (user) {
      // Try to load saved profile data
      const savedProfile = localStorage.getItem(`profile_${user.email}`)
      if (savedProfile) {
        const profileData = JSON.parse(savedProfile)
        setName(profileData.name || user.fullName)
        setVehiclePlate(profileData.vehiclePlate || '')
      } else {
        // Use data from user object
        setName(user.fullName || '')
      }
    }
  }, [user])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      // Save profile data
      const profileData = {
        name,
        vehiclePlate,
        updatedAt: new Date().toISOString()
      }

      localStorage.setItem(`profile_${user.email}`, JSON.stringify(profileData))

      // Update user data in auth storage
      const authData = JSON.parse(localStorage.getItem('parkingAuth') || '{}')
      if (authData.user) {
        authData.user.fullName = name
        localStorage.setItem('parkingAuth', JSON.stringify(authData))
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setLoading(false)
    }
  }, [name, vehiclePlate, user])

  if (!user) {
    return (
      <section className="dashboard">
        <p>Please log in to view your profile.</p>
      </section>
    )
  }

  return (
    <section className="dashboard">
      <h2>User Profile</h2>

      <div className="profile-info">
        <div className="info-card">
          <h3>Account Information</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Member since:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="vehicle">Vehicle Plate</label>
          <input
            id="vehicle"
            value={vehiclePlate}
            onChange={(e) => setVehiclePlate(e.target.value)}
            placeholder="ABC-1234"
            required
          />
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {saved && (
        <div className="saved-card">
          <h3>✅ Profile Saved Successfully!</h3>
          <p>Your profile information has been updated.</p>
        </div>
      )}
    </section>
  )
}

export default Profile
