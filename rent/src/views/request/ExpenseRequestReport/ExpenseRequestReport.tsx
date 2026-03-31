/* eslint-disable @typescript-eslint/no-explicit-any */
import { ExpenseRequestDoc, LandlordDoc } from '@/services/Landlord'
import {
    CollectionReference,
    DocumentData,
    Query,
    QueryConstraint,
    QueryCompositeFilterConstraint,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
} from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { IRequest, getTypeRequestTagClasses } from '../entities/IRequest'
import { useSessionUser } from '@/store/authStore'
import { useTranslation } from '@/utils/hooks/useTranslation'
import { manageAuth } from '@/constants/roles.constant'
import { getRegionsById } from '@/views/Entity/Regions'
import UserName from '@/views/bank/show/components/UserName'
import Currency from '@/views/shared/Currency'
import { formatRelative } from 'date-fns/formatRelative'
import { fr } from 'date-fns/locale/fr'
import { Tag, Card, Select, Button, DatePicker } from '@/components/ui'
import Tabs from '@/components/ui/Tabs'
import { getCategorieName } from '../entities/AuthRequest'

type AnyConstraint = QueryConstraint | QueryCompositeFilterConstraint

interface CurrencySummary {
    totalRequests: number
    totalAmount: number
    byType: Record<string, { count: number; amount: number }>
    byStatus: Record<string, { count: number; amount: number }>
    byTypeAndStatus: Record<
        string,
        Record<string, { count: number; amount: number }>
    >
}

interface ReportSummary {
    totalRequests: number
    totalAmount: number
    byCurrency: Record<string, CurrencySummary>
}

interface OptionType {
    label: string
    value: string | number
}

