import React, { useState } from 'react'

interface PrintableMapProps {
    position: { lat: number; lng: number }
    zoom?: number
    width?: number
    height?: number
    mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
    className?: string
}

// Single-image map via Google Static Maps API. Safe for react-to-print:
// one <img> that loads once, no live tiles, no JS SDK, no CORS-blocked
// requests during the print clone.
const PrintableMap: React.FC<PrintableMapProps> = ({
    position,
    zoom = 17,
    width = 640,
    height = 400,
    mapType = 'hybrid',
    className = '',
}) => {
    const [errored, setErrored] = useState(false)
    const apiKey = import.meta.env.VITE_GOOGLE_MAP_APIKEY
    const { lat, lng } = position || { lat: 0, lng: 0 }
    const scale = 2

    const src =
        `https://maps.googleapis.com/maps/api/staticmap` +
        `?center=${lat},${lng}` +
        `&zoom=${zoom}` +
        `&size=${width}x${height}` +
        `&scale=${scale}` +
        `&maptype=${mapType}` +
        `&markers=color:red%7C${lat},${lng}` +
        `&key=${apiKey}`
    if (errored || !apiKey) {
        return (
            <div
                className={`w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 ${className}`.trim()}
            >
                Carte indisponible — {lat.toFixed(5)}, {lng.toFixed(5)}
            </div>
        )
    }
    return (
        <img
            src={src}
            alt={`Carte ${lat},${lng}`}
            onError={() => setErrored(true)}
            className={`w-full h-full object-cover ${className}`.trim()}
        />
    )
}

export default PrintableMap
