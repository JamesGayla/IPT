import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MobileApp from './MobileApp.jsx'

function AppWrapper() {
  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true'
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [])

  return <MobileApp />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
)
