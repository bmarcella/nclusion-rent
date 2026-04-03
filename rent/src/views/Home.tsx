/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSessionUser } from "@/store/authStore"
import { useEffect, useMemo, useState } from "react"
import { fetchReportPerReport, getBankCountsByRegion } from "./Entity/Regions"
import SimplePie from "./Charts/SimplePie"
import { ReportSteps } from "./Entity"
import { DocumentData, getDocs, query, Query, where, orderBy, limit, Timestamp } from "@firebase/firestore"
import { BankDoc, ExpenseRequestDoc } from "@/services/Landlord"
import { IRequest, getTypeRequestTagClasses } from "./request/entities/IRequest"
import Card from "@/components/ui/Card"
import { Spinner } from "@/components/ui"
import Chart from "react-apexcharts"
import { COLORS } from "@/constants/chart.constant"
import { HiOutlineOfficeBuilding, HiOutlineUserGroup, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineEye, HiOutlinePlus, HiOutlineCollection, HiOutlineHome, HiOutlineCurrencyDollar, HiOutlineDocumentText, HiOutlineClock, HiOutlineClipboardCheck } from "react-icons/hi"
import { Tag } from "@/components/ui"
import { CollectionReference } from "firebase/firestore"

const STEP_COLORS: Record<string, string> = {
    'Rejeté': '#ff6a55',
    'Non-Vues': '#fbc13e',
    'Approbation': '#8C62FF',
    'Rénovation': '#FE964A',
    'Disponible': '#7cbc7d',
}

const STEP_ICONS: Record<string, any> = {
    'Rejeté': HiOutlineExclamationCircle,
    'Non-Vues': HiOutlineEye,
    'Approbation': HiOutlineCheckCircle,
    'Rénovation': HiOutlineOfficeBuilding,
    'Disponible': HiOutlineHome,
}

