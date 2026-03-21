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
  { name: "Hindi", nativeName: "हिन्दी", code: "hi" },
  { name: "Bengali", nativeName: "বাংলা", code: "bn" },
  { name: "Assamese", nativeName: "অসমীয়া", code: "as" },
  { name: "Gujarati", nativeName: "ગુજરાતી", code: "gu" },
  { name: "Kannada", nativeName: "ಕನ್ನಡ", code: "kn" },
  { name: "Kashmiri", nativeName: "कॉशुर", code: "ks" },
  { name: "Konkani", nativeName: "कोंकणी", code: "gom" },
  { name: "Malayalam", nativeName: "മലയാളം", code: "ml" },
  { name: "Manipuri", nativeName: "মৈতৈলোন্", code: "mni-Mtei" },
  { name: "Marathi", nativeName: "मराठी", code: "mr" },
  { name: "Nepali", nativeName: "नेपाली", code: "ne" },
  { name: "Odia", nativeName: "ଓଡ଼ିଆ", code: "or" },
  { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", code: "pa" },
  { name: "Sanskrit", nativeName: "संस्कृतम्", code: "sa" },
  { name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", code: "sat" },
  { name: "Sindhi", nativeName: "सिन्धी", code: "sd" },
  { name: "Tamil", nativeName: "தமிழ்", code: "ta" },
  { name: "Telugu", nativeName: "తెలుగు", code: "te" },
  { name: "Urdu", nativeName: "اردو", code: "ur" },
  { name: "Bodo", nativeName: "बड़ो", code: "brx" },
  { name: "Dogri", nativeName: "डोगरी", code: "doi" },
  { name: "Maithili", nativeName: "मैथिली", code: "mai" }
];
export const LANGUAGES = LANGUAGE_OPTIONS.map((item) => item.name);
export const BLOCKS = [];
export const VILLAGES = [];

export const ROLE_CARDS = {};

export const MOCK_SHGS = [];
