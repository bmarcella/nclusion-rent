/* eslint-disable @typescript-eslint/no-explicit-any */
import { BankStep } from "@/views/Entity";
import TableBank from "../components/TableBank";
import { Navigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import useTranslation from "@/utils/hooks/useTranslation";

export const ShowBankByStepBase = () => {
  const { step } = useParams();
  const [ params , setParams] = useState<any>(step);
  const { t } = useTranslation();
  if (!step) {
     return <Navigate to="/" />;
  }

  useEffect(() => {
    setParams(step);
  }, [step]);

  return (
    <div>
      <h4> { t(`bank.bankSteps.${params}`) }</h4>
      <TableBank key={params} step={`bankSteps.${params}` as BankStep} />
    </div>
  );
};

const ShowBankByStep = () => {
  return <ShowBankByStepBase />;
};

export default ShowBankByStep;
