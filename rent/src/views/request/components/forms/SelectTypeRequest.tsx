import React, { useState } from 'react'
import { requestType } from '../../entities/AuthRequest';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Steps from '@/components/ui/Steps';
import useTranslation from '@/utils/hooks/useTranslation';


function SelectTypeRequest() {
  const { t } = useTranslation();
  const [typeReq, setTypeReq] = useState(requestType(t));
  const [step, setStep] = useState(0);
  const cardFooter = (
    <div className="flex">
      <Button size="sm" className="ltr:mr-2 rtl:ml-2">
        Démarrer
      </Button>
    </div>
  )
  return (
    <>
      <Steps current={step}>
        <Steps.Item title={"Selectionner le type de requête"} />
      </Steps>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {typeReq.map((tq) => <Card className='mt-1' key={tq.value}
          header={{
            content: tq.label,
            bordered: false,
          }}
          footer={{
            content: cardFooter,
            bordered: false,
          }}
        >
          <p>
            {tq.description}
          </p>
        </Card>)}
      </div>



    </>

  )
}

export default SelectTypeRequest