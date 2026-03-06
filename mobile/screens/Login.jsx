import { useState, useCallback } from 'react'
import '../styles/Login.css'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      const data = await response.json()
      onLogin(data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [onLogin])

  return (
    <div className="login-container">
      <div className="login-header">
        <h1>Parking Lot</h1>
        <p>User Access</p>
      </div>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading} className="login-btn">
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="demo-login">
          Demo: user1 / user123
        </p>
      </form>
    </div>
  )
}

export default Login
