import React, { useState } from 'react';
import { GoogleMap, Marker, useLoadScript, InfoWindow } from '@react-google-maps/api';
import { BankImage } from './components/ImageGallery';
import Currency from '@/views/shared/Currency';

export interface Location {
  lat: number;
  lng: number;
  name: string;
  state ?: string;
  price?: string;
  imageUrls?: BankImage[]; // Changed to list of images
}

interface GoogleMapWithMarkersProps {
  locations: Location[];
  mapContainerStyle?: React.CSSProperties;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const defaultContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '800px',
};

const GoogleMapWithMarkers: React.FC<GoogleMapWithMarkersProps> = ({
  locations,
  mapContainerStyle = defaultContainerStyle,
  center,
  zoom = 12,
}) => {

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_APIKEY,
  });

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const defaultCenter = center || (locations.length > 0 ? { lat: locations[0].lat, lng: locations[0].lng } : { lat: 0, lng: 0 });
  const getMarkerColor = (state?: string) => {
    console.log("state", state)
    switch (state) {
      case 'bankSteps.readyToUse':
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'bankSteps.rejected':
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
      case 'bankSteps.needApproval':
      case 'bankSteps.needApprobation':
      case 'bankSteps.needContract':
      case 'bankSteps.needRenovation':
        return 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png';
      case 'bankSteps.pending':
        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'bankSteps.notProceeded':
        return 'http://maps.google.com/mapfiles/ms/icons/grey-dot.png';
      default:
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'; // default color
    }
  };
  
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
         icon={{
           url: getMarkerColor(loc.state),
           scaledSize: new window.google.maps.Size(40, 40),
         }}
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
                {selectedLocation.imageUrls.map((image, idx) => (
                  <img
                    key={idx}
                    src={image.imageUrl}
                    alt={`${selectedLocation.name}-${idx}`}
                    style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                  />
                ))}
              </div>
            )}
            <h3 style={{ margin: '0 0 4px 0' }}>{selectedLocation.name}</h3>
            {selectedLocation.price && <p style={{ margin: 0, fontWeight: 'bold' }}>
                <Currency amount= {selectedLocation.price} />
                </p> }
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default GoogleMapWithMarkers;
