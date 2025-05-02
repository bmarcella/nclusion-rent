/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePicker } from '@/components/ui';
import { Select } from '@/components/ui/Select';
import { bankSteps, Proprio } from '@/views/demo/Entity';
import {   RegionType } from '@/views/demo/Entity/Regions';
import { useEffect, useState } from 'react';

interface OptionType {
  label: string;
  value: string | number;
}

interface Props {
  onChangeDate: (start:  Date, end? : Date) => void;
  onChangeStep: (d: string ) => void;
  t : (key: string) => string;
  all : boolean;
}

export const convertToSelectOptionsRegion = (items: RegionType[]) => {
  return items.map((obj) => ({
    value: obj.value,
    label: obj.name,
  }))
}

export const convertToSelectOptionsProprio = (items: Proprio[]) => {
  return items.map((obj) => ({
    value: obj.id,
    label: obj.fullName,
  }))
}

export const convertToSelectOptionsSteps = (items: string[], t: any) => {
  const a =  items.map((obj) => ({
    value: obj,
    label: t('bank.'+obj),
  }));
  a.unshift({ label: "Tout", value: undefined });
  return a;
}


function FilterMyBank({ onChangeDate, onChangeStep, t, all }: Props) {
  const [start, setStart] = useState<Date>();
  const [end, setEnd] = useState<Date>();
  const [steps, setSteps] = useState<OptionType[]>(convertToSelectOptionsSteps(bankSteps, t));
   // bankSteps

 useEffect(() => {
   onChangeDate(start, end);
}, [start, end]);









  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded">
       {steps.length > 1 && (
              <Select
                placeholder="Etape"
                options={steps}
                onChange={(options: OptionType) => {
                  if (!options) {
                      onChangeStep(undefined);
                      return;
                    }
                    onChangeStep(options.value as string);
                }}
              />
            )}
        { !all && (<>
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
        </>) }
            

  
    </div>
  );
}

export default FilterMyBank;
