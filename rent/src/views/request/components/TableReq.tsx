// /* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import {
//     getDocs,
//     query,
//     orderBy,
//     limit,
//     startAfter,
//     DocumentSnapshot,
//     getDoc,
//     where,
//     DocumentData,
//     Query,
//     QueryConstraint,
//     Timestamp,
//     getCountFromServer,
//   } from 'firebase/firestore';
// import  { useEffect, useMemo, useRef, useState } from 'react';
// import {  BankStep } from '@/views/Entity';
// import {  ExpenseRequestDoc } from '@/services/Landlord';
// import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
// import Table from '@/components/ui/Table';
// import { Alert, Button, Dialog, Pagination, Select, Tabs, Tooltip } from '@/components/ui';
// import { useSessionUser } from '@/store/authStore';
// import { PiCheck, PiEyeLight } from 'react-icons/pi';
// import { useWindowSize } from '@/utils/hooks/useWindowSize';
// import TabContent from '@/components/ui/Tabs/TabContent';
// import TabList from '@/components/ui/Tabs/TabList';
// import TabNav from '@/components/ui/Tabs/TabNav';
// import { BiConversation, BiEdit, BiImage, BiMap } from 'react-icons/bi';
// import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage';
// import { formatRelative } from 'date-fns';
// import { fr } from 'date-fns/locale';
// import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { getRegionIds } from '@/views/Entity/Regions';
// import classNames from 'classnames';
// import { HiHome } from 'react-icons/hi';
// import YesOrNoPopup from '@/views/shared/YesOrNoPopup';
// import { deleteReqType } from '@/services/firebase/BankService';
// import FilterBank from '@/views/bank/show/components/FilterBank';
// import { hasAuthority } from '@/utils/RoleChecker';
// import Currency from '@/views/shared/Currency';
// import { RequestType } from '@/views/Entity/Request';
// import FilterMyBank from '@/views/bank/show/components/FilterMyBank';
// import UserName from '@/views/bank/show/components/UserName';
// import MapPopup from '@/views/bank/show/MapPopup';
// import BankStepBadge from '@/views/bank/show/components/BankStep';

// const { Tr, Th, Td, THead, TBody } = Table
// const pageSizeOption = [
//     { value: 100, label: '100 / page' },
//     { value: 200, label: '200 / page' },
// ]

//    type Option = {
//         value: number
//         label: string
//     }

//     interface Props {
//         mode: 'sent' | 'recieved' | 'all';
//         step?: string;
//         all?: boolean;
//    }
//   export function TableReq ( { mode, step }: Props) { 
//     const [page, setPage] = useState(1);
//     const [hasNext, setHasNext] = useState(true);
//     const [objs, setObjs] = useState<RequestType[]>([]);
//     const [currentPage, setCurrentPage] = useState(0);
//     const [pageDocs, setPageDocs] = useState<DocumentSnapshot[]>([]);
//     const fetchedRef = useRef(false);
//     const [totalData, setTotalData] = useState(1);
   
//     const [cObj, setCObj] = useState<RequestType>();
//     const { width, height } = useWindowSize();
//     const [message, setMessage] = useTimeOutMessage();
//     const [alert, setAlert] = useState("success") as any;
//     const { t } = useTranslation();
//     const navigate = useNavigate()
//     // 
//     const { userId, proprio , authority } = useSessionUser((state) => state.user);
//     const [ regions, setRegions] = useState<number>(0);
//     const [start, setStart] = useState<Date>();
//     const [end, setEnd] = useState<Date>();
//     const [steps, setSteps] = useState<string>();

//     // 
//      const [dialogIsOpen, setIsOpen] = useState(false)
//     const openDialog = (obj: RequestType) => {
//         setCObj(obj);
//         setIsOpen(true)
//     }

//     const onDialogClose = () => {
//         setIsOpen(false)
//     }
//     const yes  = async  (idToDel: string) => {
//                 await deleteReqType(idToDel || '');
//                 setObjs(prev => prev.filter(item => item.id !== idToDel));
//     }

