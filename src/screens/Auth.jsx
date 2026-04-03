import { useState, useCallback } from 'react'
import './Auth.css'

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Login logic
        if (!formData.email || !formData.password) {
          throw new Error('Please fill in all fields')
        }

        // Mock login - in real app, this would call your API
        const mockUsers = JSON.parse(localStorage.getItem('parkingUsers') || '[]')
        const user = mockUsers.find(u => u.email === formData.email && u.password === formData.password)

        if (!user) {
          throw new Error('Invalid email or password')
        }

        // Store auth state
        localStorage.setItem('parkingAuth', JSON.stringify({
          isAuthenticated: true,
          user: { email: user.email, fullName: user.fullName }
        }))

        onLogin(user)
      } else {
        // Signup logic
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
          throw new Error('Please fill in all fields')
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match')
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }

        // Mock signup - in real app, this would call your API
        const mockUsers = JSON.parse(localStorage.getItem('parkingUsers') || '[]')

        if (mockUsers.some(u => u.email === formData.email)) {
          throw new Error('Email already exists')
        }

        const newUser = {
          id: Date.now(),
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          createdAt: new Date().toISOString()
        }

        mockUsers.push(newUser)
        localStorage.setItem('parkingUsers', JSON.stringify(mockUsers))

        // Auto login after signup
        localStorage.setItem('parkingAuth', JSON.stringify({
          isAuthenticated: true,
          user: { email: newUser.email, fullName: newUser.fullName }
        }))

        onLogin(newUser)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isLogin, formData, onLogin])

  const toggleMode = useCallback(() => {
    setIsLogin(!isLogin)
    setError('')
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    })
  }, [isLogin])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>ParkFlow</h1>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to access your parking dashboard' : 'Join us to manage your parking experience'}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              className="link-btn"
              onClick={toggleMode}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>

      <div className="auth-features">
        <div className="feature">
          <div className="feature-icon">🚗</div>
          <h3>Smart Parking</h3>
          <p>Real-time parking spot monitoring</p>
        </div>
        <div className="feature">
          <div className="feature-icon">📊</div>
          <h3>Analytics</h3>
          <p>Detailed insights and reports</p>
        </div>
        <div className="feature">
          <div className="feature-icon">🔒</div>
          <h3>Secure</h3>
          <p>Safe and secure parking management</p>
        </div>  
      </div>
    </div>
  )
}

export default Auth