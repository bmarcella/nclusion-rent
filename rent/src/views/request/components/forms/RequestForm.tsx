import React, { useState } from 'react'
import { Steps } from '@/components/ui/Steps';
import Alert from '@/components/ui/Alert';
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage';
import CreateRequestForm from './CreateRequestForm';
import ImageReq from '../ImageReq';

function RequestForm() {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useTimeOutMessage();
  const [req, setReq] = useState<any>();
  const [alert, setAlert] = useState("success") as any;

  const nextStep = () => {
    setStep((prev) => prev + 1);
  }
  return (
    <>
      <Steps current={step}>
        <Steps.Item title={"Ajouter"} />
      </Steps>
      {message && (
        <Alert showIcon className="mb-4" type={alert}>
          <span className="break-all">{message}</span>
        </Alert>
      )}
      <div className="justify-center rounded p-4">
        {step === 0 && (<CreateRequestForm />)}
        {step === 1 && req && req.id && (<ImageReq nextStep={(step: number, data: any): void => {
          nextStep();
        }} reqId={req.id} />)}
      </div>
    </>

  )
}

export default RequestForm