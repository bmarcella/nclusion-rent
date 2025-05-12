/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePicker } from '@/components/ui';
import Checkbox from '@/components/ui/Checkbox/Checkbox';
import { Select } from '@/components/ui/Select';
import { manageAuth } from '@/constants/roles.constant';
import { Landlord } from '@/services/Landlord';
import { Proprio } from '@/views/Entity';
import {   RegionType } from '@/views/Entity/Regions';
import { Query, DocumentData, CollectionReference, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface OptionType {
  label: string;
  value: string | number;
}



export const convertToSelectOptionsRegion = (items: RegionType[]) => {
  return items.map((obj) => ({
    value: obj.value,
    label: obj.name,
  }))
}

export const convertToSelectOptionsProprio = (items: Proprio[]) => {
  return items.map((obj) => ({
    value: obj.id_user,
    label: obj.fullName,
  }))
}

interface Props {
  authority: string[];
  proprio: any;
  t: (key: string) => string;
  onChangeRegion: (id:  number) => void;
  onChangeAgent?: (d: string ) => void;
  onChangeDate: (start:  Date, end? : Date) => void;
  onChangeMap?: (value: boolean) => void;
  isMap?: boolean;
}

function FilterBank({ authority, proprio, t, onChangeRegion, onChangeAgent, onChangeDate, isMap,  onChangeMap = (value: any)=>{}  }: Props) {
  const [regions, setRegions] = useState<OptionType[]>([]);
  const [agents, setAgents] = useState<OptionType[]>([]);

 
  //
  const [selectedRegions, setSelectedRegions] = useState<number>();
  const [selectedAgents, setSelectedAgents] = useState<string>();
  //
  const [start, setStart] = useState<Date>();
  const [end, setEnd] = useState<Date>();
  useEffect(() => {
    if (!authority?.length) return;
      const fetchData = async () => {
      const { regions } = await manageAuth(authority[0], proprio, t);
      const regs = convertToSelectOptionsRegion(regions);
      regs.unshift({ label: 'All', value: 0 });
      setRegions(regs);
      await fetchProprio();
    };

    fetchData();
  }, [authority, proprio, t]);

  useEffect(() => {
    if (!onChangeAgent) return;
    const fetchData = async () => {
      await fetchProprio();
   };
   fetchData();
 }, [selectedRegions]);

 useEffect(() => {
  onChangeDate(start, end);
}, [start, end]);

 useEffect(() => {
  console.log('selectedAgents:', selectedAgents);
  if(selectedAgents && onChangeAgent) onChangeAgent(selectedAgents);
}, [setSelectedAgents]);

  const fetchProprio = async () => {
    try {
     let q: Query<DocumentData>;
     let baseQuery: Query<DocumentData> = Landlord as CollectionReference<DocumentData>;
      q = query(baseQuery, orderBy('fullName'), where ('type_person', '==', 'agent_immobilier'));

     if(selectedRegions!= 0 && selectedRegions != undefined) {
      q = query(baseQuery, where('regions', 'array-contains', selectedRegions), orderBy('fullName'), where ('type_person', '==', 'agent_immobilier'));
      console.log('regions:', selectedRegions);
      }
    const snapshot = await getDocs(q);
    const landlords: Proprio[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Proprio[];
        const a = convertToSelectOptionsProprio(landlords);
        a.unshift({ label: 'All', value: undefined });
        setAgents(a); 
      } catch (error) {
        console.error('Error fetching page:', error);
      }
    
    };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded">
    { isMap && <Checkbox  onChange={(options: any) => {
             onChangeMap(options);
          }}>
      Show on Map 
  </Checkbox> }
    {regions.length > 1 && (
        <Select
          placeholder="Region"
          options={regions}
          onChange={(options: OptionType) => {
            if (!options) {
                setSelectedRegions(0);
                onChangeRegion(0);
                return;
              }
            if(onChangeAgent) onChangeAgent(undefined);
            setSelectedRegions(options.value as number);
            onChangeRegion(options.value as number);
          }}
        />
      )}
      { (agents.length > 0) && onChangeAgent && (
        <Select
          placeholder="Agent"
          options={agents}
          onChange={(options: OptionType) => {
             if(!options || options.value == undefined) {
                setSelectedAgents(undefined);
                onChangeAgent(undefined);
                return;
              }
              setSelectedAgents(options.value);
              onChangeAgent(options.value.toString());
          }}
        />
      )}

      <DatePicker placeholder="Date debut"  onChange={(date) => {
            setStart(undefined);
            if (!date) {
                 setStart(undefined);
                return;
              }
             console.log('start:', date);
             setStart(new Date(date));
          }} />

       <DatePicker placeholder="Date fin" onChange={(date) => {
            setEnd(undefined);
            if (!date) {
                 setEnd(undefined);
                return;
              }
             console.log('start:', date);
             setEnd(new Date(date));
          }}  />

        

  
    </div>
  );
}

export default FilterBank;
