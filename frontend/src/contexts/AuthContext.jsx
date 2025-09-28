import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('family_token')
    if (token) {
      // Verify token with backend
      axios.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setIsAuthenticated(true)
        setUser(response.data.user)
      })
      .catch(() => {
        localStorage.removeItem('family_token')
        setIsAuthenticated(false)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (password) => {
    try {
      const response = await axios.post('/api/auth/login', { password })
      const { token, user } = response.data
      
      localStorage.setItem('family_token', token)
      setIsAuthenticated(true)
      setUser(user)
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('family_token')
    setIsAuthenticated(false)
    setUser(null)
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
