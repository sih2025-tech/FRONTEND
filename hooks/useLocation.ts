import { useState, useCallback } from 'react';
import { locationService, LocationServiceOptions } from '@/services/locationService';

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async (options?: LocationServiceOptions): Promise<GeolocationPosition | null> => {
    if (!locationService.isSupported()) {
      setError('Geolocation not supported');
      return null;
    }

    setIsRequesting(true);
    setError(null);

    try {
      const position = await locationService.getCurrentPosition(options);
      setCurrentLocation(position);
      return position;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get location';
      setError(errorMessage);
      console.error('Location error:', err);
      return null;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setCurrentLocation(null);
    setError(null);
    locationService.clearCache();
  }, []);

  const getCachedLocation = useCallback(() => {
    return locationService.getCachedPosition();
  }, []);

  return {
    currentLocation,
    isRequesting,
    error,
    requestLocation,
    clearLocation,
    getCachedLocation,
    isSupported: locationService.isSupported()
  };
};
