import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getListings, getListingTypes } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import './Browse.css'

function Browse() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [listingTypes, setListingTypes] = useState([])
  const [activeTypeId, setActiveTypeId] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadListingTypes()
  }, [])

  useEffect(() => {
    loadListings()
  }, [activeTypeId])

  const loadListingTypes = async () => {
    try {
      const types = await getListingTypes()
      setListingTypes(types)
    } catch (err) {
      console.error('Error loading listing types:', err)
      setError('Failed to load categories')
    }
  }

  const loadListings = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await getListings({
        type: activeTypeId,
        limit: 50,
        excludeUserId: user?.id // Exclude current user's listings
      })
      setListings(data || [])
    } catch (err) {
      console.error('Error loading listings:', err)
      setError('Failed to load listings')
    } finally {
      setLoading(false)
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

  return (
    <div className="browse">
      <div className="browse__header">
        <div className="browse__categories">
          <button
            className={`browse__category ${activeTypeId === null ? 'browse__category--active' : ''}`}
            onClick={() => setActiveTypeId(null)}
          >
            All
          </button>
          {listingTypes.map(type => (
            <button
              key={type.id}
              className={`browse__category ${activeTypeId === type.id ? 'browse__category--active' : ''}`}
              onClick={() => setActiveTypeId(type.id)}
            >
              {type.name}
            </button>
          ))}
        </div>
      </div>

      <div className="browse__content">
        {error && (
          <div className="browse__error">
            <p>{error}</p>
            <button onClick={loadListings}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="browse__loading">
            <p>Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="browse__empty">
            <p>No listings found</p>
            <button onClick={() => navigate('/post')}>Post First Listing</button>
          </div>
        ) : (
          <div className="browse__grid">
            {listings.map(listing => (
              <article
                key={listing.id}
                className="listing-card"
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                <div className="listing-card__image">
                  <div style={{
                    backgroundColor: '#e2e8f0',
                    height: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px'
                  }}>
                    📦
                  </div>
                  <span className="listing-card__badge">
                    {listing.listing_types?.name || 'Item'}
                  </span>
                </div>
                <div className="listing-card__content">
                  <h3 className="listing-card__title">{listing.title}</h3>
                  <p className="listing-card__location">{listing.location || 'Location not specified'}</p>
                  <p className="listing-card__price">{formatPrice(listing.price)}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Browse
