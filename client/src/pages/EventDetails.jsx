import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import './EventDetails.css'

function EventDetails() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Registration state variables
  const [registering, setRegistering] = useState(false)
  const [registerSuccess, setRegisterSuccess] = useState('')
  const [registerError, setRegisterError] = useState('')

  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`http://localhost:5000/api/events/${id}`)

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Event not found')
          } else if (response.status === 400) {
            throw new Error('Invalid event ID format')
          } else {
            throw new Error(`Failed to fetch event: ${response.status}`)
          }
        }

        const data = await response.json()
        setEvent(data)
      } catch (err) {
        console.error('Error fetching event details:', err)
        setError(err.message || 'Failed to load event details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchEvent()
    }
  }, [id])

  // Handle Event Registration POST request
  const handleRegister = async () => {
    if (!token) {
      setRegisterError('Please login to register for an event.')
      return
    }

    try {
      setRegistering(true)
      setRegisterSuccess('')
      setRegisterError('')

      const response = await fetch(`http://localhost:5000/api/events/${id}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Your session has expired. Please login again.')
        }
        throw new Error(data.message || 'Registration failed')
      }

      // Update state with newly returned event document
      setEvent(data)
      setRegisterSuccess('Registered successfully! You can view this under My Registrations.')
    } catch (err) {
      console.error('Error registering for event:', err)
      setRegisterError(err.message || 'Failed to register for event')
    } finally {
      setRegistering(false)
    }
  }

  // Helper function to format date strings cleanly
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBA'
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="status-container loading-state">
          <div className="spinner"></div>
          <p>Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="page-container">
        <div className="status-container error-state">
          <p className="error-icon">⚠️</p>
          <h2>Event Not Found</h2>
          <p>{error || 'The requested event could not be found.'}</p>
          <Link to="/events" className="btn-action-primary">
            ← Back to Events Catalog
          </Link>
        </div>
      </div>
    )
  }

  const isSoldOut = event.availableSeats <= 0

  return (
    <div className="page-container">
      <div className="event-details-layout">
        <div className="details-nav-back">
          <Link to="/events" className="back-link">
            ← Back to Events Catalog
          </Link>
        </div>

        <div className="event-details-grid">
          {/* Left Column: Event Information */}
          <div className="event-info-panel">
            <div className="info-header">
              <span className="event-category-badge">🎓 Campus Event</span>
              <h1 className="event-details-title">{event.title}</h1>
            </div>

            <div className="event-meta-grid">
              <div className="meta-card">
                <span className="meta-card-icon">📅</span>
                <div>
                  <div className="meta-card-label">Date</div>
                  <div className="meta-card-value">{formatDate(event.date)}</div>
                </div>
              </div>

              <div className="meta-card">
                <span className="meta-card-icon">⏰</span>
                <div>
                  <div className="meta-card-label">Time</div>
                  <div className="meta-card-value">{event.time || 'Time TBA'}</div>
                </div>
              </div>

              <div className="meta-card">
                <span className="meta-card-icon">📍</span>
                <div>
                  <div className="meta-card-label">Venue</div>
                  <div className="meta-card-value">{event.venue || 'Venue TBA'}</div>
                </div>
              </div>

              <div className="meta-card">
                <span className="meta-card-icon">👥</span>
                <div>
                  <div className="meta-card-label">Capacity & Seats</div>
                  <div className="meta-card-value">
                    {event.availableSeats} of {event.totalCapacity} seats left
                  </div>
                </div>
              </div>
            </div>

            <div className="event-description-box">
              <h3>About This Event</h3>
              <p className="event-details-description">{event.description}</p>
            </div>
          </div>

          {/* Right Column: Registration Card */}
          <div className="event-action-panel">
            <div className="registration-card-box">
              <h3>Event Registration</h3>
              <p className="registration-card-subtitle">
                Reserve your seat for this campus activity.
              </p>

              <div className="seat-status-indicator">
                <div className="seat-count-row">
                  <span>Available Seats</span>
                  <span className={`seat-count-badge ${isSoldOut ? 'sold-out' : 'available'}`}>
                    {isSoldOut ? 'Sold Out' : `${event.availableSeats} Available`}
                  </span>
                </div>
                <div className="seat-count-row total-cap">
                  <span>Total Capacity</span>
                  <span>{event.totalCapacity} attendees</span>
                </div>
              </div>

              {/* Status Banners */}
              {registerSuccess && (
                <div className="alert-message success">
                  ✅ {registerSuccess}
                </div>
              )}

              {registerError && (
                <div className="alert-message error">
                  ⚠️ {registerError}
                </div>
              )}

              {/* Action Button depending on Authentication & Availability */}
              <div className="action-button-wrapper">
                {!token ? (
                  <Link to="/login" className="btn-register-action btn-login-prompt">
                    Login to Register
                  </Link>
                ) : isSoldOut ? (
                  <button className="btn-register-action btn-sold-out" disabled>
                    Sold Out
                  </button>
                ) : (
                  <button
                    className="btn-register-action btn-register-active"
                    onClick={handleRegister}
                    disabled={registering}
                  >
                    {registering ? 'Registering...' : 'Register for Event'}
                  </button>
                )}
              </div>

              <div className="registration-notice">
                <small>⚡ Fast 1-click registration with instantaneous seat confirmation.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
