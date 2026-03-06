import GoogleMapApp from '@/views/bank/show/Map';
import { Bank } from '@/views/Entity'
import React from 'react';
interface Props {
    bank : Bank
}
function BankReqView( { bank } : Props) {
  return (
    <div>
     <h2 className="text-2xl font-bold mb-2 text-pink-600">Bank Location</h2>
      {/* Map section */}
      <div className="w-full h-100 mb-6 rounded-lg shadow-lg overflow-hidden">
        { bank && <GoogleMapApp position={bank.location} ></GoogleMapApp> }
      </div>
    </div>
  )
}

export default BankReqView