//     const columns = useMemo<ColumnDef<any>[]>(
//         () => [
//             {
//                 header: 'Envoyé par',
//                 cell: ({ row }) => (
//                     <div>
//                         <Tooltip
//                             title= {
//                                 <div>
//                                     Urgent: {' '}
//                                     { row.original.urgency && <strong className="text-green-400"> Oui </strong> } <br />
//                                     { !row.original.urgency && <strong className="text-yellow-400"> Non </strong> }
//                                     Id: {' '}
//                                     { row.original.id && <strong className="text-green-400"> { row.original.id } </strong> }
//                                 </div>
                                
//                             }
//                         >
//                             <span className="cursor-pointer">{ row.original.bankName}</span>
//                         </Tooltip>
//                     </div>
//                     ),
                
//             },
//             {
//                 header: 'Proprietaire',
//                 cell: ({ row }) => (
//                  <div className="min-w-[160px]">
//                     <div className="font-medium">  { ( row.original?.landlord) ? row.original?.landlord?.fullName : "" } </div>
//                     <div className="text-sm text-gray-500">{ ( row.original?.landlord) ? row.original?.landlord?.phone : "" }</div>
//                   </div>
//                  ),
//             },
//             {
//                 header: 'Agent',
//                 cell: ({ row }) => (
//                  <div className="min-w-[160px]">
//                     <div className="font-medium">  { ( row.original?.createdBy) ? <UserName userId={row.original.createdBy} /> : "" } </div>
//                   </div>
//                  ),
//             },
//             {
//                 header: 'Prix',
//                 cell: ({ row }) => (
//                     <div className="min-w-[160px]">
//                        <div className="font-medium"> Initial : <Currency amount={row.original.rentCost}></Currency></div>
//                         { (row.original?.final_rentCost && row.original?.final_rentCost>0) && 
//                        <div className="font-medium"> Final : <Currency amount={row.original.final_rentCost}></Currency>
//                        </div> }
//                      </div>
//                     ),
//             },
//             {
//               header: 'Ville',
//               cell: ({ row }) => (
//                 <div>
//                     <MapPopup bank={row.original}/>
//                 </div>
//                 ),
//             },
//             {
//                 header: 'Date de création',
//                 cell: ({ row }) => (
//                     <div className="min-w-[160px]">
//                        <div className="font-medium"> {    formatRelative(row.original.createdAt.toDate?.() || row.original.createdAt, new Date(), { locale: fr } )  }</div>
//                      </div>
//                     ),
//             },
//             {
//                 header: 'Etape',
//                 cell: ({ row }) => (
//                     <div className="min-w-auto">
//                        <BankStepBadge renovStep={row.original?.renovStep} step={row.original.step} finaldec={row.original.finalDecision} isAgent={isAgent}/>
//                      </div>
//                     ),
//             },
//             {
//                 header: 'Action',
//                 cell: ({ row }) => {
//                  if (!step && !all) return (
//                         <div>
//                         <Button variant="solid"  shape="circle" size="xs" onClick={() => openDialog(row.original)}>
//                             <PiEyeLight />
//                          </Button>
//                          {  <YesOrNoPopup Ok={yes} id={row.original.id} ></YesOrNoPopup> }
//                     </div>);
//                  else return (
//                     <div className="min-w-[200px]">
//                         { (hasAuthority(authority, 'admin')  || hasAuthority(authority, 'super_manager'))&&
//                          <Button variant="solid"  shape="circle" size="xs" className='mr-1 '  onClick={() => openDialog(row.original)}>
//                             <PiEyeLight />
//                          </Button> }
//                          <Button className="ml-1 bg-green-300 hover:bg-green-400 border-0 hover:ring-0" variant="solid" shape="circle" size="xs"  onClick={() => navigate("/bank/"+row.original.id) }>
//                             <PiCheck />
//                          </Button>
//                          {  <YesOrNoPopup Ok={yes} id={row.original.id} ></YesOrNoPopup>}
//                     </div>);
//                 } 
//             },
//         ],
//         [],
//     )

//     const getQueryDate = (q: Query<DocumentData, DocumentData>)  => {
         
//             const filters: QueryConstraint[] = [];

