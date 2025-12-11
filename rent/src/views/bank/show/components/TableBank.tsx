/* eslint-disable @typescript-eslint/no-unused-vars */
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
    DocumentData,
    Query,
    QueryConstraint,
    Timestamp,
    getCountFromServer,
} from 'firebase/firestore';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Bank, BankStep } from '@/views/Entity';
import { BankDoc, getLandlordDoc } from '@/services/Landlord';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import Table from '@/components/ui/Table';
import { Alert, Button, Dialog, Pagination, Select, Tabs, Tooltip } from '@/components/ui';
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
import { getRegionIds } from '@/views/Entity/Regions';
import classNames from 'classnames';
import { HiHome } from 'react-icons/hi';
import YesOrNoPopup from '@/views/shared/YesOrNoPopup';
import { deleteBank, getBankImages } from '@/services/firebase/BankService';
import MapPopup from '../MapPopup';
import FilterBank from '@/views/bank/show/components/FilterBank';
import FilterMyBank from './FilterMyBank';
import { hasAuthority } from '@/utils/RoleChecker';
import GoogleMapWithMarkers from '../GoogleMapWithMarkers';
import ChangeLocation from '../../add/components/ChangeLocation';
import Currency from '@/views/shared/Currency';
import ImageSignedContract from '../../add/components/ImageSignedContract';

const { Tr, Th, Td, THead, TBody } = Table
const pageSizeOption = [
    { value: 10, label: '10 / page' },
    { value: 50, label: '50 / page' },
    { value: 100, label: '100 / page' },
    { value: 200, label: '200 / page' },
]

type Option = {
    value: number
    label: string
}

