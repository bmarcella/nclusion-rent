/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'
import { useLandlordMap } from '@/utils/hooks/useLandlordMap'
import Table from '@/components/ui/Table'
import THead from '@/components/ui/Table/THead'
import TBody from '@/components/ui/Table/TBody'
import Card from '@/components/ui/Card'
import {
    formatNumber,
    ReportEmpty,
    ReportSkeleton,
    reportTableClasses as cls,
} from './reportUi'
import {
    fetchReportPerCreatorPerWeek,
    getLast4Weeks,
    getQueryFiltersWeek,
} from '@/services/Report'
import UserName from '@/views/bank/show/components/UserName'
import useTranslation from '@/utils/hooks/useTranslation'
import { useSessionUser } from '@/store/authStore'
import { BankDoc, LandlordDoc } from '@/services/Landlord'
import {
    Query,
    DocumentData,
    query,
    getCountFromServer,
    orderBy,
    where,
} from 'firebase/firestore'

import { ReportStepsFullX, ReportStepsWeek } from '@/views/Entity'
import FilterBankWeek from './FilterBankWeek'
import { StepDateRange } from './StepDateRange'
import { fetchReportPerReportWeek } from '@/views/Entity/Regions'

interface WeekResult {
    week: any
    new: number
    old: number
    total: number
}

