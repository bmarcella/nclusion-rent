/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BankStep, ListBankSteps } from "@/views/Entity";
import TableBank from "./components/TableBank";
import Tabs from "@/components/ui/Tabs";
import TabList from "@/components/ui/Tabs/TabList";
import TabContent from "@/components/ui/Tabs/TabContent";
import TabNav from "@/components/ui/Tabs/TabNav";
import TaskManager from "./components/TaskManager";

export const ShowNeedApprovalBankBase= () => {
 
  
  return (
    <div>
       <Tabs defaultValue={ListBankSteps[0].key} className="w-full">
                <TabList>
                   { ListBankSteps.map((step)=>(<TabNav value={step.key}>{step.label}</TabNav>) )  }
                </TabList>
                { ListBankSteps.map((step, index)=>( 
                  <div >
                    <TabContent value={step.key}>
                       { step.key === "bankSteps.needRenovation" && <TaskManager key={index+'_'+step.key as BankStep} /> }
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