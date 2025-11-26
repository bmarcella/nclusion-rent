import { Tabs } from '@/components/ui';
import TabContent from '@/components/ui/Tabs/TabContent';
import TabList from '@/components/ui/Tabs/TabList';
import TabNav from '@/components/ui/Tabs/TabNav';
import { useTranslation } from 'react-i18next';
import { requestStatusAll } from './entities/AuthRequest';
import ShowReq from './components/ShowReq';

export function ShowRequestBase() {
  const { t } = useTranslation();
  const statuses = requestStatusAll(t)
  return (
    <>

     <Tabs defaultValue="tab1" className="w-full">
        <TabList>
          <TabNav value="tab1">Tout</TabNav>
          { statuses.map((st)=>{
            return (<TabNav key={st.value} value={st.value}>{st.label}</TabNav>)
          })} 
        </TabList>
        <div className="p-4">
            <TabContent value="tab1">
               <ShowReq></ShowReq>   
            </TabContent>
             { statuses.map((st)=>{
            return (<TabContent key={st.value} value={st.value}>
                { <ShowReq status={st.value} ></ShowReq> }
            </TabContent>)
          })} 
    
        </div>
    </Tabs>
    </>
  )
}

const ShowRequest = () =>{
 return <ShowRequestBase/>;
}

export default ShowRequest