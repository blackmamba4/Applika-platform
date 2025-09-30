// lib/header-visibility.ts
// Client-side utility for managing header element visibility preferences

export interface HeaderVisibilityPreferences {
  showContactInfo: boolean;
  showRecipientInfo: boolean;
  showCompanyInfo: boolean;
  showDate: boolean;
}

const HEADER_VISIBILITY_KEYS = {
  showContactInfo: 'coverLetter_showContactInfo',
  showRecipientInfo: 'coverLetter_showRecipientInfo', 
  showCompanyInfo: 'coverLetter_showCompanyInfo',
  showDate: 'coverLetter_showDate'
} as const;

// Get header visibility preferences from localStorage
export const getHeaderVisibilityPreferences = (): HeaderVisibilityPreferences => {
  if (typeof window === 'undefined') {
    // Server-side: return default values
    return {
      showContactInfo: false,
      showRecipientInfo: false,
      showCompanyInfo: false,
      showDate: false,
    };
  }

  return {
    showContactInfo: getStoredPreference('showContactInfo'),
    showRecipientInfo: getStoredPreference('showRecipientInfo'),
    showCompanyInfo: getStoredPreference('showCompanyInfo'),
    showDate: getStoredPreference('showDate'),
  };
};

// Get a single preference from localStorage
const getStoredPreference = (key: keyof typeof HEADER_VISIBILITY_KEYS): boolean => {
  try {
    const stored = localStorage.getItem(HEADER_VISIBILITY_KEYS[key]);
    return stored ? JSON.parse(stored) : false;
  } catch {
    return false;
  }
};

// Set a single preference in localStorage
export const setHeaderVisibilityPreference = (
  key: keyof typeof HEADER_VISIBILITY_KEYS, 
  value: boolean
): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(HEADER_VISIBILITY_KEYS[key], JSON.stringify(value));
  } catch {
    // Silently fail if localStorage is not available
  }
};

// Apply header visibility preferences to meta object
export const applyHeaderVisibilityPreferences = <T extends HeaderVisibilityPreferences>(
  meta: T
): T => {
  const preferences = getHeaderVisibilityPreferences();
  
  return {
    ...meta,
    ...preferences,
  };
};
