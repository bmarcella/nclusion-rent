import { Tabs } from '@/components/ui/Tabs';
import TabContent from '@/components/ui/Tabs/TabContent';
import TabList from '@/components/ui/Tabs/TabList';
import TabNav from '@/components/ui/Tabs/TabNav';
import { Proprio } from '@/views/Entity';
import EntEditForm from './EntEditForm';
import ImageLandlord from '@/views/bank/add/components/ImageLandlord';
import SecEnt from './SecEnt';
import UserEnt from './UserEnt';

interface Props {
    onChange: (payload: any) => void;
    userId?: string,
    lord: Proprio
}
function EditEntity( { onChange , lord, userId } : Props) {
  return (
    <div>
          <Tabs defaultValue="tab1">
                <TabList>
                    <TabNav value="tab1">Informations générales</TabNav>
                    <TabNav value="tab2">Roles & Regions</TabNav>
                    <TabNav value="tab3">Documents</TabNav>
                    <TabNav value="tab4">Securité & Utilisateurs</TabNav>
                </TabList>
                <div className="p-4">
                    <TabContent value="tab1">
                         <EntEditForm lord={lord} onChange={onChange} ></EntEditForm>
                    </TabContent>
                    <TabContent value="tab2">
                        <SecEnt  lord={lord} onChange={onChange}></SecEnt>
                    </TabContent>
                    <TabContent value="tab3">
                
                        <div className="text-gray-700 dark:text-white">
                        { lord && <ImageLandlord nextStep={ () => {
                         
                        }} lordId={lord.id}  isEdit={true} userId={userId || ""} /> }
                        </div>
      
                    </TabContent>
                    <TabContent value="tab4">
                        <UserEnt lord={lord} onChange={onChange}></UserEnt>
                    </TabContent>
                
                </div>
            </Tabs>
    </div>
  )
}

export default EditEntity