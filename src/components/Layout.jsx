import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import './Layout.css'

function Layout() {
  return (
    <div className="layout">
      <TopBar />
      <main className="layout__content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}

export default Layout
