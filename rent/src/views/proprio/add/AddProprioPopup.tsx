import React, { useState } from 'react'
import AddProprioForm from './components/AddProprioForm'
import Button from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { BiPlus } from 'react-icons/bi'
import { useWindowSize } from '@/utils/hooks/useWindowSize'

export function AddProprioPopup( { done } : any) {
  const [dialogIsOpen, setIsOpen] = useState(false)
  const { width, height} = useWindowSize();

  const openDialog = () => {
      setIsOpen(true)
  }

  const onDialogClose = () => {
      setIsOpen(false)
  }
  return (
    <div>
        <Button variant="solid" onClick={() => openDialog()} icon={<BiPlus/>}>
                
        </Button>
            <Dialog
                isOpen={dialogIsOpen}
                width={width*0.9}
                height={height*0.9}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <div  className="flex flex-col h-full overflow-y-auto" >
                    <AddProprioForm done={done} /> 
                    <div className="text-right mt-6">
                        <Button
                            className="ltr:mr-2 rtl:ml-2"
                            variant="plain"
                            onClick={onDialogClose}
                        >
                            fermer
                        </Button>
                       
                    </div>
                </div>
            </Dialog>
    
    </div>
  )
}

export default AddProprioPopup