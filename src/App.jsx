import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Browse from './pages/Browse'
import Post from './pages/Post'
import EditListing from './pages/EditListing'
import Dashboard from './pages/Dashboard'
import Enquiries from './pages/Enquiries'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import ListingDetail from './pages/ListingDetail'
import './App.css'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/" element={<Navigate to="/browse" />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/post" element={<Post />} />
            <Route path="/post/edit/:id" element={<EditListing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/enquiries/:id" element={<Enquiries />} />
            <Route path="/messages" element={<Navigate to="/enquiries" />} />
            <Route path="/messages/:id" element={<Navigate to="/enquiries" />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

export default App
