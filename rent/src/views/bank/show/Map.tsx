// components/MyMap.tsx
import React, { useEffect, useState } from 'react'
import { GoogleMap, useJsApiLoader, Marker, StreetViewPanorama } from '@react-google-maps/api'

const containerStyle = {
    width: '100%',
    height: '400px',
}

interface MyMapProps {
    position: { lat: number; lng: number }
    streetView?: boolean
    tilt3d?: boolean
}

export const checkStreetViewCoverage = (
    position: { lat: number; lng: number },
): Promise<boolean> => {
    return new Promise((resolve) => {
        const service = new google.maps.StreetViewService()
        service.getPanorama(
            { location: position, radius: 50 },
            (_data, status) => {
                resolve(status === google.maps.StreetViewStatus.OK)
            },
        )
    })
}

export const useStreetViewAvailable = (
    position: { lat: number; lng: number } | null,
    isLoaded: boolean,
) => {
    const [available, setAvailable] = useState(false)
    useEffect(() => {
        if (!position || !isLoaded) {
            setAvailable(false)
            return
        }
        checkStreetViewCoverage(position).then(setAvailable)
    }, [position?.lat, position?.lng, isLoaded])
    return available
}

const GoogleMapApp: React.FC<MyMapProps> = ({ position, streetView = false, tilt3d = false }) => {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_APIKEY,
        mapIds: [import.meta.env.VITE_GOOGLE_MAP_ID],
    })

    if (!isLoaded) return <div>Loading Map...</div>

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={position}
            zoom={tilt3d ? 18 : 15}
            tilt={tilt3d ? 45 : 0}
            options={{
                mapId: import.meta.env.VITE_GOOGLE_MAP_ID,
                streetViewControl: true,
            }}
        >
            <Marker position={position} />
            {streetView && (
                <StreetViewPanorama
                    position={position}
                    visible={true}
                    options={{
                        pov: { heading: 0, pitch: 0 },
                        zoom: 1,
                        addressControl: false,
                        enableCloseButton: true,
                    }}
                />
            )}
        </GoogleMap>
    )
}

export default GoogleMapApp
