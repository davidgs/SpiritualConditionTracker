import json
import os
import urllib.request
import urllib.parse
from urllib.error import URLError, HTTPError
import ssl
import datetime
import traceback

# Meeting Guide API documentation:
# https://github.com/code4recovery/spec

# Meeting Guide API feeds from various regions
MEETING_GUIDE_FEEDS = {
    "San Francisco": "https://aasfmarin.org/wp-admin/admin-ajax.php?action=meetings",
    "New York": "https://www.nyintergroup.org/wp-admin/admin-ajax.php?action=meetings",
    "Los Angeles": "https://lacoaa.org/wp-admin/admin-ajax.php?action=meetings",
    "Chicago": "https://chicagoaa.org/wp-admin/admin-ajax.php?action=meetings",
    "Central New York": "https://aacny.org/wp-admin/admin-ajax.php?action=meetings",
}

# Default region to use
DEFAULT_REGION = "San Francisco"

# Cache meeting data to avoid hammering the APIs
MEETING_CACHE = {}
CACHE_EXPIRY = 24 * 60 * 60  # 24 hours in seconds

def get_meetings(region=None, day=None, time=None, types=None, location=None):
    """
    Fetch meetings from the Meeting Guide API
    
    Args:
        region (str): Region name from MEETING_GUIDE_FEEDS
        day (str): Day of the week (sunday, monday, etc.)
        time (str): Time of day (morning, noon, evening, night)
        types (str): Meeting type (open, closed, etc.)
        location (str): Location search term
        
    Returns:
        list: Filtered meeting data
    """
    try:
        # Use the specified region or default
        region_key = str(region) if region and str(region) in MEETING_GUIDE_FEEDS else DEFAULT_REGION
        feed_url = MEETING_GUIDE_FEEDS[region_key]
        
        # Check if we have a cached version that's still valid
        cache_key = region_key
        current_time = datetime.datetime.now().timestamp()
        
        if cache_key in MEETING_CACHE and current_time - MEETING_CACHE[cache_key]['timestamp'] < CACHE_EXPIRY:
            meetings = MEETING_CACHE[cache_key]['data']
        else:
            # Create SSL context that ignores certificate validation
            # This is generally not recommended but necessary for some meeting APIs
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            
            # Fetch the meeting data
            with urllib.request.urlopen(feed_url, context=ctx) as response:
                meetings = json.loads(response.read().decode())
                
            # Cache the result
            MEETING_CACHE[cache_key] = {
                'data': meetings,
                'timestamp': current_time
            }
        
        # Filter meetings based on criteria
        filtered_meetings = meetings
        
        # Filter by day
        if day:
            day = day.lower()
            filtered_meetings = [m for m in filtered_meetings if 
                                 'day' in m and m['day'].lower() == day]
        
        # Filter by time
        if time:
            time = time.lower()
            time_ranges = {
                'morning': ('00:00', '11:59'),
                'noon': ('12:00', '14:59'),
                'evening': ('15:00', '19:59'),
                'night': ('20:00', '23:59')
            }
            
            if time in time_ranges:
                start_time, end_time = time_ranges[time]
                filtered_meetings = [m for m in filtered_meetings if 
                                    'time' in m and start_time <= m['time'] <= end_time]
        
        # Filter by type
        if types:
            types = types.lower()
            filtered_meetings = [m for m in filtered_meetings if 
                                'types' in m and any(t.lower() == types for t in m['types'])]
        
        # Filter by location
        if location:
            location = location.lower()
            filtered_meetings = [m for m in filtered_meetings if 
                               ('name' in m and location in m['name'].lower()) or
                               ('location' in m and location in m['location'].lower()) or
                               ('address' in m and location in m['address'].lower()) or
                               ('city' in m and location in m['city'].lower()) or
                               ('region' in m and location in m['region'].lower())]
        
        # Limit to 20 results maximum
        return filtered_meetings[:20]
    
    except HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.reason}")
        return {"error": f"HTTP Error: {e.code} - {e.reason}"}
    except URLError as e:
        print(f"URL Error: {e.reason}")
        return {"error": f"URL Error: {e.reason}"}
    except Exception as e:
        print(f"Error fetching meetings: {e}")
        traceback.print_exc()
        return {"error": f"Error fetching meetings: {str(e)}"}

if __name__ == "__main__":
    import sys
    
    # Get arguments from command line
    if len(sys.argv) >= 2:
        region = sys.argv[1] if sys.argv[1] else None
        day = sys.argv[2] if len(sys.argv) > 2 and sys.argv[2] else None
        time = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else None
        types = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] else None
        location = sys.argv[5] if len(sys.argv) > 5 else "San Francisco"
        
        # Call the function with the arguments
        meetings = get_meetings(region, day, time, types, location)
        
        # Print the result as JSON to stdout
        print(json.dumps(meetings))