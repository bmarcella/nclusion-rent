/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Table from '@/components/ui/Table';
import THead from '@/components/ui/Table/THead';
import TBody from '@/components/ui/Table/TBody';
import {  fetchReportPerCreatorPerWeek, getLast4Weeks, getQueryFiltersWeek } from '@/services/Report';
import UserName from '@/views/bank/show/components/UserName';
import useTranslation from '@/utils/hooks/useTranslation';
import { useSessionUser } from '@/store/authStore';
import { BankDoc } from '@/services/Landlord';
import { Query, DocumentData, query } from 'firebase/firestore';

import {  ReportStepsWeek } from '@/views/Entity';
import FilterBankWeek from './FilterBankWeek';
import { StepDateRange } from './StepDateRange';
function WeekAIReport() {
  const [data, setData] = useState<any[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { proprio , authority } = useSessionUser((state) => state.user);
  // -------------------
  const [ regions, setRegions] = useState<number>(0);
  const [agents, setAgents] = useState<string>();
  const [start, setStart] = useState<Date>();
  const [end, setEnd] = useState<Date>();
  const [type_rep, setTypeRep] = useState<boolean>();

  useEffect(() => {
    const now =  (!start) ? new Date() : start;
    const weeks = getLast4Weeks(now);
    const q: Query<DocumentData> = query(BankDoc);
    fetchReportPerCreatorPerWeek(getQueryFiltersWeek(q,{
      regions: regions,
      agents: agents,
      authority: authority,
      proprio: proprio
    }), ReportStepsWeek, weeks).then((result) => {
      console.log("result", result);
      setData(result);
      if (result.length > 0) {
        setSteps(result[0].steps);
      }
      setLoading(false);
    });
  }, [regions, agents, start]);

  if (loading) return <p>Chargement du rapport...</p>;

  // Calculate total per column (step)
  const columnTotals = steps.map((_, index) =>
    data.reduce((sum, item) => sum + (item.values[index].value || 0), 0)
  );

const onChangeRegion = async (id: number) => {
    setRegions(id);
}

const onChangeType = async (type_rep: boolean) => {
  setTypeRep(type_rep);
}

const onChangeAgent = async (id: string) =>{
   setAgents(id);
 }

 const onChangeDate = async (start: Date) => {
    setStart(start);
 }

  // Calculate grand total (sum of all values)
  // const grandTotal = columnTotals.reduce((acc, val) => acc + val, 0);

  return (
    <div className="overflow-x-auto p-1 bg-white rounded-lg shadow-md">

          <FilterBankWeek  authority={authority || []} proprio={proprio} t={t}
           onChangeRegion={onChangeRegion} 
           onChangeAgent={onChangeAgent} 
           onChangeDate = {onChangeDate}
          >

          </FilterBankWeek> 

      
      <Table>
        <caption className="text-lg font-semibold text-gray-700 p-4">
          Rapport par agent immobilier par semaine
        </caption>
        <THead>
          <tr>
            <th>Agents</th>
            <th>Total</th>
            {steps.map((step, index) => (
              <th key={index} className="text-center capitalize">
                {step.name}
                <StepDateRange start={step.start} end={step.end} > </StepDateRange>
              </th>
            ))}
          </tr>
        </THead>
        <TBody>
  
          {data.map(({ name, values }) => {

            return (
          <tr key={name} className="border-t">
              <td className="p-2">
                <UserName userId={name} />
              </td>

              <td className="text-center font-semibold">
                {values.reduce(
                  (total, arr) => total + arr.reduce((sum, item) => sum + item.value, 0),
                  0
                )}
              </td>

              {values.map((value: any[], index: number) => {
                const rowTotal = value.reduce((sum, item) => sum + item.value, 0);
                const val2 = value[2]?.value ?? 0;
                const val1 = value[1]?.value ?? 0;
                let colorClass = '';
                if (val2 <= 2) colorClass = 'text-red-500';
                else if (val2 === 3) colorClass = 'text-orange-500';
                else if (val2 >= 4) colorClass = 'text-green-500';

                return (
                  <td key={`${name}-${index}`} className={`text-center ${colorClass}`} >
                    {`${val2} / ${rowTotal - val1}`} <br/> ({rowTotal})
                  </td>
                );
              })}
            </tr>
            );
          })}

          {/* Total Row */}
         
        </TBody>
      </Table>
    </div>
  );
}

export default WeekAIReport;
