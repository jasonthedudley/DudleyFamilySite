import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Gallery from './pages/Gallery'
import Calendar from './pages/Calendar'
import MessageBoard from './pages/MessageBoard'
import Login from './pages/Login'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="family-theme">
      <Router>
        <Navigation />
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/gallery" 
              element={isAuthenticated ? <Gallery /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/calendar" 
              element={isAuthenticated ? <Calendar /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/messages" 
              element={isAuthenticated ? <MessageBoard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
      </Router>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
