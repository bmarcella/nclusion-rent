import Tabs from '@/components/ui/Tabs'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import TaskManagerPopup from '@/views/vendor/components/TaskManagerPopup'
import ShowContrat from './ShowContrat'

function Contrats() {
  return (
    <> 
   
        <Tabs defaultValue="tab2" className="w-full">
                <TabList>
                <TabNav value="tab2">Voir</TabNav>
                    <TabNav value="tab1">Ajouter</TabNav>
                   
                </TabList>
                <div className="p-4">
                    <TabContent value="tab1">
                       <TaskManagerPopup></TaskManagerPopup>
                    </TabContent>
                    <TabContent value="tab2">
                       <ShowContrat/>
                    </TabContent>
        
                </div>
            </Tabs>
        
    </>
  )
}

export default Contrats