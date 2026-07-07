import { useState } from 'react'
import './Admin.css'

const MOCK_USERS = [
  { id: '1', name: 'John Doe', email: 'john@test.com', role: 'user', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@test.com', role: 'user', status: 'active' },
  { id: '3', name: 'Bob Wilson', email: 'bob@test.com', role: 'user', status: 'blocked' }
]

const MOCK_PENDING_LISTINGS = [
  { id: '1', title: 'Industrial Robot Arm', user: 'John Doe', type: 'Machinery', status: 'pending' },
  { id: '2', title: 'Warehouse Space Rental', user: 'Jane Smith', type: 'Rentals', status: 'pending' }
]

function Admin() {
  const [activeTab, setActiveTab] = useState('users')

  return (
    <div className="admin">
      <div className="admin__container">
        <h1 className="admin__title">Admin Panel</h1>

        <div className="admin__tabs">
          <button
            className={`admin__tab ${activeTab === 'users' ? 'admin__tab--active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`admin__tab ${activeTab === 'listings' ? 'admin__tab--active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            Listings
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="admin__section">
            <h2 className="admin__section-title">User Management</h2>
            <div className="admin__list">
              {MOCK_USERS.map(user => (
                <div key={user.id} className="admin-item">
                  <div className="admin-item__main">
                    <div>
                      <h3 className="admin-item__title">{user.name}</h3>
                      <p className="admin-item__subtitle">{user.email}</p>
                    </div>
                    <span className={`admin-item__badge admin-item__badge--${user.status}`}>
                      {user.status}
                    </span>
                  </div>
                  <div className="admin-item__actions">
                    {user.status === 'active' ? (
                      <button className="admin-item__action admin-item__action--danger">
                        Block
                      </button>
                    ) : (
                      <button className="admin-item__action">
                        Unblock
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="admin__section">
            <h2 className="admin__section-title">Pending Listings</h2>
            <div className="admin__list">
              {MOCK_PENDING_LISTINGS.map(listing => (
                <div key={listing.id} className="admin-item">
                  <div className="admin-item__main">
                    <div>
                      <h3 className="admin-item__title">{listing.title}</h3>
                      <p className="admin-item__subtitle">
                        {listing.type} • Posted by {listing.user}
                      </p>
                    </div>
                    <span className="admin-item__badge admin-item__badge--pending">
                      {listing.status}
                    </span>
                  </div>
                  <div className="admin-item__actions">
                    <button className="admin-item__action">
                      Approve
                    </button>
                    <button className="admin-item__action admin-item__action--danger">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Admin
