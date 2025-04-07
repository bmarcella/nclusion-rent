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
      label: "Besoin de validations",
      title: "Validation requise",
      description: "La banque nécessite une validation avant de passer à l'étape suivante."
    },
    {
      key: "bankSteps.needApprobation",
      label: "Besoin d'approbations",
      title: "Approbation requise",
      description: "La banque attend une approbation officielle."
    },
    {
      key: "bankSteps.needContract",
      label: "Besoin de contrat",
      title: "Contrat requis",
      description: "La banque a besoin de signer un contrat pour continuer le processus."
    },
    {
      key: "bankSteps.needRenovation",
      label: "Besoin de rénovation",
      title: "Rénovation requise",
      description: "La banque nécessite des rénovations avant d’être opérationnelle."
    },
    {
      key: "bankSteps.readyToUse",
      label: "Prêt à l'emploi",
      title: "Banque prête",
      description: "La banque est prête à être utilisée."
    },
    {
      key: "bankSteps.rejected",
      label: "Rejeté",
      title: "Banque rejetée",
      description: "La banque a été rejetée et nécessite une approbation."
    },
    {
      key: "bankSteps.pending",
      label: "En attente",
      title: "Banque en attente",
      description: "La banque est en attente d'approbation."
    },
    {
      key: "bankSteps.notProceeded",
      label: "Non traité",
      title: "Banque non traitée",
      description: "La banque n'a pas encore été traitée dans le système."
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