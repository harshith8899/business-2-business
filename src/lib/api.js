import { supabase } from './supabase'

// ==================== LISTINGS ====================

/**
 * Get all active listings with filters
 */
export async function getListings({ type, location, minPrice, maxPrice, search, limit = 20, offset = 0, excludeUserId, listingMode } = {}) {
  try {
    let query = supabase
      .from('listings')
      .select(`
        *,
        profiles:user_id (
          full_name,
          company_name,
          phone,
          location
        ),
        listing_types:listing_type_id (
          name,
          code
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // Apply filters
    if (type) {
      query = query.eq('listing_type_id', type)
    }

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    if (minPrice !== undefined && minPrice !== null) {
      query = query.gte('price', minPrice)
    }

    if (maxPrice !== undefined && maxPrice !== null) {
      query = query.lte('price', maxPrice)
    }

    // Exclude specific user's listings (e.g., don't show own listings in browse)
    if (excludeUserId) {
      query = query.neq('user_id', excludeUserId)
    }

    // Filter by listing mode (sell/buy)
    if (listingMode) {
      query = query.eq('listing_mode', listingMode)
    }

    if (search) {
      // If full-text search is set up
      if (supabase.from('listings').select('search_vector').limit(1)) {
        query = query.textSearch('search_vector', search)
      } else {
        // Fallback to ILIKE search
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return { data, count }
  } catch (error) {
    console.error('Error fetching listings:', error)
    throw error
  }
}

/**
 * Get single listing by ID
 */
export async function getListing(id) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        profiles:user_id (
          id,
          full_name,
          company_name,
          phone,
          location,
          bio
        ),
        listing_types:listing_type_id (
          name,
          code
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    // Increment view count (don't wait for it)
    supabase
      .from('listings')
      .update({ views_count: data.views_count + 1 })
      .eq('id', id)
      .then()

    return data
  } catch (error) {
    console.error('Error fetching listing:', error)
    throw error
  }
}

/**
 * Get user's own listings
 */
export async function getMyListings(userId) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        listing_types:listing_type_id (
          name,
          code
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching my listings:', error)
    throw error
  }
}

/**
 * Create a new listing
 */
export async function createListing(listingData) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .insert([listingData])
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error creating listing:', error)
    throw error
  }
}

/**
 * Update listing
 */
export async function updateListing(id, updates) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error updating listing:', error)
    throw error
  }
}

/**
 * Delete listing
 */
export async function deleteListing(id) {
  try {
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id)

    if (error) throw error

    return true
  } catch (error) {
    console.error('Error deleting listing:', error)
    throw error
  }
}

// ==================== LISTING TYPES ====================

/**
 * Get all listing types
 */
export async function getListingTypes() {
  try {
    const { data, error } = await supabase
      .from('listing_types')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching listing types:', error)
    throw error
  }
}

// ==================== ENQUIRIES ====================

/**
 * Create an enquiry
 */
export async function createEnquiry(enquiryData) {
  try {
    const { data, error } = await supabase
      .from('enquiries')
      .insert([enquiryData])
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error creating enquiry:', error)
    throw error
  }
}

/**
 * Get enquiries I've sent
 */
export async function getMyEnquiries(userId) {
  try {
    const { data, error } = await supabase
      .from('enquiries')
      .select(`
        *,
        listings:listing_id (
          id,
          title,
          price,
          location,
          profiles:user_id (
            full_name,
            phone,
            company_name
          )
        )
      `)
      .eq('enquirer_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching my enquiries:', error)
    throw error
  }
}

/**
 * Get enquiries received on my listings
 */
export async function getReceivedEnquiries(userId) {
  try {
    // First, get all the user's listing IDs
    const { data: userListings, error: listingsError } = await supabase
      .from('listings')
      .select('id')
      .eq('user_id', userId)

    if (listingsError) throw listingsError

    // If user has no listings, return empty array
    if (!userListings || userListings.length === 0) {
      return []
    }

    const listingIds = userListings.map(listing => listing.id)

    // Then get enquiries for those listings
    const { data, error } = await supabase
      .from('enquiries')
      .select(`
        *,
        profiles:enquirer_id (
          full_name,
          phone,
          company_name
        ),
        listings:listing_id (
          id,
          title,
          user_id
        )
      `)
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching received enquiries:', error)
    throw error
  }
}

/**
 * Get enquiries for a specific listing (listing owner only)
 */
export async function getListingEnquiries(listingId) {
  try {
    const { data, error } = await supabase
      .from('enquiries')
      .select(`
        *,
        profiles:enquirer_id (
          full_name,
          phone,
          email,
          company_name
        )
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error fetching listing enquiries:', error)
    throw error
  }
}

/**
 * Update enquiry status
 */
export async function updateEnquiryStatus(enquiryId, status) {
  try {
    const { data, error } = await supabase
      .from('enquiries')
      .update({ status })
      .eq('id', enquiryId)
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error('Error updating enquiry status:', error)
    throw error
  }
}

// ==================== DASHBOARD STATS ====================

/**
 * Get user dashboard statistics
 */
export async function getDashboardStats(userId) {
  try {
    // Get counts in parallel
    const [listingsResult, enquiriesResult, receivedResult] = await Promise.all([
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active'),

      supabase
        .from('enquiries')
        .select('id', { count: 'exact', head: true })
        .eq('enquirer_id', userId),

      supabase
        .from('enquiries')
        .select(`
          id,
          listings!inner(user_id)
        `, { count: 'exact', head: true })
        .eq('listings.user_id', userId)
    ])

    // Get total views from all listings
    const { data: listingsData } = await supabase
      .from('listings')
      .select('views_count')
      .eq('user_id', userId)

    const totalViews = listingsData?.reduce((sum, listing) => sum + (listing.views_count || 0), 0) || 0

    return {
      activeListings: listingsResult.count || 0,
      enquiriesSent: enquiriesResult.count || 0,
      enquiriesReceived: receivedResult.count || 0,
      totalViews
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}
