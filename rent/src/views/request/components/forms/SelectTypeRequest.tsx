/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { requestType } from '../../entities/AuthRequest';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Steps from '@/components/ui/Steps';
import useTranslation from '@/utils/hooks/useTranslation';
interface Props {
  GetSelected : (tq: any) => void 
}

function SelectTypeRequest( { GetSelected } : Props) {
  const { t } = useTranslation();
  const [typeReq] = useState(requestType(t));
  const [step] = useState(0);
  const cardFooter = (tq: any) => (
    <div className="flex">
      <Button size="sm" className="ltr:mr-2 rtl:ml-2" onClick={()=>{ GetSelected(tq)}}>
        Démarrer
      </Button>
    </div>
  )
  return (
    <>
      <Steps current={step}>
        <Steps.Item title={"Selectionner le type de requête"} />
        <Steps.Item title={"Ajouter requête"} />
      </Steps>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {typeReq.map((tq) => <Card className='mt-1' key={tq.value}
          header={{
            content: tq.label,
            bordered: false,
          }}
          footer={{
            content: cardFooter(tq),
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