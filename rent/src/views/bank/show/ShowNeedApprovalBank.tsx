/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BankStep } from "@/views/Entity";
import TableBank from "./components/TableBank";
import Tabs from "@/components/ui/Tabs";
import TabList from "@/components/ui/Tabs/TabList";
import TabContent from "@/components/ui/Tabs/TabContent";
import TabNav from "@/components/ui/Tabs/TabNav";

export const ShowNeedApprovalBankBase= () => {
  const bankSteps = [
    {
      key: "bankSteps.needApproval",
      label: "Validation",
      title: "Validation requise",
      description: "La banque nécessite une validation avant de passer à l'étape suivante.",
      authority : []
    },
    {
      key: "bankSteps.needApprobation",
      label: "Approbation",
      title: "Approbation requise",
      description: "La banque attend une approbation officielle.",
      authority : []
    },
    {
      key: "bankSteps.needContract",
      label: "Contrat",
      title: "Contrat requis",
      description: "La banque a besoin de signer un contrat pour continuer le processus.",
      authority : []
    },
    {
      key: "bankSteps.needRenovation",
      label: "Rénovation",
      title: "Rénovation requise",
      description: "La banque nécessite des rénovations avant d’être opérationnelle.",
      authority : []
    },
    {
      key: "bankSteps.readyToUse",
      label: "Disponible",
      title: "Banque prête",
      description: "La banque est prête à être utilisée.",

    },
    {
      key: "bankSteps.rejected",
      label: "Rejeté",
      title: "Banque rejetée",
      description: "La banque a été rejetée et nécessite une approbation.",
      authority : []
    },
    {
      key: "bankSteps.pending",
      label: "Considération",
      title: "Banque en attente",
      description: "La banque est en attente d'approbation.",
      authority : []
    },
    {
      key: "bankSteps.notProceeded",
      label: "Non traité",
      title: "Banque non traitée",
      description: "La banque n'a pas encore été traitée dans le système.",
      authority : []
    }
  ];
  
  return (
    <div>
       <Tabs defaultValue={bankSteps[0].key} className="w-full">
                <TabList>
                   { bankSteps.map((step)=>(<TabNav value={step.key}>{step.label}</TabNav>) )  }
                </TabList>
                { bankSteps.map((step)=>( 
                  <div >
                 
                    <TabContent value={step.key}>
                       <TableBank step={ step.key as BankStep} key={step.key} />
                    </TabContent>
                </div>)) }
            </Tabs>
    </div>
  );
}


const ShowNeedApprovalBank = () => {
    return <ShowNeedApprovalBankBase />
}

export default ShowNeedApprovalBank;