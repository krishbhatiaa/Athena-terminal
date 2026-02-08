import React, { useState } from 'react'
import axios from 'axios'

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('/auth/login', {
        username,
        password
      })

      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        onLoginSuccess(response.data.user)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)'
      }}>
        <div className="card" style={{
          width: '100%',
          maxWidth: '400px',
          padding: '32px'
        }}>
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            marginBottom: '8px',
            color: 'var(--text-primary)'
          }}>ATHENA</div>
          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '32px'
          }}>Financial Terminal</div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase'
              }}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="search-box"
                style={{ width: '100%' }}
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase'
              }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="search-box"
                style={{ width: '100%' }}
                disabled={loading}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                background: 'rgba(220, 38, 38, 0.1)',
                border: '1px solid #DC2626',
                borderRadius: '6px',
                color: '#DC2626',
                fontSize: '13px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--accent-success)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: '13px'
          }}>
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-success)',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '13px'
              }}
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
