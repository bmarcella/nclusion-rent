import { Tabs } from '@/components/ui';
import TabContent from '@/components/ui/Tabs/TabContent';
import TabList from '@/components/ui/Tabs/TabList';
import TabNav from '@/components/ui/Tabs/TabNav';
import { getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RenovContract } from '../Entity';
import { getContratDoc, getLandlordDoc } from '@/services/Landlord';
import ContractDeService from './components/ContractDeService';
import { useSessionUser } from '@/store/authStore';
import EditContrat from './components/EditContrat';
export function ViewContratBase() {
  const { id } = useParams();
  const [cont, setCont] = useState<any>();
  const [proprioe, setProprio] = useState<any>();
   const {  proprio  } = useSessionUser((state) => state.user);
  useEffect(() => {
    getOneContrat(id);
    }, [id]);

    useEffect(() => {
      if(cont?.assignee) getLord(cont.assignee);
      }, [cont]);
  

      const getLord  = async (id: string) => {
        try {
            const contRef = getLandlordDoc(id);
            const contSnap = await getDoc(contRef);
            if (contSnap.exists()) {
                const data = contSnap.data() as RenovContract;
                setProprio(data);
            
            } 
        } catch (err) {
            console.error("Error fetching landlords:", err);
        }
     }
  

   const getOneContrat  = async (id: string) => {
      try {
          const contRef = getContratDoc(id);
          const contSnap = await getDoc(contRef);
          if (contSnap.exists()) {
              const data = contSnap.data() as RenovContract;
              setCont(data);
          }
      } catch (err) {
          console.error("Error fetching landlords:", err);
      }
   }

  
  return (
    <>
      <Tabs defaultValue="tab1" className="w-full">
                <TabList>
                <TabNav value="tab1">Contrat</TabNav>
                { cont && !cont.completed && <TabNav value="tab2">Modifier</TabNav> }
                   
                </TabList>
                <div className="p-4">
                    <TabContent value="tab1">
                    { cont && proprioe && proprio && <ContractDeService
                    contract={cont}
                    employee={proprioe}
                    proprio={proprio}
                    />}
                    </TabContent> 
                    { cont && !cont.completed && <TabContent value="tab2">
                      <EditContrat contrat={cont} ></EditContrat>
                    </TabContent> }
        
                </div>
            </Tabs>
    </>
  )
}


  const ViewContrat = () => {
      return <ViewContratBase />
  }
  

export default   ViewContrat ;