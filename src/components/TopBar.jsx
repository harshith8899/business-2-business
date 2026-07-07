import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchOverlay from './SearchOverlay'
import './TopBar.css'

function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <header className="topbar">
        <button className="topbar__logo" onClick={() => navigate('/browse')}>
          <span className="topbar__logo-text">B2B Market</span>
        </button>

        <button
          className="topbar__search-btn"
          onClick={() => setSearchOpen(true)}
          aria-label="Open search"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </header>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

export default TopBar
