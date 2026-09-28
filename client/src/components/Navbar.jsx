import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem('token'))
  )
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch {
      return null
    }
  })
  const navigate = useNavigate()
  const location = useLocation()

  // Helper to synchronize token and user role state across components
  const syncAuth = () => {
    setIsLoggedIn(Boolean(localStorage.getItem('token')))
    try {
      setCurrentUser(JSON.parse(localStorage.getItem('user') || 'null'))
    } catch {
      setCurrentUser(null)
    }
  }

  // Listen to custom 'authChange' event to synchronize authentication state across components
  useEffect(() => {
    window.addEventListener('authChange', syncAuth)

    return () => {
      window.removeEventListener('authChange', syncAuth)
    }
  }, [])

  // Sync state on route transitions
  useEffect(() => {
    syncAuth()
  }, [location])

  const handleLogout = () => {
    // 1. Remove JWT token and cached user profile from localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')

    // 2. Immediately update local state so Navbar re-renders in logged-out state
    setIsLoggedIn(false)
    setCurrentUser(null)

    // 3. Broadcast authChange event across application
    window.dispatchEvent(new Event('authChange'))

    // 4. Redirect user to home page
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">Campus Events</span>
        </Link>
        <ul className="navbar-links">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/events" className="nav-link">Events</Link></li>
          {isLoggedIn ? (
            <>
              {currentUser?.role === 'admin' && (
                <li>
                  <Link to="/admin/events" className="nav-link nav-btn-admin">
                    🛡️ Admin
                  </Link>
                </li>
              )}
              <li><Link to="/my-registrations" className="nav-link nav-btn-secondary">My Registrations</Link></li>
              <li>
                <button onClick={handleLogout} className="nav-link nav-btn-primary logout-btn">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="nav-link nav-btn-secondary">Login</Link></li>
              <li><Link to="/register" className="nav-link nav-btn-primary">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
