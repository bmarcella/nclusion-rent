import React, { useState } from 'react';
import { GoogleMap, Marker, useLoadScript, InfoWindow } from '@react-google-maps/api';

interface Location {
  lat: number;
  lng: number;
  name: string;
  price?: string;
  imageUrls?: string[]; // Changed to list of images
}

interface GoogleMapWithMarkersProps {
  locations: Location[];
  apiKey: string;
  mapContainerStyle?: React.CSSProperties;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const defaultContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '400px',
};

const GoogleMapWithMarkers: React.FC<GoogleMapWithMarkersProps> = ({
  locations,
  apiKey,
  mapContainerStyle = defaultContainerStyle,
  center,
  zoom = 10,
}) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
  });

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const defaultCenter = center || (locations.length > 0 ? { lat: locations[0].lat, lng: locations[0].lng } : { lat: 0, lng: 0 });

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={zoom}
    >
      {locations.map((loc, idx) => (
        <Marker 
          key={idx} 
          position={{ lat: loc.lat, lng: loc.lng }} 
          onClick={() => setSelectedLocation(loc)}
        />
      ))}

      {selectedLocation && (
        <InfoWindow
          position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
          onCloseClick={() => setSelectedLocation(null)}
        >
          <div style={{ maxWidth: '220px', overflowY: 'auto', maxHeight: '300px' }}>
            {selectedLocation.imageUrls && selectedLocation.imageUrls.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                {selectedLocation.imageUrls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`${selectedLocation.name}-${idx}`}
                    style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                  />
                ))}
              </div>
            )}
            <h3 style={{ margin: '0 0 4px 0' }}>{selectedLocation.name}</h3>
            {selectedLocation.price && <p style={{ margin: 0, fontWeight: 'bold' }}>{selectedLocation.price}</p>}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default GoogleMapWithMarkers;
