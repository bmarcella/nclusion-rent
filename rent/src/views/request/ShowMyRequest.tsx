import Tabs from '@/components/ui/Tabs';
import TabContent from '@/components/ui/Tabs/TabContent';
import TabList from '@/components/ui/Tabs/TabList';
import TabNav from '@/components/ui/Tabs/TabNav';
import React from 'react'
import RecieveReq from './components/RecieveReq';
import SentReq from './components/SentReq';

export function ShowMyRequestBase() {
  return (
    <>
    <Tabs defaultValue="tab1" className="w-full">
        <TabList>
          <TabNav value="tab1">Reçu</TabNav>
          <TabNav value="tab3">Envoyé</TabNav>
        </TabList>
        <div className="p-4">
            <TabContent value="tab1">
                <RecieveReq/>
            </TabContent>
            <TabContent value="tab3">
               <SentReq/>
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