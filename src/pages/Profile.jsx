import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

function Profile() {
  const { user, profile, updateProfile, logout } = useAuth()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    company_name: profile?.company_name || '',
    location: profile?.location || '',
    bio: profile?.bio || ''
  })

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await updateProfile(formData)
      setEditing(false)
      alert('Profile updated successfully!')
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="profile">
      <div className="profile__container">
        <div className="profile__header">
          <div className="profile__avatar">
            {profile?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="profile__name">{profile?.full_name || 'User'}</h1>
            <p className="profile__email">{user?.email}</p>
          </div>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c00',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="profile__section">
            <h2 className="profile__section-title">Edit Profile</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Full Name *
                </label>
                <input
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Phone
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Company Name
                </label>
                <input
                  name="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Location
                </label>
                <input
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setFormData({
                      full_name: profile?.full_name || '',
                      phone: profile?.phone || '',
                      company_name: profile?.company_name || '',
                      location: profile?.location || '',
                      bio: profile?.bio || ''
                    })
                  }}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    backgroundColor: '#2c7a7b',
                    color: 'white',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="profile__section">
            <h2 className="profile__section-title">Account</h2>
            <div className="profile__menu">
              <button className="profile__menu-item" onClick={() => setEditing(true)}>
                <span>Edit Profile</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {profile?.company_name && (
              <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f7fafc', borderRadius: '8px' }}>
                <p style={{ fontSize: '14px', color: '#4a5568' }}>
                  <strong>Company:</strong> {profile.company_name}
                </p>
                {profile.location && (
                  <p style={{ fontSize: '14px', color: '#4a5568', marginTop: '8px' }}>
                    <strong>Location:</strong> {profile.location}
                  </p>
                )}
                {profile.phone && (
                  <p style={{ fontSize: '14px', color: '#4a5568', marginTop: '8px' }}>
                    <strong>Phone:</strong> {profile.phone}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {profile?.is_admin && (
          <div className="profile__section">
            <h2 className="profile__section-title">Admin</h2>
            <div className="profile__menu">
              <button
                className="profile__menu-item"
                onClick={() => navigate('/admin')}
              >
                <span>Admin Panel</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <button className="profile__logout" onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default Profile
