# Supabase Enhancements

This file contains additional indexes, policies, and optimizations to add to your existing Supabase setup.

---

## 1. Performance Indexes

These indexes will significantly improve query performance for browsing, filtering, and dashboard queries.

### Profiles Indexes
```sql
create index idx_profiles_is_active on profiles(is_active);
```

### Listings Indexes
```sql
create index idx_listings_user_id on listings(user_id);
create index idx_listings_type_id on listings(listing_type_id);
create index idx_listings_status on listings(status);
create index idx_listings_created_at on listings(created_at desc);
create index idx_listings_location on listings(location);
create index idx_listings_price on listings(price);
```

### Enquiries Indexes
```sql
create index idx_enquiries_listing_id on enquiries(listing_id);
create index idx_enquiries_enquirer_id on enquiries(enquirer_id);
create index idx_enquiries_status on enquiries(status);
create index idx_enquiries_created_at on enquiries(created_at desc);
```

---

## 2. Missing RLS Policies

### Enquiries - Read Policies

#### Allow enquirer to read their own enquiries
```sql
create policy "Users can read own enquiries"
on enquiries for select
to authenticated
using (auth.uid() = enquirer_id);
```

#### Allow listing owner to read enquiries on their listings
```sql
create policy "Listing owner can read enquiries"
on enquiries for select
to authenticated
using (
  exists (
    select 1 from listings
    where listings.id = enquiries.listing_id
    and listings.user_id = auth.uid()
  )
);
```

### Enquiries - Update Policy

#### Allow listing owner to update enquiry status (mark as read/replied/closed)
```sql
create policy "Listing owner can update enquiry status"
on enquiries for update
to authenticated
using (
  exists (
    select 1 from listings
    where listings.id = enquiries.listing_id
    and listings.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from listings
    where listings.id = enquiries.listing_id
    and listings.user_id = auth.uid()
  )
);
```

### Profiles - Public Read Policy (Optional)

If you want other users to see basic profile info of listing owners:

```sql
create policy "Anyone can read public profile info"
on profiles for select
using (true);
```

**Note:** This allows everyone to read all profiles. If you want to restrict it, use this instead:

```sql
create policy "Users can read profiles of listing owners"
on profiles for select
using (
  exists (
    select 1 from listings
    where listings.user_id = profiles.id
  )
);
```

---

## 3. Full-Text Search (Optional but Recommended)

Enables fast search across listing titles, descriptions, and locations.

### Add Search Vector Column
```sql
alter table listings add column search_vector tsvector;
```

### Create GIN Index for Full-Text Search
```sql
create index idx_listings_search on listings using gin(search_vector);
```

### Create Function to Update Search Vector
```sql
create or replace function listings_search_trigger()
returns trigger
language plpgsql
as $$
begin
  new.search_vector := 
    setweight(to_tsvector('english', coalesce(new.title,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.location,'')), 'C');
  return new;
end;
$$;
```

### Create Trigger to Auto-Update Search Vector
```sql
create trigger listings_search_update
before insert or update on listings
for each row
execute function listings_search_trigger();
```

### Usage Example
```sql
-- Search listings
select id, title, description, price, location,
       ts_rank(search_vector, query) as rank
from listings,
     plainto_tsquery('english', 'hydraulic machine') as query
where search_vector @@ query
  and status = 'active'
order by rank desc, created_at desc
limit 20;
```

---

## 4. Auto-Update Timestamp Trigger (Optional)

Automatically update `updated_at` field on record changes.

### Profiles
```sql
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_profiles_updated_at
before update on profiles
for each row
execute function update_updated_at_column();
```

### Listings
```sql
create trigger update_listings_updated_at
before update on listings
for each row
execute function update_updated_at_column();
```

### Enquiries
```sql
create trigger update_enquiries_updated_at
before update on enquiries
for each row
execute function update_updated_at_column();
```

---

## 5. Auto-Increment Counters (Optional)

Automatically update `enquiries_count` when an enquiry is created.

```sql
create or replace function increment_enquiries_count()
returns trigger
language plpgsql
as $$
begin
  update listings
  set enquiries_count = enquiries_count + 1
  where id = new.listing_id;
  return new;
end;
$$;

create trigger increment_listing_enquiries
after insert on enquiries
for each row
execute function increment_enquiries_count();
```

Similarly for decrement (when enquiry is deleted):

```sql
create or replace function decrement_enquiries_count()
returns trigger
language plpgsql
as $$
begin
  update listings
  set enquiries_count = enquiries_count - 1
  where id = old.listing_id;
  return old;
end;
$$;

create trigger decrement_listing_enquiries
after delete on enquiries
for each row
execute function decrement_enquiries_count();
```

---

## 6. Admin Policies (For Admin Panel)

Allow admins to manage all data.

### Admin - Read All Profiles
```sql
create policy "Admins can read all profiles"
on profiles for select
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
  )
);
```

