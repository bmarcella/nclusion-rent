import { BankStep, ListIBankSteps } from '@/views/Entity'
import TableBank from './components/TableBank'
import Tabs from '@/components/ui/Tabs'
import TabList from '@/components/ui/Tabs/TabList'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabNav from '@/components/ui/Tabs/TabNav'

export const ShowInactiveBankBase = () => {
    return (
        <div>
            <Tabs defaultValue={'all'} className="w-full">
                <TabList>
                    <TabNav key={'all'} value={'all'}>
                        Tout
                    </TabNav>
                    {ListIBankSteps.map((step, index) => (
                        <TabNav key={index} value={step.key}>
                            {step.label}
                        </TabNav>
                    ))}
                </TabList>

                <TabContent value={'all'}>
                    <TableBank all={true} />
                </TabContent>

                {ListIBankSteps.map((step, index) => (
                    <div key={index}>
                        <TabContent value={step.key}>
                            <TableBank
                                key={step.key}
                                step={step.key as BankStep}
                            />
                        </TabContent>
                    </div>
                ))}
            </Tabs>
        </div>
    )
}

const ShowInactiveBank = () => {
    return <ShowInactiveBankBase />
}

export default ShowInactiveBank
