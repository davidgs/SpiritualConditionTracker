#!/bin/bash
# Script to update the index.bundle file with our enhanced static bundle

# Path to the index.bundle file
BUNDLE_PATH="/var/www/vhosts/spiritual-condition.com/httpdocs/index.bundle"

# Create the enhanced bundle content
cat > "$BUNDLE_PATH" << 'EOF'
// Enhanced Static Bundle for Spiritual Condition Tracker
// This file provides basic app functionality for the static deployment
(function() {
  console.log('[Bundle] Loading enhanced static bundle...');
  
  // Provide minimal mocks for expected Hermes APIs
  if (typeof global !== 'undefined' && !global.HermesInternal) {
    global.HermesInternal = {
      getRuntimeProperties: function() {
        return { 
          "OSS Release Version": "hermes-2023-08-07-RNv0.72.4-node-v18.17.1",
          "Build Mode": "Release", 
          "Bytecode Version": 99 
        };
      },
      hasToStringBug: function() { return false; },
      enablePromiseRejectionTracker: function() {},
      enterCriticalSection: function() {},
      exitCriticalSection: function() {},
      handleMemoryPressure: function() {},
      initializeHermesIfNeeded: function() {},
      shouldEnableTurboModule: function() { return false; }
    };
  }
  
  // Create a simple React-like app if this is loaded directly in a browser
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // Check if we're running in the context of our app container
    const isInAppContainer = document.getElementById('root') && 
                            document.getElementById('app-container');
    
    if (isInAppContainer) {
      console.log('[Bundle] Running in app container mode');
      
      // Get root element
      const root = document.getElementById('root');
      
      // Create a basic app interface
      createBasicAppInterface(root);
    }
    // If loaded directly (not in our app container)
    else if (window.location.pathname.includes('index.bundle')) {
      console.log('[Bundle] Running in standalone mode');
      
      // Create a message for direct access
      document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; text-align: center; padding: 20px;">
          <h1>Spiritual Condition Tracker</h1>
          <p>This is a bundle file and should not be accessed directly.</p>
          <a href="/" style="padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to App</a>
        </div>
      `;
    }
  }
  
  function createBasicAppInterface(container) {
    // Set container styles
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    container.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif';
    
    // Create basic app structure
    const appHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; width: 100%;">
        <!-- Header -->
        <header style="background-color: #007bff; color: white; padding: 1rem; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="margin: 0; font-size: 1.5rem;">Spiritual Condition Tracker</h1>
        </header>
        
        <!-- Tabs -->
        <div class="tabs" style="display: flex; background-color: #f1f1f1; border-bottom: 1px solid #ddd;">
          <button class="tab-btn active" data-tab="dashboard" style="flex: 1; padding: 12px; border: none; background: none; font-weight: bold; color: #007bff; border-bottom: 2px solid #007bff; cursor: pointer;">Dashboard</button>
          <button class="tab-btn" data-tab="activities" style="flex: 1; padding: 12px; border: none; background: none; cursor: pointer;">Activities</button>
          <button class="tab-btn" data-tab="meetings" style="flex: 1; padding: 12px; border: none; background: none; cursor: pointer;">Meetings</button>
          <button class="tab-btn" data-tab="nearby" style="flex: 1; padding: 12px; border: none; background: none; cursor: pointer;">Nearby</button>
          <button class="tab-btn" data-tab="settings" style="flex: 1; padding: 12px; border: none; background: none; cursor: pointer;">Settings</button>
        </div>
        
        <!-- Content area -->
        <div class="content" style="flex: 1; padding: 1rem; overflow-y: auto;">
          <!-- Dashboard tab -->
          <div class="tab-content active" id="dashboard-content">
            <div style="background-color: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 1rem;">
              <h2 style="margin-top: 0; color: #333;">Sobriety</h2>
              <div style="font-size: 2rem; font-weight: bold; color: #007bff;">2.58 Years</div>
              <div style="color: #666; margin-top: 0.5rem;">943 days</div>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 1rem;">
              <h2 style="margin-top: 0; color: #333;">Spiritual Fitness</h2>
              <div style="width: 100%; height: 24px; background-color: #e9ecef; border-radius: 12px; overflow: hidden; margin: 1rem 0;">
                <div style="width: 78%; height: 100%; background-color: #28a745; border-radius: 12px;"></div>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span>Low</span>
                <span style="font-weight: bold;">78%</span>
                <span>High</span>
              </div>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="margin-top: 0; color: #333;">Recent Activities</h2>
              <ul style="padding-left: 1rem;">
                <li style="margin-bottom: 0.5rem;">Meeting - Yesterday</li>
                <li style="margin-bottom: 0.5rem;">Meditation - 2 days ago</li>
                <li style="margin-bottom: 0.5rem;">Reading - 3 days ago</li>
              </ul>
            </div>
          </div>
          
          <!-- Activities tab (hidden initially) -->
          <div class="tab-content" id="activities-content" style="display: none;">
            <h2>Activity Log</h2>
            <p>Use this screen to log your daily recovery activities.</p>
            
            <div style="background-color: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 1rem;">
              <button style="padding: 0.75rem 1rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Log New Activity</button>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin-top: 0;">Activity History</h3>
              <div style="border-bottom: 1px solid #eee; padding: 0.75rem 0;">
                <div style="font-weight: bold;">Meeting</div>
                <div style="color: #666; font-size: 0.9rem;">Yesterday at 7:30 PM</div>
              </div>
              <div style="border-bottom: 1px solid #eee; padding: 0.75rem 0;">
                <div style="font-weight: bold;">Meditation</div>
                <div style="color: #666; font-size: 0.9rem;">2 days ago - 20 minutes</div>
              </div>
              <div style="padding: 0.75rem 0;">
                <div style="font-weight: bold;">Reading</div>
                <div style="color: #666; font-size: 0.9rem;">3 days ago - 30 minutes</div>
              </div>
            </div>
          </div>
          
          <!-- Meetings tab (hidden initially) -->
          <div class="tab-content" id="meetings-content" style="display: none;">
            <h2>Meetings</h2>
            <p>Manage your recovery meetings and get reminders.</p>
            
            <div style="background-color: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 1rem;">
              <button style="padding: 0.75rem 1rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; width: 100%;">Add New Meeting</button>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin-top: 0;">Upcoming Meetings</h3>
              <div style="border-bottom: 1px solid #eee; padding: 0.75rem 0;">
                <div style="font-weight: bold;">Daily Reflections</div>
                <div style="color: #666; font-size: 0.9rem;">Tomorrow at 7:00 PM - Community Center</div>
              </div>
              <div style="border-bottom: 1px solid #eee; padding: 0.75rem 0;">
                <div style="font-weight: bold;">Big Book Study</div>
                <div style="color: #666; font-size: 0.9rem;">Thursday at 6:30 PM - Online</div>
              </div>
              <div style="padding: 0.75rem 0;">
                <div style="font-weight: bold;">Speaker Meeting</div>
                <div style="color: #666; font-size: 0.9rem;">Saturday at 2:00 PM - Recovery Center</div>
              </div>
            </div>
          </div>
          
          <!-- Nearby tab (hidden initially) -->
          <div class="tab-content" id="nearby-content" style="display: none;">
            <h2>Nearby Recovery Friends</h2>
            <p>Connect with others in recovery who are nearby.</p>
            
            <div style="background-color: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 1rem; text-align: center;">
              <p>This feature requires location permission.</p>
              <button style="padding: 0.75rem 1rem; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Start Proximity Scan</button>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin-top: 0;">Connected Friends</h3>
              <p style="color: #666;">No connections yet. Use the proximity scan to find others nearby.</p>
            </div>
          </div>
          
          <!-- Settings tab (hidden initially) -->
          <div class="tab-content" id="settings-content" style="display: none;">
            <h2>Settings</h2>
            
            <div style="background-color: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 1rem;">
              <h3 style="margin-top: 0;">Profile</h3>
              <div style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">
                <div style="font-weight: bold;">Sobriety Date</div>
                <div style="color: #666; margin-top: 0.25rem;">September 5, 2022</div>
              </div>
              <div style="padding: 0.75rem 0;">
                <div style="font-weight: bold;">Sponsor</div>
                <div style="color: #666; margin-top: 0.25rem;">John D. (555) 123-4567</div>
              </div>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 1rem;">
              <h3 style="margin-top: 0;">Appearance</h3>
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0;">
                <span>Dark Mode</span>
                <label class="switch">
                  <input type="checkbox" id="dark-mode-toggle">
                  <span style="position: relative; display: inline-block; width: 50px; height: 24px; background-color: #ccc; border-radius: 24px; transition: 0.4s;">
                    <span style="position: absolute; content: ''; height: 20px; width: 20px; left: 2px; bottom: 2px; background-color: white; border-radius: 50%; transition: 0.4s;"></span>
                  </span>
                </label>
              </div>
            </div>
            
            <div style="background-color: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="margin-top: 0;">About</h3>
              <div style="padding: 0.75rem 0; border-bottom: 1px solid #eee;">
                <div style="font-weight: bold;">Version</div>
                <div style="color: #666; margin-top: 0.25rem;">1.0.0</div>
              </div>
              <div style="padding: 0.75rem 0;">
                <div style="font-weight: bold;">Privacy Policy</div>
                <div style="color: #007bff; margin-top: 0.25rem; cursor: pointer;">View Policy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Insert HTML into container
    container.innerHTML = appHTML;
    
    // Add tab switching behavior
    const tabButtons = container.querySelectorAll('.tab-btn');
    const tabContents = container.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and content
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabButtons.forEach(btn => btn.style.fontWeight = 'normal');
        tabButtons.forEach(btn => btn.style.color = '#333');
        tabButtons.forEach(btn => btn.style.borderBottom = 'none');
        
        tabContents.forEach(content => content.style.display = 'none');
        
        // Add active class to clicked button and show corresponding content
        button.classList.add('active');
        button.style.fontWeight = 'bold';
        button.style.color = '#007bff';
        button.style.borderBottom = '2px solid #007bff';
        
        const tabId = button.getAttribute('data-tab');
        const content = container.querySelector(`#${tabId}-content`);
        if (content) {
          content.style.display = 'block';
        }
      });
    });
    
    // Handle dark mode toggle
    const darkModeToggle = container.querySelector('#dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          container.style.backgroundColor = '#121212';
          container.style.color = '#f1f1f1';
          
          // Update all card backgrounds
          const cards = container.querySelectorAll('[style*="background-color: white"]');
          cards.forEach(card => {
            card.style.backgroundColor = '#2d2d2d';
            card.style.color = '#f1f1f1';
          });
          
          // Update tab background
          const tabs = container.querySelector('.tabs');
          if (tabs) tabs.style.backgroundColor = '#1a1a1a';
          
          // Update borders
          const borders = container.querySelectorAll('[style*="border-bottom: 1px solid #eee"]');
          borders.forEach(border => {
            border.style.borderBottom = '1px solid #444';
          });
        } else {
          container.style.backgroundColor = '';
          container.style.color = '';
          
          // Reset all card backgrounds
          const cards = container.querySelectorAll('[style*="background-color: #2d2d2d"]');
          cards.forEach(card => {
            card.style.backgroundColor = 'white';
            card.style.color = '';
          });
          
          // Reset tab background
          const tabs = container.querySelector('.tabs');
          if (tabs) tabs.style.backgroundColor = '#f1f1f1';
          
          // Reset borders
          const borders = container.querySelectorAll('[style*="border-bottom: 1px solid #444"]');
          borders.forEach(border => {
            border.style.borderBottom = '1px solid #eee';
          });
        }
      });
    }
  }
  
  // Export expected modules to prevent errors
  return {
    __esModule: true,
    default: {
      name: 'SpiritualConditionTracker',
      displayName: 'Spiritual Condition Tracker',
      expo: {
        name: 'Spiritual Condition Tracker'
      }
    }
  };
})();
EOF

echo "Enhanced bundle file created at $BUNDLE_PATH"
echo "File size: $(stat -c %s "$BUNDLE_PATH") bytes"

# Check file permissions
echo "Setting proper permissions..."
chmod 644 "$BUNDLE_PATH"

echo "Done!"