interface Props {
    step?: BankStep;
    isAgent?: boolean;
    all?: boolean;
}
export function TableBank({ step, isAgent = false, all = false }: Props) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(pageSizeOption[0].value);
    const [hasNext, setHasNext] = useState(true);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageDocs, setPageDocs] = useState<DocumentSnapshot[]>([]);
    const fetchedRef = useRef(false);
    const [totalData, setTotalData] = useState(1);
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [cbank, setCBank] = useState<Bank>();
    const { width, height } = useWindowSize();
    const [message, setMessage] = useTimeOutMessage();
    const [alert, setAlert] = useState("success") as any;
    const { t } = useTranslation();
    const navigate = useNavigate()
    // 
    const { userId, proprio, authority } = useSessionUser((state) => state.user);
    const [regions, setRegions] = useState<number>(0);
    const [agents, setAgents] = useState<string>();
    const [start, setStart] = useState<Date>();
    const [end, setEnd] = useState<Date>();
    const [name, setName] = useState<string>();
    const [steps, setSteps] = useState<string>();
    const [isMap, setMap] = useState<boolean>();
    const [mapData, setMapData] = useState<any[]>();
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    // 
    const openDialog = (bank: Bank) => {
        setCBank(bank);
        setIsOpen(true)
    }

    const onDialogClose = () => {
        setIsOpen(false)
    }
    const yes = async (idToDel: string) => {
        await deleteBank(idToDel || '');
        setBanks(prev => prev.filter(item => item.id !== idToDel));
    }

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                header: 'Nom Bank',
                cell: ({ row }) => (
                    <div>
                        <Tooltip
                            title={
                                <div>
                                    Urgent: {' '}
                                    {row.original.urgency && <strong className="text-green-400"> Oui </strong>} <br />
                                    {!row.original.urgency && <strong className="text-yellow-400"> Non </strong>}
                                    Id: {' '}
                                    {row.original.id && <strong className="text-green-400"> {row.original.id} </strong>}
                                </div>

                            }
                        >
                            <span className="cursor-pointer">{row.original.bankName}</span>
                        </Tooltip>
                    </div>
                ),

            },
            {
                header: 'Proprietaire',
                cell: ({ row }) => (
                    <div className="min-w-[160px]">
                        <div className="font-medium">  {(row.original?.landlord) ? row.original?.landlord?.fullName : ""} </div>
                        <div className="text-sm text-gray-500">{(row.original?.landlord) ? row.original?.landlord?.phone : ""}</div>
                    </div>
                ),
            },
            {
                header: 'Agent',
                cell: ({ row }) => (
                    <div className="min-w-[160px]">
                        <div className="font-medium">  {(row.original?.createdBy) ? <UserName userId={row.original.createdBy} /> : ""} </div>
                    </div>
                ),
            },
            {
                header: 'Prix',
                cell: ({ row }) => (
                    <div className="min-w-[160px]">
                        <div className="font-medium"> Initial : <Currency amount={row.original.rentCost}></Currency></div>
                        {(row.original?.final_rentCost && row.original?.final_rentCost > 0) &&
                            <div className="font-medium"> Final : <Currency amount={row.original.final_rentCost}></Currency>
                            </div>}
                    </div>
                ),
            },
            {
                header: 'Ville',
                cell: ({ row }) => (
                    <div>
                        <MapPopup bank={row.original} />
                    </div>
                ),
            },
            {
                header: 'Date de création',
                cell: ({ row }) => (
                    <div className="min-w-[160px]">
                        <div className="font-medium"> {formatRelative(row.original.createdAt.toDate?.() || row.original.createdAt, new Date(),
                            { locale: fr })}</div>
                    </div>
                ),
            },
            {
                header: 'Etape',
                cell: ({ row }) => (
                    <div className="min-w-auto">
                        <BankStepBadge renovStep={row.original?.renovStep} step={row.original.step} finaldec={row.original.finalDecision} isAgent={isAgent} />
                    </div>
                ),
            },
            {
                header: 'Action',
                cell: ({ row }) => {

                    if (!step && !all) return (
                        <div>
                            <Button variant="solid" shape="circle" size="xs" onClick={() => openDialog(row.original)}>
                                <PiEyeLight />
                            </Button>
                            {<YesOrNoPopup Ok={yes} id={row.original.id} ></YesOrNoPopup>}
                        </div>);
                    else return (
                        <div className="min-w-[200px]">
                        {(hasAuthority(authority, 'coordonator') || hasAuthority(authority, 'admin') || hasAuthority(authority, 'super_manager')) &&
                            <Button variant="solid" shape="circle" size="xs" className='mr-1 ' onClick={() => openDialog(row.original)}>
                                <PiEyeLight />
                            </Button> }
                            <Button className="ml-1 bg-green-300 hover:bg-green-400 border-0 hover:ring-0" variant="solid" shape="circle" size="xs" onClick={() => navigate("/bank/" + row.original.id)}>
                                <PiCheck />
                            </Button>
                          {<YesOrNoPopup Ok={yes} id={row.original.id} ></YesOrNoPopup>}
                        </div>);
                }
            },
        ],
        [],
    )

    const getQueryDate = (q: Query<DocumentData, DocumentData>) => {

        const filters: QueryConstraint[] = [];

        if (regions && regions != 0) {
            filters.push(where('id_region', '==', regions));
        } else {
            const ids = (proprio?.regions?.length == 0 && authority && authority[0] == "admin") ? getRegionIds() : (proprio) ? proprio.regions : [];
            filters.push(where("id_region", "in", ids))
        }

        if (agents) {
            filters.push(where('createdBy', '==', agents));
        }

        if (name) {
            filters.push(where('bankName', '>=', name));
            filters.push(where('bankName', '<=', name + '\uf8ff'));

            filters.push(where('bankName', '>=', cfl(name)));
            filters.push(where('bankName', '<=', cfl(name) + '\uf8ff'));
        }

        if (steps) {
            filters.push(where('step', '==', steps));
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

    const cfl = (val: string) => {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1);
    }

    const fetchTotalCount = async () => {
        let q: Query<DocumentData>;
        if (!step) {
            if (!all) {
                q = query(BankDoc, orderBy("createdAt", "desc"), where("createdBy", "==", userId));
            } else {
                q = query(BankDoc, orderBy("createdAt", "desc"));
            }
        } else {
            q = query(BankDoc, orderBy("createdAt", "desc"), where("step", "==", step));
        }
        q = getQueryDate(q);

        const snapshot = await getCountFromServer(q);  // 🚀 NOT getDocs!
        setTotalData(snapshot.data().count);
    };

    const fetchBanks = async (pageNum: number) => {
        let q: Query<DocumentData>;
        if (!step) {
            if (!all) {
                q = query(BankDoc, orderBy("createdAt", "desc"), where("createdBy", "==", userId), limit(pageSize));
            } else {
                q = query(BankDoc, orderBy("createdAt", "desc"), limit(pageSize));
            }
        } else {
            q = query(BankDoc, orderBy("createdAt", "desc"), where("step", "==", step), limit(pageSize));
        }

        q = getQueryDate(q);

        // Only if not first page
        if (pageNum > 1 && pageDocs[pageNum - 2]) {
            q = query(q, startAfter(pageDocs[pageNum - 2]));
        }

        fetchTotalCount();

        const snapshot = await getDocs(q);

        const newBanks = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                const landlordId = data.landlord;
                let landlord = null;
                if (landlordId) {
                    const landlordSnap = await getDoc(getLandlordDoc(landlordId));
                    landlord = landlordSnap.exists() ? landlordSnap.data() : null;
                }
                const images = await getBankImages(docSnap.id);
                return { id: docSnap.id, ...data, landlord, images };
            })
        );
        // Instead of replacing, accumulate
        // setBanks((prevBanks: any) => (pageNum === 1 ? newBanks : [...prevBanks, ...newBanks]));
        setBanks(newBanks);
        setCurrentPage(pageNum);

        // Important: set the last doc for next page
        if (snapshot.docs.length > 0) {
            setPageDocs((prev) => {
                const updated = [...prev];
                updated[pageNum - 1] = snapshot.docs[snapshot.docs.length - 1];
                return updated;
            });
        }

        // (optional) update totalData properly if you fetched total separately
    };

    const table: any = useReactTable({
        data: banks,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true, // ✅ Add this
        pageCount: Math.ceil(totalData / pageSize), // ✅ Optional
    })


    useEffect(() => {
        setCurrentPage(1); // reset first
        fetchBanks(1);
    }, [start, end, regions, agents, steps, name]);


    const onPaginationChange = async (page: number) => {
        if (page !== currentPage) {
            await fetchBanks(page);
        }
        //  table.setPageIndex(page - 1);
    };

    const onSelectChange = (value = 0) => {
        table.setPageSize(Number(value))
        setPageSize(Number(value));
    }
    const onChangeBank = (payload: any, step: number) => {
        if (step != 1) {
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

    const nextStep = async (step: number, data: any) => {
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

    const onChangeRegion = async (id: number) => {
        setRegions(id);
    }

    const onChangeAgent = async (id: string) => {
        console.log("onChangeAgent: ", id);
        setAgents(id);
    }

    const onChangeName = async (name: string) => {
        setName(name);
    }

    const onChangeDate = async (start: Date, end: Date) => {
        setStart(start);
        setEnd(end);
    }
    const onChangeStep = async (step: BankStep) => {
        setSteps(step);
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lng: longitude });
            },
            (err) => {
                console.error(`Error: ${err.message}`);
            }
        );
    }, []);
    return (
        <div>
            <div className="grid grid-cols-6 gap-4 mt-6 mb-6">
                <div className={classNames('rounded-2xl p-4 flex flex-col justify-center', 'bg-green-100')} >
                    <div className="flex justify-between items-center relative">
                        <div>
                            <div className="mb-4 text-gray-900 font-bold">{'Total banks'}</div>
                            <h1 className="mb-1 text-gray-900">{totalData}</h1>
                        </div>
                        <div
                            className={
                                'flex items-center justify-center min-h-12 min-w-12 max-h-12 max-w-12 bg-gray-900 text-white rounded-full text-2xl md:hidden'
                            }
                        >
                            <HiHome />
                        </div>
                    </div>
                </div>
            </div>
            {(step || all) &&
                <FilterBank authority={authority || []} proprio={proprio} t={t}
                    onChangeRegion={onChangeRegion}
                    onChangeAgent={onChangeAgent}
                    onChangeDate={onChangeDate}
                    isMap={true}
                    onChangeMap={(value) => {
                        if (value) {
                            const data = banks.map((bank: any) => {
                                if (bank.location?.lng && bank.location?.lat) {
                                    return {
                                        lng: bank.location?.lng,
                                        lat: bank.location?.lat,
                                        name: bank.bankName,
                                        price: bank.rentCost,
                                        state: bank.step,
                                        id: bank.id,
                                        imageUrls: bank.images,
                                    } as any;
                                } else return null
                            }).filter((bank: any) => bank !== null);
                            console.log("mapData: ", data);
                            setMapData(data);
                        } else {
                            setMapData([]);
                        }
                        setMap(value);

                    }}
                >

                </FilterBank>}

            {!step && <FilterMyBank onChangeDate={onChangeDate} onChangeStep={onChangeStep} t={t} all={all}
                onChangeName={onChangeName}
            ></FilterMyBank>}

            <div className="w-full  mt-6 bg-gray-50 dark:bg-gray-700 rounded-sm p-6 shadow">
                {!isMap && <>
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
                </>}
                {
                    isMap && mapData && mapData.length > 0 && (
                        <GoogleMapWithMarkers
                            locations={mapData}
                        // zoom={8} // optional
                        />
                    )
                }
                <div className="flex items-center justify-between mt-4">
                    <Pagination
                        // pageSize={table.getState().pagination.pageSize}
                        // currentPage={table.getState().pagination.pageIndex + 1}
                        // currentPage={currentPage}
                        pageSize={pageSize}
                        currentPage={currentPage}
                        total={totalData}
                        // total={banks.length}
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
                width={width * 0.9}
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
                                    Informations générales
                                </TabNav>
                                <TabNav value="tab2" icon={<BiImage />}>
                                    Documents & Images
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
                                            <TabNav value="2tab3" icon={<BiImage />}>
                                                Autres
                                            </TabNav>
                                        </TabList>
                                        <div className="p-4">

                                            <TabContent value="2tab1">
                                                {message && (
                                                    <Alert showIcon className="mt-6 mb-6" type={alert}>
                                                        <span className="break-all ">{message}</span>
                                                    </Alert>
                                                )}
                                                {cbank?.id && <ImageBank nextStep={nextStep} bankId={cbank.id} userId={userId || ''} isEdit={true}></ImageBank>}
                                            </TabContent>

                                            <TabContent value="2tab3">
                                                {message && (
                                                    <Alert showIcon className="mt-6 mb-6" type={alert}>
                                                        <span className="break-all ">{message}</span>
                                                    </Alert>
                                                )}
                                                {cbank?.id &&
                                                    <ImageSignedContract nextStep={nextStep}
                                                        bankId={cbank.id}
                                                        userId={userId || ''}
                                                        isEdit={true}>
                                                    </ImageSignedContract>}
                                            </TabContent>

                                            <TabContent value="2tab2">
                                                {message && (
                                                    <Alert showIcon className="mt-6 mb-6" type={alert}>
                                                        <span className="break-all ">{message}</span>
                                                    </Alert>
                                                )}
                                                {cbank?.id && cbank?.landlord?.id &&
                                                    <ImageLandlord nextStep={nextStep}
                                                        lordId={cbank.landlord.id}
                                                        userId={userId || ''}
                                                        isEdit={true}></ImageLandlord>}
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
                                    {cbank?.id && <CommentsBank nextStep={nextStep}
                                        bankId={cbank.id}
                                        userId={userId || ''}
                                        isEdit={true} />}
                                </TabContent>

                                <TabContent value="tab4">
                                    {cbank?.id && location && <ChangeLocation location={location} bankId={cbank.id} ></ChangeLocation>}
                                    {cbank?.location && <GoogleMapApp position={cbank.location} />}
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


