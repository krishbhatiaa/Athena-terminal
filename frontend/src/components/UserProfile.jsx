import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function UserProfile({ user, onClose, onUpdate }) {
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [address, setAddress] = useState(user?.address || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || '')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await axios.put('/auth/profile', {
        full_name: fullName,
        address,
        phone,
        photo_url: photoUrl
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      localStorage.setItem('user', JSON.stringify(response.data))
      setSuccess('Profile updated successfully!')
      onUpdate(response.data)
      setTimeout(() => onClose(), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '32px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--text-primary)'
          }}>Edit Profile</div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
              textTransform: 'uppercase'
            }}>Photo URL</label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              className="search-box"
              style={{ width: '100%' }}
              disabled={loading}
            />
            {photoUrl && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <img
                  src={photoUrl}
                  alt="Profile"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--accent-success)'
                  }}
                  onError={() => setPhotoUrl('')}
                />
              </div>
            )}
          </div>

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
            }}>Address</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, City, State, ZIP"
              className="search-box"
              style={{
                width: '100%',
                minHeight: '80px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
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
            }}>Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(555) 123-4567"
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

          {success && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10B981',
              borderRadius: '6px',
              color: '#10B981',
              fontSize: '13px'
            }}>
              {success}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '10px',
                background: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
