import React, { useState } from 'react';
import '../styles/Login.css';  // This is working now!
console.log('CSS imported:', document.styleSheets.length);

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      if (onLogin) {
        onLogin(data);
      }
      
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-login-container">
      <div className="mobile-login-card">
        <h1>ParkFlow</h1>
        <h2>Welcome Back</h2>
        <p className="subtitle">Sign in to access your parking dashboard</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="signup-link">
          Don't have an account? <a href="#">Sign Up</a>
        </p>
      </div>
      
      <div className="features">
        <div className="feature-item">
          <h3>Smart Parking</h3>
          <p>Real-time parking spot monitoring</p>
        </div>
        
        <div className="feature-item">
          <h3>Analytics</h3>
          <p>Detailed insights and reports</p>
        </div>
        
        <div className="feature-item">
          <h3>Secure</h3>
          <p>Safe and secure parking management</p>
        </div>
      </div>
    </div>
  );
};

export default Login;