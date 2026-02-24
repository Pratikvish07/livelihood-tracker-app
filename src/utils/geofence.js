import * as Location from "expo-location";
import { metersBetween } from "./location";
import { GEOFENCE_LOCATIONS, GEOFENCE_SETTINGS, DEFAULT_LOCATION } from "../constants/appData";

/**
 * Request location permissions from the user
 * @returns {Promise<boolean>} - Returns true if permission granted
 */
export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted";
}

/**
 * Get current location of the user
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}|null>}
 */
export async function getCurrentLocation() {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || 0
    };
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
}

/**
 * Check if current location is within geofence for given district/block
 * @param {number} currentLat - Current latitude
 * @param {number} currentLon - Current longitude
 * @param {string} district - District name
 * @param {string} block - Block name
 * @returns {object} - Validation result with distance and status
 */
export function validateGeofence(currentLat, currentLon, district, block) {
  if (!GEOFENCE_SETTINGS.enabled) {
    return {
      isValid: true,
      distance: 0,
      message: "Geofencing disabled"
    };
  }

  // Find the district in geofence locations
  const districtData = GEOFENCE_LOCATIONS.find(
    d => d.name.toLowerCase().includes(district.toLowerCase()) || 
         district.toLowerCase().includes(d.id)
  );

  if (!districtData) {
    // If district not found, check against default location
    const distance = metersBetween(
      currentLat, currentLon,
      DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude
    );

    return {
      isValid: distance <= DEFAULT_LOCATION.radiusMeters,
      distance: Math.round(distance),
      message: distance <= DEFAULT_LOCATION.radiusMeters 
        ? "Within allowed area" 
        : `Outside allowed area (${Math.round(distance/1000)}km)`,
      district: null,
      block: null
    };
  }

  // Check if within district radius
  const districtDistance = metersBetween(
    currentLat, currentLon,
    districtData.center.latitude, districtData.center.longitude
  );

  if (districtDistance > districtData.radiusMeters) {
    return {
      isValid: false,
      distance: Math.round(districtDistance),
      message: `Outside ${districtData.name} district (${Math.round(districtDistance/1000)}km)`,
      district: districtData,
      block: null
    };
  }

  // If block specified, check block-level geofence
  if (block) {
    const blockData = districtData.blocks.find(
      b => b.name.toLowerCase() === block.toLowerCase()
    );

    if (blockData) {
      const blockDistance = metersBetween(
        currentLat, currentLon,
        blockData.latitude, blockData.longitude
      );

      return {
        isValid: blockDistance <= blockData.radiusMeters,
        distance: Math.round(blockDistance),
        message: blockDistance <= blockData.radiusMeters
          ? `Within ${blockData.name} block`
          : `Outside ${blockData.name} block (${Math.round(blockDistance/1000)}km)`,
        district: districtData,
        block: blockData
      };
    }
  }

  return {
    isValid: true,
    distance: Math.round(districtDistance),
    message: `Within ${districtData.name} district`,
    district: districtData,
    block: null
  };
}

/**
 * Get all available geofence locations for display
 * @returns {Array} - List of districts with blocks
 */
export function getGeofenceLocations() {
  return GEOFENCE_LOCATIONS.map(district => ({
    id: district.id,
    name: district.name,
    center: district.center,
    radiusKm: Math.round(district.radiusMeters / 1000),
    blocks: district.blocks.map(block => ({
      name: block.name,
      latitude: block.latitude,
      longitude: block.longitude,
      radiusKm: Math.round(block.radiusMeters / 1000)
    }))
  }));
}

/**
 * Calculate distance from current location to target
 * @param {number} currentLat - Current latitude
 * @param {number} currentLon - Current longitude
 * @param {number} targetLat - Target latitude
 * @param {number} targetLon - Target longitude
 * @returns {number} - Distance in meters
 */
export function calculateDistance(currentLat, currentLon, targetLat, targetLon) {
  return metersBetween(currentLat, currentLon, targetLat, targetLon);
}

/**
 * Format distance for display
 * @param {number} meters - Distance in meters
 * @returns {string} - Formatted distance string
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
