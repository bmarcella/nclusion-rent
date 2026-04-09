import { useState } from 'react'
import { Tabs } from '@/components/ui'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import AIReport from './components/AIReport'
import RegionReport from './components/RegionReport'
import WeekAIReport from './components/WeekAIReport'

// Tabs are mounted lazily so only the active tab fetches data. Once a tab
// has been visited it stays mounted to preserve its local state and avoid
// re-fetching when the user toggles back.
export function ReportBase() {
    const [active, setActive] = useState<string>('tab1')
    const [visited, setVisited] = useState<Set<string>>(new Set(['tab1']))

    const handleChange = (value: string) => {
        setActive(value)
        if (!visited.has(value)) {
            setVisited((prev) => {
                const next = new Set(prev)
                next.add(value)
                return next
            })
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-gray-900 dark:text-gray-100">Rapports</h3>
                <p className="text-sm text-gray-500 mt-1">
                    Vue d&apos;ensemble de l&apos;activité des agents et des
                    régions.
                </p>
            </div>

            <Tabs
                value={active}
                onChange={(v) => handleChange(v as string)}
                className="w-full"
            >
                <TabList>
                    <TabNav value="tab1">Agent immobilier</TabNav>
                    <TabNav value="tab3">Hebdomadaire</TabNav>
                    <TabNav value="tab2">Régions</TabNav>
                </TabList>
                <div className="pt-4">
                    <TabContent value="tab1">
                        {visited.has('tab1') && <AIReport />}
                    </TabContent>
                    <TabContent value="tab3">
                        {visited.has('tab3') && <WeekAIReport />}
                    </TabContent>
                    <TabContent value="tab2">
                        {visited.has('tab2') && <RegionReport />}
                    </TabContent>
                </div>
            </Tabs>
        </div>
    )
}

const Report = () => {
    return <ReportBase />
}

export default Report
