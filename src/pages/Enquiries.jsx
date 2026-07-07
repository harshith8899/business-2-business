import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyEnquiries, getReceivedEnquiries, updateEnquiryStatus } from '../lib/api'
import './Enquiries.css'

function Enquiries() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('received') // 'received' or 'sent'
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)

  useEffect(() => {
    loadEnquiries()
  }, [activeTab])

  useEffect(() => {
    // If there's an ID in the URL and we have enquiries, select it
    if (id && enquiries.length > 0) {
      const enquiry = enquiries.find(e => e.id === id)
      if (enquiry) {
        setSelectedEnquiry(enquiry)
        // Mark as read if it's a received enquiry
        if (activeTab === 'received' && enquiry.status === 'new') {
          handleStatusUpdate(enquiry.id, 'read')
        }
      }
    } else if (enquiries.length > 0 && !selectedEnquiry) {
      // Auto-select first enquiry
      setSelectedEnquiry(enquiries[0])
      if (activeTab === 'received' && enquiries[0].status === 'new') {
        handleStatusUpdate(enquiries[0].id, 'read')
      }
    }
  }, [id, enquiries])

  const loadEnquiries = async () => {
    setLoading(true)
    setError('')
    try {
      const data = activeTab === 'received'
        ? await getReceivedEnquiries(user.id)
        : await getMyEnquiries(user.id)
      setEnquiries(data || [])
      setSelectedEnquiry(null)
    } catch (err) {
      console.error('Error loading enquiries:', err)
      setError('Failed to load enquiries')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (enquiryId, newStatus) => {
    try {
      await updateEnquiryStatus(enquiryId, newStatus)
      // Update local state
      setEnquiries(prev => prev.map(e =>
        e.id === enquiryId ? { ...e, status: newStatus } : e
      ))
      if (selectedEnquiry?.id === enquiryId) {
        setSelectedEnquiry(prev => ({ ...prev, status: newStatus }))
      }
    } catch (err) {
      console.error('Error updating enquiry status:', err)
    }
  }

  const handleEnquiryClick = (enquiry) => {
    setSelectedEnquiry(enquiry)
    navigate(`/enquiries/${enquiry.id}`)
    // Mark as read if it's a received enquiry and status is new
    if (activeTab === 'received' && enquiry.status === 'new') {
      handleStatusUpdate(enquiry.id, 'read')
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return '1d ago'
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const getStatusColor = (status) => {
    const colors = {
      new: '#2c7a7b',
      read: '#744210',
      replied: '#2f855a',
      closed: '#718096'
    }
    return colors[status] || '#718096'
  }

  const getListingTitle = (enquiry) => {
    if (activeTab === 'received') {
      return enquiry.listings?.title || 'Listing'
    }
    return enquiry.listings?.title || 'Listing'
  }

  const getContactName = (enquiry) => {
    if (activeTab === 'received') {
      return enquiry.profiles?.full_name || enquiry.profiles?.company_name || 'Anonymous'
    }
    return enquiry.listings?.profiles?.full_name || enquiry.listings?.profiles?.company_name || 'Seller'
  }

  return (
    <div className="enquiries">
      <div className="enquiries__sidebar">
        <div className="enquiries__sidebar-header">
          <h2 className="enquiries__sidebar-title">Enquiries</h2>
          <div className="enquiries__tabs">
            <button
              className={`enquiries__tab ${activeTab === 'received' ? 'enquiries__tab--active' : ''}`}
              onClick={() => setActiveTab('received')}
            >
              Received
            </button>
            <button
              className={`enquiries__tab ${activeTab === 'sent' ? 'enquiries__tab--active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              Sent
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>
        ) : error ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#c00' }}>{error}</div>
        ) : enquiries.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ marginBottom: '12px', opacity: 0.7 }}>
              {activeTab === 'received'
                ? 'No enquiries received yet'
                : 'No enquiries sent yet'}
            </p>
            <button
              onClick={() => navigate('/browse')}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2c7a7b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Browse Listings
            </button>
          </div>
        ) : (
          <div className="enquiries__list">
            {enquiries.map(enquiry => (
              <button
                key={enquiry.id}
                className={`enquiry-item ${selectedEnquiry?.id === enquiry.id ? 'enquiry-item--active' : ''}`}
                onClick={() => handleEnquiryClick(enquiry)}
              >
                <div className="enquiry-item__avatar">
                  {getContactName(enquiry).charAt(0).toUpperCase()}
                </div>
                <div className="enquiry-item__content">
                  <div className="enquiry-item__header">
                    <span className="enquiry-item__name">{getContactName(enquiry)}</span>
                    <span className="enquiry-item__time">{formatDate(enquiry.created_at)}</span>
                  </div>
                  <p className="enquiry-item__listing">{getListingTitle(enquiry)}</p>
                  <p className="enquiry-item__preview">{enquiry.message}</p>
                </div>
                {enquiry.status === 'new' && activeTab === 'received' && (
                  <span className="enquiry-item__badge" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="enquiries__main">
        {selectedEnquiry ? (
          <>
            <div className="enquiries__header">
              <div>
                <h3 className="enquiries__header-title">{getContactName(selectedEnquiry)}</h3>
                <p className="enquiries__header-subtitle">
                  Re: {getListingTitle(selectedEnquiry)}
                </p>
              </div>
              {activeTab === 'received' && (
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => handleStatusUpdate(selectedEnquiry.id, e.target.value)}
                  className="enquiries__status-select"
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: getStatusColor(selectedEnquiry.status),
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
              )}
            </div>

            <div className="enquiries__detail">
              <div className="enquiries__detail-section">
                <h4 className="enquiries__detail-label">Message</h4>
                <p className="enquiries__detail-text">{selectedEnquiry.message}</p>
              </div>

              <div className="enquiries__detail-section">
                <h4 className="enquiries__detail-label">Listing Details</h4>
                <p className="enquiries__detail-text">
                  <strong>{selectedEnquiry.listings?.title}</strong>
                </p>
                {selectedEnquiry.listings?.price && (
                  <p className="enquiries__detail-text">
                    Price: {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0
                    }).format(selectedEnquiry.listings.price)}
                  </p>
                )}
                {selectedEnquiry.listings?.location && (
                  <p className="enquiries__detail-text">
                    Location: {selectedEnquiry.listings.location}
                  </p>
                )}
                <button
                  onClick={() => navigate(`/listing/${selectedEnquiry.listing_id}`)}
                  style={{
                    marginTop: '12px',
                    padding: '8px 16px',
                    backgroundColor: '#2c7a7b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  View Listing
                </button>
              </div>

              <div className="enquiries__detail-section">
                <h4 className="enquiries__detail-label">Contact Information</h4>
                {activeTab === 'received' ? (
                  <>
                    <p className="enquiries__detail-text">
                      <strong>From:</strong> {selectedEnquiry.profiles?.full_name || 'N/A'}
                    </p>
                    {selectedEnquiry.profiles?.company_name && (
                      <p className="enquiries__detail-text">
                        <strong>Company:</strong> {selectedEnquiry.profiles.company_name}
                      </p>
                    )}
                    {selectedEnquiry.enquirer_email && (
                      <p className="enquiries__detail-text">
                        <strong>Email:</strong>{' '}
                        <a href={`mailto:${selectedEnquiry.enquirer_email}`} style={{ color: '#2c7a7b' }}>
                          {selectedEnquiry.enquirer_email}
                        </a>
                      </p>
                    )}
                    {selectedEnquiry.enquirer_phone && (
                      <p className="enquiries__detail-text">
                        <strong>Phone:</strong>{' '}
                        <a href={`tel:${selectedEnquiry.enquirer_phone}`} style={{ color: '#2c7a7b' }}>
                          {selectedEnquiry.enquirer_phone}
                        </a>
                      </p>
                    )}
                    {selectedEnquiry.profiles?.phone && !selectedEnquiry.enquirer_phone && (
                      <p className="enquiries__detail-text">
                        <strong>Phone:</strong>{' '}
                        <a href={`tel:${selectedEnquiry.profiles.phone}`} style={{ color: '#2c7a7b' }}>
                          {selectedEnquiry.profiles.phone}
                        </a>
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <p className="enquiries__detail-text">
                      <strong>To:</strong> {selectedEnquiry.listings?.profiles?.full_name || 'Seller'}
                    </p>
                    {selectedEnquiry.listings?.profiles?.company_name && (
                      <p className="enquiries__detail-text">
                        <strong>Company:</strong> {selectedEnquiry.listings.profiles.company_name}
                      </p>
                    )}
                    {selectedEnquiry.listings?.profiles?.phone && (
                      <p className="enquiries__detail-text">
                        <strong>Phone:</strong>{' '}
                        <a href={`tel:${selectedEnquiry.listings.profiles.phone}`} style={{ color: '#2c7a7b' }}>
                          {selectedEnquiry.listings.profiles.phone}
                        </a>
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="enquiries__detail-section">
                <p className="enquiries__detail-meta">
                  Sent on {new Date(selectedEnquiry.created_at).toLocaleString()}
                </p>
                {activeTab === 'sent' && (
                  <p className="enquiries__detail-meta">
                    Status:{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: getStatusColor(selectedEnquiry.status),
                        color: 'white'
                      }}
                    >
                      {selectedEnquiry.status}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="enquiries__empty">
            <p>Select an enquiry to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Enquiries
