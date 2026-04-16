// components/MyMap.tsx
import React from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const containerStyle = {
    width: '100%',
    height: '400px',
}

interface MyMapProps {
    position: { lat: number; lng: number }
}

const GoogleMapAppV2: React.FC<MyMapProps> = ({ position }) => {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_APIKEY,
         mapIds: [import.meta.env.VITE_GOOGLE_MAP_ID],
    })

    if (!isLoaded) return <div>Loading Map...</div>

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={position}
            zoom={13}
        >
            <Marker position={position} />
        </GoogleMap>
    )
}

export default GoogleMapAppV2