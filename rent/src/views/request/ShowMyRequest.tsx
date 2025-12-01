import Tabs from '@/components/ui/Tabs';
import TabContent from '@/components/ui/Tabs/TabContent';
import TabList from '@/components/ui/Tabs/TabList';
import TabNav from '@/components/ui/Tabs/TabNav';
import RecieveReq from './components/RecieveReq';
import SentReq from './components/SentReq';
import RecieveReqApproved from './components/RecieveReqApproved';
import RecieveReqRejectAndCancel from './components/RecieveReqRejectAndCancel';

export function ShowMyRequestBase() {
  return (
    <>
    <Tabs defaultValue="tab1" className="w-full">
        <TabList>
          <TabNav value="tab1">Reçue</TabNav>
          <TabNav value="tab3">Envoyée</TabNav>
          <TabNav value="tab4">Approuvée</TabNav>
          <TabNav value="tab5">Rejettée & Annullée</TabNav>
        </TabList>
        <div className="p-4">
            <TabContent value="tab1">
                <RecieveReq/>
            </TabContent>
            <TabContent value="tab3">
               <SentReq/>
            </TabContent>

             <TabContent value="tab4">
               <RecieveReqApproved></RecieveReqApproved>
            </TabContent>

             <TabContent value="tab5">
               <RecieveReqRejectAndCancel></RecieveReqRejectAndCancel>
            </TabContent>
        </div>
    </Tabs>
    </>
  )
}

const ShowMyRequest = () =>{
 return <ShowMyRequestBase/>;
}

export default ShowMyRequest;