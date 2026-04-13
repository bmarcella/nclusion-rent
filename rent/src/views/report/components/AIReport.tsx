/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'
import Table from '@/components/ui/Table'
import THead from '@/components/ui/Table/THead'
import TBody from '@/components/ui/Table/TBody'
import Card from '@/components/ui/Card'
import { fetchReportPerCreator, getQueryFilters } from '@/services/Report'
import UserName from '@/views/bank/show/components/UserName'
import FilterBank from '@/views/bank/show/components/FilterBank'
import useTranslation from '@/utils/hooks/useTranslation'
import { useSessionUser } from '@/store/authStore'
import { BankDoc } from '@/services/Landlord'
import { Query, DocumentData, query } from 'firebase/firestore'
import ReportTypeFilter from './ReportTypeFilter'
import { ReportSteps, ReportStepsFull } from '@/views/Entity'
import { useLandlordMap } from '@/utils/hooks/useLandlordMap'
import {
    formatNumber,
    ReportEmpty,
    ReportSkeleton,
    reportTableClasses as cls,
} from './reportUi'

function AIReport() {
    const [data, setData] = useState<any[]>([])
    const [steps, setSteps] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const { t } = useTranslation()
    const { proprio, authority } = useSessionUser((state) => state.user)

    const [regions, setRegions] = useState<number>(0)
    const [agents, setAgents] = useState<string>()
    const [start, setStart] = useState<Date>(new Date())
    const [end, setEnd] = useState<Date>()
    const [type_rep, setTypeRep] = useState<boolean>()
    const landlordMap = useLandlordMap()

    useEffect(() => {
        setLoading(true)
        const q: Query<DocumentData> = query(BankDoc)
        const localSteps = type_rep ? ReportSteps : ReportStepsFull
        fetchReportPerCreator(
            localSteps,
            getQueryFilters(q, {
                regions,
                agents,
                start,
                end,
                authority,
                proprio,
            }),
        ).then((result) => {
            setData(result)
            if (result.length > 0) {
                setSteps(result[0].steps)
            } else {
                setSteps([])
            }
            setLoading(false)
        })
    }, [regions, agents, start, end, type_rep])

    // Memoize column totals so they only recompute when data/steps change.
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

    // "Progression" = banques qui ont dépassé les deux premières colonnes
    // (Rejeté + Non-Vues). On somme tout ce qui suit l'index 1 pour rester
    // robuste aux deux jeux d'étapes (ReportSteps / ReportStepsFull).
    const progressedTotal = useMemo(
        () =>
            columnTotals
                .slice(2)
                .reduce((sum, v) => sum + (Number(v) || 0), 0),
        [columnTotals],
    )

    // Pre-compute per-row totals & progression once per data refresh.
    const rows = useMemo(
        () =>
            data.map(({ name, values }) => {
                const rowTotal = values.reduce(
                    (acc: number, val: number) => acc + (Number(val) || 0),
                    0,
                )
                const progressed = values
                    .slice(2)
                    .reduce(
                        (acc: number, val: number) => acc + (Number(val) || 0),
                        0,
                    )
                const perc = rowTotal ? (progressed / rowTotal) * 100 : 0
                let colorClass = ''
                if (perc <= 50) colorClass = 'text-red-500'
                else if (perc < 80) colorClass = 'text-orange-500'
                else colorClass = 'text-green-500'
                return {
                    name,
                    values,
                    rowTotal,
                    progressed,
                    perc,
                    colorClass,
                }
            }),
        [data],
    )

    const onChangeRegion = (id: number) => setRegions(id)
    const onChangeType = (v: boolean) => setTypeRep(v)
    const onChangeAgent = (id: string) => setAgents(id)
    const onChangeDate = (s: Date, e: Date) => {
        setStart(s)
        setEnd(e)
    }

    return (
        <Card bordered className="overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                    Rapport par agent immobilier
                </h5>
                <p className="text-xs text-gray-500 mt-0.5">
                    {data.length} agent{data.length !== 1 ? 's' : ''} ·{' '}
                    {formatNumber(grandTotal)} banques
                </p>
            </div>

            <div className="px-4 py-3 space-y-3 border-b border-gray-200 dark:border-gray-700">
                <FilterBank
                    authority={authority || []}
                    proprio={proprio}
                    t={t}
                    onChangeRegion={onChangeRegion}
                    onChangeAgent={onChangeAgent}
                    onChangeDate={onChangeDate}
                />
                <ReportTypeFilter onChangeReportTypeA={onChangeType} />
            </div>

            {loading ? (
                <ReportSkeleton rows={6} cols={Math.max(steps.length + 2, 6)} />
            ) : rows.length === 0 ? (
                <ReportEmpty />
            ) : (
                <div className={`${cls.wrapper} m-4`}>
                    <Table className={cls.table}>
                        <THead className={cls.thead}>
                            <tr>
                                <th className={cls.thLeft}>Agent</th>
                                <th className={cls.th}>
                                    Total banques proposées
                                </th>
                                <th className={cls.th}>
                                    Total banques validées
                                </th>
                                {steps.map((step) => (
                                    <th
                                        key={step}
                                        className={`${cls.th} capitalize`}
                                    >
                                        {step}
                                    </th>
                                ))}
                                {type_rep && (
                                    <th className={cls.th}>Taux de conversion</th>
                                )}
                            </tr>
                        </THead>
                        <TBody>
                            <tr className={cls.totalRow}>
                                <td className={cls.tdLeft}>Total</td>
                                <td className={cls.td}>
                                    {formatNumber(grandTotal)}
                                </td>
                                <td className={cls.td}>
                                    {formatNumber(progressedTotal)}
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
                                                  (progressedTotal /
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
                                    rowTotal,
                                    progressed,
                                    perc,
                                    colorClass,
                                }) => (
                                    <tr key={name} className={cls.row}>
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
                                            {formatNumber(rowTotal)}
                                        </td>
                                        <td
                                            className={`${cls.td} font-semibold`}
                                        >
                                            {formatNumber(progressed)}
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

export default AIReport
