/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from '@/components/ui';
import { getBankDoc } from '@/services/Landlord';
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage';
import { Bank } from '@/views/Entity';
import { Timestamp, updateDoc } from 'firebase/firestore';
import DemoDetails from '../../add/components/DemoDetails';
import InfoBank from '../../add/components/InfoBank';
import RenovationDetails from '../../add/components/RenovDetails';
import RentDetails from '../../add/components/RentDetails';
import SecurityDetails from '../../add/components/SecDetails';
import { useState } from 'react';

interface Props {
  docRef: Bank;
  id: string;
  onChangeBank: (payload: any, step: number) => void;
  userId: string
}

function EditBank( { docRef , onChangeBank , id , userId} : Props) {
    const [message, setMessage] = useTimeOutMessage()
    const [alert, setAlert] = useState("success") as any;
    const update = async (data: any)  => {
      return new Promise((resolve, reject) => {
        console.log("Bank ID: ", docRef);
        const docRefs = getBankDoc(id);
        console.log("Document Reference: ", docRefs);
        updateDoc(docRefs, data).then((d: any) => {
        setMessage("Informations saved successfully.");
        setAlert("success");
        return resolve(d);
      }).catch ((error) => {
            console.error("Error updating document:", error);
            setMessage(error.message);
            setAlert("danger");
            return reject(error);
        }
      );
    });
  }
  
  type StepData = Record<string, any>;
  
  const nextStep = async (step: number, data: StepData) => {
    console.log(`Step Data (${step}) =>`, data);
    let payload: StepData = {  updateBy: userId, uploadedAt: Timestamp.now()};
    try {
      switch (step) {
        case 1:
          payload = {  
            bankName: data.bankName,
            id_region: data.id_region,
            city: data.city,
            addresse: data.addresse,
            yearCount: data.yearCount,
            date: data.date,
            superficie: data.superficie,
            nombre_chambre: data.nombre_chambre,
            rentCost: data.rentCost,
            final_rentCost: data.final_rentCost,
            reference: data.reference,
            landlord: data.landlord,
            isrefSameAsLandlord: data.isrefSameAsLandlord,
            urgency: data.urgency,
          };
          break;
        case 2:
          payload = { rentDetails: data };
          break;
        case 3:
          payload = { demoDetails: data };
          break;
        case 4:
          payload = { securityDetails: data };
          break;
        case 5:
          payload = { renovationDetails: data };
          break;

        default:
          console.warn(`Unhandled step: ${step}`);
          return;
      }
  
      if (Object.keys(payload).length > 0) {
        await update(payload);
        onChangeBank(payload as any, step);
        console.log(`Document updated with ID: ${docRef.id}`, docRef);
      }
    } catch (error: any) {
      console.error("Error updating document:", error);
      setMessage(error.message);
      setAlert("danger");
    }
  };
   
  
   const onError = (error: any) => {
      console.error("Error:", error);
      setMessage(error.message);
      setAlert("danger");
  }
  return (
    <>
  
       { message && (
                <Alert showIcon className="mb-4 mt-4" type={alert}>
                    <span className="break-all">{message}</span>
                </Alert>
        )}

      <div className=" w-full">
        <InfoBank nextStep={nextStep} defaultValues={docRef} isEdit={true} userId={userId} onError={onError} /> 
        <hr className='mb-4 mt-4'></hr>
        <RentDetails nextStep={nextStep}  defaultValues={docRef.rentDetails} isEdit={true}  />
        <hr className='mb-4 mt-4'></hr>
        <DemoDetails nextStep={nextStep}  defaultValues={docRef.demoDetails} isEdit={true}  />
        <hr className='mb-4 mt-4'></hr>
        <SecurityDetails nextStep={nextStep} defaultValues={docRef.securityDetails} isEdit={true}  />
        <hr className='mb-4 mt-4'></hr>
        <RenovationDetails nextStep={nextStep} defaultValues={docRef.renovationDetails} isEdit={true}  />
        <hr className='mb-4 mt-4'></hr>
        {/* <UploadImgBank/> */}
      </div>
    </>
  )
}

export default EditBank