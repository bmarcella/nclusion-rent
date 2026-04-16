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
import { Button, Pagination, Select, Tooltip } from '@/components/ui'
import { useSessionUser } from '@/store/authStore'
import { PiCheck, PiEyeLight } from 'react-icons/pi'
import { useWindowSize } from '@/utils/hooks/useWindowSize'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { formatRelative } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getRegionIds } from '@/views/Entity/Regions'
import classNames from 'classnames'
import { HiHome } from 'react-icons/hi'
import { deleteBank } from '@/services/firebase/BankService'
import FilterBank from '@/views/bank/show/components/FilterBank'
import { hasAuthority } from '@/utils/RoleChecker'
import BankStepBadge from '@/views/bank/show/components/BankStep'
import FilterMyBank from '@/views/bank/show/components/FilterMyBank'
import UserName from '@/views/bank/show/components/UserName'
import MapPopup from '@/views/bank/show/MapPopup'
import Currency from '@/views/shared/Currency'

const { Tr, Th, Td, THead, TBody } = Table
const pageSizeOption = [
    { value: 100, label: '100 / page' },
    { value: 200, label: '200 / page' },
]

type Option = {
    value: number
    label: string
}

interface Props {
    step?: BankStep
    all?: boolean
}
export function AllFreeTask({ step, all }: Props) {
    const [page, setPage] = useState(1)
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
    //
    const { userId, proprio, authority } = useSessionUser((state) => state.user)
    const [regions, setRegions] = useState<number>(0)
    const [agents, setAgents] = useState<string>()
    const [start, setStart] = useState<Date>()
    const [end, setEnd] = useState<Date>()
    const [steps, setSteps] = useState<string>()
    //
    const openDialog = (bank: Bank) => {
        setCBank(bank)
        setIsOpen(true)
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
                    <div>
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
                            <span className="cursor-pointer">
                                {row.original.bankName}
                            </span>
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
                            <Currency amount={row.original.rentCost}></Currency>
                        </div>
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
                            isAgent={true}
                        />
                    </div>
                ),
            },
            {
                header: 'Actions',
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
                            </div>
                        )
                    else
                        return (
                            <div className="min-w-[200px]">
                                {hasAuthority(authority, 'admin') && (
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

    const fetchBanks = async (pageNum: number) => {
        let q: Query<DocumentData>
        if (!step) {
            q = query(
                BankDoc,
                orderBy('createdAt', 'desc'),
                where('step', '==', 'bankSteps.needRenovation'),
                limit(pageSizeOption[0].value),
            )
        } else {
            q = query(
                BankDoc,
                orderBy('createdAt', 'desc'),
                where('step', '==', 'bankSteps.needRenovation'),
                where('renovStep', '==', step),
                limit(pageSizeOption[0].value),
            )
        }

        q = getQueryDate(q)

        // If we're not on the first page, we need to start after a document
        if (pageNum > 1 && pageDocs[pageNum - 2]) {
            q = query(q, startAfter(pageDocs[pageNum - 2]))
        }

        const snapshot = await getDocs(q)
        setTotalData(snapshot.size)
        // Resolve landlords
        const banksWithLandlords = await Promise.all(
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
                return { id: docSnap.id, ...data, landlord }
            }),
        )
        // Update state
        setBanks(banksWithLandlords as any)
        setCurrentPage(pageNum)
        // Store the snapshot for this page if it’s new
        if (!pageDocs[pageNum - 1]) {
            setPageDocs((prev) => {
                const updated = [...prev]
                updated[pageNum - 1] = snapshot.docs[0] // store the first doc of this page
                return updated
            })
        }
    }
    useEffect(() => {
        if (fetchedRef.current) return
        fetchBanks(1) // load first page
    }, [])

    useEffect(() => {
        fetchBanks(1)
    }, [start, end, regions, agents, steps])

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
        setAgents(id)
    }

    const onChangeDate = async (start: Date, end: Date) => {
        setStart(start)
        setEnd(end)
    }
    const onChangeStep = async (step: BankStep) => {
        setSteps(step)
    }
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
                                    ? t('bank.' + step)
                                    : all
                                      ? 'Toutes les banks'
                                      : 'Rénovation libre'}
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
                    onChangeRegion={onChangeRegion}
                    onChangeAgent={onChangeAgent}
                    onChangeDate={onChangeDate}
                ></FilterBank>
            )}

            {!step && (
                <FilterMyBank
                    t={t}
                    all={all}
                    onChangeDate={onChangeDate}
                    onChangeStep={onChangeStep}
                ></FilterMyBank>
            )}

            <div className="w-full rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
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
                                        {row.getVisibleCells().map((cell) => {
                                            return (
                                                <Td
                                                    key={cell.id}
                                                    className="py-3 px-4 align-middle"
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef
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

                {/* Pagination bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/40">
                    <div className="text-xs text-gray-500">
                        Page{' '}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {table.getState().pagination.pageIndex + 1}
                        </span>{' '}
                        —{' '}
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {totalData}
                        </span>{' '}
                        résultat{totalData > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-3">
                        <Pagination
                            pageSize={table.getState().pagination.pageSize}
                            currentPage={
                                table.getState().pagination.pageIndex + 1
                            }
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
        </div>
    )
}

export default AllFreeTask
