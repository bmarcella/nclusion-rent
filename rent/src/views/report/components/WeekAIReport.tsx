/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Table from '@/components/ui/Table';
import THead from '@/components/ui/Table/THead';
import TBody from '@/components/ui/Table/TBody';
import {  fetchReportPerCreatorPerWeek, getLast4Weeks, getQueryFiltersWeek } from '@/services/Report';
import UserName from '@/views/bank/show/components/UserName';
import useTranslation from '@/utils/hooks/useTranslation';
import { useSessionUser } from '@/store/authStore';
import { BankDoc, LandlordDoc } from '@/services/Landlord';
import { Query, DocumentData, query, getCountFromServer, orderBy, where } from 'firebase/firestore';

import {  ReportStepsFullX, ReportStepsWeek } from '@/views/Entity';
import FilterBankWeek from './FilterBankWeek';
import { StepDateRange } from './StepDateRange';
import { fetchReportPerReportWeek } from '@/views/Entity/Regions';


interface WeekResult {
  week: any;
  new: number;
  old: number;
  total: number;
}


function WeekAIReport() {
  const [data, setData] = useState<any[]>([]);
  const [datab, setDatab] = useState<any[]>([]);
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
  const [ totalData, setTotalData] = useState<any[]>([]);
  const [ div, setDiv] = useState<number>(0);
   const [ prevTotal, setPrevTotal] = useState<number>(0);
 



const fetchTotalCount = async (regions: number, weeks: [], i: number): Promise<void> => {
  let prev = 0;

  await fetchPrevTotalCount(regions, weeks, i );

  const reversedWeeks = [...weeks].reverse(); // Avoid mutating original array

  const results: WeekResult[] = [];
  let w = 0;
  for (const week of reversedWeeks) {
    let q: Query<DocumentData>;

    if (regions) {
      q = query(
        LandlordDoc,
        where("regions", "array-contains", regions),
        where("type_person", "==", "agent_immobilier"),
        where("createdAt", ">=", week.start),
        where("createdAt", "<=", week.end)
      );
    } else {
      q = query(
        LandlordDoc,
        where("type_person", "==", "agent_immobilier"),
        where("createdAt", ">=", week.start),
        where("createdAt", "<=", week.end)
      );
    }

    const snapshot = await getCountFromServer(q);
    const currentCount = snapshot.data().count;
    if (w==0) currentCount + prevTotal;

    results.push({
      week,
      new: currentCount,
      old: prev,
      total: prev + currentCount
    });

    prev += currentCount;
    w++;
  }

  setTotalData(results.reverse());
  console.log("totalData", results);
};




const fetchPrevTotalCount = async (regions: number, weeks: [], i: number): Promise<void> => {


    let week = weeks[i];
    let q: Query<DocumentData>;
    if (week === undefined) {
      console.log("week is undefined");
      return;
    }
    if (regions) {
      q = query(
        LandlordDoc,
        where("regions", "array-contains", regions),
        where("type_person", "==", "agent_immobilier"),
        where("createdAt", "<", week.start),
      );
    } else {
      q = query(
        LandlordDoc,
        where("type_person", "==", "agent_immobilier"),
        where("createdAt", "<", week.start),
      );
    }

    const snapshot = await getCountFromServer(q);
    const currentCount = snapshot.data().count;
    setPrevTotal(currentCount);
    console.log("prevTotal", currentCount, week.start);
};


  

  useEffect(() => {
    setPrevTotal(0);
   if (!type_rep) simpleReport();
   else advencedReport();
   

  }, [regions, agents, start, type_rep]);

  const simpleReport = async () => {
    setSteps([]);
    const now =  (!start) ? new Date() : start;
    const weeks = getLast4Weeks(now);
    const q: Query<DocumentData> = query(BankDoc);
    fetchReportPerCreatorPerWeek(getQueryFiltersWeek(q,{
      regions: regions,
      agents: agents,
      authority: authority,
      proprio: proprio
    }), ReportStepsWeek, weeks).then((result) => {
     
      setData(result);
      if (result.length > 0) {
        setSteps(result[0].steps);
      }
      setLoading(false);
    });
  }

  const advencedReport = async () => {
      setSteps([]);
      const now =  (!start) ? new Date() : start;
      const weeks = getLast4Weeks(now, 12);
      const steps =  ReportStepsFullX;
      const q: Query<DocumentData> = query(BankDoc);
      const filters = getQueryFiltersWeek(q,
        {
        regions: regions,
        agents: agents,
        authority: authority,
        proprio: proprio
      });
      fetchReportPerReportWeek(weeks, steps, filters).then((result) => {
      setDiv(result.length);
      setDatab(result);
      if (result.length > 0) {
        setSteps(result[0].steps);
        fetchTotalCount(regions, weeks, (result.length -1));
       
      }
      setLoading(false);
    });
    
  }

  if (loading) return <p>Chargement du rapport...</p>;

  // Calculate total per column (step)
  // const columnTotals = steps.map((_, index) =>
  //   data.reduce((sum, item) => sum + (item.values[index].value || 0), 0)
  // );

   // Calculate total per column (step)
  const columnTotals = steps.map((_, index) =>
    datab.reduce((sum, item) => sum + (item.values[index] || 0), 0)
  );

  // Calculate grand total (sum of all values)
  const grandTotal = columnTotals.reduce((acc, val) => acc + val, 0);
  const grandTotalAgent = datab.reduce((acc, item) => acc + item.total_agents, 0);


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
  const totalAgents = totalData.reduce((acc, val) => acc + val.new, 0) ;
  return (
    <div className="overflow-x-auto p-1 bg-white rounded-lg shadow-md">

         <FilterBankWeek  authority={authority || []} proprio={proprio} t={t}
           onChangeRegion={onChangeRegion} 
           onChangeAgent={onChangeAgent} 
           onChangeDate = {onChangeDate}
           onChangeMap={onChangeType}
           message = {t('report.weekAIReport.message')}
           isMap={true}
          >

          </FilterBankWeek> 

      
      { !type_rep && (<>
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
      </>) }

     { type_rep && datab.length>0 && (<>
      <Table>
        <caption className="text-lg font-semibold text-gray-700 p-4">
          Rapport par agent immobilier par semaine & status
        </caption>
        <THead>
          <tr>
            <th>Week</th>
            {  <th>Nouveau Agent</th> }
            {  <th>Total Agents</th> }
            <th className="text-center p-2">Total</th>
            {steps.map((step, idx) => (
              <th key={typeof step === 'string' ? step : step.name ?? idx} className="text-center capitalize">
                       {typeof step === 'string' ? step : step.name}
              </th>
            ))}
            { type_rep && <th className="text-center p-2">Progression</th> }
          </tr>
        </THead>
        <TBody>
         <tr className="font-semibold bg-gray-100 border-t">
            <td className="p-2 text-left">Total</td>
             { totalData && totalData.length>0 &&  <td className="text-center p-2"> { totalAgents  } </td> }
            { totalData && totalData.length>0 &&  <td className="text-center p-2">{(grandTotalAgent/div).toFixed(2) } / { totalAgents } ({(((grandTotalAgent/div) / totalAgents )*100).toFixed(2)}%) </td> }
            <td className="text-center p-2">{grandTotal}</td>
            {columnTotals.map((val, idx) => (
              <td key={`col-total-${idx}`} className="text-center p-2">
                {val}
              </td>
            ))}
          { type_rep && <td className="text-center p-2"> { ((columnTotals[1]/grandTotal) * 100).toFixed(2) }%</td> }
          </tr>

          {datab.map(({ week, values, total_agents, index }, i) => {
            const rowTotal = values.reduce((acc, val) => acc + val, 0);
            const perc = ((values[2] / rowTotal) * 100);
            let colorClass = '';
            if (perc <= 50) colorClass = 'text-red-500';
            else if (perc < 80) colorClass = 'text-orange-500';
            else if (perc >= 80) colorClass = 'text-green-500';

            return (
              <tr key={index} className="border-t">
                <td className="p-2 text-left font-semibold" >
              
                <StepDateRange start={week.start} end={week.end} key={index}> </StepDateRange>
                </td>
                 { totalData && totalData.length>0 && <td className="text-center font-semibold">
                    { totalData[i].new || 0 }
                </td> }
                { totalData && totalData.length>0 && <td className="text-center font-semibold">
                  { total_agents} / { (totalData[i].total ) || 0 } ( {(total_agents/ ((totalData[i].total ) || 0) * 100).toFixed(2)} %)
                </td> }
                <td className="text-center font-semibold">{rowTotal}</td>
                {values.map((value, i) => (
                  <td key={`${i}`} className="text-center">
                    {value || 0}
                  </td>
                ))}
                {type_rep && (
                <th
                  className={colorClass}
                >
                  {perc.toFixed(2)}%
                </th>
              )}
              </tr>
            );
          })}

          {/* Total Row */}
         
        </TBody>
      </Table>
      </>) }
    </div>
  );
}

export default WeekAIReport;
