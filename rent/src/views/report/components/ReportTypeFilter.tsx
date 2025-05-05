/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */

import Checkbox from '@/components/ui/Checkbox/Checkbox';
import { DatePicker } from '@/components/ui/DatePicker';
import { Proprio } from '@/views/Entity';
import {   RegionType } from '@/views/Entity/Regions';
import { useState, useEffect } from 'react';





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
  t?: (key: string) => string;
  onChangeReportTypeA?: (value: boolean) => void;
  onChangeDate?: (start:  Date, end? : Date) => void;
}

function ReportTypeFilter({  t, onChangeReportTypeA = (value: any)=>{}, onChangeDate  }: Props) {
  const [start, setStart] = useState<Date>();
  const [end, setEnd] = useState<Date>();
   useEffect(() => {
    if(onChangeDate) onChangeDate(start, end);
  }, [start, end]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded">
     { onChangeDate && <>
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
       </>}

 {  <Checkbox  onChange={(options: any) => {
             onChangeReportTypeA(options);
          }}>
      Show Performances
   </Checkbox> }
        

  
    </div>
  );
}



export default ReportTypeFilter