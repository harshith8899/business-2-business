import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getListing, createEnquiry } from '../lib/api'
import './ListingDetail.css'

function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  console.log(user)
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showEnquiryForm, setShowEnquiryForm] = useState(false)
  const [enquiryMessage, setEnquiryMessage] = useState('')
  const [sendingEnquiry, setSendingEnquiry] = useState(false)

  useEffect(() => {
    loadListing()
  }, [id])

  const loadListing = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getListing(id)
      setListing(data)
    } catch (err) {
      console.error('Error loading listing:', err)
      setError('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const handleSendEnquiry = async (e) => {
    e.preventDefault()
    setSendingEnquiry(true)

    try {
      console.log("Current user:", user);
      console.log("Listing ID:", id);
      console.log("Enquirer ID:", user.id);
      await createEnquiry({
        listing_id: id,
        enquirer_id: user.id,
        message: enquiryMessage,
        enquirer_phone: user.phone || '',
        enquirer_email: user.email
      })
      alert('Enquiry sent successfully! The listing owner will contact you.')
      setShowEnquiryForm(false)
      setEnquiryMessage('')
    } catch (err) {
      console.error('Error sending enquiry:', err)
      alert('Failed to send enquiry. Please try again.')
    } finally {
      setSendingEnquiry(false)
    }
  }

  const formatPrice = (price) => {
    if (!price) return 'Contact for price'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="listing-detail" style={{ padding: '40px', textAlign: 'center' }}>
        Loading...
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="listing-detail" style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#c00', marginBottom: '16px' }}>{error || 'Listing not found'}</p>
        <button onClick={() => navigate('/browse')}>Back to Browse</button>
      </div>
    )
  }

  const isOwner = user?.id === listing.user_id

  return (
    <div className="listing-detail">
      <button className="listing-detail__back" onClick={() => navigate(-1)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back
      </button>

      <div className="listing-detail__image">
        <div style={{
          backgroundColor: '#e2e8f0',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '120px'
        }}>
          📦
        </div>
      </div>

      <div className="listing-detail__content">
        <div className="listing-detail__header">
          <div>
            <span className="listing-detail__badge">{listing.listing_types?.name || 'Item'}</span>
            <h1 className="listing-detail__title">{listing.title}</h1>
            <p className="listing-detail__location">{listing.location || 'Location not specified'}</p>
          </div>
          <p className="listing-detail__price">{formatPrice(listing.price)}</p>
        </div>

        <div className="listing-detail__section">
          <h2 className="listing-detail__section-title">Description</h2>
          <p className="listing-detail__description">{listing.description}</p>
        </div>

        {(listing.condition || listing.job_type || listing.rental_period || listing.urgency) && (
          <div className="listing-detail__section">
            <h2 className="listing-detail__section-title">Details</h2>
            <dl className="listing-detail__specs">
              {listing.condition && (
                <div className="listing-detail__spec">
                  <dt className="listing-detail__spec-label">Condition</dt>
                  <dd className="listing-detail__spec-value">{listing.condition}</dd>
                </div>
              )}
              {listing.job_type && (
                <div className="listing-detail__spec">
                  <dt className="listing-detail__spec-label">Job Type</dt>
                  <dd className="listing-detail__spec-value">{listing.job_type}</dd>
                </div>
              )}
              {listing.rental_period && (
                <div className="listing-detail__spec">
                  <dt className="listing-detail__spec-label">Rental Period</dt>
                  <dd className="listing-detail__spec-value">{listing.rental_period}</dd>
                </div>
              )}
              {listing.urgency && (
                <div className="listing-detail__spec">
                  <dt className="listing-detail__spec-label">Urgency</dt>
                  <dd className="listing-detail__spec-value">{listing.urgency}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <div className="listing-detail__section">
          <h2 className="listing-detail__section-title">Contact Information</h2>
          <div className="listing-detail__seller">
            <p className="listing-detail__seller-name">{listing.profiles?.full_name || 'Anonymous'}</p>
            {listing.profiles?.company_name && (
              <p className="listing-detail__seller-contact">{listing.profiles.company_name}</p>
            )}
            {listing.profiles?.location && (
              <p className="listing-detail__seller-contact">{listing.profiles.location}</p>
            )}
          </div>
        </div>

        {!isOwner && (
          <>
            {!showEnquiryForm ? (
              <button
                className="listing-detail__cta"
                onClick={() => setShowEnquiryForm(true)}
              >
                Send Enquiry
              </button>
            ) : (
              <form onSubmit={handleSendEnquiry} className="listing-detail__enquiry-form">
                <h3>Send Enquiry</h3>
                <textarea
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  placeholder="Hi, I'm interested in this listing. Please provide more details..."
                  rows="5"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    fontFamily: 'inherit',
                    fontSize: '14px'
                  }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEnquiryForm(false)
                      setEnquiryMessage('')
                    }}
                    disabled={sendingEnquiry}
                    style={{
                      padding: '12px 24px',
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
                    disabled={sendingEnquiry}
                    className="listing-detail__cta"
                    style={{ margin: 0 }}
                  >
                    {sendingEnquiry ? 'Sending...' : 'Send Enquiry'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {isOwner && (
          <div style={{
            padding: '16px',
            backgroundColor: '#f7fafc',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ marginBottom: '12px' }}>This is your listing</p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#2c7a7b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              View in Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListingDetail
