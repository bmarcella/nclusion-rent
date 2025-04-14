/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pagination, Select } from '@/components/ui';
import { useTranslation } from '@/utils/hooks/useTranslation';
import { DocumentData, DocumentSnapshot, getDocs, limit, orderBy, Query, query, QueryConstraint, startAfter, Timestamp, updateDoc, where } from 'firebase/firestore';
import {  useEffect, useMemo, useState } from 'react';
import { getBankTask, taskCollection } from '@/services/Landlord';
import { BankTask } from '@/views/Entity';
import { useSessionUser } from '@/store/authStore';
import { getRegionIds, getRegionsById } from '@/views/Entity/Regions';
import { ColumnDef } from '@/components/shared/DataTable';
import Table from '@/components/ui/Table/Table';
import THead from '@/components/ui/Table/THead';
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import Tr from '@/components/ui/Table/Tr';
import Th from '@/components/ui/Table/Th';
import TBody from '@/components/ui/Table/TBody';
import Td from '@/components/ui/Table/Td';
import BankName from '@/views/bank/show/components/BankName';
import { formatRelative } from 'date-fns/formatRelative';
import { fr } from 'date-fns/locale/fr';

const pageSizeOption = [
    { value: 100, label: '100 / page' },
    { value: 200, label: '200 / page' },
]

interface Props {
    state : number;
}

function AllFreeTask ({ state } : Props ) {
  const [currentPage, setCurrentPage] = useState(1);

  const { t } = useTranslation();
  const [tasks, setTasks] = useState<any[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [pageDocs, setPageDocs] = useState<DocumentSnapshot[]>([]);
     // 
  const { userId, proprio , authority } = useSessionUser((state) => state.user);
  const [ regions, setRegions] = useState<number>(0);
  const [agents, setAgents] = useState<string>();
  const [start, setStart] = useState<Date>();
  const [end, setEnd] = useState<Date>();
  const [steps, setSteps] = useState<string>();
  const [states, setStates] = useState<string>();
      // 

  const getQueryDate = (q: Query<DocumentData, DocumentData>)  => {
           
              const filters: QueryConstraint[] = [];
  
              if (regions && regions != 0) {
                  filters.push(where('id_region', '==', regions));
              } else {
                  const ids = (proprio?.regions?.length==0 && authority && authority[0] == "admin") ? getRegionIds() : (proprio) ? proprio.regions : [];
                  filters.push(where("id_region", "in", ids))
              }
  
              if (agents) {
                  filters.push(where('createdBy', '==', agents));
              }
  
              if (states) {
                  filters.push(where('state', '==', states));
              }
             
              if (start && end) {
                  const isSameDay =
                  start.toDateString() === end.toDateString();
  
                  if (isSameDay) {
                  const startOfDay = new Date(start);
                  startOfDay.setHours(0, 0, 0, 0);
  
                  const endOfDay = new Date(end);
                  endOfDay.setHours(23, 59, 59, 999);
  
                  filters.push(where('createdAt', '>=', Timestamp.fromDate(startOfDay)));
                  filters.push(where('createdAt', '<=', Timestamp.fromDate(endOfDay)));
                  } else {
                  filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
                  filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
                  }
              } else {
                  if (start) {
                  filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
                  }
                  if (end) {
                  filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
                  }
              }
              return filters.length > 0 ? query(q, ...filters) : q;
   }
  

  const fetchTasks = async (pageNum: number) => {
          try {
            let q : Query<DocumentData>;
            if(state==0) {
               q = query(taskCollection, orderBy("createdAt", "asc"), where("contratId","==",""), limit(pageSizeOption[0].value));
            }
            else if(state==1 ) {
                q = query(taskCollection, orderBy("createdAt", "asc"), where('state', "==", "in-progress") , limit(pageSizeOption[0].value));
             } else {
                q = query(taskCollection, orderBy("createdAt", "asc"), where('state', "==", "completed") , limit(pageSizeOption[0].value));
             }
            q = getQueryDate(q);
             // If we're not on the first page, we need to start after a document
           if (pageNum > 1 && pageDocs[pageNum - 2]) {
             q = query(q, startAfter(pageDocs[pageNum - 2]));
            }
            const snapshot = await getDocs(q);
            const t: BankTask[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BankTask));
            console.log(t);
            setTasks(t);
          } catch (err) {
            console.error("Error fetching landlords:", err);
          }
    };

  const updateTaskState = async (taskId: string, state: string) => {
    try {
      const taskRef = getBankTask(taskId);
      await   updateDoc(taskRef, { state });
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? { ...task, state } : task))
      );
    } catch (error) {
      console.error("Error updating task state:", error);
    }
  }

  useEffect(() => {
    fetchTasks(1);
  }, []);

  const columns = useMemo<ColumnDef<BankTask>[]>(
    () => [
        {
            header: 'Bank',
            cell: ({ row }) => (
                <div>
                    { row.original.bankId && <p className="font-semibold"><BankName id={row.original.bankId}></BankName></p>}
                </div>
                ),
            
        },
        {
            header: 'Travaux',
            cell: ({ row }) => (
                <div>
                    { row.original.taskName && <p className="font-semibold">{t('bank.'+row.original.taskName)}</p>}
                </div>
                ),
            
        },
        {
            header: 'Régions',
            cell: ({ row }) => (
                <div>
                    { row.original.id_region && <p className="font-semibold">{getRegionsById(row.original.id_region).label}</p>}
                </div>
                ),
            
        },
        {
            header: 'Date création',
            cell: ({ row }) => (
                  <div className="min-w-[160px]">
                    <div className="font-medium"> {    formatRelative(row.original.createdAt.toDate?.() || row.original.createdAt, new Date(), { locale: fr } )  }</div>
                    </div>
                ),
            
        },
        {
            header: 'Etat',
            cell: ({ row }) => (
                  <div className="min-w-[160px]">
                    <Select
                    isDisabled={state!=2}
                  className="w-[140px]"
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'in-progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                  ]}
                  value={{ value: row.original.state, label: row.original.state.replace('-', ' ') }}
                  onChange={(val) => updateTaskState(row.original.id, val?.value)}
                />
                                       
                  </div>
                ),
            
        },
    ],
    [],
)

 const table = useReactTable({
        data: tasks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });
    const onPaginationChange = (page: number) => {
        table.setPageIndex(page - 1)
    }
    const onSelectChange = (value = 0) => {
        table.setPageSize(Number(value))
    }

  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-6 w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
  <div className="w-full  mt-6  p-6 ">
           <Table>
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </Th>
                                )
                            })}
                        </Tr>
                    ))}
                </THead>
                <TBody>
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <Tr key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <Td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </Td>
                                    )
                                })}
                            </Tr>
                        )
                    })}
                </TBody>
            </Table>
            <div className="flex items-center justify-between mt-4">
                <Pagination
                    pageSize={table.getState().pagination.pageSize}
                    currentPage={table.getState().pagination.pageIndex + 1}
                    total={totalData}
                    onChange={onPaginationChange}
                />
                <div style={{ minWidth: 130 }}>
                    <Select<Option>
                        size="sm"
                        isSearchable={false}
                        value={pageSizeOption.filter(
                            (option) =>
                                option.value ===
                                table.getState().pagination.pageSize,
                        )}
                        options={pageSizeOption}
                        onChange={(option) => onSelectChange(option?.value)}
                    />
                </div>

            </div>
        </div>

    </div>
  );
}

export default AllFreeTask;
