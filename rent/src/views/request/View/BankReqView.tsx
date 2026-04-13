import { getBankImages } from '@/services/firebase/BankService'
import { BankImage } from '@/views/bank/show/components/ImageGallery'
import GoogleMapWithMarkers from '@/views/bank/show/GoogleMapWithMarkers'
import GoogleMapApp, { useStreetViewAvailable } from '@/views/bank/show/Map'
import { useJsApiLoader } from '@react-google-maps/api'
import { Button } from '@/components/ui'
import { Bank } from '@/views/Entity'
import { useEffect, useState } from 'react'

interface Props {
    bank: Bank
}
function BankReqView({ bank }: Props) {
    const [images, setImages] = useState<BankImage[]>([])
    const [streetView, setStreetView] = useState(false)
    const { isLoaded: mapsLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_APIKEY,
        mapIds: [import.meta.env.VITE_GOOGLE_MAP_ID],
    })
    const streetViewAvailable = useStreetViewAvailable(bank?.location, mapsLoaded)
    useEffect(() => {
        if (!bank.id) return
        getBankImages(bank?.id).then((imgs: BankImage[]) => {
            setImages(imgs)
        })
    }, [bank?.id])
    return (
        <div>
            <h2 className="text-2xl font-bold mb-2 text-pink-600">
                Bank Location
            </h2>
            {/* Map section */}
            <div className="w-full h-100 mb-6 rounded-lg shadow-lg overflow-hidden">
                {bank && (
                    streetView ? (
                        <GoogleMapApp
                            position={bank.location}
                            streetView={true}
                        />
                    ) : (
                        <GoogleMapWithMarkers
                            locations={[
                                {
                                    name: bank.bankName,
                                    lat: bank.location.lat,
                                    lng: bank.location.lng,
                                    price: bank.final_rentCost.toString(),
                                    state: bank.step,
                                    imageUrls: images,
                                },
                            ]}
                        />
                    )
                )}
            </div>
            {streetViewAvailable && (
                <div className="flex justify-end mb-4">
                    <Button
                        type="button"
                        size="sm"
                        variant="plain"
                        onClick={() => setStreetView(!streetView)}
                    >
                        {streetView ? 'Carte' : 'Street View'}
                    </Button>
                </div>
            )}
        </div>
    )
}

export default BankReqView
