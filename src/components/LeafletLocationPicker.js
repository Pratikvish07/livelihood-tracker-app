import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Modal, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';

export default function LeafletLocationPicker({ 
  visible, 
  onClose, 
  onLocationSelected,
  initialLatitude,
  initialLongitude 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');

  useEffect(() => {
    if (visible) {
      setSelectedLocation(null);
      setLocationStatus('idle');
    }
  }, [visible]);

  const getBrowserLocation = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setSelectedLocation(newLocation);
            setLocationStatus('captured');
            onLocationSelected(newLocation);
            onClose();
            resolve();
          },
          (error) => {
            console.log('Browser geolocation error:', error);
            setLocationStatus('error');
            setIsLoading(false);
            resolve();
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        setLocationStatus('error');
        setIsLoading(false);
        resolve();
      }
    });
  };

  const handleGPSLocation = useCallback(async () => {
    setIsLoading(true);
    setLocationStatus('fetching');
    
    try {
      // First try Expo Location
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        // Try browser geolocation as fallback
        if (Platform.OS === 'web') {
          await getBrowserLocation();
          return;
        }
        Alert.alert('Permission Denied', 'Location permission is required');
        setLocationStatus('denied');
        setIsLoading(false);
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
      
      setSelectedLocation(newLocation);
      setLocationStatus('captured');
      
      // Auto close after getting location
      setTimeout(() => {
        onLocationSelected(newLocation);
        onClose();
      }, 500);
      
    } catch (error) {
      console.error('Error getting location:', error);
      // Try browser geolocation on web
      if (Platform.OS === 'web') {
        await getBrowserLocation();
      } else {
        Alert.alert('Error', 'Could not get current location');
        setLocationStatus('error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [onLocationSelected, onClose]);

  const handleUseDefaultLocation = useCallback(() => {
    const defaultLocation = {
      latitude: 23.9045,
      longitude: 87.5245
    };
    setSelectedLocation(defaultLocation);
    setLocationStatus('captured');
    onLocationSelected(defaultLocation);
    onClose();
  }, [onLocationSelected, onClose]);

  const handleManualConfirm = useCallback(() => {
    if (selectedLocation) {
      onLocationSelected(selectedLocation);
      onClose();
    } else {
      handleUseDefaultLocation();
    }
  }, [selectedLocation, onLocationSelected, onClose, handleUseDefaultLocation]);

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Get Your Location</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>X</Text>
          </Pressable>
        </View>
        
        <View style={styles.content}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1e3a8a" />
              <Text style={styles.loadingText}>Getting your location...</Text>
            </View>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>📍</Text>
              </View>
              
              <Text style={styles.subtitle}>
                Tap below to get your current GPS location
              </Text>

              {locationStatus === 'captured' && selectedLocation && (
                <View style={styles.successBox}>
                  <Text style={styles.successTitle}>Location Captured!</Text>
                  <Text style={styles.successCoords}>
                    {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                  </Text>
                </View>
              )}

              <Pressable style={styles.gpsButton} onPress={handleGPSLocation}>
                <Text style={styles.gpsButtonIcon}>📡</Text>
                <Text style={styles.gpsButtonText}>Get GPS Location</Text>
              </Pressable>

              <Pressable style={styles.defaultButton} onPress={handleUseDefaultLocation}>
                <Text style={styles.defaultButtonText}>Use Default Location</Text>
              </Pressable>
            </>
          )}
        </View>
        
        <View style={styles.footer}>
          <Pressable style={styles.confirmButton} onPress={handleManualConfirm}>
            <Text style={styles.confirmButtonText}>Confirm & Continue</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  title: { fontSize: 18, fontWeight: '800', color: '#1e3a8a' },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 16, fontWeight: '700', color: '#64748b' },
  content: { flex: 1, padding: 20, alignItems: 'center' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#64748b', fontWeight: '600' },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  icon: { fontSize: 50 },
  subtitle: { fontSize: 16, color: '#334155', textAlign: 'center', marginBottom: 20, fontWeight: '500' },
  successBox: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#86efac', borderRadius: 12, padding: 16, marginBottom: 20, width: '100%', alignItems: 'center' },
  successTitle: { fontSize: 16, fontWeight: '700', color: '#15803d', marginBottom: 4 },
  successCoords: { fontSize: 14, fontWeight: '600', color: '#166534' },
  gpsButton: { backgroundColor: '#1e3a8a', borderRadius: 12, paddingVertical: 18, paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', gap: 12, width: '100%', marginBottom: 12 },
  gpsButtonIcon: { fontSize: 22 },
  gpsButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '700' },
  defaultButton: { backgroundColor: '#64748b', borderRadius: 10, paddingVertical: 14, width: '100%', marginBottom: 16 },
  defaultButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  footer: { padding: 16, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  confirmButton: { backgroundColor: '#15803d', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  confirmButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});
