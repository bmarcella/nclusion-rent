/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Steps } from '@/components/ui/Steps';
import Alert from '@/components/ui/Alert';
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage';
import CreateRequestForm from './CreateRequestForm';
import ImageReq from '../ImageReq';
import { RequestType } from '../../entities/AuthRequest';

interface Props {
  typeRequest : RequestType 
}

function RequestForm({ typeRequest } : Props) {

  const [step, setStep] = useState(0);
  const [message] = useTimeOutMessage();
  const [req] = useState<any>();
  const [alert] = useState("success") as any;

  const nextStep = () => {
    setStep((prev) => prev + 1);
  }
  return (
    <>
      <Steps current={step}>
        <Steps.Item title={"Ajouter requête pour " + typeRequest.label} />
      </Steps>
      
      {message && (
        <Alert showIcon className="mb-4" type={alert}>
          <span className="break-all">{message}</span>
        </Alert>
      )}
      <div className="justify-center rounded p-4">
        {step === 0 && (<CreateRequestForm typeRequest={typeRequest} />)}
        {step === 1 && req && req.id && (<ImageReq nextStep={(): void => {
          nextStep();
        }} reqId={req.id} />)}
      </div>
    </>

  )
}

export default RequestForm