import { useCallback } from 'react'
import '../styles/Profile.css'

function Profile({ user, onLogout }) {
  const handleLogout = useCallback(async () => {
    try {
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST'
      })
      onLogout()
    } catch (error) {
      console.error('Failed to logout:', error)
    }
  }, [onLogout])

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-avatar">👤</div>
        <h2>{user?.username}</h2>
        <p>{user?.email}</p>
        <div className="profile-role">
          <span className={`role-badge ${user?.role}`}>{user?.role}</span>
        </div>
      </div>

      <div className="profile-info">
        <div className="info-item">
          <label>Username</label>
          <p>{user?.username}</p>
        </div>
        <div className="info-item">
          <label>Email</label>
          <p>{user?.email}</p>
        </div>
        <div className="info-item">
          <label>Account Type</label>
          <p className="capitalize">{user?.role}</p>
        </div>
      </div>

      <button onClick={handleLogout} className="logout-btn">Logout</button>
    </div>
  )
}

export default Profile
