import { Link } from 'react-router-dom'
import './EventCard.css'

function EventCard({ event }) {
  const { _id, id, title, date, time, venue, description } = event
  const eventId = _id || id

  // Format date cleanly if an ISO string is received from MongoDB
  const formattedDate = date
    ? isNaN(new Date(date).getTime())
      ? date
      : new Date(date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
    : ''

  return (
    <div className="event-card">
      <div className="event-card-header">
        <h3 className="event-card-title">{title}</h3>
      </div>
      <div className="event-card-body">
        <div className="event-card-meta">
          <span className="meta-item">📅 {formattedDate}</span>
          <span className="meta-item">⏰ {time}</span>
          <span className="meta-item">📍 {venue}</span>
        </div>
        <p className="event-card-description">{description}</p>
      </div>
      <div className="event-card-footer">
        <Link to={`/events/${eventId}`} className="btn-view-details">
          View Details
        </Link>
      </div>
    </div>
  )
}

export default EventCard

