import { Tabs } from '@/components/ui'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import AIReport from './components/AIReport'
import RegionReport from './components/RegionReport'
import WeekAIReport from './components/WeekAIReport'

export function ReportBase() {
  return (
    <>
    <Tabs defaultValue="tab1" className="w-full">
        <TabList>
        <TabNav value="tab1">Agent immobilier</TabNav>
        <TabNav value="tab3">Hebdomadaire</TabNav>
        <TabNav value="tab2">Regions</TabNav>
        </TabList>
        <div className="p-4">
            <TabContent value="tab1">
               <AIReport></AIReport>
            </TabContent>
            <TabContent value="tab3">
               <WeekAIReport></WeekAIReport>
            </TabContent>
            <TabContent value="tab2">
              <RegionReport></RegionReport>
            </TabContent>

        </div>
    </Tabs>
    </>
  )
}

const Report = () => {
  return <ReportBase />
}

export default Report