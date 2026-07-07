# B2B Marketplace

A mobile-first B2B marketplace web application where users can buy and sell machinery, rentals, post jobs, and offer services.

## Features

### User Features
- **User Registration & Login** - Simple email/password authentication
- **Browse Marketplace** - Browse listings with category filters (Machinery, Rentals, Jobs, Services)
- **Search & Filtering** - Search with filters for type, location, and price range
- **Post Listings** - Create listings for machinery, rentals, jobs, and services
- **User Dashboard** - View active listings, inquiries, and quick stats
- **Messages** - Send and receive messages between buyers and sellers
- **Profile Management** - Manage user profile and settings

### Admin Features
- **User Management** - View, approve, and block users
- **Listing Moderation** - Approve or reject pending listings
- **Simple Admin Interface** - List-based management (mobile-friendly)

## Design

### UI/UX Approach
- **Mobile-First** - Designed for mobile with responsive desktop enhancements
- **Bottom Navigation** - 5-icon bottom navigation bar on mobile that transforms to sidebar on desktop
- **Professional Minimalism** - Clean, data-first interface with generous whitespace
- **No Fancy Animations** - Fast, efficient, and accessible

### Color Palette (Slate & Teal)
- Primary: `#2d3748` (Slate)
- Accent: `#2c7a7b` (Muted Teal)
- Text: `#1a202c` (Near-black)
- Background: `#ffffff` (White)
- Surface: `#f7fafc` (Off-white)
- Border: `#e2e8f0` (Light gray)

### Typography
- System fonts for performance and native feel
- Monospace font for prices and numbers (professional precision)
- Clear hierarchy with consistent sizing

## Tech Stack

- **React 18** - UI framework
- **React Router 6** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS Variables** - Consistent theming
- **Mobile-First CSS** - Responsive breakpoints at 768px and 1024px

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd practice
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open browser at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploying to GitHub Pages

#### Method 1: Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages when you push to the `main` branch.

**Setup Steps:**

1. Go to your GitHub repository settings
2. Navigate to **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Push your code to the `main` branch
5. The workflow will automatically build and deploy your app
6. Your app will be available at: `https://<username>.github.io/practice/`

#### Method 2: Manual Deployment

```bash
npm run deploy
```

This will build the app and deploy it to the `gh-pages` branch.

**Important:** Make sure to update the `base` property in `vite.config.js` to match your repository name:

```javascript
base: '/b2b/',  // Change this if your repo name is different
```

### Demo Accounts

**Regular User:**
- Email: `user@test.com`
- Password: any password

**Admin User:**
- Email: `admin@marketplace.com`
- Password: any password

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx           # Main layout with TopBar and BottomNav
│   ├── TopBar.jsx           # Top navigation bar
│   ├── BottomNav.jsx        # Bottom navigation (mobile) / Sidebar (desktop)
│   └── SearchOverlay.jsx    # Full-screen search overlay
├── pages/
│   ├── Login.jsx            # Login page
│   ├── Register.jsx         # Registration page
│   ├── Browse.jsx           # Browse marketplace listings
│   ├── ListingDetail.jsx   # Individual listing detail
│   ├── Post.jsx             # Create new listing
│   ├── Dashboard.jsx        # User dashboard
│   ├── Messages.jsx         # Messaging interface
│   ├── Profile.jsx          # User profile and settings
│   └── Admin.jsx            # Admin panel
├── context/
│   └── AuthContext.jsx      # Authentication context and state
├── App.jsx                  # Main app component with routing
├── main.jsx                 # Entry point
└── index.css                # Global styles and CSS variables
```

## Navigation

### Mobile (< 768px)
- **Bottom Navigation Bar** with 5 icons:
  - Browse - Browse marketplace
  - Post - Create new listing
  - Dashboard - User dashboard
  - Messages - View messages
  - Profile - User profile

### Desktop (≥ 768px)
- **Left Sidebar Navigation** (240px width)
- Bottom navigation transforms into vertical sidebar
- Content area adjusts with left margin

## Responsive Design

The application follows a mobile-first approach with three breakpoints:

- **Mobile**: < 768px (default styles)
- **Tablet**: ≥ 768px (2-column grids, sidebar navigation)
- **Desktop**: ≥ 1024px (3-column grids, expanded layouts)

## Key Features Implementation

### Search & Filtering
- Full-screen search overlay activated from top bar
- 3 essential filters: Type, Location, Price Range
- "More filters" expandable section for advanced options
- Applied filters shown as dismissible chips

### Listings
- Card-based grid layout
- Image, title, price, location, type badge
- Tap/click to view full details
- Infinite scroll ready (mock data currently)

### Dashboard
- Metric cards (active listings, inquiries, messages, views)
- Recent listings with status indicators
- Quick action buttons
- Unified buyer/seller view (no role switching needed)

### Messages
- Conversation list with unread indicators
- Real-time message thread
- Simple composer with send button
- Split-view on desktop, stacked on mobile

### Admin Panel
- Tabbed interface (Users, Listings)
- User management (approve, block)
- Listing moderation (approve, reject)
- Status badges for quick scanning

## Authentication

Currently uses **mock authentication** for demo purposes. In production:
- Replace with real API calls
- Implement proper JWT/session management
- Add password hashing
- Implement email verification
- Add OAuth options (Google, LinkedIn, etc.)

## Future Enhancements

- Real backend API integration
- Image upload functionality
- Real-time notifications
- Payment gateway integration
- Advanced search with Elasticsearch
- Analytics dashboard
- Email notifications
- Mobile app (React Native)
- PWA support

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

