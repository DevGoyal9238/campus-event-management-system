import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">🎉 Welcome to Campus Events</span>
          <h1 className="hero-title">Discover Campus Events</h1>
          <p className="hero-description">
            Stay connected with everything happening on campus. Discover upcoming hackathons, 
            workshops, cultural fests, and sports tournaments, and register with just one click.
          </p>
          <div className="hero-actions">
            <Link to="/events" className="btn-explore">Explore Events</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
