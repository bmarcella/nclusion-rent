import { Alert } from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { getBankDoc } from '@/services/Landlord';
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage';
import { updateDoc } from 'firebase/firestore';
import React, { useState } from 'react'

function ChangeLocation({ location, bankId, hide }: { location: string; bankId: string, hide?: boolean }) { 

    const [message, setMessage] = useTimeOutMessage();
    const [alert, setAlert] = useState("success") as any;

    const saveLocation = async () => {
        if (!location || !bankId) {
            setMessage("Impossible de modifier la position de la bank.");
            setAlert("danger");
            return;
        }
        console.log("saveLocation", location, bankId);
        await update({ location });
    }

    const update = async (data: any)  => {
          try  {
          const docRefs = getBankDoc(bankId) as any;
          await updateDoc(docRefs, data);
          setMessage("Position modifiée avec succès.");
          setAlert("success");
          } catch (error) {
              console.error("Error updating document:", error);
              setMessage(error.message);
              setAlert("danger");
          }
    }
  return (
    <div className='flex flex-col items-center justify-center mb-6'>
        { !hide && <h4>Changer de localisation</h4> }
        { !hide && <p>Vous pouvez changer votre localisation en cliquant sur le bouton ci-dessous.</p> }
        { message && !hide &&  (
        <Alert showIcon className="mt-6 w-full block" type={alert}>
          <span className="break-all">{message}</span>
        </Alert>
      )}
        <Button className="btn btn-secondary mt-6" onClick={ () => { saveLocation() }}>Changer de localisation</Button>
    </div>
  )
}

export default ChangeLocation;