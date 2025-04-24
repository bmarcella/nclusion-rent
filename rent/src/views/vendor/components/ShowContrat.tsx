/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Pagination, Select } from '@/components/ui';
import { useTranslation } from '@/utils/hooks/useTranslation';
import { deleteDoc, doc, DocumentData, DocumentSnapshot, getDoc, getDocs, limit, orderBy, Query, query, QueryConstraint, startAfter, Timestamp, updateDoc, where } from 'firebase/firestore';
import {  useEffect, useMemo, useState } from 'react';
import { BankDoc, contractsDoc, getContratDoc } from '@/services/Landlord';
import { Bank, BankStep,  RenovContract, RenovStep } from '@/views/Entity';
import { useSessionUser } from '@/store/authStore';
import { ColumnDef } from '@/components/shared/DataTable';
import Table from '@/components/ui/Table/Table';
import THead from '@/components/ui/Table/THead';
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import Tr from '@/components/ui/Table/Tr';
import Th from '@/components/ui/Table/Th';
import TBody from '@/components/ui/Table/TBody';
import Td from '@/components/ui/Table/Td';
import { formatRelative } from 'date-fns/formatRelative';
import { fr } from 'date-fns/locale/fr';
import UserName from '@/views/bank/show/components/UserName';
import { hasAuthority } from '@/utils/RoleChecker';
import Currency from '@/views/shared/Currency';
import { PiCheck, PiEyeLight } from 'react-icons/pi';
import YesOrNoPopup from '@/views/shared/YesOrNoPopup';
import { useNavigate } from 'react-router-dom';
import ShowListBankName from './ShowListBankName';

const pageSizeOption = [
    { value: 100, label: '100 / page' },
    { value: 200, label: '200 / page' },
]