### Admin - Update Any Profile (for blocking users)
```sql
create policy "Admins can update any profile"
on profiles for update
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
  )
);
```

### Admin - Read All Listings
```sql
create policy "Admins can read all listings"
on listings for select
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
  )
);
```

### Admin - Delete Any Listing
```sql
create policy "Admins can delete any listing"
on listings for delete
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
  )
);
```

### Admin - Read All Enquiries
```sql
create policy "Admins can read all enquiries"
on enquiries for select
to authenticated
using (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.is_admin = true
  )
);
```

---

## 7. Useful Views (Optional)

Pre-joined views for common queries.

### Listings with Owner Info
```sql
create or replace view listings_with_owner as
select 
  l.*,
  p.full_name,
  p.company_name,
  p.phone,
  p.location as owner_location,
  lt.name as listing_type_name,
  lt.code as listing_type_code
from listings l
join profiles p on l.user_id = p.id
join listing_types lt on l.listing_type_id = lt.id;
```

### Enquiries with Details
```sql
create or replace view enquiries_with_details as
select 
  e.*,
  l.title as listing_title,
  l.price as listing_price,
  l.location as listing_location,
  l.user_id as listing_owner_id,
  owner.full_name as listing_owner_name,
  owner.phone as listing_owner_phone,
  owner.email as listing_owner_email,
  enquirer.full_name as enquirer_name,
  enquirer.phone as enquirer_phone_profile,
  enquirer.email as enquirer_email_profile
from enquiries e
join listings l on e.listing_id = l.id
join profiles owner on l.user_id = owner.id
join profiles enquirer on e.enquirer_id = enquirer.id;
```

---

## 8. Data Validation Functions (Optional)

Add additional validation before insert/update.

### Validate Listing Price
```sql
create or replace function validate_listing_price()
returns trigger
language plpgsql
as $$
begin
  -- Price must be positive if provided
  if new.price is not null and new.price <= 0 then
    raise exception 'Price must be greater than 0';
  end if;
  
  -- Jobs and repairs typically don't have prices
  if new.listing_type_id in (
    select id from listing_types where code in ('job', 'repair')
  ) then
    new.price = null;
  end if;
  
  return new;
end;
$$;

create trigger validate_listing_price_trigger
before insert or update on listings
for each row
execute function validate_listing_price();
```

---

## 9. Analytics Queries

Useful queries for dashboard and analytics.

### User Statistics
```sql
select 
  p.id,
  p.full_name,
  p.email,
  count(distinct l.id) as total_listings,
  count(distinct e.id) as total_enquiries_sent,
  count(distinct le.id) as total_enquiries_received
from profiles p
left join listings l on p.id = l.user_id
left join enquiries e on p.id = e.enquirer_id
left join listings lown on lown.user_id = p.id
left join enquiries le on le.listing_id = lown.id
where p.id = auth.uid()
group by p.id, p.full_name, p.email;
```

### Listing Performance
```sql
select 
  l.id,
  l.title,
  l.views_count,
  l.enquiries_count,
  case 
    when l.views_count > 0 then round((l.enquiries_count::numeric / l.views_count::numeric) * 100, 2)
    else 0
  end as conversion_rate
from listings l
where l.user_id = auth.uid()
order by l.created_at desc;
```

### Popular Listing Types
```sql
select 
  lt.name,
  count(l.id) as total_listings,
  sum(l.views_count) as total_views,
  sum(l.enquiries_count) as total_enquiries
from listing_types lt
left join listings l on lt.id = l.listing_type_id and l.status = 'active'
group by lt.id, lt.name
order by total_listings desc;
```

---

## Installation Order

Run these enhancements in the following order:

1. **Indexes** (Section 1) - Run first for immediate performance improvement
2. **RLS Policies** (Section 2) - Essential for security
3. **Full-Text Search** (Section 3) - If you need search functionality
4. **Triggers** (Sections 4 & 5) - For auto-updates and counters
5. **Admin Policies** (Section 6) - When admin panel is ready
6. **Views** (Section 7) - For convenience, not required
7. **Validation** (Section 8) - For data integrity
8. **Analytics** (Section 9) - Reference queries, not migrations

---

## Testing

After applying these changes, test:

1. **Browse Listings** - Should be faster with indexes
2. **Search** - Test full-text search if implemented
3. **Create Enquiry** - Verify counter increments
4. **View Enquiries** - Both as enquirer and listing owner
5. **Admin Panel** - Verify admin can see/manage all data
6. **Profile Updates** - Verify `updated_at` auto-updates

---

## Notes

- All policies assume `authenticated` users. Adjust if you need public access.
- Admin policies check `is_admin` flag. Ensure at least one admin user exists.
- Full-text search uses English language. Change if needed for other languages.
- Views don't have RLS - they inherit policies from underlying tables.
- Counter triggers are eventually consistent. For high-traffic apps, consider batch updates.
