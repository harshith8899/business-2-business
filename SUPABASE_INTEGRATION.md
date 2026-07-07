# Supabase Integration Setup Guide

## ✅ What's Done

1. ✅ Installed `@supabase/supabase-js`
2. ✅ Created Supabase client configuration (`src/lib/supabase.js`)
3. ✅ Updated `AuthContext` to use Supabase Auth
4. ✅ Created API utilities for listings and enquiries (`src/lib/api.js`)

---

## 🚀 Setup Steps

### 1. Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` key under "Project API keys")

### 2. Create Environment File

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Then edit `.env` and add your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important**: Never commit `.env` to git (it's already in `.gitignore`)

### 3. Restart Dev Server

After adding environment variables, restart the dev server:

```bash
npm run dev
```

---

## 📝 What Changed

### AuthContext (`src/context/AuthContext.jsx`)

The authentication now uses Supabase Auth instead of mock localStorage:

**New features:**
- `user` - Supabase auth user object
- `profile` - User profile from `profiles` table
- `login(email, password)` - Sign in with Supabase
- `register(email, password, fullName)` - Sign up with Supabase
- `logout()` - Sign out
- `updateProfile(updates)` - Update user profile
- `isAdmin` - Boolean flag from profile

**Breaking changes:**
- `user.id` is now a UUID (was string '1')
- `user.email` is still available
- `user.name` is now `profile.full_name`
- `user.role` is now `profile.is_admin` (boolean)

### API Utilities (`src/lib/api.js`)

New functions for data operations:

**Listings:**
- `getListings({ type, location, minPrice, maxPrice, search, limit, offset })`
- `getListing(id)` - Get single listing + auto-increment views
- `getMyListings(userId)` - Get user's own listings
- `createListing(data)`
- `updateListing(id, updates)`
- `deleteListing(id)`

**Listing Types:**
- `getListingTypes()` - Get all categories

**Enquiries:**
- `createEnquiry(data)`
- `getMyEnquiries(userId)` - Enquiries I sent
- `getReceivedEnquiries(userId)` - Enquiries I received on my listings
- `getListingEnquiries(listingId)` - All enquiries for a listing
- `updateEnquiryStatus(enquiryId, status)`

**Dashboard:**
- `getDashboardStats(userId)` - Get counts for dashboard

---

## 🔧 Update Your Components

You'll need to update your page components to use the new API. Here's a quick guide:

### Login Page (`src/pages/Login.jsx`)

```jsx
import { useAuth } from '../context/AuthContext'

// In your component:
const { login } = useAuth()

const handleLogin = async (e) => {
  e.preventDefault()
  try {
    await login(email, password)
    // Redirect to dashboard
  } catch (error) {
    alert(error.message)
  }
}
```

### Register Page (`src/pages/Register.jsx`)

```jsx
import { useAuth } from '../context/AuthContext'

// In your component:
const { register } = useAuth()

const handleRegister = async (e) => {
  e.preventDefault()
  try {
    await register(email, password, fullName)
    alert('Registration successful! You can now login.')
    // Redirect to login
  } catch (error) {
    alert(error.message)
  }
}
```

### Browse Page (`src/pages/Browse.jsx`)

```jsx
import { useState, useEffect } from 'react'
import { getListings, getListingTypes } from '../lib/api'

function Browse() {
  const [listings, setListings] = useState([])
  const [listingTypes, setListingTypes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [listingsData, typesData] = await Promise.all([
        getListings(),
        getListingTypes()
      ])
      setListings(listingsData.data)
      setListingTypes(typesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // ... rest of component
}
```

### Listing Detail Page (`src/pages/ListingDetail.jsx`)

```jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getListing, createEnquiry } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadListing()
  }, [id])

  const loadListing = async () => {
    try {
      const data = await getListing(id)
      setListing(data)
    } catch (error) {
      console.error('Error loading listing:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnquiry = async (message) => {
    try {
      await createEnquiry({
        listing_id: id,
        enquirer_id: user.id,
        message,
        enquirer_phone: user.phone || '',
        enquirer_email: user.email
      })
      alert('Enquiry sent successfully!')
    } catch (error) {
      console.error('Error sending enquiry:', error)
      alert('Failed to send enquiry')
    }
  }

  // ... rest of component
}
```

### Post Listing Page (`src/pages/Post.jsx`)

```jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createListing, getListingTypes } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function Post() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listingTypes, setListingTypes] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    listing_type_id: '',
    condition: 'used',
    // ... other fields
  })

  useEffect(() => {
    loadListingTypes()
  }, [])

  const loadListingTypes = async () => {
    try {
      const data = await getListingTypes()
      setListingTypes(data)
    } catch (error) {
      console.error('Error loading listing types:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createListing({
        ...formData,
        user_id: user.id,
        price: formData.price ? parseFloat(formData.price) : null
      })
      alert('Listing created successfully!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error creating listing:', error)
      alert('Failed to create listing')
    }
  }

  // ... rest of component
}
```

### Dashboard Page (`src/pages/Dashboard.jsx`)

```jsx
import { useState, useEffect } from 'react'
import { getMyListings, getDashboardStats } from '../lib/api'
import { useAuth } from '../context/AuthContext'

function Dashboard() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [stats, setStats] = useState({
    activeListings: 0,
    enquiriesSent: 0,
    enquiriesReceived: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [listingsData, statsData] = await Promise.all([
        getMyListings(user.id),
        getDashboardStats(user.id)
      ])
      setListings(listingsData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  // ... rest of component
}
```

### Profile Page (`src/pages/Profile.jsx`)

```jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { user, profile, updateProfile } = useAuth()
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    company_name: profile?.company_name || '',
    location: profile?.location || '',
    bio: profile?.bio || ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    }
  }

  // ... rest of component
}
```

---

## 🔒 Authentication Flow

### Email Verification

By default, Supabase requires email verification. To disable it for development:

1. Go to **Authentication** → **Settings** in Supabase dashboard
2. Scroll to **Email Auth**
3. Toggle off "Enable email confirmations"

Or keep it enabled and handle the email confirmation flow in your app.

### Protected Routes

Add route protection in your `App.jsx`:

```jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

// Then wrap protected routes:
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## 🧪 Testing

### Test User Creation

1. Register a new user through your app
2. Check Supabase Dashboard → **Authentication** → **Users**
3. Check **Table Editor** → **profiles** to see the auto-created profile

### Test Listing Creation

1. Login with test user
2. Create a new listing
3. Check **Table Editor** → **listings**
4. Verify the listing appears in Browse page

### Test Enquiry

1. Create an enquiry on a listing
2. Check **Table Editor** → **enquiries**
3. Verify listing owner can see enquiry in dashboard

---

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

- Make sure `.env` file exists in project root
- Variable names must start with `VITE_` for Vite to expose them
- Restart dev server after adding environment variables

### "Invalid API key"

- Double-check you copied the **anon/public** key, not the service role key
- Verify no extra spaces in `.env` file

### "Row Level Security policy violation"

- Check that RLS policies are properly set up (see `supabase.md`)
- For testing, you can temporarily disable RLS on a table (not recommended for production)

### "User not found in profiles table"

- Make sure the trigger `on_auth_user_created` is properly set up (see `supabase.md`)
- Manually insert a profile for existing auth users if needed

---

## 📚 Next Steps

1. ✅ Setup environment variables
2. ✅ Test login/register
3. ⬜ Update Browse page to use `getListings()`
4. ⬜ Update Post page to use `createListing()`
5. ⬜ Update Dashboard to use `getMyListings()` and `getDashboardStats()`
6. ⬜ Update Listing Detail to use `getListing()` and `createEnquiry()`
7. ⬜ Update Profile page to use `updateProfile()`
8. ⬜ Add loading states and error handling
9. ⬜ Add the missing indexes and policies from `supabase-enhancements.md`
10. ⬜ (Optional) Add image upload with Supabase Storage

---

## 📖 Supabase Resources

- [Supabase Docs](https://supabase.com/docs)
- [Auth Helpers](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [JavaScript Client Reference](https://supabase.com/docs/reference/javascript/introduction)