function ShowContrat ( ) {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate()
  const { t } = useTranslation();
  const [conts, setConts] = useState<any[]>([]);
  const [totalData, setTotalData] = useState(0);
  const [pageDocs, setPageDocs] = useState<DocumentSnapshot[]>([]);
     // 
  const { userId, authority } = useSessionUser((state) => state.user);

  const [start, setStart] = useState<Date>();
  const [end, setEnd] = useState<Date>();
  const [states, setStates] = useState<string>();
      // 

  const getQueryDate = (q: Query<DocumentData, DocumentData>)  => {
           
              const filters: QueryConstraint[] = [];

  
  
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
            if ( hasAuthority(authority, "admin") ) {
                q = query(contractsDoc, orderBy("createdAt", "desc"), limit(pageSizeOption[0].value));
            } else {
              q = query(contractsDoc, where('createdBy', '==', userId), orderBy("createdAt", "desc"), limit(pageSizeOption[0].value));
            }
            // q = getQueryDate(q);
             // If we're not on the first page, we need to start after a document
            if (pageNum > 1 && pageDocs[pageNum - 2]) {
             q = query(q, startAfter(pageDocs[pageNum - 2]));
            }
            const snapshot = await getDocs(q);
            const t: RenovContract[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RenovContract));
            console.log(t);
            setConts(t);
          } catch (err) {
            console.error("Error fetching landlords:", err);
          }
    };

 

  useEffect(() => {
    fetchTasks(1);
  }, []);

  const columns = useMemo<ColumnDef<RenovContract>[]>(
    () => [
        {
            header: 'Vendeur',
            cell: ({ row }) => (
                <div>
                    { row.original.assignee && <p className="font-semibold"><UserName userId={row.original.assignee} keyName='id'/></p>}
                </div>
                ),
            
        },
        {
            header: 'Type ',
            cell: ({ row }) => (
                <div>
                    { row.original.renovStep && <p className="font-semibold">
                        {t('bank.'+row.original.renovStep) }
                       </p>}
                </div>
                ),
            
        },
        {
            header: 'Date',
            cell: ({ row }) => (
                  <div className="min-w-[160px]">
                      <div className="font-medium">  Debut :{    formatRelative(row.original.startDate.toDate?.() || 
                      row.original.startDate, new Date(), { locale: fr } )  }</div>
                        <div className="font-medium"> Fin : {    formatRelative(row.original.endDate.toDate?.() || row.original.endDate, new Date(), { locale: fr } )  }</div>
                    </div>
                ),
            
        },
       
        {
            header: 'Paiement',
            cell: ({ row }) => (
                   <div className="min-w-[160px]">
                      <div className="font-medium">Total : <Currency amount = {row.original.montant_total} /></div>
                      <div className="font-medium"> Initial : <Currency amount = {row.original.montant_initial} /> </div>
                      <div className="font-medium"> Balance : {  <Currency amount = { (row.original.montant_total -row.original.montant_initial)} />   }</div>
                    </div>
                ),
            
        },
        {
            header: 'Etat',
            cell: ({ row }) => (
                  <div className="min-w-[160px]">
                     { !row.original.completed && <div className="font-medium text-orange-500"> encours </div> }
                     { row.original.completed && <div className="font-medium text-green-500"> terminé </div> }
                    </div>
                ),
            
        },
        {
            header: 'Bank',
            cell: ({ row }) => (
                 <div className="min-w-[160px]">
                  <ShowListBankName bankIds={row.original.banksId} />
                  </div>
                ),
            
        },
        {
            header: 'Action',
            cell: ({ row }) => {
              return (
                <div className="min-w-[200px]">
                    { (hasAuthority(authority, 'admin') || row.original.createdBy == userId  ) && !row.original.completed  &&
                     <Button variant="solid"  shape="circle" size="xs" className='mr-1'  onClick={()=> { completContrat(row.original.id); }}>
                        <PiCheck />
                     </Button> }
                     <Button className="ml-1 bg-green-300 hover:bg-green-400 border-0 hover:ring-0" variant="solid" shape="circle" size="xs"  onClick={() => navigate("/contrat/"+row.original.id) }>
                          <PiEyeLight />
                     </Button>
                     {  !row.original.completed  && <YesOrNoPopup Ok={yes} id={row.original.id} ></YesOrNoPopup>}
                </div>);
            } 
        },
    ],
    [],
)

 const table = useReactTable({
        data: conts,
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
  const yes  = async  (id : string ) =>{
           try {
               const contrat = await conts.find((cont) => cont.id === id) as RenovContract;
               updateBanksForDelete(contrat.banksId, contrat.renovStep);
               const contRef = getContratDoc(id);
               await deleteDoc(contRef);
               setConts((prevConts) => prevConts.filter((cont) => cont.id !== id));
              } catch (err) {
                console.error("Error fetching landlords:", err);
              }
  }

  const completContrat  = async (id: string) => {
    try {
        const contRef = getContratDoc(id);
        const contSnap = await getDoc(contRef);
        if (contSnap.exists()) {
            const data = contSnap.data() as RenovContract;
            await updateDoc(contRef, {
                completed: true,
                updatedAt: new Date(),
                updatedBy: userId,
                completedBy: userId,
                completedAt: new Date(),
            })
            setConts((prevConts) => prevConts.map((cont) => (cont.id === id ? { ...cont, completed: true } : cont)));
            completedBanks(data.banksId, data.renovStep);
        } else {
            console.log("Document does not exist!");
        }
    } catch (err) {
        console.error("Error fetching landlords:", err);
    }
  }

  async function completedBanks(banksId: any[],  renovStep: string) {
    try {
      const data = (renovStep == "renovSteps.peinture" )  ? 
      {
       paintedAt: new Date(),
       updatedAt: new Date(),
       updatedBy: userId,
       step:  "bankSteps.readyToUse" as BankStep,
       renovStep: "renovSteps.completed" as RenovStep,
      } : 
      {
        comptoireBuildedAt: new Date(),
        updatedAt: new Date(),
        updatedBy: userId,
      } as Partial<Bank>; 

      const updatePromises = banksId.map((bankId) => {
        const bankRef = doc(BankDoc, bankId);
        return updateDoc(bankRef,data);
      });
      await Promise.all(updatePromises);
      console.log("Banks updated successfully");
    
    } catch (error) {
      console.error("Error updating banks:", error);
      throw new Error("Failed to update banks");
    }
  }

  async function updateBanksForDelete(banksId: any[],  renovStep: string) {
      try {
        const data =  {
        comptoireContratId : '',
        renovStep :  renovStep as RenovStep,
        updatedAt: new Date(),
        }  as Partial<Bank> ; 

        const updatePromises = banksId.map((bankId) => {
          const bankRef = doc(BankDoc, bankId);
          return updateDoc(bankRef,data);
        });
        await Promise.all(updatePromises);
        console.log("Banks updated successfully");
      } catch (error) {
        console.error("Error updating banks:", error);
        throw new Error("Failed to update banks");
      }
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

export default ShowContrat;
