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

export const LANGUAGES = [];
export const BLOCKS = [];
export const VILLAGES = [];

export const ROLE_CARDS = {};

export const MOCK_SHGS = [];
