/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'
import Table from '@/components/ui/Table'
import THead from '@/components/ui/Table/THead'
import TBody from '@/components/ui/Table/TBody'
import Card from '@/components/ui/Card'
import { fetchReportPerReport } from '@/views/Entity/Regions'
import ReportTypeFilter from './ReportTypeFilter'
import { ReportStepsFull, ReportStepsSimple } from '@/views/Entity'
import { DocumentData, query, Query } from 'firebase/firestore'
import { BankDoc } from '@/services/Landlord'
import { getQueryFiltersDate } from '@/services/Report'
import {
    formatNumber,
    ReportEmpty,
    ReportSkeleton,
    reportTableClasses as cls,
} from './reportUi'

function RegionReport() {
    const [data, setData] = useState<any[]>([])
    const [steps, setSteps] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [type_rep, setTypeRep] = useState<boolean>()
    const [start, setStart] = useState<Date>()
    const [end, setEnd] = useState<Date>()

    useEffect(() => {
        setLoading(true)
        let q: Query<DocumentData> = query(BankDoc)
        const localSteps = type_rep ? ReportStepsSimple : ReportStepsFull
        q = getQueryFiltersDate(q, { start, end })
        fetchReportPerReport(localSteps, q).then((result) => {
            setData(result)
            if (result.length > 0) {
                setSteps(result[0].steps)
            } else {
                setSteps([])
            }
            setLoading(false)
        })
    }, [type_rep, start, end])

    const columnTotals = useMemo(
        () =>
            steps.map((_, index) =>
                data.reduce((sum, item) => sum + (item.values[index] || 0), 0),
            ),
        [steps, data],
    )

    const grandTotal = useMemo(
        () => columnTotals.reduce((acc, val) => acc + val, 0),
        [columnTotals],
    )

    const grandTotalAgent = useMemo(
        () => data.reduce((acc, item) => acc + item.total_agents, 0),
        [data],
    )

    const rows = useMemo(
        () =>
            data.map(({ name, values, total_agents }) => {
                const rowTotal = values.reduce(
                    (acc: number, val: number) => acc + val,
                    0,
                )
                const perc = rowTotal ? (values[1] / rowTotal) * 100 : 0
                let colorClass = ''
                if (perc <= 50) colorClass = 'text-red-500'
                else if (perc < 80) colorClass = 'text-orange-500'
                else colorClass = 'text-green-500'
                return {
                    name,
                    values,
                    total_agents,
                    rowTotal,
                    perc,
                    colorClass,
                }
            }),
        [data],
    )

    const onChangeType = (v: boolean) => setTypeRep(v)
    const onChangeDate = (s: Date, e: Date) => {
        setStart(s)
        setEnd(e)
    }

    return (
        <Card bordered className="overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                    Rapport par région
                </h5>
                <p className="text-xs text-gray-500 mt-0.5">
                    {data.length} région{data.length !== 1 ? 's' : ''} ·{' '}
                    {formatNumber(grandTotal)} banques ·{' '}
                    {formatNumber(grandTotalAgent)} agents
                </p>
            </div>

            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <ReportTypeFilter
                    onChangeReportTypeA={onChangeType}
                    onChangeDate={onChangeDate}
                />
            </div>

            {loading ? (
                <ReportSkeleton rows={6} cols={Math.max(steps.length + 3, 6)} />
            ) : rows.length === 0 ? (
                <ReportEmpty />
            ) : (
                <div className={`${cls.wrapper} m-4`}>
                    <Table className={cls.table}>
                        <THead className={cls.thead}>
                            <tr>
                                <th className={cls.thLeft}>Région</th>
                                {!type_rep && (
                                    <th className={cls.th}>Agents</th>
                                )}
                                <th className={cls.th}>Total</th>
                                {steps.map((step) => (
                                    <th
                                        key={step}
                                        className={`${cls.th} capitalize`}
                                    >
                                        {step}
                                    </th>
                                ))}
                                {type_rep && (
                                    <th className={cls.th}>Progression</th>
                                )}
                            </tr>
                        </THead>
                        <TBody>
                            <tr className={cls.totalRow}>
                                <td className={cls.tdLeft}>Total</td>
                                {!type_rep && (
                                    <td className={cls.td}>
                                        {formatNumber(grandTotalAgent)}
                                    </td>
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
                                {type_rep && (
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
                                )}
                            </tr>

                            {rows.map(
                                ({
                                    name,
                                    values,
                                    total_agents,
                                    rowTotal,
                                    perc,
                                    colorClass,
                                }) => (
                                    <tr key={name} className={cls.row}>
                                        <td className={cls.tdLeft}>{name}</td>
                                        {!type_rep && (
                                            <td
                                                className={`${cls.td} font-semibold`}
                                            >
                                                {formatNumber(total_agents)}
                                            </td>
                                        )}
                                        <td
                                            className={`${cls.td} font-semibold`}
                                        >
                                            {formatNumber(rowTotal)}
                                        </td>
                                        {values.map(
                                            (value: number, index: number) => (
                                                <td
                                                    key={`${name}-${index}`}
                                                    className={cls.td}
                                                >
                                                    {formatNumber(value)}
                                                </td>
                                            ),
                                        )}
                                        {type_rep && (
                                            <td
                                                className={`${cls.td} font-semibold ${colorClass}`}
                                            >
                                                {perc.toFixed(2)}%
                                            </td>
                                        )}
                                    </tr>
                                ),
                            )}
                        </TBody>
                    </Table>
                </div>
            )}
        </Card>
    )
}

export default RegionReport
