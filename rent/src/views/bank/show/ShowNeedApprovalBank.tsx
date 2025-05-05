/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BankStep, ListABankSteps } from "@/views/Entity";
import TableBank from "./components/TableBank";
import Tabs from "@/components/ui/Tabs";
import TabList from "@/components/ui/Tabs/TabList";
import TabContent from "@/components/ui/Tabs/TabContent";
import TabNav from "@/components/ui/Tabs/TabNav";

export const ShowNeedApprovalBankBase= () => {
 
  
  return (
    <div>
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
            </Tabs>
    </div>
  );
}


const ShowNeedApprovalBank = () => {
    return <ShowNeedApprovalBankBase />
}

export default ShowNeedApprovalBank;