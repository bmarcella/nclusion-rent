import { Button } from "@/components/ui/Button"
import Dialog from '@/components/ui/Dialog'
import { useState } from "react"
import type { MouseEvent } from 'react'
import AuthRequestForm from "./AuthRequestForm"

export const AddAuthRequest = () => {

    const [dialogIsOpen, setIsOpen] = useState(false)

    const openDialog = () => {
        setIsOpen(true)
    }

    const onDialogClose = (e: MouseEvent) => {
        console.log('onDialogClose', e)
        setIsOpen(false)
    }

    const onDialogOk = (e?: MouseEvent) => {
        setIsOpen(false)
    }
    const onSubmitForm = (data: any) => {
        setIsOpen(false);
    }

    return (<>
        <Button variant="solid" onClick={() => openDialog()}>
            Ajouter Réglément
        </Button>

        <Dialog
            isOpen={dialogIsOpen}
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
        >
            <h5 className="mb-4">Nouvelle Réglément</h5>
            <AuthRequestForm onSubmitForm={onSubmitForm}></AuthRequestForm>
            {/* <div className="text-right mt-6">
                <Button
                    className="ltr:mr-2 rtl:ml-2"
                    variant="plain"
                    onClick={onDialogClose}
                >
                    Cancel
                </Button>
                <Button variant="solid" onClick={onDialogOk}>
                    Okay
                </Button>
            </div> */ }
        </Dialog>
    </>)
}