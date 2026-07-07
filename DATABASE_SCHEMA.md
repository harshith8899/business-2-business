# Database Schema Design

## Overview
This is a B2B marketplace platform for listing and enquiry. Users can post various types of listings (machinery, accessories, tools, rentals, jobs, repair services) and enquire about others' listings. There's no buyer/seller distinction - any user can post and enquire.

---

## Tables

### 1. users
Stores user account information and profiles.

```sql
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email               VARCHAR(255) UNIQUE NOT NULL,
  password_hash       VARCHAR(255) NOT NULL,
  full_name           VARCHAR(255) NOT NULL,
  phone               VARCHAR(50),
  company_name        VARCHAR(255),
  location            TEXT,
  bio                 TEXT,
  is_admin            BOOLEAN DEFAULT FALSE,
  is_active           BOOLEAN DEFAULT TRUE,
  email_verified      BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at       TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
```

**Fields:**
- `id`: Unique identifier
- `email`: Login credential (unique)
- `password_hash`: Hashed password
- `full_name`: User's full name
- `phone`: Contact number (optional)
- `company_name`: Business name (optional)
- `location`: Free-text location
- `bio`: User profile description
- `is_admin`: Admin flag for superuser access
- `is_active`: Account status (for blocking users)
- `email_verified`: Email verification status
- `created_at`: Registration timestamp
- `updated_at`: Last profile update
- `last_login_at`: Last login timestamp

---

### 2. listing_types
Lookup table for listing categories.

```sql
CREATE TABLE listing_types (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR(50) UNIQUE NOT NULL,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE
);

-- Seed data
INSERT INTO listing_types (code, name, description) VALUES
  ('machinery', 'Machinery', 'Industrial machinery and equipment for sale'),
  ('accessories', 'Accessories', 'Machine parts and accessories'),
  ('tools', 'Tools', 'Hand tools and power tools'),
  ('rental', 'Rental', 'Equipment and machinery available for rent'),
  ('job', 'Job Posting', 'Job opportunities and recruitment'),
  ('repair', 'Repair Service', 'Service repair requests and offerings');
```

**Fields:**
- `id`: Primary key
- `code`: Machine-readable identifier
- `name`: Display name
- `description`: Category description
- `is_active`: Enable/disable category

---

### 3. listings
Main table for all marketplace listings.

```sql
CREATE TABLE listings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_type_id INT NOT NULL REFERENCES listing_types(id),
  title           VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  price           DECIMAL(12, 2),
  currency        VARCHAR(10) DEFAULT 'USD',
  location        TEXT,
  condition       VARCHAR(50), -- e.g., 'new', 'used', 'refurbished'
  status          VARCHAR(50) DEFAULT 'active', -- 'active', 'sold', 'expired', 'draft'
  views_count     INT DEFAULT 0,
  enquiries_count INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at      TIMESTAMP,
  
  -- Job-specific fields
  job_type        VARCHAR(50), -- e.g., 'full-time', 'contract', 'freelance'
  
  -- Rental-specific fields
  rental_period   VARCHAR(50), -- e.g., 'daily', 'weekly', 'monthly'
  
  -- Repair-specific fields
  urgency         VARCHAR(50) -- e.g., 'low', 'medium', 'high', 'urgent'
);

CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_type_id ON listings(listing_type_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_location ON listings(location);
CREATE INDEX idx_listings_price ON listings(price);
```

**Fields:**
- `id`: Unique identifier
- `user_id`: Listing owner reference
- `listing_type_id`: Category reference
- `title`: Listing headline (max 255 chars)
- `description`: Full listing details
- `price`: Price amount (nullable for jobs/repairs)
- `currency`: Price currency code
- `location`: Free-text location
- `condition`: Item condition (for machinery/tools)
- `status`: Listing state (active/sold/expired/draft)
- `views_count`: Number of times viewed
- `enquiries_count`: Number of enquiries received
- `created_at`: Creation timestamp
- `updated_at`: Last modification timestamp
- `expires_at`: Optional expiry date
- `job_type`: Job category (only for job listings)
- `rental_period`: Rental billing cycle (only for rentals)
- `urgency`: Priority level (only for repair requests)

---

### 4. enquiries
Stores enquiries from users about listings.

```sql
CREATE TABLE enquiries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  enquirer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message         TEXT NOT NULL,
  enquirer_phone  VARCHAR(50),
  enquirer_email  VARCHAR(255),
  status          VARCHAR(50) DEFAULT 'new', -- 'new', 'read', 'replied', 'closed'
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_enquiries_listing_id ON enquiries(listing_id);
CREATE INDEX idx_enquiries_enquirer_id ON enquiries(enquirer_id);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_created_at ON enquiries(created_at DESC);

-- Composite index for dashboard queries (user's received enquiries)
CREATE INDEX idx_enquiries_listing_user ON enquiries(listing_id, created_at DESC);
```

**Fields:**
- `id`: Unique identifier
- `listing_id`: Reference to listing being enquired about
- `enquirer_id`: User making the enquiry
- `message`: Enquiry text
- `enquirer_phone`: Optional contact phone (can override profile phone)
- `enquirer_email`: Optional contact email (can override profile email)
- `status`: Enquiry state (new/read/replied/closed)
- `created_at`: Enquiry timestamp
- `updated_at`: Last status update

---

### 5. listing_tags (Optional)
For flexible categorization and search filtering.

