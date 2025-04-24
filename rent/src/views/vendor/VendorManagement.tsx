import Tabs from "@/components/ui/Tabs";
import TabContent from "@/components/ui/Tabs/TabContent";
import TabList from "@/components/ui/Tabs/TabList";
import TabNav from "@/components/ui/Tabs/TabNav";
import AllFreeTask from "./components/AllFreeTask";
import Contrats from "./components/Contrats";
import { BankStep } from "../Entity";


export function VendorManagementBase() {
  return (
    <>
    <h4>Gestionnaires de vendeurs</h4>
        <div>
            <Tabs defaultValue="tab1">
                <TabList>
                    <TabNav value="tab1">Tout </TabNav>
                    <TabNav value="tab4">Comptoire</TabNav>
                    <TabNav value="tab5">Peinture </TabNav>
                    <TabNav value="tab6">En attente</TabNav>
                    <TabNav value="tab2">Contrats</TabNav>
                </TabList>
                <div className="p-4">
                    <TabContent value="tab1">
                       <AllFreeTask />
                    </TabContent>
                    <TabContent value="tab4">
                       <AllFreeTask step={'renovSteps.comptoire' as BankStep}/>
                    </TabContent>
                    <TabContent value="tab5">
                       <AllFreeTask step={'renovSteps.peinture' as BankStep}/>
                    </TabContent>
                     <TabContent value="tab6">
                       <AllFreeTask step={'renovSteps.in_process' as BankStep}/>
                    </TabContent>
                    <TabContent value="tab2">
                      <Contrats/>
                    </TabContent>
                </div>
            </Tabs>
        </div>
    </>
  )
}

  const VendorManagement = () => {
      return <VendorManagementBase />
  }
  

export default VendorManagement;