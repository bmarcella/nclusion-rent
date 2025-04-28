import React, { useEffect, useState } from 'react';
import Table from '@/components/ui/Table';
import THead from '@/components/ui/Table/THead';
import TBody from '@/components/ui/Table/TBody';
import { fetchReportPerReport } from '@/views/Entity/Regions';

function RegionReport() {
  const [data, setData] = useState<any[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportPerReport().then((result) => {
      setData(result);

      if (result.length > 0) {
        setSteps(result[0].steps);
      }

      setLoading(false);
    });
  }, []);

  if (loading) return <p>Chargement du rapport...</p>;

  // Calculate total per column (step)
  const columnTotals = steps.map((_, index) =>
    data.reduce((sum, item) => sum + (item.values[index] || 0), 0)
  );

  // Calculate grand total (sum of all values)
  const grandTotal = columnTotals.reduce((acc, val) => acc + val, 0);

  return (
    <div className="overflow-x-auto p-1 bg-white rounded-lg shadow-md">
      <Table>
        <caption className="text-lg font-semibold text-gray-700 p-4">
          Rapport par agent immobilier
        </caption>
        <THead>
          <tr>
            <th>Regions</th>
            {steps.map((step) => (
              <th key={step} className="text-center capitalize">
                {step}
              </th>
            ))}
            <th>Total</th>
          </tr>
        </THead>
        <TBody>
         <tr className="font-semibold bg-gray-100 border-t">
            <td className="p-2 text-left">Total</td>

            {columnTotals.map((val, idx) => (
              <td key={`col-total-${idx}`} className="text-center p-2">
                {val}
              </td>
            ))}
            <td className="text-center p-2">{grandTotal}</td>
          </tr>
          {data.map(({ name, values }) => {
            const rowTotal = values.reduce((acc, val) => acc + val, 0);

            return (
              <tr key={name} className="border-t">
                <td className="p-2">
                   { name }
                </td>
                {values.map((value, index) => (
                  <td key={`${name}-${index}`} className="text-center">
                    {value || 0}
                  </td>
                ))}
                <td className="text-center font-semibold">{rowTotal}</td>
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
