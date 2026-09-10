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
            throw new Error(`Failed to fetch event: ${response.status} ${response.statusText}`)
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
    try {
      setRegistering(true)
      setRegisterSuccess('')
      setRegisterError('')

      const response = await fetch(`http://localhost:5000/api/events/${id}/register`, {
        method: 'POST'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Update state with newly returned event document (decreasing availableSeats immediately)
      setEvent(data)
      setRegisterSuccess('Registered successfully!')
    } catch (err) {
      console.error('Error registering for event:', err)
      setRegisterError(err.message || 'Failed to register for event')
    } finally {
      setRegistering(false)
    }
  }

  // Helper function to format date strings cleanly
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
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
        <div className="not-found-card">
          <h2>Event Not Found</h2>
          <p>{error || 'The requested event could not be found.'}</p>
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
          <span className="meta-badge">📅 {formatDate(event.date)}</span>
          <span className="meta-badge">⏰ {event.time}</span>
          <span className="meta-badge">📍 {event.venue}</span>
          <span className="meta-badge seats-badge">🪑 {event.availableSeats} Seats Available</span>
        </div>

        <div className="event-details-section">
          <h3>About This Event</h3>
          <p className="event-details-description">{event.description}</p>
        </div>

        {registerSuccess && (
          <div className="registration-message success">
            ✅ {registerSuccess}
          </div>
        )}

        {registerError && (
          <div className="registration-message error">
            ⚠️ {registerError}
          </div>
        )}

        <div className="event-details-actions">
          <button 
            className="btn-register"
            onClick={handleRegister}
            disabled={registering}
          >
            {registering ? 'Registering...' : 'Register for Event'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventDetails

