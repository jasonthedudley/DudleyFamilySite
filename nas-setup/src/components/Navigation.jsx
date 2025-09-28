import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Navigation() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  return (
    <nav className="nav">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          🏠 The Dudley Family
        </Link>
        
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <ul className="nav-links">
              <li>
                <Link 
                  to="/gallery" 
                  className={location.pathname === '/gallery' ? 'active' : ''}
                >
                  📸 Gallery
                </Link>
              </li>
              <li>
                <Link 
                  to="/calendar" 
                  className={location.pathname === '/calendar' ? 'active' : ''}
                >
                  📅 Calendar
                </Link>
              </li>
              <li>
                <Link 
                  to="/messages" 
                  className={location.pathname === '/messages' ? 'active' : ''}
                >
                  💬 Messages
                </Link>
              </li>
            </ul>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: 'var(--primary-color)', fontWeight: '500' }}>
                Welcome, {user?.name || 'Family Member'}!
              </span>
              <button onClick={logout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link to="/login" className="btn">
            Family Login
          </Link>
        )}
      </div>
    </nav>
  )
}

export default Navigation
