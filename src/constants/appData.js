// Geofencing Configuration - Define allowed locations for CRP/SHG login
export const GEOFENCE_LOCATIONS = [
  {
    id: "birbhum",
    name: "Birbhum District",
    center: { latitude: 23.8435, longitude: 87.6845 },
    radiusMeters: 50000, // 50km radius for district
    blocks: [
      { name: "Suri-I", latitude: 23.9045, longitude: 87.5245, radiusMeters: 10000 },
      { name: "Suri-II", latitude: 23.9345, longitude: 87.5545, radiusMeters: 10000 },
      { name: "Dubrajpur", latitude: 23.8145, longitude: 87.3845, radiusMeters: 10000 },
      { name: "Manbazar", latitude: 23.6745, longitude: 87.1245, radiusMeters: 10000 }
    ]
  },
  {
    id: "bankura",
    name: "Bankura District",
    center: { latitude: 23.2285, longitude: 87.0635 },
    radiusMeters: 50000,
    blocks: [
      { name: "Bankura-I", latitude: 23.2385, longitude: 87.0735, radiusMeters: 10000 },
      { name: "Bankura-II", latitude: 23.2885, longitude: 87.1135, radiusMeters: 10000 }
    ]
  },
  {
    id: "purulia",
    name: "Purulia District",
    center: { latitude: 23.3325, longitude: 86.3685 },
    radiusMeters: 50000,
    blocks: [
      { name: "Purulia-I", latitude: 23.3425, longitude: 86.3785, radiusMeters: 10000 },
      { name: "Purulia-II", latitude: 23.3925, longitude: 86.4185, radiusMeters: 10000 }
    ]
  }
];

// Default geofence center (fallback location)
export const DEFAULT_LOCATION = {
  latitude: 23.9045,
  longitude: 87.5245,
  radiusMeters: 10000
};

// Geofence validation settings
export const GEOFENCE_SETTINGS = {
  enabled: true,
  requireLocationOnLogin: true,
  maxDistanceMeters: 10000, // 10km max from assigned block
  showMapOnLogin: true
};

export const LANGUAGES = ["English", "Bengali", "Hindi", "Assamese"];
export const BLOCKS = ["All", "Block A", "Block B", "Block C"];
export const VILLAGES = ["All", "Village 1", "Village 2", "Village 3"];

export const ROLE_CARDS = {
  CRP: ["Assigned SHGs", "Total Visits", "Honorarium", "Pending Reports"],
  "Block Admin": ["CRP Coverage", "Pending Validations", "Loan Defaults", "Alerts"],
  "District Admin": ["Block Performance", "Training Status", "Fund Flow", "Risk Flags"],
  "State Admin": ["District Ranking", "Program KPI", "Escalations", "Compliance"]
};

export const MOCK_SHGS = [
  {
    id: "SHG-101",
    name: "Ujjwal Lakshmi SHG",
    members: 14,
    block: "Block A",
    village: "Village 1",
    lastVisit: "2026-02-18",
    status: "Active"
  },
  {
    id: "SHG-102",
    name: "Maa Tara SHG",
    members: 11,
    block: "Block B",
    village: "Village 2",
    lastVisit: "2026-02-16",
    status: "Needs Visit"
  },
  {
    id: "SHG-103",
    name: "Nava Jyoti SHG",
    members: 18,
    block: "Block A",
    village: "Village 3",
    lastVisit: "2026-02-14",
    status: "Active"
  }
];
