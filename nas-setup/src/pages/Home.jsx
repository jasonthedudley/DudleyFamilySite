import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div>
      <section className="welcome-section">
        <h1 className="welcome-title">Welcome to The Dudley Family Site</h1>
        <p className="welcome-subtitle">
          A private space for our family to share memories, stay connected, and plan together.
        </p>
        
        {!isAuthenticated ? (
          <div>
            <p style={{ marginBottom: '2rem', color: '#7f8c8d' }}>
              Please log in to access family features.
            </p>
            <Link to="/login" className="btn">
              Family Login
            </Link>
          </div>
        ) : (
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">📸</div>
              <h3 className="feature-title">Photo Gallery</h3>
              <p className="feature-description">
                Share and view family photos, memories, and special moments. 
                Upload photos with captions and create shareable albums.
              </p>
              <Link to="/gallery" className="btn">
                View Gallery
              </Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3 className="feature-title">Family Calendar</h3>
              <p className="feature-description">
                Keep track of birthdays, events, and family gatherings. 
                Add events and share calendar views with family members.
              </p>
              <Link to="/calendar" className="btn">
                View Calendar
              </Link>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">Message Board</h3>
              <p className="feature-description">
                Stay connected with family messages, share grocery lists, 
                and coordinate family activities in one place.
              </p>
              <Link to="/messages" className="btn">
                View Messages
              </Link>
            </div>
          </div>
        )}
      </section>
      
      {isAuthenticated && (
        <section className="card">
          <h2 style={{ marginBottom: '1rem', color: 'var(--text-color)' }}>
            Recent Activity
          </h2>
          <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
            Recent activity will appear here as you use the family features.
          </p>
        </section>
      )}
    </div>
  )
}

export default Home
