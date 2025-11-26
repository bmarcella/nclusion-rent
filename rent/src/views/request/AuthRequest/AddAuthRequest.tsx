/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/Button"
import Dialog from '@/components/ui/Dialog'
import { useState } from "react"
import type { MouseEvent } from 'react'
import AuthRequestForm from "./AuthRequestForm"
import useTimeOutMessage from "@/utils/hooks/useTimeOutMessage"
import { useSessionUser } from "@/store/authStore"
import { AuthRequest } from "../entities/AuthRequest"
import { AuthRequestDoc } from "@/services/Landlord"
import { addDoc, updateDoc } from "@firebase/firestore"
import { Alert } from "@/components/ui/Alert"

export const AddAuthRequest = ( { newRuleAdd } : any ) => {

    const [dialogIsOpen, setIsOpen] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);
    const [message, setMessage] = useTimeOutMessage()
    const [alert, setAlert] = useState("success") as any;
    const { userId } = useSessionUser((state) => state.user);
    const openDialog = () => {
        setIsOpen(true)
    }
    const onDialogClose = (e: MouseEvent) => {
        setIsOpen(false)
    }


    const onSubmitForm = async  (data: any) => {
         console.log(data);
      
         setSubmitting(true);
            try {
              const request = {
                ...data,
                created_by: userId,
                created_at: new Date(),
                updated_by: userId,
                updated_at: new Date()
              } as Partial<AuthRequest>;
              //console.log(request);
              const docRef = await addDoc(AuthRequestDoc, request);
              await updateDoc(docRef, { id: docRef.id });
              newRuleAdd();
              setMessage("Réglément enregistré avec success");
              setAlert("success")
              setTimeout(() => setSubmitting(false), 1000);
            } catch (error) {
              console.error("Error adding document: ", error);
              setMessage("Erreur lors de l'enregistrement de la requete");
              setAlert("danger")
            }
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
            {message && (
                <Alert showIcon className="mb-4" type={alert}>
                <span className="break-all">{message}</span>
                </Alert>
            )}
            <h5 className="mb-4">Nouvelle Réglément</h5>
                
            <AuthRequestForm onSubmitForm={onSubmitForm}></AuthRequestForm>
                 
        </Dialog>
    </>)
}