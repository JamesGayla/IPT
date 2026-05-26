import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'

function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  const [adminForm, setAdminForm] = useState({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }, [])

  const handleAdminInputChange = useCallback((e) => {
    const { name, value } = e.target
    setAdminForm(prev => ({
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
      if (mode === 'admin') {
        if (!adminForm.username || !adminForm.password) {
          throw new Error('Please enter admin username and password')
        }

        if (adminForm.username !== ADMIN_USERNAME || adminForm.password !== ADMIN_PASSWORD) {
          throw new Error('Invalid admin credentials')
        }

        const adminUser = {
          id: 0,
          username: ADMIN_USERNAME,
          role: 'admin',
          email: 'admin@parking.com',
          fullName: 'Admin Officer'
        }

        localStorage.setItem('parkingAuth', JSON.stringify({
          isAuthenticated: true,
          user: adminUser
        }))
        onLogin(adminUser)
        navigate('/admin/overview', { replace: true })
        return
      }

      if (isLogin) {
        if (!formData.email || !formData.password) {
          throw new Error('Please fill in all fields')
        }

        const mockUsers = JSON.parse(localStorage.getItem('parkingUsers') || '[]')
        const user = mockUsers.find(u => u.email === formData.email && u.password === formData.password)

        if (!user) {
          throw new Error('Invalid email or password')
        }

        const loggedInUser = {
          ...user,
          role: user.role || 'user'
        }

        localStorage.setItem('parkingAuth', JSON.stringify({
          isAuthenticated: true,
          user: loggedInUser
        }))

        onLogin(loggedInUser)
        navigate('/', { replace: true })
      } else {
        if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
          throw new Error('Please fill in all fields')
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match')
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters')
        }

        const mockUsers = JSON.parse(localStorage.getItem('parkingUsers') || '[]')

        if (mockUsers.some(u => u.email === formData.email)) {
          throw new Error('Email already exists')
        }

        const newUser = {
          id: Date.now(),
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: 'user',
          createdAt: new Date().toISOString()
        }

        mockUsers.push(newUser)
        localStorage.setItem('parkingUsers', JSON.stringify(mockUsers))

        localStorage.setItem('parkingAuth', JSON.stringify({
          isAuthenticated: true,
          user: newUser
        }))

        onLogin(newUser)
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [adminForm, formData, isLogin, mode, navigate, onLogin])

  const toggleMode = useCallback(() => {
    setError('')
    if (mode === 'admin') {
      setMode('login')
      setIsLogin(true)
      return
    }

    setIsLogin(!isLogin)
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    })
  }, [isLogin, mode])

  const switchToAdminLogin = useCallback(() => {
    setMode('admin')
    setError('')
    setAdminForm({ username: '', password: '' })
    setIsLogin(true)
  }, [])

  const switchToUserMode = useCallback(() => {
    setMode('login')
    setError('')
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      fullName: ''
    })
    setIsLogin(true)
  }, [])

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>ParkFlow</h1>
          <h2>
            {mode === 'admin'
              ? 'Admin Login'
              : isLogin
              ? 'Welcome Back'
              : 'Create Account'}
          </h2>
          <p>
            {mode === 'admin'
              ? 'Sign in to access the admin dashboard'
              : isLogin
              ? 'Sign in to access your parking dashboard'
              : 'Join us to manage your parking experience'}
          </p>
        </div>

        <div className="auth-mode-buttons">
          <button
            type="button"
            className={`mode-btn ${mode !== 'admin' ? 'active' : ''}`}
            onClick={switchToUserMode}
          >
            User Login
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'admin' ? 'active' : ''}`}
            onClick={switchToAdminLogin}
          >
            Admin Login
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode !== 'admin' && !isLogin && (
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
            <label htmlFor={mode === 'admin' ? 'username' : 'email'}>
              {mode === 'admin' ? 'Admin Username' : 'Email Address'}
            </label>
            <input
              id={mode === 'admin' ? 'username' : 'email'}
              name={mode === 'admin' ? 'username' : 'email'}
              type={mode === 'admin' ? 'text' : 'email'}
              value={mode === 'admin' ? adminForm.username : formData.email}
              onChange={mode === 'admin' ? handleAdminInputChange : handleInputChange}
              placeholder={mode === 'admin' ? 'Enter admin username' : 'Enter your email'}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={mode === 'admin' ? adminForm.password : formData.password}
              onChange={mode === 'admin' ? handleAdminInputChange : handleInputChange}
              placeholder={mode === 'admin' ? 'Enter admin password' : 'Enter your password'}
              required
            />
          </div>

          {mode !== 'admin' && !isLogin && (
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
            {loading
              ? 'Please wait...'
              : mode === 'admin'
              ? 'Admin Sign In'
              : isLogin
              ? 'Sign In'
              : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          {mode !== 'admin' ? (
            <>
              <p>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
                <button
                  type="button"
                  className="link-btn"
                  onClick={toggleMode}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
              <button
                type="button"
                className="link-btn"
                onClick={switchToAdminLogin}
              >
                Admin Login
              </button>
            </>
          ) : (
            <button
              type="button"
              className="link-btn"
              onClick={switchToUserMode}
            >
              Back to User Login
            </button>
          )}
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