import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './MyRegistrations.css'

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthError, setIsAuthError] = useState(false)

  const token = localStorage.getItem('token')

  // Helper function to format ISO date strings into readable format (e.g. 28 Sep 2026)
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA'
    const parsedDate = new Date(dateString)
    if (isNaN(parsedDate.getTime())) return dateString

    return parsedDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const fetchMyRegistrations = async () => {
    // If no JWT token is stored, do not attempt the network request
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      setIsAuthError(false)

      const response = await fetch('http://localhost:5000/api/events/my-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      // Handle session expiration or invalid token (HTTP 401)
      if (response.status === 401) {
        setIsAuthError(true)
        setError('Your session has expired. Please login again.')
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to load registrations (${response.status})`)
      }

      const data = await response.json()
      setRegistrations(data.registrations || [])
    } catch (err) {
      console.error('Error fetching user registrations:', err)
      setError(err.message || 'Unable to load registrations. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyRegistrations()
  }, [])

  // 1. Unauthenticated State (No Token in Storage)
  if (!token) {
    return (
      <div className="my-registrations-page">
        <div className="status-container auth-prompt-state">
          <p className="status-icon">🔒</p>
          <h3>Authentication Required</h3>
          <p>Please login to view your registrations.</p>
          <Link to="/login" className="btn-action-primary">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="my-registrations-page">
      <div className="page-header">
        <h1>My Registered Events</h1>
        <p className="page-subtitle">Track and manage your upcoming campus event bookings.</p>
      </div>

      {/* 2. Loading State */}
      {loading && (
        <div className="status-container loading-state">
          <div className="spinner"></div>
          <p>Loading your registrations...</p>
        </div>
      )}

      {/* 3. Error State */}
      {!loading && error && (
        <div className="status-container error-state">
          <p className="error-title">⚠️ {isAuthError ? 'Session Expired' : 'Error Loading Registrations'}</p>
          <p className="error-message">{error}</p>
          {isAuthError ? (
            <Link to="/login" className="btn-action-primary">
              Login Again
            </Link>
          ) : (
            <button onClick={fetchMyRegistrations} className="btn-retry">
              Try Again
            </button>
          )}
        </div>
      )}

      {/* 4. Empty State */}
      {!loading && !error && registrations.length === 0 && (
        <div className="status-container empty-state">
          <p className="status-icon">🎟️</p>
          <h3>No Registrations Found</h3>
          <p>You haven't registered for any events yet.</p>
          <Link to="/events" className="btn-action-primary">
            Explore Events
          </Link>
        </div>
      )}

      {/* 5. Registrations List / Grid */}
      {!loading && !error && registrations.length > 0 && (
        <div className="registrations-grid">
          {registrations.map((registration) => {
            const event = registration.eventId
            // If the populated event reference is missing or null, provide fallback
            const eventId = event?._id || event?.id || registration.eventId
            const title = event?.title || 'Untitled Event'
            const date = event?.date ? formatDate(event.date) : 'Date TBA'
            const time = event?.time || 'Time TBA'
            const venue = event?.venue || 'Venue TBA'
            const description = event?.description || 'No event description available.'
            const availableSeats = event?.availableSeats ?? 'N/A'
            const registeredOn = formatDate(registration.createdAt)

            return (
              <div key={registration._id} className="registration-card">
                <div>
                  <div className="registration-card-header">
                    <h3 className="registration-card-title">{title}</h3>
                    <span className="confirmed-badge">✓ Confirmed</span>
                  </div>

                  <div className="registration-meta">
                    <span className="meta-chip">📅 {date}</span>
                    <span className="meta-chip">⏰ {time}</span>
                    <span className="meta-chip">📍 {venue}</span>
                    <span className="meta-chip">🪑 {availableSeats} Seats Left</span>
                  </div>

                  <p className="registration-description">{description}</p>
                </div>

                <div className="registration-card-footer">
                  <div className="registration-timestamp">
                    Registered on: {registeredOn}
                  </div>
                  {event && (
                    <Link to={`/events/${eventId}`} className="btn-view-event">
                      View Event
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyRegistrations
