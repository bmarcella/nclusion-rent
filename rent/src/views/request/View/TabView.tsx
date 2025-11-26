/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Tabs from '@/components/ui/Tabs'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import DetailsRequest from './DetailsRequest'
import { IRequest } from '../entities/IRequest'
import HistoticView from './Histotic'
import ImageReq from '../components/ImageReq'
import { useSessionUser } from '@/store/authStore'
import { useEffect, useState } from 'react'
import {  getDocs, orderBy, query, where } from 'firebase/firestore'
import { AuthRequestDoc } from '@/services/Landlord'
import { AuthRequest, RequestTypeEnum } from '../entities/AuthRequest'
import { manageAuth } from '@/constants/roles.constant'
import { useTranslation } from 'react-i18next'
interface Props {
    data : IRequest
    onDialogClose: (close: boolean, data: IRequest)=> void 
} 

function TabView({ data, onDialogClose } : Props) {
 const { userId, proprio, authority } = useSessionUser((state) => state.user);
 const [request , setRequest]=  useState<IRequest>(data);
 const [rules , setRules]=  useState<AuthRequest [] | undefined>([]) as any;
 const [loadingRules , seLoadingRules]=  useState<boolean>(false);
 const { t } = useTranslation();

useEffect(() => {
  let canceled = false;
  const run = async () => {
    await fetchRule();
    if (canceled) return;
  }
  run();
  return () => {
    canceled = true;
  };
}, [request.requestType, request.status ]);

 const save = (data: IRequest): void => {
      setRequest(data);
      onDialogClose(false, data);
 }



 const fetchRule = async () => {
  if (!proprio?.type_person) return; // avoid undefined in query
  seLoadingRules(true);
  const role = authority![0];
  const { regions } = await manageAuth(authority![0], proprio, t);
  const reg = regions.map((r)=>r.id);
    const q = (role == 'admin') ? query(
      AuthRequestDoc,
      where("status", "==", request.status),
      where("roles", "array-contains", role),
    ) : query(
      AuthRequestDoc,
      where("status", "==", request.status),
      where("region_id", "in", reg),
      where("roles", "array-contains", role),
    )
  const snapshot = await getDocs(q);
  seLoadingRules(false);
  const objs = snapshot.docs
    .map((docSnap) => {
      const data = docSnap.data() as any;
      return { id: docSnap.id, ...data };
    })
    .filter((rule) =>
      Array.isArray(rule.reqType)
        ? rule.reqType.includes(request.requestType as RequestTypeEnum)
        : false
    );
  console.log(objs)
  setRules(objs);
};
  // cd ui
  return (
    <>
       { rules.length > 0 && <Tabs defaultValue="tab1" className="w-full">
        <TabList>
          <TabNav value="tab1"> {request.requestType.toUpperCase() }</TabNav>
          <TabNav value="tab2"> Documents</TabNav>
          <TabNav value="tab3"> Historique</TabNav>
        </TabList>
         <div className="p-4">
            <TabContent value="tab1">
              <DetailsRequest data={request} getNewreq={save} rules={rules} /> 
            </TabContent>
            <TabContent value="tab3">
                 <HistoticView data={request}></HistoticView>
            </TabContent>
              <TabContent value="tab2">
                  <ImageReq   reqId={request.id} userId={userId || ''} isEdit={true} owner={data.createdBy==userId} ></ImageReq>
            </TabContent>
        </div> 
    </Tabs> }
    { rules.length == 0  && <>
         {loadingRules && <>
         </>}

          {!loadingRules && <>
             <h3 className='text-center'> {"Vous n'avez pas access a cette requête"} </h3>
         </>}
    </>}
    </>
  )
}

export default TabView