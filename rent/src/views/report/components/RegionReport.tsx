/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Table from '@/components/ui/Table';
import THead from '@/components/ui/Table/THead';
import TBody from '@/components/ui/Table/TBody';
import { fetchReportPerReport } from '@/views/demo/Entity/Regions';
import ReportTypeFilter from './ReportTypeFilter';
import {  ReportStepsFull, ReportStepsSimple } from '@/views/demo/Entity';
import { DocumentData, query, Query } from 'firebase/firestore';
import { BankDoc } from '@/services/Landlord';
import { getQueryFilters, getQueryFiltersDate } from '@/services/Report';

function RegionReport() {
  const [data, setData] = useState<any[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [type_rep, setTypeRep] = useState<boolean>();
  const [start, setStart] = useState<Date>();
  const [end, setEnd] = useState<Date>();

  useEffect(() => {
     let q: Query<DocumentData> = query(BankDoc);
     const steps = (type_rep) ? ReportStepsSimple : ReportStepsFull ;
     q = getQueryFiltersDate(q, {
      start: start,
      end: end,
    })
    fetchReportPerReport(steps, q).then((result) => {
      setData(result);
      if (result.length > 0) {
        setSteps(result[0].steps);
      }
      setLoading(false);
    });
  }, [type_rep, start, end]);

  if (loading) return <p>Chargement du rapport...</p>;

  // Calculate total per column (step)
  const columnTotals = steps.map((_, index) =>
    data.reduce((sum, item) => sum + (item.values[index] || 0), 0)
  );

  // Calculate grand total (sum of all values)
  const grandTotal = columnTotals.reduce((acc, val) => acc + val, 0);
  const grandTotalAgent = data.reduce((acc, item) => acc + item.total_agents, 0);

  const onChangeType = async (type_rep: boolean) => {
    setTypeRep(type_rep);
  }
  const onChangeDate = async (start: Date, end: Date) => {
    setStart(start);
    setEnd(end);
 }
  return (
    <div className="overflow-x-auto p-1 bg-white rounded-lg shadow-md">
      <ReportTypeFilter onChangeReportTypeA={onChangeType}  onChangeDate = {onChangeDate}></ReportTypeFilter>
      <Table>
        <caption className="text-lg font-semibold text-gray-700 p-4">
          Rapport par région
        </caption>
        <THead>
          <tr>
            <th>Regions</th>
            { !type_rep && <th>Agents</th> }
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
            { !type_rep && <td className="text-center p-2">{grandTotalAgent}</td> }
            <td className="text-center p-2">{grandTotal}</td>
            {columnTotals.map((val, idx) => (
              <td key={`col-total-${idx}`} className="text-center p-2">
                {val}
              </td>
            ))}
          { type_rep && <td className="text-center p-2"> { ((columnTotals[1]/grandTotal) * 100).toFixed(2) }%</td> }
          </tr>

          {data.map(({ name, values, total_agents }) => {
            const rowTotal = values.reduce((acc, val) => acc + val, 0);

            return (
              <tr key={name} className="border-t">
                <td className="p-2">
                   { name }
                </td>
                { !type_rep && <td className="text-center font-semibold">
                  {total_agents}
                </td> }
                <td className="text-center font-semibold">{rowTotal}</td>
                {values.map((value, index) => (
                  <td key={`${name}-${index}`} className="text-center">
                    {value || 0}
                  </td>
                ))}
                {type_rep && (
                <th
                  className={
                    ((values[1] / rowTotal) * 100) < 50 ? 'text-red-600' : 'text-green-600'
                  }
                >
                  {((values[1] / rowTotal) * 100).toFixed(2)}%
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

export default RegionReport;
