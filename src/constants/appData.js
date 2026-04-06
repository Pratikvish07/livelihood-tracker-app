// Geofencing Configuration - Define allowed locations for CRP/SHG login
export const GEOFENCE_LOCATIONS = [
  
];

// Default geofence center (fallback location)
export const DEFAULT_LOCATION = {
  latitude: 0,
  longitude: 0,
  radiusMeters: 0
};

// Geofence validation settings
export const GEOFENCE_SETTINGS = {
  enabled: true,
  requireLocationOnLogin: true,
  maxDistanceMeters: 10000, // 10km max from assigned block
  showMapOnLogin: true
};

export const LANGUAGE_OPTIONS = [
  { name: "English", nativeName: "English", code: "en" },
  { name: "Hindi", nativeName: "हिंदी", code: "hi" },
  { name: "Tamil", nativeName: "தமிழ்", code: "ta" },
  { name: "Telugu", nativeName: "తెలుగు", code: "te" },
  { name: "Bengali", nativeName: "বাংলা", code: "bn" },
  { name: "Marathi", nativeName: "मराठी", code: "mr" },
  { name: "Gujarati", nativeName: "ગુજરાતી", code: "gu" },
  { name: "Kannada", nativeName: "ಕನ್ನಡ", code: "kn" },
  { name: "Malayalam", nativeName: "മലയാളം", code: "ml" },
  { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", code: "pa" }
];
export const LANGUAGES = LANGUAGE_OPTIONS.map((item) => item.name);
export const BLOCKS = [];
export const VILLAGES = [];

export const ROLE_CARDS = {};

export const MOCK_SHGS = [];
