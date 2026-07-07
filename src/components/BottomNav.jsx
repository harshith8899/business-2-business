import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './BottomNav.css'

function BottomNav() {
  const { user } = useAuth()

  return (
    <nav className="bottomnav">
      <NavLink to="/browse" className="bottomnav__item">
        <svg className="bottomnav__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        <span className="bottomnav__label">Browse</span>
      </NavLink>

      <NavLink to="/post" className="bottomnav__item">
        <svg className="bottomnav__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="bottomnav__label">Post</span>
      </NavLink>

      <NavLink to="/dashboard" className="bottomnav__item">
        <svg className="bottomnav__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        <span className="bottomnav__label">Dashboard</span>
      </NavLink>

      <NavLink to="/enquiries" className="bottomnav__item">
        <svg className="bottomnav__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="bottomnav__label">Enquiries</span>
      </NavLink>

      <NavLink to="/profile" className="bottomnav__item">
        <svg className="bottomnav__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span className="bottomnav__label">Profile</span>
      </NavLink>
    </nav>
  )
}

export default BottomNav
