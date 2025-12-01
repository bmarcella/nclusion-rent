import { useTranslation } from "react-i18next";
import { requestStatusAction } from "./entities/AuthRequest";
import Tabs from "@/components/ui/Tabs";
import TabList from "@/components/ui/Tabs/TabList";
import TabNav from "@/components/ui/Tabs/TabNav";
import TabContent from "@/components/ui/Tabs/TabContent";
import ShowReq from "./components/ShowReq";


export function ShowAccountantActionBase() {
     const { t } = useTranslation();
     const statuses = requestStatusAction(t)
  return (
    <>
   <Tabs defaultValue={statuses[0].value} className="w-full">
        <TabList>
          { statuses.map((st)=>{
            return (<TabNav key={st.value} value={st.value}>{st.label}</TabNav>)
          })} 
        </TabList>
        <div className="p-4">
             { statuses.map((st)=>{
            return (<TabContent key={st.value} value={st.value}>
                { <ShowReq status={st.value}  action={true} ></ShowReq> }
            </TabContent>)
          })} 
    
        </div>
    </Tabs>
    </>
  )
}

const ShowAccountantAction = () => {
  return <ShowAccountantActionBase />;
}

export default ShowAccountantAction
