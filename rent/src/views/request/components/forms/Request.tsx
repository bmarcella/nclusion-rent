import { Tabs } from "@/components/ui/Tabs"
import TabContent from "@/components/ui/Tabs/TabContent"
import TabList from "@/components/ui/Tabs/TabList"
import TabNav from "@/components/ui/Tabs/TabNav"
import SelectTypeRequest from "./SelectTypeRequest"
import { AuthRequest } from "../../AuthRequest/AuthRequest"
import { useState } from "react"
import RequestForm from "./RequestForm"


export const Request = () => {
    const [ selectedType , SetSelectedType ]  = useState();

    return (<>
        <Tabs defaultValue="tab1" >
            <TabList>
                <TabNav value="tab1">Requête</TabNav>
                <TabNav value="tab2">Configuration</TabNav>
            </TabList>
            <div className="p-4">
                <TabContent value="tab1">
                   { !selectedType && <SelectTypeRequest GetSelected={SetSelectedType} /> }
                   { selectedType && <RequestForm typeRequest={selectedType} /> }
                </TabContent>
                <TabContent value="tab2">
                    <AuthRequest></AuthRequest>
                </TabContent>

            </div>
        </Tabs>



    </>)
}