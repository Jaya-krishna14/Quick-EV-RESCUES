import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationCoords {
  lat: number;
  lng: number;
}

interface LocationContextType {
  coords: LocationCoords | null;
  address: string | null;
  isLocating: boolean;
  locationError: string | null;
  refreshLocation: () => Promise<void>;
  setManualAddress: (address: string) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<LocationCoords | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`/api/geocode?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding failed', error);
      return `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    }
  };

  const refreshLocation = (): Promise<void> => {
    return new Promise((resolve) => {
      setIsLocating(true);
      setLocationError(null);

      if (!('geolocation' in navigator)) {
        setLocationError('Geolocation is not supported by your browser.');
        setIsLocating(false);
        resolve();
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            setCoords({ lat: latitude, lng: longitude });
            const addr = await reverseGeocode(latitude, longitude);
            setAddress(addr);
          } catch (error) {
            console.error('Location processing failed', error);
            setLocationError('Failed to process location data.');
          } finally {
            setIsLocating(false);
            resolve();
          }
        },
        (error) => {
          console.error('Error getting location', error);
          let errorMsg = 'Unable to retrieve location.';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = 'Location permission denied. Please allow access in settings or enter address manually.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = 'Location information is unavailable. Check your GPS signal.';
              break;
            case error.TIMEOUT:
              errorMsg = 'Location request timed out. Please try again.';
              break;
          }
          setLocationError(errorMsg);
          setIsLocating(false);
          // Fallback to Kakinada for demo purposes if location fails
          setCoords({ lat: 16.9891, lng: 82.2475 });
          setAddress("Kakinada, Andhra Pradesh, India");
          resolve();
        },
        options
      );
    });
  };

  const setManualAddress = (newAddress: string) => {
    setAddress(newAddress);
    // When manually setting address, we clear coords as they might not match
    setCoords(null);
  };

  // Optionally auto-locate on mount
  useEffect(() => {
    refreshLocation();
  }, []);

  return (
    <LocationContext.Provider value={{ coords, address, isLocating, locationError, refreshLocation, setManualAddress }}>
      {children}
    </LocationContext.Provider>
  );
};
