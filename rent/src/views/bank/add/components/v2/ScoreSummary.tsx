/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Card } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import { V2Scoring } from '@/views/Entity'

interface Props {
    scores: Record<string, number>
    scoring?: Partial<V2Scoring>
    nextStep: (step: number, data: any) => void
}

const factorLabels = [
    { key: 'footTraffic', label: 'scoring.footTraffic.label', max: 3 },
    { key: 'trafficGenerator', label: 'scoring.trafficGenerator.label', max: 3 },
    { key: 'physicalSecurity', label: 'scoring.physicalSecurity.label', max: 3 },
    { key: 'zoneStability', label: 'scoring.zoneStability.label', max: 3 },
    { key: 'buildingCondition', label: 'scoring.buildingCondition.label', max: 3 },
    { key: 'physicalAccess', label: 'scoring.physicalAccess.label', max: 3 },
    { key: 'visibility', label: 'scoring.visibility.label', max: 3 },
]

function ScoreBar({ score, max }: { score: number; max: number }) {
    const pct = (score / max) * 100
    const color =
        pct >= 66 ? 'bg-emerald-500' : pct >= 33 ? 'bg-amber-500' : 'bg-red-500'
    return (
        <div className="flex items-center gap-3 w-full">
            <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} rounded-full transition-all`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-sm font-semibold w-10 text-right">
                {score}/{max}
            </span>
        </div>
    )
}

function ScoreSummary({ scores, scoring, nextStep }: Props) {
    const { t } = useTranslation()
    const total = Object.values(scores).reduce((sum, v) => sum + v, 0)
    const maxTotal = 21
    const pct = Math.round((total / maxTotal) * 100)

    const getDecisionColor = () => {
        if (pct >= 66) return 'text-emerald-600 dark:text-emerald-400'
        if (pct >= 33) return 'text-amber-600 dark:text-amber-400'
        return 'text-red-600 dark:text-red-400'
    }

    const getDecisionBg = () => {
        if (pct >= 66) return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
        if (pct >= 33) return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Total Score */}
            <Card bordered>
                <div className={`p-6 rounded-lg border ${getDecisionBg()}`}>
                    <div className="text-center">
                        <h4 className={`text-4xl font-bold ${getDecisionColor()}`}>
                            {total} / {maxTotal}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {t('scoring.scoutTotalScore')} ({pct}%)
                        </p>
                    </div>
                </div>
            </Card>

            {/* Per-factor breakdown */}
            <Card bordered>
                <h6 className="text-gray-900 dark:text-gray-100 mb-4">
                    {t('scoring.breakdown')}
                </h6>
                <div className="flex flex-col gap-4">
                    {factorLabels.map(({ key, label, max }) => (
                        <div key={key}>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {t(label)}
                                </span>
                            </div>
                            <ScoreBar score={scores[key] ?? 0} max={max} />
                        </div>
                    ))}
                </div>
            </Card>

            {/* Lottery competition (data only) */}
            {scoring?.lotteryCompetitionV2 && (
                <Card bordered>
                    <h6 className="text-gray-900 dark:text-gray-100 mb-2">
                        {t('scoring.lotteryCompetitionV2.label')}
                    </h6>
                    <span className="inline-block text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded mr-2">
                        {t('scoring.dataOnly')}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        {t(`scoring.${scoring.lotteryCompetitionV2}`)}
                    </span>
                </Card>
            )}

            <div className="flex justify-end">
                <Button
                    variant="solid"
                    onClick={() => nextStep(5, {})}
                >
                    {t('common.next')}
                </Button>
            </div>
        </div>
    )
}

export default ScoreSummary
