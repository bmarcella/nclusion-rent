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
} from 'firebase/firestore'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Bank, BankStep } from '@/views/Entity'
import { BankDoc, getLandlordDoc } from '@/services/Landlord'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table'
import Table from '@/components/ui/Table'
import {
    Alert,
    Button,
    Dialog,
    Pagination,
    Select,
    Tabs,
    Tooltip,
} from '@/components/ui'
import { useSessionUser } from '@/store/authStore'
import { PiCheck, PiEyeLight } from 'react-icons/pi'
import EditBank from './EditBank'
import { useWindowSize } from '@/utils/hooks/useWindowSize'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import ImageBank from '../../add/components/ImageBank'
import CommentsBank from '../../add/components/CommentsBank'
import { BiConversation, BiEdit, BiImage, BiMap } from 'react-icons/bi'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { formatRelative } from 'date-fns'
import { fr } from 'date-fns/locale'
import GoogleMapApp from '../Map'
import { useNavigate } from 'react-router-dom'
import ImageLandlord from '../../add/components/ImageLandlord'
import { useTranslation } from 'react-i18next'
import BankStepBadge from './BankStep'
import BankVersionBadge from './BankVersionBadge'
import UserName from './UserName'
import { getRegionIds } from '@/views/Entity/Regions'
import classNames from 'classnames'
import { HiHome } from 'react-icons/hi'
import YesOrNoPopup from '@/views/shared/YesOrNoPopup'
import { deleteBank, getBankImages } from '@/services/firebase/BankService'
import MapPopup from '../MapPopup'
import FilterBank from '@/views/bank/show/components/FilterBank'
import FilterMyBank from './FilterMyBank'
import { hasAuthority } from '@/utils/RoleChecker'
import GoogleMapWithMarkers from '../GoogleMapWithMarkers'
import ChangeLocation from '../../add/components/ChangeLocation'
import Currency from '@/views/shared/Currency'
import ImageSignedContract from '../../add/components/ImageSignedContract'
import { COORDONATOR_AGENT_IMMOBILLIER } from '@/constants/roles.constant'

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
    step?: BankStep[]
    isAgent?: boolean
    all?: boolean
    id: string
}
export function TableBanks({ step, isAgent = false, all = false, id }: Props) {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(pageSizeOption[0].value)
    const [hasNext, setHasNext] = useState(true)
    const [banks, setBanks] = useState<Bank[]>([])
    const [currentPage, setCurrentPage] = useState(0)
    const [pageDocs, setPageDocs] = useState<DocumentSnapshot[]>([])
    const fetchedRef = useRef(false)
    const [totalData, setTotalData] = useState(1)
    const [dialogIsOpen, setIsOpen] = useState(false)
    const [cbank, setCBank] = useState<Bank>()
    const { width, height } = useWindowSize()
    const [message, setMessage] = useTimeOutMessage()
    const [alert, setAlert] = useState('success') as any
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { userId, proprio, authority } = useSessionUser((state) => state.user)
    const [regions, setRegions] = useState<number>(0)
    const [agents, setAgents] = useState<string>()
    const [start, setStart] = useState<Date>()
    const [end, setEnd] = useState<Date>()
    const [name, setName] = useState<string>()
    const [steps, setSteps] = useState<string>()
    const [isMap, setMap] = useState<boolean>()
    const [mapData, setMapData] = useState<any[]>()
    const [location, setLocation] = useState<{
        lat: number
        lng: number
    } | null>(null)
    //
    const openDialog = (bank: Bank) => {
        setCBank(bank)
        setIsOpen(true)
    }

    const onDialogClose = () => {
        setIsOpen(false)
    }
    const yes = async (idToDel: string) => {
        await deleteBank(idToDel || '')
        setBanks((prev) => prev.filter((item) => item.id !== idToDel))
    }

    const columns = useMemo<ColumnDef<any>[]>(
        () => [
            {
                header: 'Nom Bank',
                cell: ({ row }) => (
                    <div className="min-w-[160px]">
                        <Tooltip
                            title={
                                <div>
                                    Urgent:{' '}
                                    {row.original.urgency && (
                                        <strong className="text-green-400">
                                            {' '}
                                            Oui{' '}
                                        </strong>
                                    )}{' '}
                                    <br />
                                    {!row.original.urgency && (
                                        <strong className="text-yellow-400">
                                            {' '}
                                            Non{' '}
                                        </strong>
                                    )}
                                    Id:{' '}
                                    {row.original.id && (
                                        <strong className="text-green-400">
                                            {' '}
                                            {row.original.id}{' '}
                                        </strong>
                                    )}
                                </div>
                            }
                        >
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="cursor-pointer font-medium">
                                    {row.original.bankName}
                                </span>
                                <BankVersionBadge bank={row.original} />
                            </div>
                        </Tooltip>
                    </div>
                ),
            },
            {
                header: 'Proprietaire',
                cell: ({ row }) => (
                    <div className="min-w-[160px]">
                        <div className="font-medium">
                            {' '}
                            {row.original?.landlord
                                ? row.original?.landlord?.fullName
                                : ''}{' '}
                        </div>
                        <div className="text-sm text-gray-500">
                            {row.original?.landlord
                                ? row.original?.landlord?.phone
                                : ''}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Agent',
                cell: ({ row }) => (
                    <div className="min-w-[160px]">
                        <div className="font-medium">
                            {' '}
                            {row.original?.createdBy ? (
                                <UserName userId={row.original.createdBy} />
                            ) : (
                                ''
                            )}{' '}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Prix',
                cell: ({ row }) => (
                    <div className="min-w-[160px]">
                        <div className="font-medium">
                            {' '}
                            Initial :{' '}
                            <Currency amount={row.original.rentCost}></Currency>
                        </div>
                        {row.original?.final_rentCost &&
                            row.original?.final_rentCost > 0 && (
                                <div className="font-medium">
                                    {' '}
                                    Final :{' '}
                                    <Currency
                                        amount={row.original.final_rentCost}
                                    ></Currency>
                                </div>
                            )}
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
                        <div className="font-medium">
                            {' '}
                            {formatRelative(
                                row.original.createdAt.toDate?.() ||
                                    row.original.createdAt,
                                new Date(),
                                { locale: fr },
                            )}
                        </div>
                    </div>
                ),
            },
            {
                header: 'Etape',
                cell: ({ row }) => (
                    <div className="min-w-auto">
                        <BankStepBadge
                            renovStep={row.original?.renovStep}
                            step={row.original.step}
                            finaldec={row.original.finalDecision}
                            isAgent={isAgent}
                        />
                    </div>
                ),
            },
            {
                header: 'Action',
                cell: ({ row }) => {
                    if (!step && !all)
                        return (
                            <div>
                                <Button
                                    variant="solid"
                                    shape="circle"
                                    size="xs"
                                    onClick={() => openDialog(row.original)}
                                >
                                    <PiEyeLight />
                                </Button>
                                {[
                                    'bankSteps.needApproval',
                                    'bankSteps.needApprobation',
                                ].includes(row.original.step as any) &&
                                    !hasAuthority(
                                        authority,
                                        COORDONATOR_AGENT_IMMOBILLIER,
                                    ) && (
                                        <YesOrNoPopup
                                            Ok={yes}
                                            id={row.original.id}
                                        ></YesOrNoPopup>
                                    )}
                            </div>
                        )
                    else
                        return (
                            <div className="min-w-[200px]">
                                {(hasAuthority(authority, 'coordonator') ||
                                    hasAuthority(authority, 'admin') ||
                                    hasAuthority(
                                        authority,
                                        'super_manager',
                                    )) && (
                                    <Button
                                        variant="solid"
                                        shape="circle"
                                        size="xs"
                                        className="mr-1 "
                                        onClick={() => openDialog(row.original)}
                                    >
                                        <PiEyeLight />
                                    </Button>
                                )}
                                <Button
                                    className="ml-1 bg-green-300 hover:bg-green-400 border-0 hover:ring-0"
                                    variant="solid"
                                    shape="circle"
                                    size="xs"
                                    onClick={() =>
                                        navigate('/bank/' + row.original.id)
                                    }
                                >
                                    <PiCheck />
                                </Button>
                                {[
                                    'bankSteps.needApproval',
                                    'bankSteps.needApprobation',
                                ].includes(row.original.step as any) &&
                                    !hasAuthority(
                                        authority,
                                        COORDONATOR_AGENT_IMMOBILLIER,
                                    ) && (
                                        <YesOrNoPopup
                                            Ok={yes}
                                            id={row.original.id}
                                        ></YesOrNoPopup>
                                    )}
                            </div>
                        )
                },
            },
        ],
        [],
    )

    const getQueryDate = (q: Query<DocumentData, DocumentData>) => {
        const filters: QueryConstraint[] = []

        if (regions && regions != 0) {
            filters.push(where('id_region', '==', regions))
        } else {
            const ids =
                proprio?.regions?.length == 0 &&
                authority &&
                authority[0] == 'admin'
                    ? getRegionIds()
                    : proprio
                      ? proprio.regions
                      : []
            filters.push(where('id_region', 'in', ids))
        }

        if (agents) {
            filters.push(where('createdBy', '==', agents))
        }

        if (name) {
            filters.push(where('bankName', '>=', name))
            filters.push(where('bankName', '<=', name + '\uf8ff'))

            filters.push(where('bankName', '>=', cfl(name)))
            filters.push(where('bankName', '<=', cfl(name) + '\uf8ff'))
        }

        if (steps) {
            filters.push(where('step', '==', steps))
        }

        if (start && end) {
            const isSameDay = start.toDateString() === end.toDateString()

            if (isSameDay) {
                const startOfDay = new Date(start)
                startOfDay.setHours(0, 0, 0, 0)

                const endOfDay = new Date(end)
                endOfDay.setHours(23, 59, 59, 999)

                filters.push(
                    where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
                )
                filters.push(
                    where('createdAt', '<=', Timestamp.fromDate(endOfDay)),
                )
            } else {
                filters.push(
                    where('createdAt', '>=', Timestamp.fromDate(start)),
                )
                filters.push(where('createdAt', '<=', Timestamp.fromDate(end)))
            }
        } else {
            if (start) {
                filters.push(
                    where('createdAt', '>=', Timestamp.fromDate(start)),
                )
            }
            if (end) {
                filters.push(where('createdAt', '<=', Timestamp.fromDate(end)))
            }
        }
        return filters.length > 0 ? query(q, ...filters) : q
    }

    const cfl = (val: string) => {
        return String(val).charAt(0).toUpperCase() + String(val).slice(1)
    }

    const fetchTotalCount = async () => {
        let q: Query<DocumentData>
        if (!step) {
            if (!all) {
                q = query(
                    BankDoc,
                    orderBy('createdAt', 'desc'),
                    where('createdBy', '==', userId),
                )
            } else {
                q = query(BankDoc, orderBy('createdAt', 'desc'))
            }
        } else {
            q = query(
                BankDoc,
                orderBy('createdAt', 'desc'),
                where('step', 'in', step),
                where('first_approval', '==', id),
            )
        }
        q = getQueryDate(q)
        const snapshot = await getCountFromServer(q)
        setTotalData(snapshot.data().count)
    }

    const fetchBanks = async (pageNum: number) => {
        let q: Query<DocumentData>
        if (!step) {
            if (!all) {
                q = query(
                    BankDoc,
                    orderBy('createdAt', 'desc'),
                    where('createdBy', '==', userId),
                    limit(pageSize),
                )
            } else {
                q = query(
                    BankDoc,
                    orderBy('createdAt', 'desc'),
                    limit(pageSize),
                )
            }
        } else {
            q = query(
                BankDoc,
                orderBy('createdAt', 'desc'),
                where('step', 'in', step),
                where('first_approval', '==', id),
                limit(pageSize),
            )
        }

        q = getQueryDate(q)

        // Only if not first page
        if (pageNum > 1 && pageDocs[pageNum - 2]) {
            q = query(q, startAfter(pageDocs[pageNum - 2]))
        }

        fetchTotalCount()

        const snapshot = await getDocs(q)

        const newBanks = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data()
                const landlordId = data.landlord
                let landlord = null
                if (landlordId) {
                    const landlordSnap = await getDoc(
                        getLandlordDoc(landlordId),
                    )
                    landlord = landlordSnap.exists()
                        ? landlordSnap.data()
                        : null
                }
                const images = await getBankImages(docSnap.id)
                return { id: docSnap.id, ...data, landlord, images }
            }),
        )
        // Instead of replacing, accumulate
        // setBanks((prevBanks: any) => (pageNum === 1 ? newBanks : [...prevBanks, ...newBanks]));
        setBanks(newBanks)
        setCurrentPage(pageNum)

        // Important: set the last doc for next page
        if (snapshot.docs.length > 0) {
            setPageDocs((prev) => {
                const updated = [...prev]
                updated[pageNum - 1] = snapshot.docs[snapshot.docs.length - 1]
                return updated
            })
        }

        // (optional) update totalData properly if you fetched total separately
    }

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
        setCurrentPage(1)
        fetchBanks(1)
    }, [start, end, regions, agents, steps, name])

    const onPaginationChange = async (page: number) => {
        if (page !== currentPage) {
            await fetchBanks(page)
        }
    }

    const onSelectChange = (value = 0) => {
        table.setPageSize(Number(value))
        setPageSize(Number(value))
    }
    const onChangeBank = (payload: any, step: number) => {
        if (step != 1) {
            setCBank((prev: any) => {
                const updatedData = { ...prev, ...payload }
                setBanks((prev) => {
                    if (!cbank) return prev
                    const index = prev.findIndex((b) => b.id === updatedData.id)
                    if (index !== -1) {
                        const updatedBanks = [...prev]
                        updatedBanks[index] = updatedData
                        return updatedBanks
                    }
                    return prev
                })
                return updatedData
            })
        } else {
            fetchBanks(currentPage)
        }
    }

    const nextStep = async (step: number, data: any) => {
        switch (step) {
            case 6:
                setMessage('Images saved successfully.')
                setAlert('success')
                break
            case 7:
                setMessage('Comment saved successfully.')
                setAlert('success')
                break
            default:
                console.warn(`Unhandled step: ${step}`)
                return
        }
    }

    const onChangeRegion = async (id: number) => {
        setRegions(id)
    }

    const onChangeAgent = async (id: string) => {
        console.log('onChangeAgent: ', id)
        setAgents(id)
    }

    const onChangeName = async (name: string) => {
        setName(name)
    }

    const onChangeDate = async (start: Date, end: Date) => {
        setStart(start)
        setEnd(end)
    }
    const onChangeStep = async (step: BankStep) => {
        setSteps(step)
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setLocation({ lat: latitude, lng: longitude })
            },
            (err) => {
                console.error(`Error: ${err.message}`)
            },
        )
    }, [])
    return (
        <div className="space-y-6 mt-6">
            {/* KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 dark:from-gray-800 dark:to-gray-900 border border-emerald-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-emerald-700/80 dark:text-emerald-300">
                                Total banks
                            </p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100 leading-none">
                                {totalData}
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                                {step
                                    ? step.map((s) => t('bank.' + s)).join(' / ')
                                    : all
                                      ? 'Toutes les banks'
                                      : 'Mes banks'}
                            </p>
                        </div>
                        <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-white/70 dark:bg-gray-700 text-emerald-600 shadow-sm">
                            <HiHome className="text-2xl" />
                        </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-emerald-200/40 blur-2xl pointer-events-none" />
                </div>
            </div>
            {(step || all) && (
                <FilterBank
                    authority={authority || []}
                    proprio={proprio}
                    t={t}
                    isMap={true}
                    onChangeRegion={onChangeRegion}
                    onChangeAgent={onChangeAgent}
                    onChangeDate={onChangeDate}
                    onChangeMap={(value) => {
                        if (value) {
                            const data = banks
                                .map((bank: any) => {
                                    if (
                                        bank.location?.lng &&
                                        bank.location?.lat
                                    ) {
                                        return {
                                            lng: bank.location?.lng,
                                            lat: bank.location?.lat,
                                            name: bank.bankName,
                                            price: bank.rentCost,
                                            state: bank.step,
                                            id: bank.id,
                                            imageUrls: bank.images,
                                        } as any
                                    } else return null
                                })
                                .filter((bank: any) => bank !== null)
                            console.log('mapData: ', data)
                            setMapData(data)
                        } else {
                            setMapData([])
                        }
                        setMap(value)
                    }}
                ></FilterBank>
            )}

            {!step && (
                <FilterMyBank
                    t={t}
                    all={all}
                    onChangeDate={onChangeDate}
                    onChangeStep={onChangeStep}
                    onChangeName={onChangeName}
                ></FilterMyBank>
            )}

            <div className="w-full rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {!isMap && (
                    <div className="overflow-x-auto">
                        <Table className="min-w-full">
                            <THead className="bg-gray-50 dark:bg-gray-900/60 sticky top-0 z-10">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <Tr key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <Th
                                                    key={header.id}
                                                    colSpan={header.colSpan}
                                                    className="text-xs uppercase tracking-wider font-semibold text-gray-600 dark:text-gray-300 py-3 px-4"
                                                >
                                                    {flexRender(
                                                        header.column.columnDef
                                                            .header,
                                                        header.getContext(),
                                                    )}
                                                </Th>
                                            )
                                        })}
                                    </Tr>
                                ))}
                            </THead>
                            <TBody>
                                {table.getRowModel().rows.length === 0 && (
                                    <Tr>
                                        <Td
                                            colSpan={columns.length}
                                            className="text-center py-16"
                                        >
                                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                                <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-2xl">
                                                    <HiHome />
                                                </div>
                                                <p className="text-sm font-medium text-gray-500">
                                                    Aucune bank trouvée
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    Essayez d'ajuster vos filtres
                                                </p>
                                            </div>
                                        </Td>
                                    </Tr>
                                )}
                                {table.getRowModel().rows.map((row, idx) => {
                                    return (
                                        <Tr
                                            key={row.id}
                                            className={classNames(
                                                'transition-colors',
                                                idx % 2 === 1
                                                    ? 'bg-gray-50/40 dark:bg-gray-900/20'
                                                    : '',
                                                'hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20',
                                            )}
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => {
                                                    return (
                                                        <Td
                                                            key={cell.id}
                                                            className="py-3 px-4 align-middle"
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
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
                    </div>
                )}
                {isMap && mapData && mapData.length > 0 && (
                    <div className="p-2">
                        <GoogleMapWithMarkers locations={mapData} />
                    </div>
                )}

                {/* Pagination bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40">
                    <div className="text-xs text-gray-500">
                        Page{' '}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {currentPage}
                        </span>{' '}
                        —{' '}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {totalData}
                        </span>{' '}
                        résultat{totalData > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-3">
                        <Pagination
                            pageSize={pageSize}
                            currentPage={currentPage}
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
                                onChange={(option) =>
                                    onSelectChange(option?.value)
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                isOpen={dialogIsOpen}
                width={width * 0.9}
                height={height * 0.9}
                onClose={onDialogClose}
            >
                <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 via-white to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <HiHome className="text-xl" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-xs uppercase tracking-wider text-gray-500">
                                    Détails de la bank
                                </p>
                                <h5 className="text-lg font-semibold flex items-center gap-2 flex-wrap text-gray-900 dark:text-gray-100">
                                    {cbank?.bankName || ''}
                                    {cbank && <BankVersionBadge bank={cbank} />}
                                </h5>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-4 flex flex-col flex-1 overflow-hidden">

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
                                        <Alert
                                            showIcon
                                            className="mt-6 mb-6"
                                            type={alert}
                                        >
                                            <span className="break-all ">
                                                {message}
                                            </span>
                                        </Alert>
                                    )}

                                    <Tabs defaultValue="2tab1">
                                        <TabList>
                                            <TabNav
                                                value="2tab1"
                                                icon={<BiImage />}
                                            >
                                                Banks
                                            </TabNav>
                                            <TabNav
                                                value="2tab2"
                                                icon={<BiImage />}
                                            >
                                                Proprietaires
                                            </TabNav>
                                            <TabNav
                                                value="2tab3"
                                                icon={<BiImage />}
                                            >
                                                Autres
                                            </TabNav>
                                        </TabList>
                                        <div className="p-4">
                                            <TabContent value="2tab1">
                                                {message && (
                                                    <Alert
                                                        showIcon
                                                        className="mt-6 mb-6"
                                                        type={alert}
                                                    >
                                                        <span className="break-all ">
                                                            {message}
                                                        </span>
                                                    </Alert>
                                                )}
                                                {cbank?.id && (
                                                    <ImageBank
                                                        nextStep={nextStep}
                                                        bankId={cbank.id}
                                                        userId={userId || ''}
                                                        isEdit={true}
                                                    ></ImageBank>
                                                )}
                                            </TabContent>

                                            <TabContent value="2tab3">
                                                {message && (
                                                    <Alert
                                                        showIcon
                                                        className="mt-6 mb-6"
                                                        type={alert}
                                                    >
                                                        <span className="break-all ">
                                                            {message}
                                                        </span>
                                                    </Alert>
                                                )}
                                                {cbank?.id && (
                                                    <ImageSignedContract
                                                        nextStep={nextStep}
                                                        bankId={cbank.id}
                                                        userId={userId || ''}
                                                        isEdit={true}
                                                    ></ImageSignedContract>
                                                )}
                                            </TabContent>

                                            <TabContent value="2tab2">
                                                {message && (
                                                    <Alert
                                                        showIcon
                                                        className="mt-6 mb-6"
                                                        type={alert}
                                                    >
                                                        <span className="break-all ">
                                                            {message}
                                                        </span>
                                                    </Alert>
                                                )}
                                                {cbank?.id &&
                                                    cbank?.landlord?.id && (
                                                        <ImageLandlord
                                                            nextStep={nextStep}
                                                            lordId={
                                                                cbank.landlord
                                                                    .id
                                                            }
                                                            userId={
                                                                userId || ''
                                                            }
                                                            isEdit={true}
                                                        ></ImageLandlord>
                                                    )}
                                            </TabContent>
                                        </div>
                                    </Tabs>
                                </TabContent>
                                <TabContent value="tab3">
                                    {message && (
                                        <Alert
                                            showIcon
                                            className="mt-6 mb-6"
                                            type={alert}
                                        >
                                            <span className="break-all ">
                                                {message}
                                            </span>
                                        </Alert>
                                    )}
                                    {cbank?.id && (
                                        <CommentsBank
                                            nextStep={nextStep}
                                            bankId={cbank.id}
                                            userId={userId || ''}
                                            isEdit={true}
                                        />
                                    )}
                                </TabContent>

                                <TabContent value="tab4">
                                    {cbank?.id && location && (
                                        <ChangeLocation
                                            location={location}
                                            bankId={cbank.id}
                                        ></ChangeLocation>
                                    )}
                                    {cbank?.location && (
                                        <GoogleMapApp
                                            position={cbank.location}
                                        />
                                    )}
                                </TabContent>
                            </div>
                        </Tabs>
                    </div>

                        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                className="rounded-full px-5"
                                variant="plain"
                                onClick={onDialogClose}
                            >
                                Fermer
                            </Button>
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}

export default TableBanks
