export interface LocationServiceOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export class LocationService {
  private static instance: LocationService | null = null;
  private currentPosition: GeolocationPosition | null = null;

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  async getCurrentPosition(options?: LocationServiceOptions): Promise<GeolocationPosition> {
    if (!this.isSupported()) {
      throw new Error('Geolocation not supported');
    }

    const defaultOptions: LocationServiceOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      ...options
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentPosition = position;
          resolve(position);
        },
        (error) => {
          reject(error);
        },
        defaultOptions as PositionOptions
      );
    });
  }

  getCachedPosition(): GeolocationPosition | null {
    return this.currentPosition;
  }

  clearCache(): void {
    this.currentPosition = null;
  }
}

export const locationService = LocationService.getInstance();
