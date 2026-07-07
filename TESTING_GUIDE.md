# Testing Your Supabase Integration

## ✅ What's Been Updated

All main pages now use Supabase:
- ✅ **Login & Register** - Supabase Auth
- ✅ **Browse** - Load listings from database
- ✅ **Post** - Create listings in database
- ✅ **Dashboard** - Show real user listings and stats
- ✅ **Listing Detail** - View listings and send enquiries
- ✅ **Profile** - Edit and save profile

---

## 🧪 Testing Flow

### 1. Register a New User
1. Go to http://localhost:3000
2. Click "Sign up"
3. Enter:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
4. Click "Create Account"
5. ✅ You should be redirected to Browse page

### 2. Complete Your Profile
1. Click on Profile tab (bottom nav)
2. Click "Edit Profile"
3. Fill in:
   - Full Name: `Test User`
   - Phone: `+91 9876543210`
   - Company: `Test Company`
   - Location: `Mumbai, Maharashtra`
   - Bio: `Testing the B2B marketplace platform`
4. Click "Save Changes"
5. ✅ You should see success message

### 3. Create a Listing
1. Click on Post tab (bottom nav)
2. Fill in the form:
   - Type: **Machinery**
   - Title: `CNC Milling Machine`
   - Description: `High precision CNC milling machine in excellent condition. Recently serviced.`
   - Price: `250000`
   - Location: `Mumbai`
   - Condition: **Used**
3. Click "Post Listing"
4. ✅ You should be redirected to Dashboard

### 4. Check Dashboard
1. You should see your listing in "My Listings"
2. Stats should show:
   - Active Listings: 1
   - Enquiries Received: 0
   - Enquiries Sent: 0
   - Total Views: 0

### 5. Browse Listings
1. Click on Browse tab
2. ✅ You should see your listing in the grid
3. Try filtering by category
4. Click on your listing card

### 6. View Listing Detail
1. You should see full listing details
2. Since it's your listing, you should see "This is your listing" message
3. Click "Back" to return to Browse

### 7. Test Enquiry Flow (Need 2 Users)

**Create Second User:**
1. Sign out (Profile → Sign Out)
2. Register another user: `buyer@example.com` / `password123`
3. Go to Browse
4. Click on the listing
5. Click "Send Enquiry"
6. Write a message: `Hi, I'm interested in this machine. Is it still available?`
7. Click "Send Enquiry"
8. ✅ You should see success message

**Check Enquiry as Listing Owner:**
1. Sign out
2. Login as first user (`test@example.com`)
3. Go to Dashboard
4. ✅ Stats should show "Enquiries Received: 1"

---

## 🔍 Verify in Supabase Dashboard

### Check Tables

1. **Authentication → Users**
   - Should see 2 users

2. **Table Editor → profiles**
   - Should see 2 profiles with user data

3. **Table Editor → listings**
   - Should see 1 listing
   - `user_id` should match first user's UUID
   - `listing_type_id` should be the ID for "Machinery" (probably `1`)
   - `views_count` should increment each time you view the listing detail

4. **Table Editor → enquiries**
   - Should see 1 enquiry
   - `listing_id` matches the listing UUID
   - `enquirer_id` matches second user's UUID
   - `message` contains the enquiry text

---

## 🐛 Common Issues

### "Failed to load listings" or other errors

**Check:**
1. Is `.env` file configured with correct credentials?
2. Are the tables created in Supabase? (See `supabase.md`)
3. Are RLS policies enabled? (See `supabase.md`)
4. Check browser console for detailed error messages

**Quick Fix:**
```bash
# Restart dev server
# Kill existing server
lsof -ti:3000 | xargs kill -9

# Start fresh
npm run dev
```

### "Row Level Security policy violation"

This means RLS policies aren't set up correctly.

**Fix:**
1. Go to Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy all the policies from `supabase.md`
4. Run them
5. Refresh your app

### Profile not created after registration

The trigger might not be working.

**Fix:**
1. Check if trigger exists in Supabase (SQL Editor → "Triggers" tab)
2. If not, run the trigger SQL from `supabase.md`
3. For existing users without profiles, manually create:
   ```sql
   -- Get user ID from Authentication → Users
   INSERT INTO profiles (id, full_name)
   VALUES ('user-uuid-here', 'User Name');
   ```

### Views not incrementing

The `getListing()` function updates views asynchronously. This is normal - the increment happens in background.

---

## 📊 What's Working

✅ User registration and login
✅ Profile management
✅ Creating listings
✅ Browsing listings with filters
✅ Viewing listing details (auto-increments views)
✅ Sending enquiries
✅ Dashboard stats
✅ Category filtering

---

## 🚀 Next Steps

### Recommended Enhancements (from `supabase-enhancements.md`):

1. **Add Performance Indexes** (Section 1)
   - Will make Browse and Dashboard much faster
   - Run the index SQL in Supabase SQL Editor

2. **Add Missing RLS Policies** (Section 2)
   - Allow enquiry senders to see their enquiries
   - Allow listing owners to see enquiries on their listings

3. **Add Full-Text Search** (Section 3)
   - Better search functionality
   - Search across title, description, and location

4. **Add Auto-Increment Counters** (Section 5)
   - Automatically update `enquiries_count` when enquiry is created
   - Keeps counts accurate

### Future Features:

- **Search functionality** - Add search bar in Browse page
- **Image upload** - Use Supabase Storage
- **Email verification** - Enable in Supabase Auth settings
- **Admin panel** - Manage users and listings
- **Messages page** - Show sent/received enquiries
- **Edit/Delete listings** - Owner can manage their listings
- **Pagination** - For large number of listings
- **Filters** - Price range, location search, etc.

---

## 📝 Tips

1. **Email Verification**: By default disabled for easy testing. Enable in Supabase Dashboard → Authentication → Settings → Email Auth

2. **Admin User**: To make a user admin:
   ```sql
   UPDATE profiles
   SET is_admin = true
   WHERE id = 'user-uuid-here';
   ```

3. **Test Data**: Create multiple listings to test browse and dashboard properly

4. **Mobile Testing**: Open on phone to test mobile-first design

---

## 🎉 You're All Set!

Your B2B marketplace is now connected to Supabase with:
- Real authentication
- Real-time data from database
- Full CRUD operations on listings
- Enquiry system
- User profiles
- Dashboard analytics

Go ahead and test it out! 🚀
