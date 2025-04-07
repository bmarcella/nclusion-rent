/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    getDocs,
    query,
    orderBy,
    limit,
    startAfter,
    DocumentSnapshot,
    getDoc,
    where,
  } from 'firebase/firestore';
  import  { useEffect, useMemo, useRef, useState } from 'react';
  import { Bank, BankStep } from '@/views/Entity';
  import { BankDoc, getLandlordDoc } from '@/services/Landlord';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import Table from '@/components/ui/Table';
import { Alert, Badge, Button, Dialog, Pagination, Select, Tabs, Tooltip } from '@/components/ui';
import { useSessionUser } from '@/store/authStore';
import { PiCheck, PiEyeLight } from 'react-icons/pi';
import EditBank from './EditBank';
import { useWindowSize } from '@/utils/hooks/useWindowSize';
import TabContent from '@/components/ui/Tabs/TabContent';
import TabList from '@/components/ui/Tabs/TabList';
import TabNav from '@/components/ui/Tabs/TabNav';
import ImageBank from '../../add/components/ImageBank';
import CommentsBank from '../../add/components/CommentsBank';
import { BiConversation, BiEdit, BiImage, BiMap } from 'react-icons/bi';
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage';
import { formatRelative } from 'date-fns';
import { fr } from 'date-fns/locale';
import GoogleMapApp from '../Map';
import { useNavigate } from 'react-router-dom';
import ImageLandlord from '../../add/components/ImageLandlord';
import { useTranslation } from 'react-i18next';
import BankStepBadge from './BankStep';
import UserName from './UserName';