const Home = () => {
    const { userId, authority } = useSessionUser((state) => state.user)
    const is_ai = authority && authority[0] == "agent_immobilier"
    const [regions, setRegions] = useState<string[]>([])
    const [values, setValues] = useState<number[]>([])
    const [report, setReport] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [reqStats, setReqStats] = useState<{
        total: number
        byStatus: Record<string, number>
        byCurrency: Record<string, { total: number; byType: Record<string, number>; byStatus: Record<string, number> }>
        recentRequests: IRequest[]
    }>({ total: 0, byStatus: {}, byCurrency: {}, recentRequests: [] })

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [bankData, reportData] = await Promise.all([
                    getBankCountsByRegion(),
                    fetchReportPerReport(ReportSteps as any, query(BankDoc) as Query<DocumentData>),
                ])
                setRegions(bankData.regions)
                setValues(bankData.values)
                setReport(reportData)

                // Fetch request stats
                const now = new Date()
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(now.getDate() - 30)
                const reqBase = ExpenseRequestDoc as CollectionReference<DocumentData>
                const reqSnapshot = await getDocs(
                    query(reqBase, where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)), orderBy('createdAt', 'desc'))
                )
                const requests = reqSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as IRequest[]

                const stats = {
                    total: requests.length,
                    byStatus: {} as Record<string, number>,
                    byCurrency: {} as Record<string, { total: number; byType: Record<string, number>; byStatus: Record<string, number> }>,
                    recentRequests: requests.slice(0, 5),
                }
                for (const req of requests) {
                    const status = req.status || 'unknown'
                    const currency = req.general?.currency || 'HTG'
                    const type = req.general?.type_request || 'unknown'
                    const amount = Number(req.amount) || 0

                    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1

                    if (!stats.byCurrency[currency]) {
                        stats.byCurrency[currency] = { total: 0, byType: {}, byStatus: {} }
                    }
                    stats.byCurrency[currency].total += amount
                    stats.byCurrency[currency].byType[type] = (stats.byCurrency[currency].byType[type] || 0) + amount
                    stats.byCurrency[currency].byStatus[status] = (stats.byCurrency[currency].byStatus[status] || 0) + amount
                }
                setReqStats(stats)
            } catch (e) {
                console.error('Dashboard fetch error:', e)
            }
            setLoading(false)
        }
        fetchData()
    }, [userId])

    const formatAmount = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount)

    const totalBanks = useMemo(() => values.reduce((a, b) => a + b, 0), [values])
    const totalRegions = useMemo(() => regions.length, [regions])
    const totalAgents = useMemo(() => {
        const allAgents = new Set<string>()
        report.forEach((r) => r.agents?.forEach((a: string) => allAgents.add(a)))
        return allAgents.size
    }, [report])

    const globalSteps = useMemo(() => {
        const stepMap: Record<string, number> = {}
        report.forEach((r) => {
            r.steps?.forEach((step: string, i: number) => {
                stepMap[step] = (stepMap[step] || 0) + (r.values?.[i] || 0)
            })
        })
        return stepMap
    }, [report])

    const barChartData = useMemo(() => {
        if (!report.length) return { categories: [], series: [] as any[] }
        const categories = report.map((r) => r.name || '')
        const stepLabels = report[0]?.steps || []
        const series = stepLabels.map((step: string, i: number) => ({
            name: step,
            data: report.map((r) => r.values?.[i] || 0),
        }))
        return { categories, series }
    }, [report])

    if (is_ai) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="max-w-lg w-full space-y-6 text-center">
                    <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <HiOutlineHome className="text-white text-4xl" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        Bienvenue sur la plateforme
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gestion immobilière simplifiée
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <a href="/proprio/add" className="flex items-center gap-2 justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition shadow-md">
                            <HiOutlinePlus className="text-lg" /> Ajouter entité
                        </a>
                        <a href="/proprio/myEntity" className="flex items-center gap-2 justify-center px-4 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition shadow-md">
                            <HiOutlineUserGroup className="text-lg" /> Mes entités
                        </a>
                        <a href="/bank/add" className="flex items-center gap-2 justify-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition shadow-md">
                            <HiOutlinePlus className="text-lg" /> Ajouter banque
                        </a>
                        <a href="/bank/show" className="flex items-center gap-2 justify-center px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition shadow-md">
                            <HiOutlineCollection className="text-lg" /> Mes banques
                        </a>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Spinner size={40} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <HiOutlineOfficeBuilding className="text-2xl text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Banques</p>
                            <h3 className="text-2xl font-bold">{totalBanks}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <HiOutlineCollection className="text-2xl text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Régions actives</p>
                            <h3 className="text-2xl font-bold">{totalRegions}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <HiOutlineUserGroup className="text-2xl text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Agents actifs</p>
                            <h3 className="text-2xl font-bold">{totalAgents}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <HiOutlineCheckCircle className="text-2xl text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Disponibles</p>
                            <h3 className="text-2xl font-bold">{globalSteps['Disponible'] || 0}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Status Summary Badges */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {Object.entries(globalSteps).map(([step, count]) => {
                    const color = STEP_COLORS[step] || '#999'
                    const Icon = STEP_ICONS[step] || HiOutlineOfficeBuilding
                    const pct = totalBanks > 0 ? Math.round((count / totalBanks) * 100) : 0
                    return (
                        <div
                            key={step}
                            className="rounded-xl p-4 border dark:border-gray-700"
                            style={{ borderLeftWidth: 4, borderLeftColor: color }}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <Icon className="text-lg" style={{ color }} />
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>
                                    {pct}%
                                </span>
                            </div>
                            <h4 className="text-xl font-bold">{count}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{step}</p>
                        </div>
                    )
                })}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart - Banks by Region & Status */}
                <Card className="lg:col-span-2 p-6">
                    <h4 className="text-lg font-semibold mb-4">Banques par Région</h4>
                    {barChartData.categories.length > 0 && (
                        <Chart
                            type="bar"
                            height={350}
                            options={{
                                chart: { stacked: true, toolbar: { show: false } },
                                colors: barChartData.series.map((_: any, i: number) => {
                                    const stepName = barChartData.series[i]?.name
                                    return STEP_COLORS[stepName] || COLORS[i]
                                }),
                                plotOptions: {
                                    bar: { horizontal: false, columnWidth: '55%', borderRadius: 4 },
                                },
                                xaxis: {
                                    categories: barChartData.categories,
                                    labels: { style: { fontSize: '11px' } },
                                },
                                yaxis: { title: { text: 'Nombre de banques' } },
                                legend: { position: 'top' },
                                dataLabels: { enabled: false },
                                tooltip: { shared: true, intersect: false },
                                grid: { borderColor: '#f1f1f1' },
                            }}
                            series={barChartData.series}
                        />
                    )}
                </Card>

                {/* Pie Chart - Distribution by Region */}
                <Card className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Distribution par Région</h4>
                    <SimplePie labels={regions} series={values} height={320} />
                </Card>
            </div>

            {/* Request Section */}
            {reqStats.total > 0 && (
                <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Requêtes (30 derniers jours)</h4>

                    {/* Request KPI Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-5">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                                    <HiOutlineDocumentText className="text-2xl text-violet-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total Requêtes</p>
                                    <h3 className="text-2xl font-bold">{reqStats.total}</h3>
                                </div>
                            </div>
                        </Card>
                        {Object.entries(reqStats.byCurrency).map(([currency, data]) => (
                            <Card key={currency} className="p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                        <HiOutlineCurrencyDollar className="text-2xl text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Total {currency}</p>
                                        <h3 className="text-xl font-bold">{formatAmount(data.total)}</h3>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Request by Status - Bar Chart */}
                        <Card className="lg:col-span-1 p-6">
                            <h4 className="text-lg font-semibold mb-4">Par Statut</h4>
                            <div className="space-y-3">
                                {Object.entries(reqStats.byStatus).map(([status, count]) => {
                                    const pct = reqStats.total > 0 ? Math.round((count / reqStats.total) * 100) : 0
                                    const statusColors: Record<string, string> = {
                                        pending: '#fbc13e',
                                        approved: '#7cbc7d',
                                        rejected: '#ff6a55',
                                        paid: '#2a85ff',
                                        cancelled: '#999',
                                    }
                                    const color = statusColors[status] || '#8C62FF'
                                    return (
                                        <div key={status}>
                                            <div className="flex items-center justify-between text-sm mb-1">
                                                <span className="capitalize font-medium">{status}</span>
                                                <span className="font-medium">{count} <span className="text-gray-400 text-xs">({pct}%)</span></span>
                                            </div>
                                            <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>

                        {/* Request by Type per Currency */}
                        <Card className="lg:col-span-1 p-6">
                            <h4 className="text-lg font-semibold mb-4">Par Type</h4>
                            {Object.entries(reqStats.byCurrency).map(([currency, data]) => (
                                <div key={currency} className="mb-4 last:mb-0">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">{currency}</p>
                                    <div className="space-y-2">
                                        {Object.entries(data.byType)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([type, amount]) => (
                                                <div key={type} className="flex items-center justify-between">
                                                    <Tag className={getTypeRequestTagClasses(type)}>
                                                        {type}
                                                    </Tag>
                                                    <span className="text-sm font-medium">{formatAmount(amount)} {currency}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </Card>

                        {/* Recent Requests */}
                        <Card className="lg:col-span-1 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold">Récentes</h4>
                                <a href="/request/show" className="text-sm text-blue-600 hover:underline">Voir tout</a>
                            </div>
                            <div className="space-y-3">
                                {reqStats.recentRequests.map((req) => {
                                    const statusColors: Record<string, string> = {
                                        pending: 'bg-yellow-100 text-yellow-700',
                                        approved: 'bg-green-100 text-green-700',
                                        rejected: 'bg-red-100 text-red-700',
                                        paid: 'bg-blue-100 text-blue-700',
                                    }
                                    const statusClass = statusColors[req.status] || 'bg-gray-100 text-gray-700'
                                    return (
                                        <div key={req.id} className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-700">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                                                    <HiOutlineDocumentText className="text-violet-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{req.general?.type_request || '-'}</p>
                                                    <p className="text-xs text-gray-400">{formatAmount(Number(req.amount) || 0)} {req.general?.currency || 'HTG'}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${statusClass}`}>
                                                {req.status}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>
                    </div>

                    {/* Amount by Status per Currency */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(reqStats.byCurrency).map(([currency, data]) => (
                            <Card key={currency} className="p-6">
                                <h4 className="text-lg font-semibold mb-1">{currency}</h4>
                                <p className="text-2xl font-bold text-green-600 mb-4">{formatAmount(data.total)} {currency}</p>
                                <div className="space-y-2">
                                    {Object.entries(data.byStatus)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([status, amount]) => {
                                            const pct = data.total > 0 ? Math.round((amount / data.total) * 100) : 0
                                            const statusColors: Record<string, string> = {
                                                pending: '#fbc13e',
                                                approved: '#7cbc7d',
                                                rejected: '#ff6a55',
                                                paid: '#2a85ff',
                                            }
                                            const color = statusColors[status] || '#8C62FF'
                                            return (
                                                <div key={status}>
                                                    <div className="flex items-center justify-between text-sm mb-1">
                                                        <span className="capitalize">{status}</span>
                                                        <span className="font-medium">{formatAmount(amount)} <span className="text-gray-400 text-xs">({pct}%)</span></span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Region Detail Cards */}
            <div>
                <h4 className="text-lg font-semibold mb-4">Détails par Région</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.map((item, index) => {
                        const regionTotal = item.values?.reduce((a: number, b: number) => a + b, 0) || 0
                        return (
                            <Card key={index} className="overflow-hidden">
                                <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                                    <h5 className="font-semibold">{item.name}</h5>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">{item.total_agents} agent{item.total_agents !== 1 ? 's' : ''}</span>
                                        <span className="text-sm font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                            {regionTotal}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-2">
                                        {item.steps?.map((step: string, i: number) => {
                                            const val = item.values?.[i] || 0
                                            const pct = regionTotal > 0 ? Math.round((val / regionTotal) * 100) : 0
                                            const color = STEP_COLORS[step] || COLORS[i]
                                            return (
                                                <div key={step}>
                                                    <div className="flex items-center justify-between text-sm mb-1">
                                                        <span className="text-gray-600 dark:text-gray-400">{step}</span>
                                                        <span className="font-medium">{val} <span className="text-gray-400 text-xs">({pct}%)</span></span>
                                                    </div>
                                                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${pct}%`, backgroundColor: color }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default Home
