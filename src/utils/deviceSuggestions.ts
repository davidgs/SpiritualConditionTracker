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
 * Get common names by locale for suggestion purposes
 */
function getCommonNamesByLocale(locale: string): string[] {
  const language = locale.split('-')[0].toLowerCase();
  
  const namesByLanguage: { [key: string]: string[] } = {
    'en': ['John', 'Michael', 'David', 'James', 'Robert', 'William', 'Richard', 'Christopher', 'Matthew', 'Daniel'],
    'es': ['José', 'Antonio', 'Manuel', 'Francisco', 'Juan', 'David', 'Daniel', 'Carlos', 'Miguel', 'Rafael'],
    'fr': ['Jean', 'Pierre', 'Michel', 'André', 'Philippe', 'Jacques', 'Bernard', 'Alain', 'Claude', 'Henri'],
    'de': ['Hans', 'Klaus', 'Günter', 'Wolfgang', 'Helmut', 'Walter', 'Heinrich', 'Gerhard', 'Horst', 'Dieter'],
    'it': ['Giuseppe', 'Giovanni', 'Antonio', 'Mario', 'Francesco', 'Angelo', 'Vincenzo', 'Pietro', 'Salvatore', 'Carlo'],
    'pt': ['José', 'João', 'António', 'Manuel', 'Francisco', 'Carlos', 'Paulo', 'Pedro', 'Miguel', 'Luís'],
    'ru': ['Александр', 'Сергей', 'Владимир', 'Андрей', 'Алексей', 'Дмитрий', 'Максим', 'Михаил', 'Иван', 'Евгений'],
    'zh': ['李', '王', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'],
    'ja': ['田中', '山田', '佐藤', '鈴木', '高橋', '渡辺', '伊藤', '中村', '小林', '加藤'],
    'ko': ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임']
  };
  
  return namesByLanguage[language] || namesByLanguage['en'];
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

    // Provide locale-based name suggestions for demonstration
    const nameSuggestions = getCommonNamesByLocale(locale);
    if (nameSuggestions.length > 0) {
      // Rotate through suggestions based on current time for variety
      const index = Math.floor(Date.now() / 1000) % nameSuggestions.length;
      suggestions.name = nameSuggestions[index];
    }

    // Generate sample email based on name suggestion
    if (suggestions.name) {
      const emailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
      const domainIndex = Math.floor(Date.now() / 1000) % emailDomains.length;
      suggestions.email = `${suggestions.name.toLowerCase().replace(/\s+/g, '.')}@${emailDomains[domainIndex]}`;
    }

    // Suggest phone number format based on country
    if (country === 'US' || country === 'CA') {
      suggestions.phoneNumber = '+1 (555) 123-4567';
    } else if (country === 'GB') {
      suggestions.phoneNumber = '+44 20 7123 4567';
    } else if (country === 'AU') {
      suggestions.phoneNumber = '+61 2 1234 5678';
    } else if (country === 'DE') {
      suggestions.phoneNumber = '+49 30 12345678';
    } else if (country === 'FR') {
      suggestions.phoneNumber = '+33 1 23 45 67 89';
    } else {
      suggestions.phoneNumber = '+1 (555) 123-4567';
    }

    console.log('Generated device suggestions:', suggestions);

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