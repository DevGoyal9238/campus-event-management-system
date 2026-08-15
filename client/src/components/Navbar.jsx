import { Link } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
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
          <li><Link to="/login" className="nav-link nav-btn-secondary">Login</Link></li>
          <li><Link to="/register" className="nav-link nav-btn-primary">Register</Link></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
