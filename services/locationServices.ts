// Location Service for GPS-based weather and market queries
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: {
    village?: string;
    taluka?: string;
    district?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
}

export interface LocationPermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

class LocationService {
  private watchId: number | null = null;
  private lastKnownLocation: LocationData | null = null;
  private locationCallbacks: Set<(location: LocationData) => void> = new Set();

  async getCurrentLocation(options?: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
  }): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        ...options
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          // Try to get address information
          try {
            const address = await this.reverseGeocode(
              locationData.latitude, 
              locationData.longitude
            );
            locationData.address = address;
          } catch (error) {
            console.warn('Reverse geocoding failed:', error);
          }

          this.lastKnownLocation = locationData;
          this.notifyLocationCallbacks(locationData);
          resolve(locationData);
        },
        (error) => {
          console.error('Geolocation error:', error);
          let errorMessage = 'Location access failed';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'स्थान प्रवेश नाकारला गेला / Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'स्थान उपलब्ध नाही / Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'स्थान विनंती वेळ संपली / Location request timed out.';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        defaultOptions
      );
    });
  }

  async checkPermissionStatus(): Promise<LocationPermissionStatus> {
    if (!navigator.permissions) {
      return { granted: false, denied: false, prompt: true };
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      return {
        granted: permission.state === 'granted',
        denied: permission.state === 'denied',
        prompt: permission.state === 'prompt'
      };
    } catch (error) {
      console.error('Permission check failed:', error);
      return { granted: false, denied: false, prompt: true };
    }
  }

  startLocationTracking(callback: (location: LocationData) => void): void {
    if (!navigator.geolocation) {
      throw new Error('Geolocation not supported');
    }

    this.locationCallbacks.add(callback);

    if (this.watchId === null) {
      this.watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };

          // Try to get address information
          try {
            const address = await this.reverseGeocode(
              locationData.latitude, 
              locationData.longitude
            );
            locationData.address = address;
          } catch (error) {
            console.warn('Reverse geocoding failed:', error);
          }

          this.lastKnownLocation = locationData;
          this.notifyLocationCallbacks(locationData);
        },
        (error) => {
          console.error('Location tracking error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // 1 minute
        }
      );
    }
  }

  stopLocationTracking(callback?: (location: LocationData) => void): void {
    if (callback) {
      this.locationCallbacks.delete(callback);
    } else {
      this.locationCallbacks.clear();
    }

    if (this.locationCallbacks.size === 0 && this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private notifyLocationCallbacks(location: LocationData): void {
    this.locationCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Location callback error:', error);
      }
    });
  }

  getLastKnownLocation(): LocationData | null {
    return this.lastKnownLocation;
  }

  private async reverseGeocode(latitude: number, longitude: number): Promise<LocationData['address']> {
    // Use a free geocoding service (Nominatim/OpenStreetMap)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en,mr`,
        {
          headers: {
            'User-Agent': 'KrishiAssistant/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding API error');
      }

      const data = await response.json();
      
      return {
        village: data.address?.village || data.address?.hamlet,
        taluka: data.address?.county || data.address?.state_district,
        district: data.address?.state_district || data.address?.administrative_area_level_2,
        state: data.address?.state,
        country: data.address?.country,
        pincode: data.address?.postcode
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Fallback: Try to determine location from coordinates
      return this.getLocationFromCoordinates(latitude, longitude);
    }
  }

  private getLocationFromCoordinates(latitude: number, longitude: number): LocationData['address'] {
    // Basic coordinate-based location detection for India
    // This is a simplified approach - in production, use proper geocoding
    
    // Maharashtra coordinates range (approximate)
    if (latitude >= 15.6 && latitude <= 22.0 && longitude >= 72.6 && longitude <= 80.9) {
      return {
        state: 'Maharashtra',
        country: 'India'
      };
    }
    
    // General India coordinates
    if (latitude >= 8.0 && latitude <= 37.6 && longitude >= 68.7 && longitude <= 97.25) {
      return {
        country: 'India'
      };
    }

    return {
      country: 'Unknown'
    };
  }

  calculateDistance(
    location1: { latitude: number; longitude: number },
    location2: { latitude: number; longitude: number }
  ): number {
    // Haversine formula to calculate distance between two points
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(location2.latitude - location1.latitude);
    const dLon = this.toRadians(location2.longitude - location1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(location1.latitude)) * 
      Math.cos(this.toRadians(location2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance; // Distance in kilometers
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Get nearby markets based on location
  async getNearbyMarkets(location: LocationData, radiusKm: number = 50): Promise<Array<{
    name: string;
    nameMarathi: string;
    distance: number;
    latitude: number;
    longitude: number;
    type: 'APMC' | 'FPC' | 'Private' | 'Cooperative';
  }>> {
    // Mock data for nearby markets - in production, this would query a real database
    const mockMarkets = [
      {
        name: 'Jalna APMC Market',
        nameMarathi: 'जालना कृषी उत्पादन मार्केट कमिटी',
        latitude: 19.8347,
        longitude: 75.8831,
        type: 'APMC' as const
      },
      {
        name: 'Aurangabad APMC Market',
        nameMarathi: 'औरंगाबाद कृषी उत्पादन मार्केट कमिटी',
        latitude: 19.8762,
        longitude: 75.3433,
        type: 'APMC' as const
      },
      {
        name: 'Parbhani APMC Market',
        nameMarathi: 'परभणी कृषी उत्पादन मार्केट कमिटी',
        latitude: 19.2608,
        longitude: 76.7734,
        type: 'APMC' as const
      },
      {
        name: 'Local FPC Center',
        nameMarathi: 'स्थानिक एफपीसी केंद्र',
        latitude: 19.8500,
        longitude: 75.9000,
        type: 'FPC' as const
      }
    ];

    return mockMarkets
      .map(market => ({
        ...market,
        distance: this.calculateDistance(location, market)
      }))
      .filter(market => market.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  // Format location for display
  formatLocation(location: LocationData, language: 'mr' | 'en' = 'mr'): string {
    if (location.address) {
      const parts = [];
      
      if (language === 'mr') {
        if (location.address.village) parts.push(location.address.village);
        if (location.address.taluka) parts.push(location.address.taluka);
        if (location.address.district) parts.push(location.address.district);
        if (location.address.state) parts.push(location.address.state);
      } else {
        if (location.address.village) parts.push(location.address.village);
        if (location.address.taluka) parts.push(location.address.taluka);
        if (location.address.district) parts.push(location.address.district);
        if (location.address.state) parts.push(location.address.state);
      }

      if (parts.length > 0) {
        return parts.join(', ');
      }
    }

    // Fallback to coordinates
    return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
  }
}

// Singleton instance
export const locationService = new LocationService();