//             if (regions && regions != 0) {
//                 filters.push(where('id_region', '==', regions));
//             } else {
//                 const ids = (proprio?.regions?.length==0 && authority && authority[0] == "admin") ? getRegionIds() : (proprio) ? proprio.regions : [];
//                 filters.push(where("id_region", "in", ids))
//             }

        

//             if (steps) {
//                 filters.push(where('step', '==', steps));
//             }
           
//             if (start && end) {
//                 const isSameDay =
//                 start.toDateString() === end.toDateString();

//                 if (isSameDay) {
//                 const startOfDay = new Date(start);
//                 startOfDay.setHours(0, 0, 0, 0);

//                 const endOfDay = new Date(end);
//                 endOfDay.setHours(23, 59, 59, 999);

//                 filters.push(where('createdAt', '>=', Timestamp.fromDate(startOfDay)));
//                 filters.push(where('createdAt', '<=', Timestamp.fromDate(endOfDay)));
//                 } else {
//                 filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
//                 filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
//                 }
//             } else {
//                 if (start) {
//                 filters.push(where('createdAt', '>=', Timestamp.fromDate(start)));
//                 }
//                 if (end) {
//                 filters.push(where('createdAt', '<=', Timestamp.fromDate(end)));
//                 }
//             }
//             return filters.length > 0 ? query(q, ...filters) : q;
//     }

//     const fetchTotalCount = async () => {
//         let q: Query<DocumentData>;
//            q = query(ExpenseRequestDoc, orderBy("createdAt", "desc"));
//         if (!step) {
//             if (mode === 'sent') {
//                 q = query(q, where("createdBy", "==", userId));
//             } 
//         } else {
//             q = query(q, where("step", "==", step));
//         }
//         q = getQueryDate(q);
//         const snapshot = await getCountFromServer(q);  // 🚀 NOT getDocs!
//         setTotalData(snapshot.data().count);
//     };

//     const fetchObjs = async (pageNum: number) => {
//         let q: Query<DocumentData>;
//         q = query(ExpenseRequestDoc, orderBy("createdAt", "desc"), limit(pageSizeOption[0].value));
//         if (!step) {
//             if (mode === 'sent') {
//                 q = query(q, where("createdBy", "==", userId));
//             } 
//         } else {
//             q = query(q, where("step", "==", step));
//         }
//         q = getQueryDate(q);
    
//         // Only if not first page
//         if (pageNum > 1 && pageDocs[pageNum - 2]) {
//             q = query(q, startAfter(pageDocs[pageNum - 2]));
//         }

//         fetchTotalCount();
    
//         const snapshot = await getDocs(q);
        
//         const newObjs = await Promise.all(
//             snapshot.docs.map(async (docSnap) => {
//                 const data = docSnap.data();
//                 return { id: docSnap.id, ...data }  as RequestType;
//             })
//         );

//         console.log("Banks: ", newObjs);
    
//         // Instead of replacing, accumulate
//         setObjs((prevBanks: any) => (pageNum === 1 ? newObjs : [...prevBanks, ...newObjs]));
//         setCurrentPage(pageNum);
    
//         // Important: set the last doc for next page
//         if (snapshot.docs.length > 0) {
//             setPageDocs((prev) => {
//                 const updated = [...prev];
//                 updated[pageNum - 1] = snapshot.docs[snapshot.docs.length - 1];
//                 return updated;
//             });
//         }
    
//         // (optional) update totalData properly if you fetched total separately
//     };
    
//     useEffect(() => {
//         if (fetchedRef.current) return;
//         fetchObjs(1); // load first page
//       }, []);

//     useEffect(() => {
//         fetchObjs(1);
//      }, [start, end, regions, steps]);


//     const table = useReactTable({
//         data: objs,
//         columns,
//         getCoreRowModel: getCoreRowModel(),
//         getFilteredRowModel: getFilteredRowModel(),
//         getPaginationRowModel: getPaginationRowModel(),
//     })

//     const onPaginationChange = (page: number) => {
//         if (page > currentPage) {
//             fetchObjs(page); // fetch next page when needed
//         }
//         table.setPageIndex(page - 1);
//     }

//     const onSelectChange = (value = 0) => {
//         table.setPageSize(Number(value))
//     }

