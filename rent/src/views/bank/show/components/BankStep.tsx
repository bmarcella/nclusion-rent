import React from "react";
import { useTranslation } from "@/utils/hooks/useTranslation";
import Tooltip from "@/components/ui/Tooltip";
import { formatRelative } from 'date-fns';
import { fr } from 'date-fns/locale';
import UserName from "./UserName";

export const stepColorClassMap: Record<
  string,
  {
    bg: string;
    text: string;
    ring: string;
  }
> = {
  rejected: {
    bg: "bg-red-50",
    text: "text-red-600",
    ring: "ring-red-500/10",
  },
  needApproval: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    ring: "ring-blue-500/10",
  },
  pending: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    ring: "ring-yellow-500/10",
  },
  needApprobation: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    ring: "ring-purple-500/10",
  },
  needAprobation: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    ring: "ring-indigo-500/10",
  },
  needContract: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    ring: "ring-orange-500/10",
  },
  needRenovation: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    ring: "ring-gray-500/10",
  },
  readyToUse: {
    bg: "bg-green-50",
    text: "text-green-600",
    ring: "ring-green-500/10",
  },
  take: {
    bg: "bg-green-50",
    text: "text-green-600",
    ring: "ring-green-500/10",
  },
  doNotTake: {
    bg: "bg-red-50",
    text: "text-red-600",
    ring: "ring-red-500/10",
  },
  needMoreResearch: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    ring: "ring-yellow-500/10",
  },
};

interface BankStepBadgeProps {
  step: string;
  finaldec?: any;
  isAgent? : boolean
}

const BankStepBadge: React.FC<BankStepBadgeProps> = ({ step ,  finaldec = false, isAgent = false }) => {
  const { t } = useTranslation();

  const key = step.replace("bankSteps.", "");
  const color = stepColorClassMap[key] || {
    bg: "bg-gray-50",
    text: "text-gray-600",
    ring: "ring-gray-500/10",
  };
const nkey : any = finaldec ? finaldec.status.replace("finalDecisionStatuses.", "") : false;
const ncolor = stepColorClassMap[nkey] || {
    bg: "bg-gray-50",
    text: "text-gray-600",
    ring: "ring-gray-500/10",
  };
  return (
    <>
     { !isAgent && <div
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset  mb-2 ${color.bg} ${color.text} ${color.ring}`}
    >
      {t(`bank.${step}`)}
    </div> }

   { nkey && 
   (
   
   
    <Tooltip
                             title= {
                                   <div>
                                       Crée le : {' '}
                                       { finaldec.createdAt && (
                                        <strong className="text-green-400">  
                                        {    formatRelative(finaldec?.createdAt.toDate?.() || finaldec.createdAt.createdAt, new Date(), { locale: fr } )  }
                                         </strong>)} <br />
                                        Par : <strong className="text-green-400">{ <UserName userId={finaldec.createdBy}></UserName>}</strong> <br />
                                   </div>
                                   
                               }
                           >
                              <div
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset  mb-2 ${ncolor.bg} ${ncolor.text} ${ncolor.ring}`}
    >
      {t(`bank.${finaldec.status}`)}
    </div>
                           </Tooltip>
   
   
   
  ) }
    { !nkey && <div
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset  mb-4 ${ncolor.bg} ${ncolor.text} ${ncolor.ring}`}
    >
      En cours
    </div> }
    </>
   
  );
};

export default BankStepBadge;
