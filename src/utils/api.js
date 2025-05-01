// Meeting Guide API documentation:
// https://github.com/code4recovery/spec

// Meeting Guide API feeds from various regions
const MEETING_GUIDE_FEEDS = {
  "San Francisco": "https://aasfmarin.org/wp-admin/admin-ajax.php?action=meetings",
  "New York": "https://www.nyintergroup.org/wp-admin/admin-ajax.php?action=meetings",
  "Los Angeles": "https://lacoaa.org/wp-admin/admin-ajax.php?action=meetings",
  "Chicago": "https://chicagoaa.org/wp-admin/admin-ajax.php?action=meetings",
  "Central New York": "https://aacny.org/wp-admin/admin-ajax.php?action=meetings",
};

// Default region to use
const DEFAULT_REGION = "San Francisco";

// Cache meeting data to avoid hammering the APIs
let MEETING_CACHE = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Fetch meetings from Meeting Guide API
export const fetchMeetings = async (region = null, day = null, time = null, types = null, location = null) => {
  try {
    // Use the specified region or default
    const regionKey = region && MEETING_GUIDE_FEEDS[region] ? region : DEFAULT_REGION;
    const feedUrl = MEETING_GUIDE_FEEDS[regionKey];
    
    // Check if we have a cached version that's still valid
    const cacheKey = `${regionKey}`;
    const currentTime = Date.now();
    
    if (MEETING_CACHE[cacheKey] && currentTime - MEETING_CACHE[cacheKey].timestamp < CACHE_EXPIRY) {
      const meetings = MEETING_CACHE[cacheKey].data;
      return filterMeetings(meetings, day, time, types, location);
    }
    
    // Fetch the meeting data
    console.log(`Fetching meetings from ${feedUrl}`);
    const response = await fetch(feedUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
    }
    
    const meetings = await response.json();
    
    // Cache the result
    MEETING_CACHE[cacheKey] = {
      data: meetings,
      timestamp: currentTime
    };
    
    // Return filtered results
    return filterMeetings(meetings, day, time, types, location);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};

// Filter meetings based on criteria
const filterMeetings = (meetings, day, time, types, location) => {
  let filtered = [...meetings];
  
  // Filter by day
  if (day) {
    day = day.toLowerCase();
    filtered = filtered.filter(m => 
      'day' in m && m.day.toLowerCase() === day
    );
  }
  
  // Filter by time
  if (time) {
    time = time.toLowerCase();
    const timeRanges = {
      'morning': ['00:00', '11:59'],
      'noon': ['12:00', '14:59'],
      'evening': ['15:00', '19:59'],
      'night': ['20:00', '23:59']
    };
    
    if (timeRanges[time]) {
      const [startTime, endTime] = timeRanges[time];
      filtered = filtered.filter(m => 
        'time' in m && startTime <= m.time && m.time <= endTime
      );
    }
  }
  
  // Filter by type
  if (types) {
    types = types.toLowerCase();
    filtered = filtered.filter(m => 
      'types' in m && Array.isArray(m.types) &&
      m.types.some(t => t.toLowerCase() === types)
    );
  }
  
  // Filter by location
  if (location) {
    location = location.toLowerCase();
    filtered = filtered.filter(m => 
      ('name' in m && m.name.toLowerCase().includes(location)) ||
      ('location' in m && m.location.toLowerCase().includes(location)) ||
      ('address' in m && m.address.toLowerCase().includes(location)) ||
      ('city' in m && m.city.toLowerCase().includes(location)) ||
      ('region' in m && m.region.toLowerCase().includes(location))
    );
  }
  
  // Limit to 20 results maximum
  return filtered.slice(0, 20);
};