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
  const [activeMode, setActiveMode] = useState(null) // null = all, 'sell', 'buy'
  const [activeSubCategory, setActiveSubCategory] = useState(null) // For sub-category filter
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadListingTypes()
  }, [])

  useEffect(() => {
    loadListings()
  }, [activeTypeId, activeMode, activeSubCategory])

  // Reset sub-category filter when category changes
  useEffect(() => {
    setActiveSubCategory(null)
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
        listingMode: activeMode,
        limit: 50,
        excludeUserId: user?.id
      })

      // Apply client-side sub-category filtering
      let filteredData = data || []
      if (activeSubCategory && activeTypeId) {
        const selectedType = listingTypes.find(t => t.id === activeTypeId)
        const typeCode = selectedType?.code?.toLowerCase()

        filteredData = filteredData.filter(listing => {
          if (typeCode === 'machinery' || typeCode === 'accessories') {
            return listing.condition === activeSubCategory
          } else if (typeCode === 'repair') {
            return listing.urgency === activeSubCategory
          } else if (typeCode === 'job') {
            return listing.job_type === activeSubCategory
          } else if (typeCode === 'rental') {
            return listing.rental_period === activeSubCategory
          }
          return true
        })
      }

      setListings(filteredData)
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

  const getSubCategoryBadge = (listing) => {
    const typeCode = listing.listing_types?.code?.toLowerCase()

    // Machinery/Accessories - show condition
    if ((typeCode === 'machinery' || typeCode === 'accessories') && listing.condition) {
      return { text: listing.condition, type: 'condition' }
    }

    // Repair - show urgency
    if (typeCode === 'repair' && listing.urgency) {
      return { text: listing.urgency, type: 'urgency' }
    }

    // Job - show job type
    if (typeCode === 'job' && listing.job_type) {
      return { text: listing.job_type, type: 'job-type' }
    }

    // Rental - show rental period
    if (typeCode === 'rental' && listing.rental_period) {
      return { text: listing.rental_period, type: 'rental-period' }
    }

    return null
  }

  const getSubCategoryOptions = () => {
    if (!activeTypeId) return null

    const selectedType = listingTypes.find(t => t.id === activeTypeId)
    const typeCode = selectedType?.code?.toLowerCase()

    if (typeCode === 'machinery' || typeCode === 'accessories') {
      return {
        label: 'Condition',
        options: ['new', 'used', 'refurbished']
      }
    } else if (typeCode === 'repair') {
      return {
        label: 'Urgency',
        options: ['low', 'medium', 'high', 'urgent']
      }
    } else if (typeCode === 'job') {
      return {
        label: 'Job Type',
        options: ['full-time', 'part-time', 'contract', 'temporary']
      }
    } else if (typeCode === 'rental') {
      return {
        label: 'Rental Period',
        options: ['hourly', 'daily', 'weekly', 'monthly', 'yearly']
      }
    }

    return null
  }

  return (
    <div className="browse">
      <div className="browse__header">
        {/* Listing Mode Filter */}
        <div className="browse__mode-filter">
          <button
            className={`browse__mode ${activeMode === null ? 'browse__mode--active' : ''}`}
            onClick={() => setActiveMode(null)}
          >
            All Listings
          </button>
          <button
            className={`browse__mode ${activeMode === 'sell' ? 'browse__mode--active' : ''}`}
            onClick={() => setActiveMode('sell')}
          >
            💰 For Sale
          </button>
          <button
            className={`browse__mode ${activeMode === 'buy' ? 'browse__mode--active' : ''}`}
            onClick={() => setActiveMode('buy')}
          >
            🔍 Wanted
          </button>
        </div>

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

        {/* Sub-category Filter - Dynamic based on selected category */}
        {getSubCategoryOptions() && (
          <div className="browse__subcategories">
            <span className="browse__subcategory-label">
              {getSubCategoryOptions().label}:
            </span>
            <button
              className={`browse__subcategory ${activeSubCategory === null ? 'browse__subcategory--active' : ''}`}
              onClick={() => setActiveSubCategory(null)}
            >
              All
            </button>
            {getSubCategoryOptions().options.map(option => (
              <button
                key={option}
                className={`browse__subcategory ${activeSubCategory === option ? 'browse__subcategory--active' : ''}`}
                onClick={() => setActiveSubCategory(option)}
              >
                {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        )}
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
            {listings.map(listing => {
              const subCategoryBadge = getSubCategoryBadge(listing)
              return (
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
                    <span className={`listing-card__mode-badge listing-card__mode-badge--${listing.listing_mode}`}>
                      {listing.listing_mode === 'sell' ? '💰 Selling' : '🔍 Buying'}
                    </span>
                    {subCategoryBadge && (
                      <span className={`listing-card__sub-badge listing-card__sub-badge--${subCategoryBadge.type}`}>
                        {subCategoryBadge.text}
                      </span>
                    )}
                  </div>
                  <div className="listing-card__content">
                    <h3 className="listing-card__title">{listing.title}</h3>
                    <p className="listing-card__location">{listing.location || 'Location not specified'}</p>
                    <p className="listing-card__price">{formatPrice(listing.price)}</p>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Browse
