import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './SearchOverlay.css'

const CATEGORIES = ['Machinery', 'Rentals', 'Jobs', 'Services']
const LOCATIONS = ['All Locations', 'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune']

function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    priceMin: '',
    priceMax: ''
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleSearch = (e) => {
    e.preventDefault()
    // In production, navigate with query params
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (filters.type) params.set('type', filters.type)
    if (filters.location) params.set('location', filters.location)
    if (filters.priceMin) params.set('min', filters.priceMin)
    if (filters.priceMax) params.set('max', filters.priceMax)

    navigate(`/browse?${params.toString()}`)
    onClose()
  }

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-overlay__content" onClick={(e) => e.stopPropagation()}>
        <div className="search-overlay__header">
          <h2 className="search-overlay__title">Search Marketplace</h2>
          <button
            className="search-overlay__close"
            onClick={onClose}
            aria-label="Close search"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSearch} className="search-overlay__form">
          <input
            type="text"
            placeholder="Search machinery, rentals, jobs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-overlay__input"
            autoFocus
          />

          <div className="search-overlay__filters">
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="search-overlay__select"
            >
              <option value="">All Types</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="search-overlay__select"
            >
              <option value="">All Locations</option>
              {LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            <div className="search-overlay__price">
              <input
                type="number"
                placeholder="Min price"
                value={filters.priceMin}
                onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                className="search-overlay__price-input"
              />
              <span className="search-overlay__price-sep">—</span>
              <input
                type="number"
                placeholder="Max price"
                value={filters.priceMax}
                onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                className="search-overlay__price-input"
              />
            </div>
          </div>

          <button type="button" className="search-overlay__advanced" onClick={() => setShowAdvanced(!showAdvanced)}>
            {showAdvanced ? 'Hide' : 'More'} filters
          </button>

          {showAdvanced && (
            <div className="search-overlay__advanced-filters">
              <p className="search-overlay__note">Additional filters coming soon...</p>
            </div>
          )}

          <button type="submit" className="search-overlay__submit">
            Search
          </button>
        </form>
      </div>
    </div>
  )
}

export default SearchOverlay
