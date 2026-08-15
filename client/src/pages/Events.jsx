import EventCard from '../components/EventCard'
import { sampleEvents } from '../data/mockEvents'
import './Events.css'

function Events() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Campus Events Catalog</h1>
        <p className="page-subtitle">Discover upcoming workshops, hackathons, and cultural activities.</p>
      </div>

      <div className="events-grid">
        {sampleEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}

export default Events
