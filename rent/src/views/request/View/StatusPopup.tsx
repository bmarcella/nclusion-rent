/* eslint-disable @typescript-eslint/no-explicit-any */

import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import { useState } from 'react';

function StatusPopup( { id,  Ok , title= "Voulez-vous vraiment supprimer ceci ?", desc="" ,  btnText = undefined }: any) {
    const [ynOpen, setYnOpen] = useState(false); 
            const openDialogYON = () => { 
                setYnOpen(true);
            }
            const onDialogCloseYON  = () => {
                setYnOpen(false);
            }
            const onOk = () => {
                Ok(id);
                setYnOpen(false);
            }
  return (
    <>
        <Button variant="solid"   onClick={() => openDialogYON()}  className="col-end-1 col-span-2 m-2 bg-red-500 hover:text-black-800 dark:hover:bg-red-600 hover:bg-red-300 border-0 hover:ring-0">
           { btnText ? btnText : "" }
        </Button>   

        <Dialog
            isOpen={ynOpen}
            onClose={onDialogCloseYON}
            onRequestClose={onDialogCloseYON}
        >
            <h5 className="mb-4">{ title }</h5>
            <p>
                { desc }
            </p>
            <div className="text-right mt-6">
                <Button
                    className="ltr:mr-2 rtl:ml-2"
                    variant="plain"
                    onClick={onDialogCloseYON}
                >
                    Non
                </Button>
                <Button variant="solid" onClick={onOk}>
                    Oui
                </Button>
            </div>
        </Dialog>
    </>
  )
}

export default StatusPopup