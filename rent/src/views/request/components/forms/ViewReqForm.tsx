/* eslint-disable @typescript-eslint/no-explicit-any */

import { motion } from "framer-motion";
import {  FormProvider } from "react-hook-form";
import { BankRenovationFields, BillFields, CapexFields, LeasePaymentFields, LocomotifFields, OpexFields, TelecomFields, TransportFields, GeneralFields, Section } from "../../entities/RequestComponent";
import {  Button, Card } from '@/components/ui';
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface Props {
    onSubmit : (data: any)=> void;
    goBack : () => void;
    methods: any;
    stype: any,

}

export const ViewReqForm = ( { onSubmit , methods , stype, goBack,  } : Props ) => {
 const { t } = useTranslation();
 const [region, setRegion] = useState() as any;
 const {
    handleSubmit,
    formState: { errors, isValid},
  } = methods;
  const type = stype?.key as any;
  const newRegionSet = (id_region: number)=>{
     setRegion(id_region);
  }
 

    return (<>
     <div className=" mx-auto max-w-5xl space-y-6 p-4">
        <div className="flex items-end gap-1 mt-4 ml-4">
                <Button type="submit" onClick={goBack}>retourner</Button>
        </div>
     </div>
          
  
            
          <FormProvider  {...methods}>
                      <motion.form
                      onSubmit={handleSubmit(onSubmit)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mx-auto max-w-5xl space-y-6 p-4"
                      >
           {/* <h1 className="text-2xl font-bold">Money Request Form</h1> */}
            <GeneralFields t={t} newRegionSet={newRegionSet} />
            {type === "bill" && <BillFields t={t} /> }
            {type === "capex" && <CapexFields t={t} />}
            {type === "locomotif" && <LocomotifFields t={t} />}
            {type === "telecom" && <TelecomFields t={t} />}
            {type === "opex" && <OpexFields t={t}  categories={stype.categories} />}
            {type === "transport_logistique" && <TransportFields t={t} region={region} />}
            {type === "bank_renovation" && <BankRenovationFields t={t} />}
            {type === "lease_payment" && <LeasePaymentFields t={t}  />}
            <Card className="p-4">
            <div className="text-sm text-red-600 space-y-1">
                {Object.entries(errors).length > 0 && <div className="font-medium">Please fix the highlighted validation errors above.</div>}
            </div>
            </Card>
            <div className="flex items-center gap-3">
                <Button type="submit" disabled={Object.entries(errors).length > 0}>Envoyer</Button>
            </div>
          </motion.form>
      </FormProvider>

    </>)
}