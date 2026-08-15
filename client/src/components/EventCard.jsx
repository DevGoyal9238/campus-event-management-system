import { Link } from 'react-router-dom'
import './EventCard.css'

function EventCard({ event }) {
  const { id, title, date, time, venue, description } = event

  return (
    <div className="event-card">
      <div className="event-card-header">
        <h3 className="event-card-title">{title}</h3>
      </div>
      <div className="event-card-body">
        <div className="event-card-meta">
          <span className="meta-item">📅 {date}</span>
          <span className="meta-item">⏰ {time}</span>
          <span className="meta-item">📍 {venue}</span>
        </div>
        <p className="event-card-description">{description}</p>
      </div>
      <div className="event-card-footer">
        <Link to={`/events/${id}`} className="btn-view-details">
          View Details
        </Link>
      </div>
    </div>
  )
}

export default EventCard
