import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './AdminEvents.css'

function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form State for Create / Edit
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    venue: '',
    description: '',
    totalCapacity: '',
    availableSeats: ''
  })
  const [formSubmitting, setFormSubmitting] = useState(false)

  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  // Helper to format date for input fields (YYYY-MM-DD)
  const formatForDateInput = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return ''
    return d.toISOString().split('T')[0]
  }

  // Helper to format date for display (e.g. 28 Sep 2026)
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Date TBA'
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return dateString
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const fetchEvents = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('http://localhost:5000/api/events')
      if (!response.ok) {
        throw new Error(`Failed to load events (${response.status})`)
      }
      const data = await response.json()
      setEvents(data)
    } catch (err) {
      console.error('Error fetching admin events:', err)
      setError(err.message || 'Unable to connect to server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token && user?.role === 'admin') {
      fetchEvents()
    }
  }, [])

  // Open form in Create mode
  const handleOpenCreateForm = () => {
    setEditingId(null)
    setFormData({
      title: '',
      date: '',
      time: '',
      venue: '',
      description: '',
      totalCapacity: '',
      availableSeats: ''
    })
    setError('')
    setSuccess('')
    setIsFormOpen(true)
  }

  // Open form in Edit mode
  const handleOpenEditForm = (event) => {
    setEditingId(event._id)
    setFormData({
      title: event.title || '',
      date: formatForDateInput(event.date),
      time: event.time || '',
      venue: event.venue || '',
      description: event.description || '',
      totalCapacity: event.totalCapacity || '',
      availableSeats: event.availableSeats || ''
    })
    setError('')
    setSuccess('')
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingId(null)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Submit Event Form (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setFormSubmitting(true)

    try {
      const payload = {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        description: formData.description,
        totalCapacity: Number(formData.totalCapacity),
        availableSeats: Number(formData.availableSeats)
      }

      const url = editingId
        ? `http://localhost:5000/api/events/${editingId}`
        : 'http://localhost:5000/api/events'

      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `Operation failed with status ${response.status}`)
      }

      setSuccess(editingId ? 'Event updated successfully!' : 'Event created successfully!')
      setIsFormOpen(false)
      fetchEvents()
    } catch (err) {
      console.error('Error saving event:', err)
      setError(err.message || 'Failed to save event.')
    } finally {
      setFormSubmitting(false)
    }
  }

  // Delete Event
  const handleDeleteEvent = async (id, title) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${title}"?`)
    if (!confirmDelete) return

    setError('')
    setSuccess('')

    try {
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete event')
      }

      setSuccess(`Event "${title}" deleted successfully.`)
      fetchEvents()
    } catch (err) {
      console.error('Error deleting event:', err)
      setError(err.message || 'Failed to delete event.')
    }
  }

  // 1. Unauthenticated Guard
  if (!token) {
    return (
      <div className="admin-page">
        <div className="status-container">
          <p className="status-icon">🔒</p>
          <h3>Authentication Required</h3>
          <p>Please login with an administrator account to access event management.</p>
          <Link to="/login" className="btn-action-primary">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // 2. Unauthorized Role Guard (Non-Admin User)
  if (user?.role !== 'admin') {
    return (
      <div className="admin-page">
        <div className="status-container">
          <p className="status-icon">⛔</p>
          <h3>Admin Access Required</h3>
          <p>Your account ({user?.email}) does not have administrative privileges.</p>
          <Link to="/events" className="btn-action-primary">
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Event Management Dashboard</h1>
          <p className="admin-subtitle">Create, update, and manage campus events with administrative authorization.</p>
        </div>
        {!isFormOpen && (
          <button onClick={handleOpenCreateForm} className="btn-create-event">
            ➕ Create New Event
          </button>
        )}
      </div>

      {/* Status Alerts */}
      {error && (
        <div className="admin-alert error">
          ⚠️ {error}
        </div>
      )}

      {success && (
        <div className="admin-alert success">
          ✅ {success}
        </div>
      )}

      {/* Create / Edit Form Card */}
      {isFormOpen && (
        <div className="admin-form-card">
          <div className="form-card-header">
            <h2>{editingId ? 'Edit Event' : 'Create New Event'}</h2>
            <button onClick={handleCloseForm} className="btn-close-form" title="Close Form">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="event-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Event Title *</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g. AI & Robotics Symposium"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="venue">Venue / Location *</label>
                <input
                  id="venue"
                  name="venue"
                  type="text"
                  placeholder="e.g. Main Auditorium Hall A"
                  value={formData.venue}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">Time *</label>
                <input
                  id="time"
                  name="time"
                  type="text"
                  placeholder="e.g. 10:00 AM - 4:00 PM"
                  value={formData.time}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="totalCapacity">Total Capacity *</label>
                <input
                  id="totalCapacity"
                  name="totalCapacity"
                  type="number"
                  min="1"
                  placeholder="e.g. 150"
                  value={formData.totalCapacity}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="availableSeats">Available Seats *</label>
                <input
                  id="availableSeats"
                  name="availableSeats"
                  type="number"
                  min="0"
                  placeholder="e.g. 150"
                  value={formData.availableSeats}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Event Description *</label>
              <textarea
                id="description"
                name="description"
                rows="3"
                placeholder="Provide event details, schedule, and speaker information..."
                value={formData.description}
                onChange={handleFormChange}
                required
              ></textarea>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCloseForm}
                className="btn-cancel"
                disabled={formSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit-event"
                disabled={formSubmitting}
              >
                {formSubmitting
                  ? (editingId ? 'Saving changes...' : 'Creating event...')
                  : editingId
                  ? 'Save Changes'
                  : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events Management Table */}
      {loading ? (
        <div className="status-container">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="status-container empty-state">
          <p className="status-icon">📅</p>
          <h3>No events have been created yet.</h3>
          <p>Click "Create New Event" above to publish your first campus event.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date & Time</th>
                <th>Venue</th>
                <th>Capacity</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event._id}>
                  <td className="table-event-title">{event.title}</td>
                  <td>
                    <div>{formatDisplayDate(event.date)}</div>
                    <small style={{ color: '#64748b' }}>{event.time}</small>
                  </td>
                  <td>{event.venue}</td>
                  <td>{event.totalCapacity}</td>
                  <td>
                    <span
                      className={`seats-badge ${
                        event.availableSeats > 0 ? 'available' : 'full'
                      }`}
                    >
                      {event.availableSeats} seats
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        onClick={() => handleOpenEditForm(event)}
                        className="btn-table-edit"
                        title="Edit event details"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id, event.title)}
                        className="btn-table-delete"
                        title="Delete event"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminEvents
