import React from 'react'
import { Bank, BankFormVersion } from '@/views/Entity'

interface Props {
    bank: Bank
    showScore?: boolean
}

/**
 * Small inline badge that lets the user tell V1 vs V2 banks apart in lists.
 * For V2 banks, optionally surfaces the scout total score (x/21) so reviewers
 * can scan list views without opening each bank.
 */
const BankVersionBadge: React.FC<Props> = ({ bank, showScore = true }) => {
    const isV2 = bank?.version === BankFormVersion.V2

    const badgeClasses = isV2
        ? 'bg-primary-subtle text-primary border border-primary/20'
        : 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'

    const score = bank?.scoring?.scoutTotalScore
    const maxScore = 21
    const scoreColor =
        score == null
            ? 'bg-gray-100 text-gray-500'
            : score / maxScore >= 0.66
              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              : score / maxScore >= 0.33
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-red-100 text-red-700 border border-red-200'

    return (
        <span className="inline-flex items-center gap-1">
            <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${badgeClasses}`}
                title={isV2 ? 'Formulaire V2 (avec notation)' : 'Formulaire V1'}
            >
                {isV2 ? 'V2' : 'V1'}
            </span>
            {isV2 && showScore && score != null && (
                <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${scoreColor}`}
                    title="Score du scout"
                >
                    {score}/{maxScore}
                </span>
            )}
        </span>
    )
}

export default BankVersionBadge