function WeekAIReport() {
    const [data, setData] = useState<any[]>([])
    const [datab, setDatab] = useState<any[]>([])
    const [steps, setSteps] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { t } = useTranslation()
    const { proprio, authority } = useSessionUser((state) => state.user)
    // -------------------
    const [regions, setRegions] = useState<number>(0)
    const [agents, setAgents] = useState<string>()
    const [start, setStart] = useState<Date>()
    const [end, setEnd] = useState<Date>()
    const [type_rep, setTypeRep] = useState<boolean>()
    const [totalData, setTotalData] = useState<any[]>([])
    const [div, setDiv] = useState<number>(0)
    const [prevTotal, setPrevTotal] = useState<number>(0)
    const landlordMap = useLandlordMap()

    const fetchTotalCount = async (
        regions: number,
        weeks: [],
        i: number,
    ): Promise<void> => {
        let prev = 0

        await fetchPrevTotalCount(regions, weeks, i)

        const reversedWeeks = [...weeks].reverse() // Avoid mutating original array

        const results: WeekResult[] = []
        let w = 0
        for (const week of reversedWeeks) {
            let q: Query<DocumentData>

            if (regions) {
                q = query(
                    LandlordDoc,
                    where('regions', 'array-contains', regions),
                    where('type_person', '==', 'agent_immobilier'),
                    where('createdAt', '>=', week.start),
                    where('createdAt', '<=', week.end),
                )
            } else {
                q = query(
                    LandlordDoc,
                    where('type_person', '==', 'agent_immobilier'),
                    where('createdAt', '>=', week.start),
                    where('createdAt', '<=', week.end),
                )
            }

            const snapshot = await getCountFromServer(q)
            const currentCount = snapshot.data().count
            if (w == 0) currentCount + prevTotal

            results.push({
                week,
                new: currentCount,
                old: prev,
                total: prev + currentCount,
            })

            prev += currentCount
            w++
        }

        setTotalData(results.reverse())
        console.log('totalData', results)
    }

    const fetchPrevTotalCount = async (
        regions: number,
        weeks: [],
        i: number,
    ): Promise<void> => {
        let week = weeks[i]
        let q: Query<DocumentData>
        if (week === undefined) {
            console.log('week is undefined')
            return
        }
        if (regions) {
            q = query(
                LandlordDoc,
                where('regions', 'array-contains', regions),
                where('type_person', '==', 'agent_immobilier'),
                where('createdAt', '<', week.start),
            )
        } else {
            q = query(
                LandlordDoc,
                where('type_person', '==', 'agent_immobilier'),
                where('createdAt', '<', week.start),
            )
        }

        const snapshot = await getCountFromServer(q)
        const currentCount = snapshot.data().count
        setPrevTotal(currentCount)
        console.log('prevTotal', currentCount, week.start)
    }

    useEffect(() => {
        setLoading(true)
        setPrevTotal(0)
        if (!type_rep) simpleReport()
        else advencedReport()
    }, [regions, agents, start, type_rep])

    const simpleReport = async () => {
        setSteps([])
        const now = !start ? new Date() : start
        const weeks = getLast4Weeks(now)
        const q: Query<DocumentData> = query(BankDoc)
        fetchReportPerCreatorPerWeek(
            getQueryFiltersWeek(q, {
                regions: regions,
                agents: agents,
                authority: authority,
                proprio: proprio,
            }),
            ReportStepsWeek,
            weeks,
        ).then((result) => {
            setData(result)
            if (result.length > 0) {
                setSteps(result[0].steps)
            }
            setLoading(false)
        })
    }

    const advencedReport = async () => {
        setSteps([])
        const now = !start ? new Date() : start
        const weeks = getLast4Weeks(now, 12)
        const steps = ReportStepsFullX
        const q: Query<DocumentData> = query(BankDoc)
        const filters = getQueryFiltersWeek(q, {
            regions: regions,
            agents: agents,
            authority: authority,
            proprio: proprio,
        })
        fetchReportPerReportWeek(weeks, steps, filters).then((result) => {
            setDiv(result.length)
            setDatab(result)
            if (result.length > 0) {
                setSteps(result[0].steps)
                fetchTotalCount(regions, weeks, result.length - 1)
            }
            setLoading(false)
        })
    }

    // Memoize totals so they only recompute when the underlying data changes.
    const columnTotals = useMemo(
        () =>
            steps.map((_, index) =>
                datab.reduce(
                    (sum, item) => sum + (item.values[index] || 0),
                    0,
                ),
            ),
        [steps, datab],
    )

    const grandTotal = useMemo(
        () => columnTotals.reduce((acc, val) => acc + val, 0),
        [columnTotals],
    )

    const grandTotalAgent = useMemo(
        () => datab.reduce((acc, item) => acc + item.total_agents, 0),
        [datab],
    )

    const totalAgents = totalData.reduce((acc, val) => acc + val.new, 0)

    const onChangeRegion = (id: number) => setRegions(id)
    const onChangeType = (v: boolean) => setTypeRep(v)
    const onChangeAgent = (id: string) => setAgents(id)
    const onChangeDate = (s: Date) => setStart(s)

    const showSimple = !type_rep
    const showAdvanced = type_rep && datab.length > 0
    const isEmpty =
        !loading &&
        ((showSimple && data.length === 0) ||
            (type_rep && datab.length === 0))

    return (
        <Card bordered className="overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                    {type_rep
                        ? 'Rapport hebdomadaire par statut'
                        : 'Rapport par agent immobilier par semaine'}
                </h5>
                <p className="text-xs text-gray-500 mt-0.5">
                    {showSimple
                        ? `${data.length} agent${data.length !== 1 ? 's' : ''}`
                        : `${datab.length} semaine${datab.length !== 1 ? 's' : ''}`}
                </p>
            </div>

            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <FilterBankWeek
                    authority={authority || []}
                    proprio={proprio}
                    t={t}
                    message={t('report.weekAIReport.message')}
                    isMap={true}
                    onChangeRegion={onChangeRegion}
                    onChangeAgent={onChangeAgent}
                    onChangeDate={onChangeDate}
                    onChangeMap={onChangeType}
                />
            </div>

            {loading ? (
                <ReportSkeleton rows={6} cols={Math.max(steps.length + 2, 6)} />
            ) : isEmpty ? (
                <ReportEmpty />
            ) : (
                <>
                    {showSimple && (
                        <div className={`${cls.wrapper} m-4`}>
                            <Table className={cls.table}>
                                <THead className={cls.thead}>
                                    <tr>
                                        <th className={cls.thLeft}>Agent</th>
                                        <th className={cls.th}>Total</th>
                                        {steps.map((step, index) => (
                                            <th
                                                key={index}
                                                className={`${cls.th} capitalize`}
                                            >
                                                {step.name}
                                                <div className="text-[10px] font-normal opacity-70 mt-0.5">
                                                    <StepDateRange
                                                        start={step.start}
                                                        end={step.end}
                                                    >
                                                        {' '}
                                                    </StepDateRange>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </THead>
                                <TBody>
                                    {data.map(({ name, values }) => {
                                        const total = values.reduce(
                                            (t: number, arr: any[]) =>
                                                t +
                                                arr.reduce(
                                                    (s: number, item: any) =>
                                                        s + item.value,
                                                    0,
                                                ),
                                            0,
                                        )
                                        return (
                                            <tr
                                                key={name}
                                                className={cls.row}
                                            >
                                                <td className={cls.tdLeft}>
                                                    <UserName
                                                        userId={name}
                                                        landlord={landlordMap?.get(
                                                            name,
                                                        )}
                                                    />
                                                </td>
                                                <td
                                                    className={`${cls.td} font-semibold`}
                                                >
                                                    {formatNumber(total)}
                                                </td>
                                                {values.map(
                                                    (
                                                        value: any[],
                                                        index: number,
                                                    ) => {
                                                        const rowTotal =
                                                            value.reduce(
                                                                (
                                                                    sum: number,
                                                                    item: any,
                                                                ) =>
                                                                    sum +
                                                                    item.value,
                                                                0,
                                                            )
                                                        const val2 =
                                                            value[2]?.value ?? 0
                                                        const val1 =
                                                            value[1]?.value ?? 0
                                                        let colorClass = ''
                                                        if (val2 <= 2)
                                                            colorClass =
                                                                'text-red-500'
                                                        else if (val2 === 3)
                                                            colorClass =
                                                                'text-orange-500'
                                                        else if (val2 >= 4)
                                                            colorClass =
                                                                'text-green-500'

                                                        return (
                                                            <td
                                                                key={`${name}-${index}`}
                                                                className={`${cls.td} ${colorClass}`}
                                                            >
                                                                <span className="font-semibold">{`${val2} / ${rowTotal - val1}`}</span>
                                                                <div className="text-[10px] opacity-70">
                                                                    ({rowTotal})
                                                                </div>
                                                            </td>
                                                        )
                                                    },
                                                )}
                                            </tr>
                                        )
                                    })}
                                </TBody>
                            </Table>
                        </div>
                    )}

                    {showAdvanced && (
                        <div className={`${cls.wrapper} m-4`}>
                            <Table className={cls.table}>
                                <THead className={cls.thead}>
                                    <tr>
                                        <th className={cls.thLeft}>Semaine</th>
                                        <th className={cls.th}>
                                            Nouveaux agents
                                        </th>
                                        <th className={cls.th}>Total agents</th>
                                        <th className={cls.th}>Total</th>
                                        {steps.map((step, idx) => (
                                            <th
                                                key={
                                                    typeof step === 'string'
                                                        ? step
                                                        : (step.name ?? idx)
                                                }
                                                className={`${cls.th} capitalize`}
                                            >
                                                {typeof step === 'string'
                                                    ? step
                                                    : step.name}
                                            </th>
                                        ))}
                                        <th className={cls.th}>Progression</th>
                                    </tr>
                                </THead>
                                <TBody>
                                    <tr className={cls.totalRow}>
                                        <td className={cls.tdLeft}>Total</td>
                                        {totalData && totalData.length > 0 ? (
                                            <td className={cls.td}>
                                                {formatNumber(totalAgents)}
                                            </td>
                                        ) : (
                                            <td className={cls.td}>—</td>
                                        )}
                                        {totalData && totalData.length > 0 ? (
                                            <td className={cls.td}>
                                                {(
                                                    grandTotalAgent / div
                                                ).toFixed(2)}{' '}
                                                / {formatNumber(totalAgents)} (
                                                {totalAgents
                                                    ? (
                                                          (grandTotalAgent /
                                                              div /
                                                              totalAgents) *
                                                          100
                                                      ).toFixed(2)
                                                    : '0.00'}
                                                %)
                                            </td>
                                        ) : (
                                            <td className={cls.td}>—</td>
                                        )}
                                        <td className={cls.td}>
                                            {formatNumber(grandTotal)}
                                        </td>
                                        {columnTotals.map((val, idx) => (
                                            <td
                                                key={`col-total-${idx}`}
                                                className={cls.td}
                                            >
                                                {formatNumber(val)}
                                            </td>
                                        ))}
                                        <td className={cls.td}>
                                            {grandTotal
                                                ? (
                                                      (columnTotals[1] /
                                                          grandTotal) *
                                                      100
                                                  ).toFixed(2)
                                                : '0.00'}
                                            %
                                        </td>
                                    </tr>

                                    {datab.map(
                                        (
                                            { week, values, total_agents },
                                            i,
                                        ) => {
                                            const rowTotal = values.reduce(
                                                (acc: number, v: number) =>
                                                    acc + v,
                                                0,
                                            )
                                            const perc = rowTotal
                                                ? (values[2] / rowTotal) * 100
                                                : 0
                                            let colorClass = ''
                                            if (perc <= 50)
                                                colorClass = 'text-red-500'
                                            else if (perc < 80)
                                                colorClass = 'text-orange-500'
                                            else colorClass = 'text-green-500'

                                            return (
                                                <tr
                                                    key={i}
                                                    className={cls.row}
                                                >
                                                    <td
                                                        className={`${cls.tdLeft} font-semibold`}
                                                    >
                                                        <StepDateRange
                                                            start={week.start}
                                                            end={week.end}
                                                        >
                                                            {' '}
                                                        </StepDateRange>
                                                    </td>
                                                    <td
                                                        className={`${cls.td} font-semibold`}
                                                    >
                                                        {formatNumber(
                                                            totalData &&
                                                                totalData[i]
                                                                ? totalData[i]
                                                                      .new || 0
                                                                : 0,
                                                        )}
                                                    </td>
                                                    <td
                                                        className={`${cls.td} font-semibold`}
                                                    >
                                                        {totalData &&
                                                        totalData[i] ? (
                                                            <>
                                                                {formatNumber(
                                                                    total_agents,
                                                                )}{' '}
                                                                /{' '}
                                                                {formatNumber(
                                                                    totalData[i]
                                                                        .total ||
                                                                        0,
                                                                )}{' '}
                                                                <span className="text-[10px] opacity-70">
                                                                    (
                                                                    {totalData[
                                                                        i
                                                                    ].total
                                                                        ? (
                                                                              (total_agents /
                                                                                  totalData[
                                                                                      i
                                                                                  ]
                                                                                      .total) *
                                                                              100
                                                                          ).toFixed(
                                                                              2,
                                                                          )
                                                                        : '0.00'}
                                                                    %)
                                                                </span>
                                                            </>
                                                        ) : (
                                                            formatNumber(
                                                                total_agents,
                                                            )
                                                        )}
                                                    </td>
                                                    <td
                                                        className={`${cls.td} font-semibold`}
                                                    >
                                                        {formatNumber(rowTotal)}
                                                    </td>
                                                    {values.map(
                                                        (
                                                            value: number,
                                                            j: number,
                                                        ) => (
                                                            <td
                                                                key={j}
                                                                className={
                                                                    cls.td
                                                                }
                                                            >
                                                                {formatNumber(
                                                                    value,
                                                                )}
                                                            </td>
                                                        ),
                                                    )}
                                                    <td
                                                        className={`${cls.td} font-semibold ${colorClass}`}
                                                    >
                                                        {perc.toFixed(2)}%
                                                    </td>
                                                </tr>
                                            )
                                        },
                                    )}
                                </TBody>
                            </Table>
                        </div>
                    )}
                </>
            )}
        </Card>
    )
}

export default WeekAIReport
