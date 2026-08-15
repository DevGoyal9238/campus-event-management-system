import './Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">Campus Events</span>
        </div>
        <ul className="navbar-links">
          <li><a href="#" className="nav-link active">Home</a></li>
          <li><a href="#" className="nav-link">Events</a></li>
          <li><a href="#" className="nav-link nav-btn-secondary">Login</a></li>
          <li><a href="#" className="nav-link nav-btn-primary">Register</a></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