const { Tr, Th, Td, THead, TBody } = Table
  const PAGE_SIZE = 0;
  const pageSizeOption = [
    { value: 100, label: '20 / page' },
    { value: 200, label: '30 / page' },
    { value: 400, label: '40 / page' },
    { value: 500, label: '50 / page' },
]

   type Option = {
        value: number
        label: string
    }
    interface Props {
        step?: BankStep;
   }
  export function TableBank( { step  }: Props) { 
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(true);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageDocs, setPageDocs] = useState<DocumentSnapshot[]>([]);
    const fetchedRef = useRef(false);
    const { userId } = useSessionUser((state) => state.user);
    const [totalData, setTotalData] = useState(1);
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [cbank, setCBank] = useState<Bank>();
    const { width, height } = useWindowSize();
    const [message, setMessage] = useTimeOutMessage();
    const [alert, setAlert] = useState("success") as any;
    const { t } = useTranslation();
    const navigate = useNavigate()
    const openDialog = (bank: Bank) => {
        setCBank(bank);
        setIsOpen(true)
    }

    const onDialogClose = () => {
        setIsOpen(false)
    }

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                header: 'Nom Bank',
                cell: ({ row }) => (
                    <div>
                        <Tooltip
                            title= {
                                <div>
                                    Urgent: {' '}
                                    { row.original.urgency && <strong className="text-green-400"> Oui </strong> } <br />
                                    { !row.original.urgency && <strong className="text-yellow-400"> Non </strong> }
                                    Id: {' '}
                                    { row.original.id && <strong className="text-green-400"> { row.original.id } </strong> }
                                </div>
                                
                            }
                        >
                            <span className="cursor-pointer">{ row.original.bankName}</span>
                        </Tooltip>
                    </div>
                    ),
                
            },
            {
                header: 'Proprietaire',
                cell: ({ row }) => (
                 <div className="min-w-[160px]">
                    <div className="font-medium">  { ( row.original?.landlord) ? row.original?.landlord?.fullName : "" } </div>
                    <div className="text-sm text-gray-500">{ ( row.original?.landlord) ? row.original?.landlord?.phone : "" }</div>
                  </div>
                 ),
            },
            {
                header: 'Agent',
                cell: ({ row }) => (
                 <div className="min-w-[160px]">
                    <div className="font-medium">  { ( row.original?.createdBy) ? <UserName userId={row.original.createdBy} /> : "" } </div>
                  </div>
                 ),
            },
            {
                header: 'Prix',
                cell: ({ row }) => (
                    <div className="min-w-[160px]">
                       <div className="font-medium">  HTG { row.original.rentCost}.00</div>
                     </div>
                    ),
            },
            {
              header: 'Ville',
              accessorKey: 'city',
            },
            {
                header: 'Date de creation',
                cell: ({ row }) => (
                    <div className="min-w-[160px]">
                       <div className="font-medium"> {    formatRelative(row.original.createdAt.toDate?.() || row.original.createdAt, new Date(), { locale: fr } )  }</div>
                     </div>
                    ),
            },
            {
                header: 'Etape',
                cell: ({ row }) => (
                    <div className="min-w-auto">
                       <BankStepBadge step={row.original.step} />
                     </div>
                    ),
            },
            {
                header: 'Action',
                cell: ({ row }) => {

                 if (!step) return (
                        <div className="min-w-[160px]">
                        <Button variant="solid"  size="sm" onClick={() => openDialog(row.original)}>
                            <PiEyeLight />
                         </Button>
                    </div>);
                 else return (
                    <div className="min-w-[160px]">
                         <Button variant="solid"  size="sm" className="ml-2" onClick={() => navigate("/bank/"+row.original.id) }>
                            <PiCheck />
                         </Button>
                    </div>);
                } 
            },
        ],
        [],
    )
    const fetchBanks = async (pageNum: number) => {
        let q = null;
        if (!step){
           q = query(BankDoc, orderBy("createdAt", "desc"), where("createdBy", "==", userId), limit(pageSizeOption[0].value));
        } else {
           q = query(BankDoc, orderBy("createdAt", "desc"), where("step", "==", step), limit(pageSizeOption[0].value));
        }
      
        // If we're not on the first page, we need to start after a document
        if (pageNum > 1 && pageDocs[pageNum - 2]) {
           q = query(q, startAfter(pageDocs[pageNum - 2]));
        }
      
        const snapshot = await getDocs(q);
        setTotalData(snapshot.size);
        // Resolve landlords
        const banksWithLandlords = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const landlordId = data.landlord;
            let landlord = null;
      
            if (landlordId) {
              const landlordSnap = await getDoc(getLandlordDoc(landlordId));
              landlord = landlordSnap.exists() ? landlordSnap.data() : null;
            }
            return { id: docSnap.id, ...data, landlord };
          })
        );
        console.log("Banks with landlords: ", banksWithLandlords);
        // Update state
        setBanks(banksWithLandlords as any);
        setCurrentPage(pageNum);
        // Store the snapshot for this page if it’s new
        if (!pageDocs[pageNum - 1]) {
          setPageDocs((prev) => {
            const updated = [...prev];
            updated[pageNum - 1] = snapshot.docs[0]; // store the first doc of this page
            return updated;
          });
        }
      };
    
    useEffect(() => {
      if (fetchedRef.current) return;
      fetchBanks(1); // load first page
    }, []);

    // const handlePrev = () => {
    //     if (page > 1) {
    //         fetchBanks(page - 1);
    //     }
    //   };
    
    //   const handleNext = () => {
    //     if (hasNext) {
    //         fetchBanks(page + 1);
    //     }
    //   };

      const table = useReactTable({
        data: banks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    const onPaginationChange = (page: number) => {
        table.setPageIndex(page - 1)
    }

    const onSelectChange = (value = 0) => {
        table.setPageSize(Number(value))
    }
   const onChangeBank = (payload: any, step:number) => {
    if(step != 1) {
        setCBank((prev: any) => {
            const updatedData = { ...prev, ...payload };
            setBanks((prev) => {
                if (!cbank) return prev;
                 const index = prev.findIndex((b) => b.id === updatedData.id);
                 if (index !== -1) {
                     const updatedBanks = [...prev];
                     updatedBanks[index] = updatedData;
                     return updatedBanks;
                 }
                 return prev;
             });
            return updatedData;
        });
    } else {
        fetchBanks(currentPage);
    }

   }

   const nextStep = async (step: number, data: any ) => {
     console.log(`Step Data (${step}) =>`, data);
     switch (step) {
        case 6:
            setMessage("Images saved successfully.");
            setAlert("success");
          break;
        case 7:
            setMessage("Comment saved successfully.");
            setAlert("success");
          break;
        default:
          console.warn(`Unhandled step: ${step}`);
        return;
      }
   }
    return (

      <div>
        <div className="w-full  mt-6 bg-gray-50 dark:bg-gray-700 rounded-sm p-6 shadow">
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

             <Dialog
                isOpen={dialogIsOpen}
                width={ width * 0.4 }
                height={height * 0.9}
                onClose={onDialogClose}
                >
                <div className="flex flex-col h-full px-4 py-6 bg-white dark:bg-gray-900 overflow-hidden">
                   <div className="flex flex-col gap-4">
                        <h5 className="text-lg font-semibold mb-4">
                        {cbank?.bankName || ''}
                        </h5>
                    </div>

            <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="tab1">
                <TabList>
                    <TabNav value="tab1" icon={<BiEdit />}>
                        Informations generales
                    </TabNav>
                    <TabNav value="tab2" icon={<BiImage />}>
                        Images
                    </TabNav>
                    <TabNav value="tab3" icon={<BiConversation />}>
                        Commentaires
                    </TabNav>
                    <TabNav value="tab4" icon={<BiMap />}>
                        Map
                    </TabNav>
                </TabList>
                <div className="p-4">
                    <TabContent value="tab1">
                    {cbank?.id && (
                        <EditBank
                        docRef={cbank}
                        id={cbank.id}
                        userId={userId || ''}
                        onChangeBank={onChangeBank}
                        />
                    )}
                    </TabContent>
                    <TabContent value="tab2">
                        {message && (
                        <Alert showIcon className="mt-6 mb-6" type={alert}>
                            <span className="break-all ">{message}</span>
                        </Alert>
                        )}

                            <Tabs defaultValue="2tab1">
                                <TabList>
                        
                                    <TabNav value="2tab1" icon={<BiImage />}>
                                        Banks
                                    </TabNav>
                                    <TabNav value="2tab2" icon={<BiImage />}>
                                        Proprietaires
                                    </TabNav>
                                </TabList>
                                <div className="p-4">
                                
                                    <TabContent value="2tab1">
                                        {message && (
                                        <Alert showIcon className="mt-6 mb-6" type={alert}>
                                            <span className="break-all ">{message}</span>
                                        </Alert>
                                        )}
                                        { cbank?.id && <ImageBank nextStep={nextStep} bankId={cbank.id}  userId={userId || ''} isEdit={true}></ImageBank> }
                                    </TabContent>

                                    <TabContent value="2tab2">
                                        {message && (
                                        <Alert showIcon className="mt-6 mb-6" type={alert}>
                                            <span className="break-all ">{message}</span>
                                        </Alert>
                                        )}
                                        { cbank?.id && <ImageLandlord nextStep={nextStep} lordId={cbank.landlord.id}  userId={userId || ''} isEdit={true}></ImageLandlord> }
                                    </TabContent>
                                </div>
                            </Tabs>
                    </TabContent>
                    <TabContent value="tab3">
                    {message && (
                        <Alert showIcon className="mt-6 mb-6" type={alert}>
                            <span className="break-all ">{message}</span>
                        </Alert>
                        )}
                    { cbank?.id && <CommentsBank nextStep={nextStep} bankId={cbank.id}  userId={userId || ''} isEdit={true}/> }
                    </TabContent>

                    <TabContent value="tab4">
            
                    { cbank?.location && <GoogleMapApp position={cbank.location}  /> }
                    </TabContent>
                </div>
            </Tabs>
          
                    </div>

                    <div className="text-right mt-6">
                    <Button
                        className="ltr:mr-2 rtl:ml-2"
                        variant="plain"
                        onClick={onDialogClose}
                    >
                        Fermer
                    </Button>
                    </div>
                </div>
             </Dialog>
      </div>
    );
  }
  

  export default TableBank;
  