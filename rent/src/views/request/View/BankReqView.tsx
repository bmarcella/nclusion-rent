/* eslint-disable @typescript-eslint/no-explicit-any */
import { Tabs } from '@/components/ui/Tabs'
import { getBankImages, getLordImages } from '@/services/firebase/BankService'
import { useSessionUser } from '@/store/authStore'
import CommentsBank from '@/views/bank/add/components/CommentsBank'
import BankInfo from '@/views/bank/show/components/BankInfo'
import RentCostHistory from '@/views/bank/show/components/RentCostHistory'
import ImageGallery, { BankImage } from '@/views/bank/show/components/ImageGallery'
import ImageLordComp, { LordImage } from '@/views/bank/show/components/ImageLord'
import StepHistory from '@/views/bank/show/components/StepHistory'
import GoogleMapWithMarkers from '@/views/bank/show/GoogleMapWithMarkers'
import GoogleMapApp, { useStreetViewAvailable } from '@/views/bank/show/Map'
import { useJsApiLoader } from '@react-google-maps/api'
import { Button } from '@/components/ui'
import { Bank } from '@/views/Entity'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
    const [lImages, setLImages] = useState<LordImage[]>([])
    const { userId } = useSessionUser((state) => state.user)
    const [activeTab, setActiveTab] = useState('comments')
    const { t } = useTranslation()
    useEffect(() => {
        if (!bank.id) return
        getBankImages(bank?.id).then((imgs: BankImage[]) => {
            setImages(imgs)
        })
    }, [bank?.id])

     useEffect(() => {
            if (bank)
                getLordImages(bank.landlord).then((imgs: any[]) => {
                    setLImages(imgs)
                })
        }, [bank]);

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

                {/* Photos */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-2xl font-bold text-pink-600">
                            Photo
                        </h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                            {images.length + lImages.length} fichiers
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Bank Images */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-5  border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        Images des banks
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {images.length} photo
                                        {images.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <ImageGallery
                                    images={images}
                                    userId={userId || ''}
                                    canDelete={false}
                                    showPic={true}
                                />
                            </div>
                        </div>

                        {/* Landlord Documents */}
                        <div className="lg:col-span-1">
                            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-5 border border-indigo-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        Documents propriétaire
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {lImages.length} doc
                                        {lImages.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <ImageLordComp
                                    images={lImages}
                                    userId={userId || ''}
                                    canDelete={false}
                                    showPic={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                 {/* Details & Comments side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                    {/* Details - 2/3 width */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-pink-600">
                                        Details
                                    </h2>
                                    {bank?.step && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                                            {t('bank.' + bank.step)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="p-4">
                                {bank && <BankInfo bank={bank} />}
                                {bank?.rentCostHistory &&
                                    bank.rentCostHistory.length > 0 && (
                                        <div className="mt-6 pt-5 border-t border-gray-200">
                                            <RentCostHistory
                                                history={bank.rentCostHistory}
                                                compact
                                            />
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* Comments & Timeline - 1/3 width */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border border-indigo-100 dark:border-gray-700 overflow-hidden h-full flex flex-col">
                            <Tabs
                                defaultValue="comments"
                                onChange={(val) => setActiveTab(val as string)}
                            >
                                <Tabs.TabList className="px-4 pt-3 border-b border-indigo-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60">
                                    <Tabs.TabNav value="comments">
                                        Commentaires
                                    </Tabs.TabNav>
                                    <Tabs.TabNav value="timeline">
                                        Timeline
                                    </Tabs.TabNav>
                                </Tabs.TabList>
                            </Tabs>
                            <div className="p-4 flex-1 overflow-y-auto max-h-[700px]">
                                {activeTab === 'comments' &&
                                    bank &&
                                    bank.id && (
                                        <CommentsBank
                                            bankId={bank.id}
                                            userId={userId || ''}
                                            isEdit={true}
                                            nextStep={function (
                                                step: number,
                                                data: any,
                                            ): void {
                                                throw new Error(
                                                    'Function not implemented.',
                                                )
                                            }}
                                            only={false}
                                        />
                                    )}
                                {activeTab === 'timeline' &&
                                    bank &&
                                    bank.id && <StepHistory bankId={bank.id} />}
                            </div>
                        </div>
                    </div>
                </div>

        </div>
    )
}

export default BankReqView
