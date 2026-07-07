import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyListings, getDashboardStats, deleteListing } from '../lib/api'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeListings: 0,
    enquiriesSent: 0,
    enquiriesReceived: 0,
    totalViews: 0
  })
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const [listingsData, statsData] = await Promise.all([
        getMyListings(user.id),
        getDashboardStats(user.id)
      ])
      setListings(listingsData || [])
      setStats(statsData || stats)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteListing = async (listingId, listingTitle) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${listingTitle}"? This action cannot be undone.`)

    if (!confirmed) return

    try {
      await deleteListing(listingId)
      // Reload dashboard data
      await loadDashboard()
      alert('Listing deleted successfully!')
    } catch (err) {
      console.error('Error deleting listing:', err)
      alert('Failed to delete listing. Please try again.')
    }
  }

  const handleEditListing = (listingId) => {
    navigate(`/post/edit/${listingId}`)
  }

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <h1 className="dashboard__title">Dashboard</h1>

        {error && (
          <div className="dashboard__error" style={{
            backgroundColor: '#fee',
            color: '#c00',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        ) : (
          <>
            <div className="dashboard__stats">
              <div className="stat-card">
                <div className="stat-card__value">{stats.activeListings}</div>
                <div className="stat-card__label">Active Listings</div>
              </div>

              <div className="stat-card">
                <div className="stat-card__value">{stats.enquiriesReceived}</div>
                <div className="stat-card__label">Enquiries Received</div>
              </div>

              <div className="stat-card">
                <div className="stat-card__value">{stats.enquiriesSent}</div>
                <div className="stat-card__label">Enquiries Sent</div>
              </div>

              <div className="stat-card">
                <div className="stat-card__value">{stats.totalViews}</div>
                <div className="stat-card__label">Total Views</div>
              </div>
            </div>

            <div className="dashboard__section">
              <div className="dashboard__section-header">
                <h2 className="dashboard__section-title">My Listings</h2>
                <button
                  className="dashboard__view-all"
                  onClick={() => navigate('/post')}
                >
                  Post New
                </button>
              </div>

              {listings.length === 0 ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  backgroundColor: '#f7fafc',
                  borderRadius: '8px'
                }}>
                  <p style={{ marginBottom: '16px' }}>You haven't created any listings yet</p>
                  <button
                    onClick={() => navigate('/post')}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#2c7a7b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Create Your First Listing
                  </button>
                </div>
              ) : (
                <div className="dashboard__listings">
                  {listings.slice(0, 5).map(listing => (
                    <div
                      key={listing.id}
                      className="listing-item"
                    >
                      <div
                        className="listing-item__main"
                        onClick={() => navigate(`/listing/${listing.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <h3 className="listing-item__title">{listing.title}</h3>
                        <span className={`listing-item__status listing-item__status--${listing.status}`}>
                          {listing.status}
                        </span>
                      </div>
                      <div className="listing-item__stats">
                        <span className="listing-item__stat">{listing.views_count || 0} views</span>
                        <span className="listing-item__stat">{listing.enquiries_count || 0} enquiries</span>
                      </div>
                      <div className="listing-item__actions">
                        <button
                          className="listing-item__action listing-item__action--edit"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditListing(listing.id)
                          }}
                          title="Edit listing"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="listing-item__action listing-item__action--delete"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteListing(listing.id, listing.title)
                          }}
                          title="Delete listing"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard__section">
              <h2 className="dashboard__section-title">Quick Actions</h2>
              <div className="dashboard__actions">
            <button className="action-card" onClick={() => navigate('/post')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Post Listing</span>
            </button>

            <button className="action-card" onClick={() => navigate('/enquiries')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>View Enquiries</span>
            </button>

            <button className="action-card" onClick={() => navigate('/browse')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span>Browse Market</span>
            </button>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