```sql
CREATE TABLE listing_tags (
  id          SERIAL PRIMARY KEY,
  listing_id  UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  tag         VARCHAR(100) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listing_tags_listing_id ON listing_tags(listing_id);
CREATE INDEX idx_listing_tags_tag ON listing_tags(tag);
CREATE UNIQUE INDEX idx_listing_tags_unique ON listing_tags(listing_id, tag);
```

**Use case:** Add tags like "hydraulic", "CNC", "urgent", "remote", etc. for better search and filtering.

---

### 6. admin_logs (Optional)
Track admin actions for audit trail.

```sql
CREATE TABLE admin_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES users(id),
  action      VARCHAR(100) NOT NULL, -- e.g., 'block_user', 'delete_listing'
  target_type VARCHAR(50), -- e.g., 'user', 'listing', 'enquiry'
  target_id   UUID,
  details     JSONB,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);
```

---

## Relationships

```
users (1) ──── (many) listings
users (1) ──── (many) enquiries (as enquirer)
listings (1) ──── (many) enquiries
listing_types (1) ──── (many) listings
listings (1) ──── (many) listing_tags
users (1) ──── (many) admin_logs (as admin)
```

---

## Key Queries

### 1. Browse Listings (with filters)
```sql
SELECT l.*, u.full_name, u.company_name, lt.name as listing_type_name
FROM listings l
JOIN users u ON l.user_id = u.id
JOIN listing_types lt ON l.listing_type_id = lt.id
WHERE l.status = 'active'
  AND (l.listing_type_id = ? OR ? IS NULL)  -- optional type filter
  AND (l.location ILIKE ? OR ? IS NULL)     -- optional location filter
  AND (l.price BETWEEN ? AND ? OR ? IS NULL) -- optional price range
ORDER BY l.created_at DESC
LIMIT 20 OFFSET ?;
```

### 2. User Dashboard - My Listings
```sql
SELECT l.*, lt.name as listing_type_name,
       COUNT(e.id) as total_enquiries
FROM listings l
JOIN listing_types lt ON l.listing_type_id = lt.id
LEFT JOIN enquiries e ON l.id = e.listing_id
WHERE l.user_id = ?
GROUP BY l.id, lt.name
ORDER BY l.created_at DESC;
```

### 3. User Dashboard - My Enquiries
```sql
SELECT e.*, l.title, l.price, l.location, u.full_name as listing_owner
FROM enquiries e
JOIN listings l ON e.listing_id = l.id
JOIN users u ON l.user_id = u.id
WHERE e.enquirer_id = ?
ORDER BY e.created_at DESC;
```

### 4. Listing Details with Enquiries
```sql
-- Get listing
SELECT l.*, u.full_name, u.phone, u.email, u.company_name, lt.name as listing_type_name
FROM listings l
JOIN users u ON l.user_id = u.id
JOIN listing_types lt ON l.listing_type_id = lt.id
WHERE l.id = ?;

-- Get enquiries (only visible to listing owner)
SELECT e.*, u.full_name, u.phone, u.email
FROM enquiries e
JOIN users u ON e.enquirer_id = u.id
WHERE e.listing_id = ?
ORDER BY e.created_at DESC;
```

### 5. Search Listings
```sql
SELECT l.*, u.full_name, lt.name as listing_type_name,
       ts_rank(to_tsvector('english', l.title || ' ' || l.description), query) as rank
FROM listings l
JOIN users u ON l.user_id = u.id
JOIN listing_types lt ON l.listing_type_id = lt.id,
     plainto_tsquery('english', ?) as query
WHERE l.status = 'active'
  AND to_tsvector('english', l.title || ' ' || l.description) @@ query
ORDER BY rank DESC, l.created_at DESC
LIMIT 20;
```

### 6. Admin - All Users
```sql
SELECT id, email, full_name, company_name, location, is_active, 
       created_at, last_login_at,
       (SELECT COUNT(*) FROM listings WHERE user_id = users.id) as total_listings,
       (SELECT COUNT(*) FROM enquiries WHERE enquirer_id = users.id) as total_enquiries
FROM users
ORDER BY created_at DESC;
```

---

## Notes

1. **No Messaging System**: Enquiries are one-way. Users receive enquiries with contact details and can respond outside the platform (email/phone).

2. **No Image Storage**: Images are parked for now. When needed, add a `listing_images` table with foreign key to listings.

3. **Flexible Listing Types**: The schema supports all listing types (machinery, rentals, jobs, repairs) in one table with type-specific optional fields.

4. **Search**: Uses PostgreSQL full-text search. For production, consider Elasticsearch or Algolia for better performance.

5. **Status Management**: 
   - Listings: active, sold, expired, draft
   - Enquiries: new, read, replied, closed
   - Users: is_active flag for blocking

6. **Counters**: `views_count` and `enquiries_count` are denormalized for performance. Update via triggers or application logic.

7. **UUIDs vs INTs**: Using UUIDs for main entities (users, listings, enquiries) for security and distributed systems. Using INTs for lookup tables.

8. **Indexes**: Added indexes on frequently queried fields (foreign keys, status, dates, location, price).

---

## Future Enhancements

- **listing_images**: When image upload is ready
- **saved_listings**: Bookmark/favorite functionality
- **notifications**: User notification preferences and delivery log
- **reviews_ratings**: User and listing reviews
- **reports**: User-reported content for moderation
- **listing_views**: Track who viewed what (analytics)
