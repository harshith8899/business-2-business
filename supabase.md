# Supabase Setup Guide (Simple)

## Done

### 1. profiles

``` sql
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text not null,
    phone text,
    company_name text,
    location text,
    bio text,
    is_admin boolean default false,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```

### 2. listing_types

``` sql
create table listing_types (
    id integer generated always as identity primary key,
    code text unique not null,
    name text not null,
    description text,
    is_active boolean default true
);
```

Seed:

``` sql
insert into listing_types (code,name,description) values
('machinery','Machinery','Industrial machinery'),
('accessories','Accessories','Machine parts'),
('tools','Tools','Hand & power tools'),
('rental','Rental','Rental equipment'),
('job','Job Posting','Jobs'),
('repair','Repair Service','Repairs');
```

### 3. listings

``` sql
create table listings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id) on delete cascade,
    listing_type_id integer not null references listing_types(id),
    title text not null,
    description text not null,
    price numeric(12,2),
    currency text default 'INR',
    location text,
    condition text,
    status text default 'active',
    views_count integer default 0,
    enquiries_count integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    expires_at timestamptz,
    job_type text,
    rental_period text,
    urgency text
);
```

Constraints:

``` sql
alter table listings add constraint chk_listing_status check (status in ('active','sold','expired','draft'));
alter table listings add constraint chk_listing_condition check (condition is null or condition in ('new','used','refurbished'));
alter table listings add constraint chk_job_type check (job_type is null or job_type in ('full-time','part-time','contract','internship','freelance'));
alter table listings add constraint chk_rental_period check (rental_period is null or rental_period in ('hourly','daily','weekly','monthly'));
alter table listings add constraint chk_urgency check (urgency is null or urgency in ('low','medium','high','urgent'));
```

### 4. enquiries

``` sql
create table enquiries (
    id uuid primary key default gen_random_uuid(),
    listing_id uuid not null references listings(id) on delete cascade,
    enquirer_id uuid not null references profiles(id) on delete cascade,
    message text not null,
    enquirer_phone text,
    enquirer_email text,
    status text default 'new',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```

Constraint:

``` sql
alter table enquiries add constraint chk_enquiry_status
check (status in ('new','read','replied','closed'));
```

## Trigger

``` sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, full_name)
  values(new.id, coalesce(new.raw_user_meta_data->>'full_name',''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
```

## Enable RLS

``` sql
alter table profiles enable row level security;
alter table listings enable row level security;
alter table enquiries enable row level security;
```

## Policies

### Profiles

``` sql
create policy "Users can read own profile"
on profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can update own profile"
on profiles for update
to authenticated
using (auth.uid() = id);
```

### Listings

``` sql
create policy "Anyone can read listings"
on listings for select
using (true);

create policy "Users can insert listing"
on listings for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Owner can update listing"
on listings for update
to authenticated
using (auth.uid() = user_id);

create policy "Owner can delete listing"
on listings for delete
to authenticated
using (auth.uid() = user_id);
```

### Enquiries

``` sql
create policy "Users can create enquiry"
on enquiries for insert
to authenticated
with check (auth.uid() = enquirer_id);
```

# What Next?

1.  Install `@supabase/supabase-js`.
2.  Connect your app using Project URL + Anon Key.
3.  Implement Sign Up / Login.
4.  Verify `profiles` is auto-created.
5.  Build:
    -   Create Listing
    -   View Listings
    -   Listing Details
    -   Create Enquiry
6.  Later:
    -   Supabase Storage for images
    -   Better enquiry permissions
    -   Admin panel
    -   Search & filters
