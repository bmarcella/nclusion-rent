/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BankStep, ListABankSteps } from "@/views/Entity";
import TableBank from "./components/TableBank";
import Tabs from "@/components/ui/Tabs";
import TabList from "@/components/ui/Tabs/TabList";
import TabContent from "@/components/ui/Tabs/TabContent";
import TabNav from "@/components/ui/Tabs/TabNav";
import { hasAuthority } from "@/utils/RoleChecker";
import { useSessionUser } from "@/store/authStore";
import { useMemo } from "react";
import { TableBanks } from './components/TableBanks';

export const ShowNeedApprovalBankBase= () => {
 const { userId, authority} = useSessionUser((state) => state.user);
  // is coordonanteur agent  imobilier 
  const is_coordonator_agent_immobilier = useMemo(()=> {
     return hasAuthority(authority, "coordonator_agent_immobilier");
  } ,[authority]) 
  return (
    <div>

       { !is_coordonator_agent_immobilier &&  
       <Tabs defaultValue={'all'} className="w-full">
                <TabList>
                  <TabNav key={'all'} value={'all'}>Tout</TabNav>
                   { ListABankSteps.map((step, index)=>(<TabNav key={index} value={step.key}>{step.label}</TabNav>) )  }
                </TabList>

                <TabContent value={'all'}>
                       <TableBank all={true} /> 
                </TabContent>

                { ListABankSteps.map((step, index)=>( 
                  <div key={index}>
                    <TabContent value={step.key}>
                       <TableBank step={ step.key as BankStep} key={step.key} />
                    </TabContent>
                </div>)) }
        </Tabs> }
        { is_coordonator_agent_immobilier &&  
             <Tabs defaultValue={'all'} className="w-full">
                <TabList>
                  <TabNav  value={'all'}>Besoins de validations</TabNav>
                  <TabNav value={'tab1'}>Déja Validé</TabNav>
                </TabList>
                <TabContent value={'all'}>
                       <TableBank step={'bankSteps.needApproval'}   /> 
                </TabContent>
                  <TabContent value={'tab1'}>
                       <TableBanks step={['bankSteps.needApprobation', 'bankSteps.needContract', 'bankSteps.needRenovation', 'bankSteps.readyToUse']} id={userId}   /> 
                </TabContent>
        </Tabs> }
    </div>
  );
}


const ShowNeedApprovalBank = () => {
    return <ShowNeedApprovalBankBase />
}

export default ShowNeedApprovalBank;