//     const onChangeBank = (payload: any, step:number) => {
//     if(step != 1) {
//         setCObj((prev: any) => {
//             const updatedData = { ...prev, ...payload };
//             setCObj((prev: any) => {
//                 if (!cObj) return prev;
//                  const index = prev.findIndex((b: any) => b.id === updatedData.id);
//                  if (index !== -1) {
//                      const updated = [...prev];
//                      updated[index] = updatedData;
//                      return updated;
//                  }
//                  return prev;
//              });
//             return updatedData;
//         });
//     } else {
//         fetchObjs(currentPage);
//     }

//     }


//     const onChangeRegion = async (id: number) => {
//         console.log("onChangeRegion: ", id);
//         setRegions(id);
//     }

//      const onChangeDate = async (start: Date, end: Date) => {
//         setStart(start);
//         setEnd(end);
//      }
//      const onChangeStep = async (step: BankStep) => {
//         console.log("onChangeStep: ", step);
//         setSteps(step);
//      }
//     return (
//       <div>
//          <div className="grid grid-cols-6 gap-4 mt-6 mb-6">
//             <div className={classNames( 'rounded-2xl p-4 flex flex-col justify-center','bg-green-100' )} >
//                 <div className="flex justify-between items-center relative">
//                     <div>
//                         <div className="mb-4 text-gray-900 font-bold">{'Total banks'}</div>
//                         <h1 className="mb-1 text-gray-900">{totalData}</h1>
//                     </div>
//                     <div
//                         className={
//                             'flex items-center justify-center min-h-12 min-w-12 max-h-12 max-w-12 bg-gray-900 text-white rounded-full text-2xl md:hidden'
//                         }
//                     >
//                     <HiHome />
//                     </div>
//                 </div>
//             </div>
//           </div>
//           { 
//           <FilterBank  authority={authority || []} proprio={proprio} t={t}
//            onChangeRegion={onChangeRegion} 
//            onChangeDate = {onChangeDate}
//            isMap = {false}
//           >
//           </FilterBank> }

//         { step && <FilterMyBank  onChangeStep={onChangeStep}  t={t}  ></FilterMyBank> } 
      
//         <div className="w-full  mt-6 bg-gray-50 dark:bg-gray-700 rounded-sm p-6 shadow">
//           {   <>
//             <Table>
//                 <THead>
//                     {table.getHeaderGroups().map((headerGroup) => (
//                         <Tr key={headerGroup.id}>
//                             {headerGroup.headers.map((header) => {
//                                 return (
//                                     <Th
//                                         key={header.id}
//                                         colSpan={header.colSpan}
//                                     >
//                                         {flexRender(
//                                             header.column.columnDef.header,
//                                             header.getContext(),
//                                         )}
//                                     </Th>
//                                 )
//                             })}
//                         </Tr>
//                     ))}
//                 </THead>
//                 <TBody>
//                     {table.getRowModel().rows.map((row) => {
//                         return (
//                             <Tr key={row.id}>
//                                 {row.getVisibleCells().map((cell) => {
//                                     return (
//                                         <Td key={cell.id}>
//                                             {flexRender(
//                                                 cell.column.columnDef.cell,
//                                                 cell.getContext(),
//                                             )}
//                                         </Td>
//                                     )
//                                 })}
//                             </Tr>
//                         )
//                     })}
//                 </TBody>
//             </Table>
//             </> }
//             <div className="flex items-center justify-between mt-4">
//                 <Pagination
//                     pageSize={table.getState().pagination.pageSize}
//                     currentPage={table.getState().pagination.pageIndex + 1}
//                     total={totalData}
//                     onChange={onPaginationChange}
//                 />
//                 <div style={{ minWidth: 130 }}>
//                     <Select<Option>
//                         size="sm"
//                         isSearchable={false}
//                         value={pageSizeOption.filter(
//                             (option) =>
//                                 option.value ===
//                                 table.getState().pagination.pageSize,
//                         )}
//                         options={pageSizeOption}
//                         onChange={(option) => onSelectChange(option?.value)}
//                     />
//                 </div>

//             </div>
//         </div>

