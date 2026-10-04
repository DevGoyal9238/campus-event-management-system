import { Link } from 'react-router-dom'
import './EventCard.css'

function EventCard({ event }) {
  const { _id, id, title, date, time, venue, description, availableSeats } = event
  const eventId = _id || id
  const isSoldOut = typeof availableSeats === 'number' && availableSeats <= 0

  // Format date cleanly if an ISO string is received from MongoDB
  const formattedDate = date
    ? isNaN(new Date(date).getTime())
      ? date
      : new Date(date).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })
    : 'Date TBA'

  return (
    <div className={`event-card ${isSoldOut ? 'sold-out-card' : ''}`}>
      <div className="event-card-header">
        <h3 className="event-card-title">{title}</h3>
        {isSoldOut && (
          <span className="badge-sold-out">Sold Out</span>
        )}
      </div>

      <div className="event-card-body">
        <div className="event-card-meta">
          <span className="meta-item">📅 {formattedDate}</span>
          <span className="meta-item">⏰ {time || 'Time TBA'}</span>
          <span className="meta-item">📍 {venue || 'Venue TBA'}</span>
          <span className={`meta-item ${isSoldOut ? 'seats-sold-out' : 'seats-available'}`}>
            🪑 {isSoldOut ? '0 Seats Left' : `${availableSeats} Seats Left`}
          </span>
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
