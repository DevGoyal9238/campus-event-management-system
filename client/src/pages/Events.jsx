import { useState, useEffect } from 'react'
import EventCard from '../components/EventCard'
import './Events.css'

function Events() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('http://localhost:5000/api/events')

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setEvents(data)
    } catch (err) {
      console.error('Error fetching events:', err)
      setError(err.message || 'Unable to connect to server. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Campus Events Catalog</h1>
        <p className="page-subtitle">Discover upcoming workshops, hackathons, and cultural activities.</p>
      </div>

      {loading && (
        <div className="status-container loading-state">
          <div className="spinner"></div>
          <p>Loading events from database...</p>
        </div>
      )}

      {!loading && error && (
        <div className="status-container error-state">
          <p className="error-title">⚠️ Error Loading Events</p>
          <p className="error-message">{error}</p>
          <button onClick={fetchEvents} className="btn-retry">Try Again</button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="status-container empty-state">
          <p className="empty-icon">📅</p>
          <h3>No Events Found</h3>
          <p>There are currently no upcoming events scheduled. Please check back later!</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="events-grid">
          {events.map((event) => (
            <EventCard key={event._id || event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Events

