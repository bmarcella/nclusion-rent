import Tabs from "@/components/ui/Tabs";
import TabContent from "@/components/ui/Tabs/TabContent";
import TabList from "@/components/ui/Tabs/TabList";
import TabNav from "@/components/ui/Tabs/TabNav";
import AllFreeTask from "./components/AllFreeTask";
import Contrats from "./components/Contrats";


export function VendorManagementBase() {
  return (
    <>
    <h4>Gestion des fournisseurs</h4>
        <div>
            <Tabs defaultValue="tab1">
                <TabList>
                    <TabNav value="tab1">Travaux Disponibles </TabNav>
                    <TabNav value="tab4">Travaux Encours </TabNav>
                    <TabNav value="tab5">Travaux Terminés </TabNav>
                    <TabNav value="tab2">Contrats</TabNav>
                    <TabNav value="tab3">Rapport</TabNav>
                </TabList>
                <div className="p-4">
                    <TabContent value="tab1">
                       <AllFreeTask state={0} />
                    </TabContent>
                    <TabContent value="tab4">
                       <AllFreeTask state={1}/>
                    </TabContent>
                    <TabContent value="tab5">
                       <AllFreeTask state={2}/>
                    </TabContent>
                    <TabContent value="tab2">
                      <Contrats/>
                    </TabContent>
                    <TabContent value="tab3">
                        
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