export function ExpenseRequestReportBase() {
    const { authority, proprio } = useSessionUser((state) => state.user)
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [requests, setRequests] = useState<IRequest[]>([])
    const [summary, setSummary] = useState<ReportSummary>({
        totalRequests: 0,
        totalAmount: 0,
        byCurrency: {},
    })
    const [regions, setRegions] = useState<OptionType[]>([])
    const [selectedRegion, setSelectedRegion] = useState<number | undefined>()
    const [selectedType, setSelectedType] = useState<string | undefined>()
    const [selectedStatus, setSelectedStatus] = useState<string | undefined>()
    const [filterCreatedBy, setFilterCreatedBy] = useState<string | undefined>()
    const [creatorOptions, setCreatorOptions] = useState<OptionType[]>([])
    const [startDate, setStartDate] = useState<Date>(() => {
        const d = new Date()
        d.setDate(d.getDate() - 7)
        return d
    })
    const [endDate, setEndDate] = useState<Date>(new Date())


    const typeOptions: OptionType[] = [
        { label: 'Tous', value: '' },
        { label: 'Légal', value: 'legal' },
        { label: 'Facture', value: 'bill' },
        { label: 'Capex', value: 'capex' },
        { label: 'Locomotif', value: 'locomotif' },
        { label: 'Telecom', value: 'telecom' },
        { label: 'Opex', value: 'opex' },
        { label: 'Transport', value: 'transport_logistique' },
        { label: 'Rénovation', value: 'bank_renovation' },
        { label: 'Loyer', value: 'lease_payment' },
        { label: 'Divers', value: 'divers' },
    ]

    const statusOptions: OptionType[] = [
        { label: 'Tous', value: '' },
        { label: 'En attente', value: 'pending' },
        { label: 'Approuvé', value: 'approved' },
        { label: 'Rejeté', value: 'rejected' },
        { label: 'Payé', value: 'paid' },
    ]

    useEffect(() => {
        if (!authority?.length) return
        const fetchRegions = async () => {
            const { regions: r } = await manageAuth(authority[0], proprio, t)
            const opts = r.map((reg: any) => ({
                value: reg.value,
                label: reg.name,
            }))
            opts.unshift({ label: 'Toutes les régions', value: '' })
            setRegions(opts)
        }
        fetchRegions()
    }, [authority, proprio, t])

    useEffect(() => {
        fetchReport()
    }, [selectedRegion, selectedType, selectedStatus, startDate, endDate])

    const fetchReport = async () => {
        setLoading(true)
        try {
            const base = ExpenseRequestDoc as CollectionReference<DocumentData>
            let q: Query<DocumentData> = query(
                base,
                orderBy('createdAt', 'desc'),
                where('createdAt', '>=', Timestamp.fromDate(startDate)),
                where('createdAt', '<=', Timestamp.fromDate(endDate)),
            )

            if (selectedRegion) {
                q = query(
                    q,
                    where('general.id_region_user', '==', selectedRegion),
                )
            }
            if (selectedType) {
                q = query(q, where('general.type_request', '==', selectedType))
            }
            if (selectedStatus) {
                q = query(q, where('status', '==', selectedStatus))
            }

            const snapshot = await getDocs(q)
            const data: IRequest[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as IRequest[]

            setRequests(data)
            setFilterCreatedBy(undefined)
            computeSummary(data)
            resolveCreatorNames(data)
        } catch (error) {
            console.error('Error fetching report:', error)
        }
        setLoading(false)
    }

    const computeSummary = (data: IRequest[]) => {
        const result: ReportSummary = {
            totalRequests: data.length,
            totalAmount: 0,
            byCurrency: {},
        }

        for (const req of data) {
            const amount = Number(req.amount) || 0
            const type = req.general?.type_request || 'unknown'
            const status = req.status || 'unknown'
            const currency = req.general?.currency || 'HTG'

            result.totalAmount += amount

            if (!result.byCurrency[currency]) {
                result.byCurrency[currency] = {
                    totalRequests: 0,
                    totalAmount: 0,
                    byType: {},
                    byStatus: {},
                    byTypeAndStatus: {},
                }
            }
            const cur = result.byCurrency[currency]
            cur.totalRequests++
            cur.totalAmount += amount

            if (!cur.byType[type]) cur.byType[type] = { count: 0, amount: 0 }
            cur.byType[type].count++
            cur.byType[type].amount += amount

            if (!cur.byStatus[status])
                cur.byStatus[status] = { count: 0, amount: 0 }
            cur.byStatus[status].count++
            cur.byStatus[status].amount += amount

            if (!cur.byTypeAndStatus[type]) cur.byTypeAndStatus[type] = {}
            if (!cur.byTypeAndStatus[type][status])
                cur.byTypeAndStatus[type][status] = { count: 0, amount: 0 }
            cur.byTypeAndStatus[type][status].count++
            cur.byTypeAndStatus[type][status].amount += amount
        }

        setSummary(result)
    }

    const resolveCreatorNames = async (data: IRequest[]) => {
        const uniqueIds = [
            ...new Set(data.map((r) => r.createdBy).filter(Boolean)),
        ]
        const opts: OptionType[] = [{ label: 'Tous', value: '' }]
        for (const uid of uniqueIds) {
            try {
                const q = query(LandlordDoc, where('id_user', '==', uid))
                const snap = await getDocs(q)
                if (!snap.empty) {
                    const lord = snap.docs[0].data()
                    opts.push({ label: lord.fullName || uid, value: uid })
                } else {
                    opts.push({ label: uid, value: uid })
                }
            } catch {
                opts.push({ label: uid, value: uid })
            }
        }
        setCreatorOptions(opts)
    }

    const filteredRequests = useMemo(() => {
        if (!filterCreatedBy) return requests
        return requests.filter((r) => r.createdBy === filterCreatedBy)
    }, [requests, filterCreatedBy])

    const currencies = Object.keys(summary.byCurrency)

    const formatAmount = (amount: number) =>
        new Intl.NumberFormat('fr-FR').format(amount)

    return (
        <div className="space-y-6">
            <h3>Rapport des Requêtes</h3>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                <DatePicker
                    placeholder="Date début"
                    value={startDate}
                    onChange={(date) => {
                        if (date) setStartDate(date)
                    }}
                />
                <DatePicker
                    placeholder="Date fin"
                    value={endDate}
                    onChange={(date) => {
                        if (date) setEndDate(date)
                    }}
                />
                {regions.length > 0 && (
                    <Select
                        placeholder="Région"
                        options={regions}
                        onChange={(option: any) =>
                            setSelectedRegion(option?.value || undefined)
                        }
                    />
                )}
                <Select
                    placeholder="Type de requête"
                    options={typeOptions}
                    onChange={(option: any) =>
                        setSelectedType(option?.value || undefined)
                    }
                />
                <Select
                    placeholder="Statut"
                    options={statusOptions}
                    onChange={(option: any) =>
                        setSelectedStatus(option?.value || undefined)
                    }
                />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <p className="text-sm text-gray-500">Total Requêtes</p>
                    <h3 className="text-2xl font-bold">
                        {summary.totalRequests}
                    </h3>
                </Card>
                {currencies.map((currency) => (
                    <Card key={currency} className="p-4">
                        <p className="text-sm text-gray-500">
                            Total {currency}
                        </p>
                        <h3 className="text-2xl font-bold text-green-600">
                            {formatAmount(
                                summary.byCurrency[currency].totalAmount,
                            )}{' '}
                            {currency}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                            {summary.byCurrency[currency].totalRequests}{' '}
                            requêtes
                        </p>
                    </Card>
                ))}
            </div>

            {/* By Type & Status - Tabbed by Currency */}
            {currencies.length > 0 && (
                <Card className="p-6">
                    <Tabs defaultValue={currencies[0]}>
                        <Tabs.TabList>
                            {currencies.map((currency) => (
                                <Tabs.TabNav key={currency} value={currency}>
                                    {currency} (
                                    {summary.byCurrency[currency].totalRequests}
                                    )
                                </Tabs.TabNav>
                            ))}
                        </Tabs.TabList>
                        {currencies.map((currency) => {
                            const cur = summary.byCurrency[currency]
                            return (
                                <Tabs.TabContent
                                    key={currency}
                                    value={currency}
                                    className="pt-4"
                                >
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-lg font-semibold mb-4">
                                                Par Type
                                            </h4>
                                            <div className="space-y-3">
                                                {Object.entries(cur.byType).map(
                                                    ([type, data]) => (
                                                        <div
                                                            key={type}
                                                            className="flex items-center justify-between"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <Tag
                                                                    className={getTypeRequestTagClasses(
                                                                        type,
                                                                    )}
                                                                >
                                                                    {t(
                                                                        `request.types.${type}`,
                                                                    ) || type}
                                                                </Tag>
                                                                <span className="text-sm text-gray-500">
                                                                    (
                                                                    {data.count}
                                                                    )
                                                                </span>
                                                            </div>
                                                            <span className="font-semibold">
                                                                {formatAmount(
                                                                    data.amount,
                                                                )}{' '}
                                                                {currency}
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-semibold mb-4">
                                                Par Statut
                                            </h4>
                                            <div className="space-y-3">
                                                {Object.entries(
                                                    cur.byStatus,
                                                ).map(([status, data]) => (
                                                    <div
                                                        key={status}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium capitalize">
                                                                {status}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                ({data.count})
                                                            </span>
                                                        </div>
                                                        <span className="font-semibold">
                                                            {formatAmount(
                                                                data.amount,
                                                            )}{' '}
                                                            {currency}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Tabs.TabContent>
                            )
                        })}
                    </Tabs>
                </Card>
            )}

            {/* Type x Status Breakdown */}
            {currencies.length > 0 && (
                <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4">
                        Statistiques par Type et Statut
                    </h4>
                    <Tabs defaultValue={currencies[0]}>
                        <Tabs.TabList>
                            {currencies.map((currency) => (
                                <Tabs.TabNav key={currency} value={currency}>
                                    {currency}
                                </Tabs.TabNav>
                            ))}
                        </Tabs.TabList>
                        {currencies.map((currency) => {
                            const cur = summary.byCurrency[currency]
                            const allStatuses = [
                                ...new Set(
                                    Object.values(cur.byTypeAndStatus).flatMap(
                                        (s) => Object.keys(s),
                                    ),
                                ),
                            ]
                            return (
                                <Tabs.TabContent
                                    key={currency}
                                    value={currency}
                                    className="pt-4"
                                >
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                            <thead>
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                        Type
                                                    </th>
                                                    {allStatuses.map(
                                                        (status) => (
                                                            <th
                                                                key={status}
                                                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase capitalize"
                                                            >
                                                                {status}
                                                            </th>
                                                        ),
                                                    )}
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase font-bold">
                                                        Total
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {Object.entries(
                                                    cur.byTypeAndStatus,
                                                ).map(([type, statuses]) => {
                                                    const typeTotal =
                                                        Object.values(
                                                            statuses,
                                                        ).reduce(
                                                            (sum, s) =>
                                                                sum + s.amount,
                                                            0,
                                                        )
                                                    const typeCount =
                                                        Object.values(
                                                            statuses,
                                                        ).reduce(
                                                            (sum, s) =>
                                                                sum + s.count,
                                                            0,
                                                        )
                                                    return (
                                                        <tr key={type}>
                                                            <td className="px-4 py-3">
                                                                <Tag
                                                                    className={getTypeRequestTagClasses(
                                                                        type,
                                                                    )}
                                                                >
                                                                    {t(
                                                                        `request.types.${type}`,
                                                                    ) || type}
                                                                </Tag>
                                                            </td>
                                                            {allStatuses.map(
                                                                (status) => {
                                                                    const cell =
                                                                        statuses[
                                                                            status
                                                                        ]
                                                                    return (
                                                                        <td
                                                                            key={
                                                                                status
                                                                            }
                                                                            className="px-4 py-3 text-right"
                                                                        >
                                                                            {cell ? (
                                                                                <div>
                                                                                    <div className="font-medium">
                                                                                        {formatAmount(
                                                                                            cell.amount,
                                                                                        )}{' '}
                                                                                        {
                                                                                            currency
                                                                                        }
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-400">
                                                                                        {
                                                                                            cell.count
                                                                                        }{' '}
                                                                                        req.
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-gray-300">
                                                                                    -
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                    )
                                                                },
                                                            )}
                                                            <td className="px-4 py-3 text-right">
                                                                <div className="font-bold">
                                                                    {formatAmount(
                                                                        typeTotal,
                                                                    )}{' '}
                                                                    {currency}
                                                                </div>
                                                                <div className="text-xs text-gray-400">
                                                                    {typeCount}{' '}
                                                                    req.
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                                {/* Totals row */}
                                                <tr className="bg-gray-50 dark:bg-gray-800 font-bold">
                                                    <td className="px-4 py-3">
                                                        Total
                                                    </td>
                                                    {allStatuses.map(
                                                        (status) => {
                                                            const statusTotal =
                                                                Object.values(
                                                                    cur.byTypeAndStatus,
                                                                ).reduce(
                                                                    (
                                                                        sum,
                                                                        types,
                                                                    ) =>
                                                                        sum +
                                                                        (types[
                                                                            status
                                                                        ]
                                                                            ?.amount ||
                                                                            0),
                                                                    0,
                                                                )
                                                            const statusCount =
                                                                Object.values(
                                                                    cur.byTypeAndStatus,
                                                                ).reduce(
                                                                    (
                                                                        sum,
                                                                        types,
                                                                    ) =>
                                                                        sum +
                                                                        (types[
                                                                            status
                                                                        ]
                                                                            ?.count ||
                                                                            0),
                                                                    0,
                                                                )
                                                            return (
                                                                <td
                                                                    key={status}
                                                                    className="px-4 py-3 text-right"
                                                                >
                                                                    <div>
                                                                        {formatAmount(
                                                                            statusTotal,
                                                                        )}{' '}
                                                                        {
                                                                            currency
                                                                        }
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 font-normal">
                                                                        {
                                                                            statusCount
                                                                        }{' '}
                                                                        req.
                                                                    </div>
                                                                </td>
                                                            )
                                                        },
                                                    )}
                                                    <td className="px-4 py-3 text-right">
                                                        <div>
                                                            {formatAmount(
                                                                cur.totalAmount,
                                                            )}{' '}
                                                            {currency}
                                                        </div>
                                                        <div className="text-xs text-gray-400 font-normal">
                                                            {cur.totalRequests}{' '}
                                                            req.
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </Tabs.TabContent>
                            )
                        })}
                    </Tabs>
                </Card>
            )}

            {/* Request List */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">
                        Détails des requêtes
                    </h4>
                    <div className="flex items-center gap-4">
                        {creatorOptions.length > 1 && (
                            <div style={{ minWidth: 200 }}>
                                <Select
                                    size="sm"
                                    placeholder="Demandeur"
                                    options={creatorOptions}
                                    onChange={(option: any) =>
                                        setFilterCreatedBy(
                                            option?.value || undefined,
                                        )
                                    }
                                />
                            </div>
                        )}
                        <span className="text-sm text-gray-500">
                            {filteredRequests.length} résultats
                        </span>
                    </div>
                </div>
                {loading ? (
                    <p className="text-center text-gray-500 py-8">
                        Chargement...
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Type
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Demandeur
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Montant
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Statut
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredRequests.map((req) => (
                                    <tr key={req.id}>
                                        <td className="px-4 py-3">
                                            <Tag
                                                className={getTypeRequestTagClasses(
                                                    req.general?.type_request,
                                                )}
                                            >
                                                {t(
                                                    `request.types.${req.general?.type_request}`,
                                                ) || req.general?.type_request}
                                            </Tag>
                                        </td>
                                        <td className="px-4 py-3">
                                            {req.createdBy && (
                                                <UserName
                                                    userId={req.createdBy}
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {formatAmount(
                                                Number(req.amount) || 0,
                                            )}{' '}
                                            {req.general?.currency || 'HTG'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="capitalize">
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {req.createdAt
                                                ? formatRelative(
                                                      req.createdAt?.toDate?.() ||
                                                          req.createdAt,
                                                      new Date(),
                                                      { locale: fr },
                                                  )
                                                : ''}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    )
}

const ExpenseRequestReport = () => {
    return <ExpenseRequestReportBase />
}

export default ExpenseRequestReport
