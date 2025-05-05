import React, { useEffect, useState } from 'react';
import Table from '@/components/ui/Table';
import THead from '@/components/ui/Table/THead';
import TBody from '@/components/ui/Table/TBody';
import { fetchReportPerCreator, getQueryFilters } from '@/services/Report';
import UserName from '@/views/bank/show/components/UserName';
import FilterBank from '@/views/bank/show/components/FilterBank';
import useTranslation from '@/utils/hooks/useTranslation';
import { useNavigate } from 'react-router';
import { useSessionUser } from '@/store/authStore';
import { BankDoc } from '@/services/Landlord';
import { Query, DocumentData, query } from 'firebase/firestore';
import ReportTypeFilter from './ReportTypeFilter';
import {  ReportSteps, ReportStepsFull } from '@/views/Entity';
function AIReport() {
  const [data, setData] = useState<any[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { proprio , authority } = useSessionUser((state) => state.user);
  // -------------------
  const [ regions, setRegions] = useState<number>(0);
  const [agents, setAgents] = useState<string>();
  const [start, setStart] = useState<Date>();
  const [end, setEnd] = useState<Date>();
  const [type_rep, setTypeRep] = useState<boolean>();

  useEffect(() => {
    const q: Query<DocumentData> = query(BankDoc);
    const steps = (type_rep) ? ReportSteps : ReportStepsFull ;
    fetchReportPerCreator(steps, getQueryFilters(q, {
      regions: regions,
      agents: agents,
      start: start,
      end: end,
      authority: authority,
      proprio: proprio
    })).then((result) => {
      setData(result);

      if (result.length > 0) {
        setSteps(result[0].steps);
      }

      setLoading(false);
    });
  }, [regions, agents, start, end, type_rep]);

  if (loading) return <p>Chargement du rapport...</p>;

  // Calculate total per column (step)
  const columnTotals = steps.map((_, index) =>
    data.reduce((sum, item) => sum + (item.values[index] || 0), 0)
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

 const onChangeDate = async (start: Date, end: Date) => {
    setStart(start);
    setEnd(end);
 }

  // Calculate grand total (sum of all values)
  const grandTotal = columnTotals.reduce((acc, val) => acc + val, 0);

  return (
    <div className="overflow-x-auto p-1 bg-white rounded-lg shadow-md">

          <FilterBank  authority={authority || []} proprio={proprio} t={t}
           onChangeRegion={onChangeRegion} 
           onChangeAgent={onChangeAgent} 
           onChangeDate = {onChangeDate}
          >

          </FilterBank> 

          <ReportTypeFilter onChangeReportTypeA={onChangeType} ></ReportTypeFilter>
      <Table>
        <caption className="text-lg font-semibold text-gray-700 p-4">
          Rapport par agent immobilier
        </caption>
        <THead>
          <tr>
            <th>Agents</th>
            <th>Total</th>
            {steps.map((step) => (
              <th key={step} className="text-center capitalize">
                {step}
              </th>
            ))}
            { type_rep && <th>Progression</th> }
          </tr>
        </THead>
        <TBody>
         <tr className="font-semibold bg-gray-100 border-t">
            <td className="p-2 text-left">Total</td>
            <td className="text-center p-2">{grandTotal}</td>
            {columnTotals.map((val, idx) => (
              <td key={`col-total-${idx}`} className="text-center p-2">
                {val}
              </td>
            ))}

            { type_rep && <td className="text-center p-2"> { ((columnTotals[2]/grandTotal) * 100).toFixed(2) }%</td> }
         
          </tr>
          {data.map(({ name, values }) => {
            const rowTotal = values.reduce((acc, val) => acc + val, 0);
            const perc = ((values[2] / rowTotal) * 100);
            let colorClass = '';
            if (perc <= 50) colorClass = 'text-red-500';
            else if (perc < 80) colorClass = 'text-orange-500';
            else if (perc >= 80) colorClass = 'text-green-500';
            return (
              <tr key={name} className="border-t">
                <td className="p-2">
                  <UserName userId={name} />
                </td>
                <td className="text-center font-semibold">{rowTotal}</td>
                {values.map((value, index) => (
                  <td key={`${name}-${index}`} className="text-center">
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
    </div>
  );
}

export default AIReport;
