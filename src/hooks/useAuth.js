import { useEffect, useState } from 'react'

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem('parkingAuth')
        if (authData) {
          const { isAuthenticated: authStatus, user: userData } = JSON.parse(authData)
          if (authStatus && userData) {
            setIsAuthenticated(true)
            setUser(userData)
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        localStorage.removeItem('parkingAuth')
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setUser(userData)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem('parkingAuth')
  }

  return {
    isAuthenticated,
    user,
    authLoading,
    handleLogin,
    handleLogout,
  }
}