//              <Dialog
//                 isOpen={dialogIsOpen}
//                 width={ width * 0.9 }
//                 height={height * 0.9}
//                 onClose={onDialogClose}
//                 >
//                 <div className="flex flex-col h-full px-4 py-6 bg-white dark:bg-gray-900 overflow-hidden">
//                    <div className="flex flex-col gap-4">
//                         <h5 className="text-lg font-semibold mb-4">
//                         {cbank?.bankName || ''}
//                         </h5>
//                     </div>

//             <div className="flex-1 overflow-y-auto">
//             <Tabs defaultValue="tab1">
//                 <TabList>
//                     <TabNav value="tab1" icon={<BiEdit />}>
//                         Informations generales
//                     </TabNav>
//                     <TabNav value="tab2" icon={<BiImage />}>
//                         Images
//                     </TabNav>
//                     <TabNav value="tab3" icon={<BiConversation />}>
//                         Commentaires
//                     </TabNav>
//                     <TabNav value="tab4" icon={<BiMap />}>
//                         Map
//                     </TabNav>
//                 </TabList>
//                 <div className="p-4">
//                     <TabContent value="tab1">
//                     {cbank?.id && (
//                         <EditBank
//                         docRef={cbank}
//                         id={cbank.id}
//                         userId={userId || ''}
//                         onChangeBank={onChangeBank}
//                         />
//                     )}
//                     </TabContent>
//                     <TabContent value="tab2">
//                         {message && (
//                         <Alert showIcon className="mt-6 mb-6" type={alert}>
//                             <span className="break-all ">{message}</span>
//                         </Alert>
//                         )}

//                             <Tabs defaultValue="2tab1">
//                                 <TabList>
                        
//                                     <TabNav value="2tab1" icon={<BiImage />}>
//                                         Banks
//                                     </TabNav>
//                                     <TabNav value="2tab2" icon={<BiImage />}>
//                                         Proprietaires
//                                     </TabNav>
//                                 </TabList>
//                                 <div className="p-4">
                                
//                                     <TabContent value="2tab1">
//                                         {message && (
//                                         <Alert showIcon className="mt-6 mb-6" type={alert}>
//                                             <span className="break-all ">{message}</span>
//                                         </Alert>
//                                         )}
//                                         { cbank?.id && <ImageBank nextStep={nextStep} bankId={cbank.id}  userId={userId || ''} isEdit={true}></ImageBank> }
//                                     </TabContent>

//                                     <TabContent value="2tab2">
//                                         {message && (
//                                         <Alert showIcon className="mt-6 mb-6" type={alert}>
//                                             <span className="break-all ">{message}</span>
//                                         </Alert>
//                                         )}
//                                         { cbank?.id && cbank?.landlord?.id && 
//                                         <ImageLandlord nextStep={nextStep}
//                                           lordId={cbank.landlord.id} 
//                                           userId={userId || ''} 
//                                           isEdit={true}></ImageLandlord> }
//                                     </TabContent>
//                                 </div>
//                             </Tabs>
//                     </TabContent>
//                     <TabContent value="tab3">
//                     {message && (
//                         <Alert showIcon className="mt-6 mb-6" type={alert}>
//                             <span className="break-all ">{message}</span>
//                         </Alert>
//                         )}
//                     { cbank?.id && <CommentsBank nextStep={nextStep}
//                       bankId={cbank.id} 
//                       userId={userId || ''} 
//                       isEdit={true}/> }
//                     </TabContent>

//                     <TabContent value="tab4">
//                          { cbank?.id && location && <ChangeLocation location={location} bankId={cbank.id} ></ChangeLocation>}
//                          { cbank?.location &&  <GoogleMapApp position={cbank.location}  /> }
//                     </TabContent>
//                 </div>
//             </Tabs>
          
//                     </div>

//                     <div className="text-right mt-6">
//                     <Button
//                         className="ltr:mr-2 rtl:ml-2"
//                         variant="plain"
//                         onClick={onDialogClose}
//                     >
//                         Fermer
//                     </Button>
//                     </div>
//                 </div>
//              </Dialog>
//       </div>
//     );
//   }
  

//   export default TableReq;


  