
import Table from '@/components/ui/Table';
import TBody from '@/components/ui/Table/TBody';
import THead from '@/components/ui/Table/THead';
import { fetchReportPerCreator } from '@/services/Report';
import UserName from '@/views/bank/show/components/UserName';
import React, { useEffect, useState } from 'react'

function AIReport() {
    const [data, setData] = useState<any[]>([]);
    const [steps, setSteps] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
        fetchReportPerCreator().then((result) => {
        setData(result);
        console.log("result", result);

         const total = result.reduce((sum, item) => {
            const itemTotal = item.values.reduce((acc, val) => acc + val, 0);
            return sum + itemTotal;
          }, 0);

        setSteps(result[0].steps);
        setLoading(false);
      });
    }, []);
  
    if (loading) return <p>Chargement du rapport...</p>;
    
  return (
    <div className="overflow-x-auto p-2 bg-white rounded-lg shadow-md">
    <Table>
      <caption className="text-lg font-semibold text-gray-700 p-4">
        Rapport par agent immobilier
      </caption>
      <THead>
        <tr>
          <th>Agents</th>
          {data.length > 0 &&
            data[0].steps.map((step) => (
              <th key={step} className=" text-center">
                {step}
              </th>
            ))}
            <th>Total</th>
        </tr>
        </THead>
        <TBody>
        {data.map(({ name, values }) => (
          <tr key={name} className="border-t">
            <td className="p-2">{<UserName userId={name} ></UserName>}</td>
            {values.map((value, index) => (
              <td key={`${name}-${index}`}  className="text-center">
                {value || 0}
              </td>
            ))}
              <td className="p-2">{ }</td>
          </tr>
        ))}
      </TBody>
      </Table>
  </div>
  
  );
}

export default AIReport