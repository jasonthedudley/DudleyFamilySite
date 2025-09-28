import React, { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import axios from 'axios'

function Calendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    type: 'event'
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events')
      setEvents(response.data)
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateSelect = (selectInfo) => {
    const date = selectInfo.startStr.split('T')[0]
    setNewEvent({ ...newEvent, date })
    setEditingEvent(null)
    setShowForm(true)
  }

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event
    setEditingEvent({
      id: event.id,
      title: event.title,
      date: event.startStr.split('T')[0],
      time: event.startStr.includes('T') ? event.startStr.split('T')[1].substring(0, 5) : '',
      description: event.extendedProps?.description || '',
      type: event.extendedProps?.type || 'event'
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const eventData = {
        ...newEvent,
        datetime: newEvent.time ? `${newEvent.date}T${newEvent.time}` : newEvent.date
      }

      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent.id}`, eventData)
        await fetchEvents()
      } else {
        await axios.post('/api/events', eventData)
        await fetchEvents()
      }

      setShowForm(false)
      setEditingEvent(null)
      setNewEvent({ title: '', date: '', time: '', description: '', type: 'event' })
    } catch (error) {
      console.error('Failed to save event:', error)
    }
  }

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/api/events/${eventId}`)
        await fetchEvents()
        setShowForm(false)
        setEditingEvent(null)
      } catch (error) {
        console.error('Failed to delete event:', error)
      }
    }
  }

  const getEventColor = (type) => {
    switch (type) {
      case 'birthday': return '#e74c3c'
      case 'anniversary': return '#9b59b6'
      case 'holiday': return '#f39c12'
      case 'event': return '#3498db'
      default: return '#3498db'
    }
  }

  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.datetime,
    backgroundColor: getEventColor(event.type),
    borderColor: getEventColor(event.type),
    extendedProps: {
      description: event.description,
      type: event.type
    }
  }))

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-color)' }}>
          📅 Family Calendar
        </h1>
        <button 
          onClick={() => setShowForm(true)}
          className="btn"
        >
          Add Event
        </button>
      </div>

      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={calendarEvents}
          select={handleDateSelect}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowForm(false)}
            >
              ×
            </button>
            
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-color)' }}>
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Event Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g., Mom's Birthday"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Time (optional)</label>
                  <input
                    type="time"
                    className="form-input"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Event Type</label>
                <select
                  className="form-input"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                >
                  <option value="event">General Event</option>
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea
                  className="form-input form-textarea"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Add more details about this event..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                {editingEvent && (
                  <button 
                    type="button" 
                    onClick={() => handleDelete(editingEvent.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                )}
                <button type="submit" className="btn">
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Calendar
