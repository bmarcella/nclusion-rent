/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from 'react'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage';
import Alert from '@/components/ui/Alert';
import RentDetails from './RentDetails';
import { getBankDoc } from '@/services/Landlord';
import { Timestamp, updateDoc } from 'firebase/firestore';
import InfoBank from './InfoBank';
import DemoDetails from './DemoDetails';
import SecurityDetails from './SecDetails';
import { Bank, getEmptyPartialBank } from '@/views/Entity';
import RenovationDetails from './RenovDetails';
import UploadImgBank from './ImageBank';
import { useSessionUser } from '@/store/authStore';
import CommentsBank from './CommentsBank';
import EndBank from './EndBank';
import useTranslation from '@/utils/hooks/useTranslation';



const BankForm = () => {
  const [step, setStep] = useState(0);
  const [docRef, setDocRef] = useState<Bank>() as any;
  const [message, setMessage] = useTimeOutMessage();
  const [alert, setAlert] = useState("success") as any;
  const topRef = useRef<HTMLDivElement>(null);
  const { userId } = useSessionUser((state) => state.user);
  const [bankInfo, setBankInfo] = useState<Partial<Bank>>(getEmptyPartialBank());
  const { t } = useTranslation();

  
  if (!navigator.geolocation) {
    setMessage("Geolocation is not supported by your browser.");
    setAlert("danger");
    return;
  }

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const onRestart = () => {
    setStep(0);
    setDocRef(undefined);
    setBankInfo(getEmptyPartialBank());
  }

  const onChange = (nextStep: number) => {
    if (nextStep < 0) {
        setStep(0)
    } else if (nextStep > 7) {
        setStep(7)
    } else {
        setStep(nextStep)
    }
}

const onNext = () => onChange(step + 1);
 const stepKey =  [
  "bank",
  "bail",
  "demographie",
  "securite",
  "renovation",
  "images",
  "commentaires",
  "termine"
]

const update = async (data: any)  => {
    return new Promise((resolve, reject) => {
      const docRefs = getBankDoc(docRef.id) as any;
      updateDoc(docRefs, data).then((d: any) => {
      setMessage("Informations saved successfully.");
      setAlert("success");
      scrollToTop();
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


const nextStep = async (step: number, data: any ) => {
  let payload: any = { updateBy: userId, uploadedAt: Timestamp.now()};
  scrollToTop();
  try {
    switch (step) {
      case 1:
         await setDocRef(data);
        break;
      case 2:
        payload = { rentDetails: data, ...payload };
        break;
      case 3:
        payload = { demoDetails: data, ...payload };
        break;
      case 4:
        payload = { securityDetails: data, ...payload };
        break;
      case 5:
        payload = { renovationDetails: data, ...payload };
        break;
      case 6:
          setMessage("Images saved successfully.");
          setAlert("success");
        break;
      case 7:
          setMessage("Comment saved successfully.");
          setAlert("success");
        break;
      default:
        console.warn(`Unhandled step: ${step}`);
      return;
    }

    if (Object.keys(payload).length > 0 &&  step!= 1) {
      await update(payload);
      setDocRef((prev: any) => ({ ...prev, ...payload }));
      console.log(`Document updated with ID: ${docRef.id}`, docRef);
    }
    onNext();
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
<div ref={topRef} className="  justify-center rounded p-4">
  {/* Steps Header */}
  <div className="grid grid-flow-row auto-rows-max gap-4 mb-2 pl-4 pb-2 pr-4">
     <h5 className='w-full' title={t(`steps.${stepKey[step]}`)}> {t(`common.addBank`)} - {t(`steps.stepName`)} {step+1} - {t(`steps.${stepKey[step]}`)} </h5>
      {message && (
        <Alert showIcon className="mt-6 w-full block" type={alert}>
          <span className="break-all">{message}</span>
        </Alert>
      )}
  </div>

  {/* Main Content */}

    <div className="pr-4 pl-4">
      {step === 0 && (
        <InfoBank
          nextStep={nextStep}
          defaultValues={bankInfo}
          userId={userId || ''}
          onError={onError}
        />
      )}
      {step === 1 && (
        <RentDetails
          nextStep={nextStep}
          defaultValues={docRef.rentDetails}
        />
      )}
      {step === 2 && (
        <DemoDetails
          nextStep={nextStep}
          defaultValues={docRef.demoDetails}
        />
      )}
      {step === 3 && (
        <SecurityDetails
          nextStep={nextStep}
          defaultValues={docRef.securityDetails}
        />
      )}
      {step === 4 && (
        <RenovationDetails
          nextStep={nextStep}
          defaultValues={docRef.renovationDetails}
        />
      )}
      {step === 5 && docRef.id && (
        <UploadImgBank
          bankId={docRef.id}
          nextStep={nextStep}
          userId={userId || ''}
        />
      )}
      {step === 6 && docRef.id && (
        <CommentsBank
          bankId={docRef.id}
          nextStep={nextStep}
          userId={userId || ''}
        />
      )}
      {step === 7 && docRef.id && <EndBank onRestart={onRestart} />}
    </div>

</div>


    </>
  );
}

export default BankForm
