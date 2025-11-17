/* eslint-disable @typescript-eslint/no-explicit-any */

import { motion } from "framer-motion";
import {  FormProvider } from "react-hook-form";
import { BankRenovationFields, BillFields, CapexFields, LeasePaymentFields, LocomotifFields, OpexFields, TelecomFields, TransportFields, GeneralFields } from "../../entities/RequestComponent";
import {  Button, Card } from '@/components/ui';
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface Props {
    onSubmit : (data: any)=> void;
    methods: any;
    type: string
}

export const ViewReqForm = ( { onSubmit , methods , type } : Props ) => {
 const { t } = useTranslation();
 const [region, setRegion] = useState() as any;
 const {
    handleSubmit,
    formState: { errors, isValid},
  } = methods;

  const newRegionSet = (id_region: number)=>{
     setRegion(id_region);
  }

  console.log(errors)
 

    return (<>
    
    <FormProvider  {...methods}>
                      <motion.form
                      onSubmit={handleSubmit(onSubmit)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mx-auto max-w-5xl space-y-6 p-4"
                      >
        <h1 className="text-2xl font-bold">Money Request Form</h1>
            <GeneralFields t={t} newRegionSet={newRegionSet} />
            {type === "bill" && <BillFields t={t} /> }
            {type === "capex" && <CapexFields t={t} />}
            {type === "locomotif" && <LocomotifFields t={t} />}
            {type === "telecom" && <TelecomFields t={t} />}
            {type === "opex" && <OpexFields t={t} />}
            {type === "transport_logistique" && <TransportFields t={t} region={region} />}
            {type === "bank_renovation" && <BankRenovationFields t={t} />}
            {type === "lease_payment" && <LeasePaymentFields t={t}  />}
            <Card className="p-4">
            <div className="text-sm text-red-600 space-y-1">
                {Object.entries(errors).length > 0 && <div className="font-medium">Please fix the highlighted validation errors above.</div>}
                {Object.entries(errors).length }  { isValid }
            </div>
            </Card>
            <div className="flex items-center gap-3">
                <Button type="submit" disabled={Object.entries(errors).length > 0}>Submit</Button>
            </div>
          </motion.form>
      </FormProvider>

    </>)
}