import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getListing, updateListing, getListingTypes } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import './Post.css'

function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listingTypes, setListingTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    listing_type_id: '',
    title: '',
    description: '',
    price: '',
    location: '',
    condition: 'used',
    job_type: '',
    rental_period: '',
    urgency: ''
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [listing, types] = await Promise.all([
        getListing(id),
        getListingTypes()
      ])

      // Check if user owns this listing
      if (listing.user_id !== user.id) {
        setError('You do not have permission to edit this listing')
        return
      }

      setListingTypes(types)
      setFormData({
        listing_type_id: listing.listing_type_id || '',
        title: listing.title || '',
        description: listing.description || '',
        price: listing.price || '',
        location: listing.location || '',
        condition: listing.condition || 'used',
        job_type: listing.job_type || '',
        rental_period: listing.rental_period || '',
        urgency: listing.urgency || ''
      })
    } catch (err) {
      console.error('Error loading listing:', err)
      setError('Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const updates = {
        listing_type_id: parseInt(formData.listing_type_id),
        title: formData.title,
        description: formData.description,
        price: formData.price ? parseFloat(formData.price) : null,
        location: formData.location || null,
        condition: formData.condition || null
      }

      // Add type-specific fields
      const selectedType = listingTypes.find(t => t.id === parseInt(formData.listing_type_id))

      if (selectedType?.code === 'job') {
        updates.job_type = formData.job_type || null
      } else if (selectedType?.code === 'rental') {
        updates.rental_period = formData.rental_period || null
      } else if (selectedType?.code === 'repair') {
        updates.urgency = formData.urgency || null
      }

      await updateListing(id, updates)
      alert('Listing updated successfully!')
      navigate('/dashboard')
    } catch (err) {
      console.error('Error updating listing:', err)
      setError(err.message || 'Failed to update listing')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return (
      <div className="post">
        <div className="post__container" style={{ textAlign: 'center', padding: '40px' }}>
          Loading...
        </div>
      </div>
    )
  }

  if (error && !formData.title) {
    return (
      <div className="post">
        <div className="post__container">
          <div className="post__error" style={{
            backgroundColor: '#fee',
            color: '#c00',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
          <button onClick={() => navigate('/dashboard')} style={{
            padding: '12px 24px',
            backgroundColor: '#2c7a7b',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const selectedType = listingTypes.find(t => t.id === parseInt(formData.listing_type_id))
  const showPrice = selectedType?.code !== 'job' && selectedType?.code !== 'repair'

  return (
    <div className="post">
      <div className="post__container">
        <h1 className="post__title">Edit Listing</h1>

        {error && (
          <div className="post__error" style={{
            backgroundColor: '#fee',
            color: '#c00',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="post__form">
          <div className="post__field">
            <label htmlFor="listing_type_id" className="post__label">Type *</label>
            <select
              id="listing_type_id"
              name="listing_type_id"
              value={formData.listing_type_id}
              onChange={handleChange}
              className="post__select"
              required
            >
              {listingTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div className="post__field">
            <label htmlFor="title" className="post__label">Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
              className="post__input"
              placeholder="e.g. CNC Milling Machine"
              maxLength="255"
              required
            />
          </div>

          <div className="post__field">
            <label htmlFor="description" className="post__label">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="post__textarea"
              placeholder="Describe your listing in detail..."
              rows="5"
              required
            />
          </div>

          {showPrice && (
            <div className="post__field">
              <label htmlFor="price" className="post__label">
                Price (INR) {selectedType?.code === 'rental' && '- per period'}
              </label>
              <input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                className="post__input"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          )}

          <div className="post__field">
            <label htmlFor="location" className="post__label">Location</label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
              className="post__input"
              placeholder="City, State"
            />
          </div>

          {/* Machinery/Tools/Accessories - show condition */}
          {(selectedType?.code === 'machinery' || selectedType?.code === 'tools' || selectedType?.code === 'accessories') && (
            <div className="post__field">
              <label htmlFor="condition" className="post__label">Condition</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="post__select"
              >
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
              </select>
            </div>
          )}

          {/* Job-specific fields */}
          {selectedType?.code === 'job' && (
            <div className="post__field">
              <label htmlFor="job_type" className="post__label">Job Type</label>
              <select
                id="job_type"
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className="post__select"
              >
                <option value="">Select type</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          )}

          {/* Rental-specific fields */}
          {selectedType?.code === 'rental' && (
            <div className="post__field">
              <label htmlFor="rental_period" className="post__label">Rental Period</label>
              <select
                id="rental_period"
                name="rental_period"
                value={formData.rental_period}
                onChange={handleChange}
                className="post__select"
              >
                <option value="">Select period</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}

          {/* Repair-specific fields */}
          {selectedType?.code === 'repair' && (
            <div className="post__field">
              <label htmlFor="urgency" className="post__label">Urgency</label>
              <select
                id="urgency"
                name="urgency"
                value={formData.urgency}
                onChange={handleChange}
                className="post__select"
              >
                <option value="">Select urgency</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          )}

          <div className="post__actions">
            <button
              type="button"
              className="post__cancel"
              onClick={() => navigate('/dashboard')}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="post__submit"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Update Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditListing
