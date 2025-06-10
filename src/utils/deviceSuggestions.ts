/**
 * Device-based profile suggestions utility
 * Provides intelligent auto-suggestions for profile information using device APIs and browser capabilities
 */

export interface ProfileSuggestions {
  name?: string;
  email?: string;
  phoneNumber?: string;
  timezone?: string;
  country?: string;
}

/**
 * Get intelligent profile suggestions from device capabilities
 */
export async function getDeviceProfileSuggestions(): Promise<ProfileSuggestions> {
  const suggestions: ProfileSuggestions = {};

  try {
    // Get timezone information
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    suggestions.timezone = timezone;

    // Get country from locale
    const locale = navigator.language || 'en-US';
    const country = locale.split('-')[1] || 'US';
    suggestions.country = country;

    // Try to get device name for name suggestions (limited on web)
    if ('userAgentData' in navigator) {
      const userAgentData = (navigator as any).userAgentData;
      if (userAgentData?.brands) {
        // Could potentially extract device info for suggestions
        console.log('Device brands available:', userAgentData.brands);
      }
    }

    // Check for autofill capabilities
    if ('credentials' in navigator) {
      // Web Authentication API available - browser may have stored credentials
      console.log('Credential management available for auto-suggestions');
    }

    // Check for contact access (requires user permission)
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const contacts = await (navigator as any).contacts.select(['name', 'email', 'tel'], { multiple: false });
        if (contacts && contacts.length > 0) {
          const contact = contacts[0];
          if (contact.name && contact.name.length > 0) {
            suggestions.name = contact.name[0];
          }
          if (contact.email && contact.email.length > 0) {
            suggestions.email = contact.email[0];
          }
          if (contact.tel && contact.tel.length > 0) {
            suggestions.phoneNumber = contact.tel[0];
          }
        }
      } catch (error) {
        console.log('Contact access not available or denied:', error);
      }
    }

  } catch (error) {
    console.log('Error getting device suggestions:', error);
  }

  return suggestions;
}

/**
 * Get location-based suggestions for phone number formatting
 */
export function getLocationBasedPhoneFormat(): string {
  try {
    const locale = navigator.language || 'en-US';
    const country = locale.split('-')[1] || 'US';
    
    // Return country code for phone number formatting
    const countryMapping: { [key: string]: string } = {
      'US': 'US',
      'CA': 'CA',
      'GB': 'GB',
      'AU': 'AU',
      'DE': 'DE',
      'FR': 'FR',
      'IT': 'IT',
      'ES': 'ES',
      'NL': 'NL',
      'BE': 'BE',
      'CH': 'CH',
      'AT': 'AT',
      'IE': 'IE',
      'PT': 'PT',
      'DK': 'DK',
      'SE': 'SE',
      'NO': 'NO',
      'FI': 'FI',
      'IS': 'IS',
      'LU': 'LU',
      'MT': 'MT',
      'CY': 'CY',
      'GR': 'GR',
      'BG': 'BG',
      'RO': 'RO',
      'HR': 'HR',
      'SI': 'SI',
      'SK': 'SK',
      'CZ': 'CZ',
      'HU': 'HU',
      'PL': 'PL',
      'LT': 'LT',
      'LV': 'LV',
      'EE': 'EE'
    };

    return countryMapping[country] || 'US';
  } catch (error) {
    console.log('Error detecting location for phone format:', error);
    return 'US';
  }
}

/**
 * Extract name suggestions from browser autofill data
 */
export function setupAutofillSuggestions(): void {
  // Enable browser autofill by ensuring proper autocomplete attributes
  const nameFields = document.querySelectorAll('input[autocomplete*="name"]');
  const emailFields = document.querySelectorAll('input[autocomplete="email"]');
  const phoneFields = document.querySelectorAll('input[autocomplete="tel"]');

  // Add focus listeners to suggest filling from autofill
  nameFields.forEach(field => {
    field.addEventListener('focus', () => {
      console.log('Name field focused - browser autofill should be available');
    });
  });

  emailFields.forEach(field => {
    field.addEventListener('focus', () => {
      console.log('Email field focused - browser autofill should be available');
    });
  });

  phoneFields.forEach(field => {
    field.addEventListener('focus', () => {
      console.log('Phone field focused - browser autofill should be available');
    });
  });
}

/**
 * Get smart suggestions button for manual triggering
 */
export function createSuggestionsButton(onSuggestions: (suggestions: ProfileSuggestions) => void) {
  return {
    label: "Auto-fill from device",
    onClick: async () => {
      const suggestions = await getDeviceProfileSuggestions();
      onSuggestions(suggestions);
    }
  };
}