import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(password)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="auth-form">
      <h2 className="auth-title">Family Login</h2>
      <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '2rem' }}>
        Enter the family password to access our private space.
      </p>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Family Password
          </label>
          <input
            type="password"
            id="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter family password"
            required
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn" 
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
          Don't have the password? Contact a family member for access.
        </p>
      </div>
    </div>
  )
}

export default Login
