import { getBankImages } from '@/services/firebase/BankService';
import { BankImage } from '@/views/bank/show/components/ImageGallery';
import GoogleMapWithMarkers from '@/views/bank/show/GoogleMapWithMarkers';
import { Bank } from '@/views/Entity'
import { useEffect, useState } from 'react';
interface Props {
    bank : Bank
}
function BankReqView( { bank } : Props) {
     const [images, setImages] = useState<BankImage[]>([])
    useEffect(() => {
               if(!bank.id) return;
               getBankImages(bank?.id).then((imgs: BankImage[]) => {
                   setImages(imgs);
               });
      }, [bank?.id]);
  return (
    <div>
     <h2 className="text-2xl font-bold mb-2 text-pink-600">Bank Location</h2>
      {/* Map section */}
      <div className="w-full h-100 mb-6 rounded-lg shadow-lg overflow-hidden">
        { bank && <GoogleMapWithMarkers locations={[
          {
          name: bank.bankName,
          lat: bank.location.lat,
          lng: bank.location.lng,
          price: bank.final_rentCost.toString(),
          state: bank.step,
           imageUrls : images
          }
        ]} ></GoogleMapWithMarkers> }
      </div>
    </div>
  )
}

export default BankReqView