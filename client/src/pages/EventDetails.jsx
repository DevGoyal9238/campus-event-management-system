import { useParams, Link } from 'react-router-dom'
import { sampleEvents } from '../data/mockEvents'
import './EventDetails.css'

function EventDetails() {
  const { id } = useParams()
  const event = sampleEvents.find((e) => e.id === id)

  if (!event) {
    return (
      <div className="page-container">
        <div className="not-found-card">
          <h2>Event Not Found</h2>
          <p>The requested event ID could not be found.</p>
          <Link to="/events" className="btn-back">← Back to Catalog</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="event-details-card">
        <Link to="/events" className="back-link">← Back to Catalog</Link>
        
        <h1 className="event-details-title">{event.title}</h1>
        
        <div className="event-details-meta">
          <span className="meta-badge">📅 {event.date}</span>
          <span className="meta-badge">⏰ {event.time}</span>
          <span className="meta-badge">📍 {event.venue}</span>
          <span className="meta-badge seats-badge">🪑 {event.availableSeats} Seats Available</span>
        </div>

        <div className="event-details-section">
          <h3>About This Event</h3>
          <p className="event-details-description">{event.description}</p>
        </div>

        <div className="event-details-actions">
          <button className="btn-register">Register for Event</button>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
