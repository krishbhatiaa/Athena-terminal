import React, { useState } from 'react'
import axios from 'axios'

export default function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/auth/register', {
        username,
        email,
        password,
        full_name: fullName
      })

      if (response.data && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        onRegisterSuccess(response.data.user)
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
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
        background: 'var(--bg-primary)',
        padding: '20px'
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
          }}>Create Account</div>
          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '32px'
          }}>Join ATHENA Financial Terminal</div>

          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase'
              }}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="search-box"
                style={{ width: '100%' }}
                disabled={loading}
              />
            </div>

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
                placeholder="username"
                className="search-box"
                style={{ width: '100%' }}
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
                textTransform: 'uppercase'
              }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="search-box"
                style={{ width: '100%' }}
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
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
                placeholder="Minimum 6 characters"
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
              }}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
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
              {loading ? 'Creating account...' : 'Create Account'}
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
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-success)',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '13px'
              }}
            >
              Login here
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
