// components/MyMap.tsx
import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import React, { useState } from "react";
import GoogleMapApp from "./Map";
import { Bank } from "@/views/Entity";


interface MyMapProps {
    bank: Bank;
}

const MapPopup: React.FC<MyMapProps> = ({ bank }) => {
    
  const [dialogIsOpen, setIsOpen] = useState(false)

  const openDialog = () => {
      setIsOpen(true)
  }

  const onDialogClose = () => {
      setIsOpen(false)
  }


  return (
      <div>
            <a
            className="cursor-pointer text-blue-700 hover:text-blue-400 hover:underline"
            onClick={() => openDialog()}
          >
            {bank.city}
             </a>
          <Dialog
              isOpen={dialogIsOpen}
              onClose={onDialogClose}
              onRequestClose={onDialogClose}
          >
              <h5 className="mb-4"> { bank.bankName }</h5>
              <GoogleMapApp position={bank.location}></GoogleMapApp>
              <div className="text-right mt-6">
                  <Button
                      className="ltr:mr-2 rtl:ml-2"
                      variant="plain"
                      onClick={onDialogClose}
                  >
                      Fermer
                  </Button>
    
              </div>
          </Dialog>
      </div>
  )
};

export default MapPopup;
