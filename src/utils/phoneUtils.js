/**
 * Phone number utilities for formatting and validation
 */

/**
 * Format a phone number to (XXX) XXX-XXXX
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number
 */
export function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length > 10) {
    // Handle numbers with country code
    const countryCode = cleaned.slice(0, cleaned.length - 10);
    const areaCode = cleaned.slice(cleaned.length - 10, cleaned.length - 7);
    const firstThree = cleaned.slice(cleaned.length - 7, cleaned.length - 4);
    const lastFour = cleaned.slice(cleaned.length - 4);
    return `+${countryCode} (${areaCode}) ${firstThree}-${lastFour}`;
  }
  
  // Return original value if we can't properly format it
  return phoneNumber;
}

/**
 * Format a phone number for input field (as the user types)
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - Formatted phone number
 */
export function formatPhoneNumberForInput(phoneNumber) {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format while typing
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else {
    // Handle longer numbers with country code
    const countryCode = cleaned.slice(0, cleaned.length - 10);
    const areaCode = cleaned.slice(cleaned.length - 10, cleaned.length - 7);
    const firstThree = cleaned.slice(cleaned.length - 7, cleaned.length - 4);
    const lastFour = cleaned.slice(cleaned.length - 4);
    return `+${countryCode} (${areaCode}) ${firstThree}-${lastFour}`;
  }
}

/**
 * Create a tel: URL from a phone number
 * @param {string} phoneNumber - The phone number
 * @returns {string} - tel: URL for the phone number
 */
export function createPhoneUrl(phoneNumber) {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters for the URL
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Create tel: URL
  return `tel:${cleaned}`;
}

/**
 * Validate a phone number
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
export function isValidPhoneNumber(phoneNumber) {
  if (!phoneNumber) return false;
  
  // Basic validation - at least 10 digits
  const cleaned = phoneNumber.replace(/\D/g, '');
  return cleaned.length >= 10;
}