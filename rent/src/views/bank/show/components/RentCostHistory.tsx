import { RentCostChange } from '@/views/Entity'
import { formatRelative } from 'date-fns/formatRelative'
import { fr } from 'date-fns/locale/fr'
import UserName from './UserName'

interface Props {
    history?: RentCostChange[]
    title?: string
    compact?: boolean
}

const fmt = (n: number) => new Intl.NumberFormat('fr-FR').format(n)

function RentCostHistory({ history, title, compact = false }: Props) {
    if (!history || history.length === 0) return null

    return (
        <div className={compact ? '' : 'mt-6 pt-5 border-t border-gray-100'}>
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-pink-600 text-[11px] font-bold">
                        {history.length}
                    </span>
                    {title || 'Historique du loyer final'}
                </h4>
            </div>
            <ol className="relative border-l-2 border-pink-100 ml-3 space-y-4">
                {history.map((h, i) => {
                    const when =
                        (h.at as any)?.toDate?.() ??
                        (h.at instanceof Date ? h.at : new Date(h.at))
                    const toNum = Number(h.to)
                    const fromNum = h.from != null ? Number(h.from) : undefined
                    const delta = fromNum != null ? toNum - fromNum : undefined
                    const pct =
                        fromNum && fromNum !== 0
                            ? (delta! / fromNum) * 100
                            : undefined
                    const up = (delta ?? 0) > 0
                    return (
                        <li key={i} className="ml-5 relative">
                            <span
                                className={[
                                    'absolute -left-[30px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white',
                                    i === 0
                                        ? 'bg-pink-500 shadow-[0_0_0_4px_rgba(236,72,153,0.15)]'
                                        : 'bg-pink-200',
                                ].join(' ')}
                            />
                            <div className="rounded-xl border border-gray-100 bg-white hover:border-pink-200 hover:shadow-sm transition-all p-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-gray-500 line-through">
                                        {fromNum != null ? fmt(fromNum) : '—'}
                                    </span>
                                    <svg
                                        className="h-4 w-4 text-gray-300"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="text-base font-bold text-pink-600">
                                        {fmt(toNum)}
                                    </span>
                                    <span className="text-[11px] font-medium text-gray-500">
                                        HTG
                                    </span>
                                    {delta != null && delta !== 0 && (
                                        <span
                                            className={[
                                                'ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                                                up
                                                    ? 'bg-rose-50 text-rose-600'
                                                    : 'bg-emerald-50 text-emerald-600',
                                            ].join(' ')}
                                        >
                                            <span>{up ? '▲' : '▼'}</span>
                                            {fmt(Math.abs(delta))}
                                            {pct != null && (
                                                <span className="opacity-70">
                                                    {' '}
                                                    ({pct > 0 ? '+' : ''}
                                                    {pct.toFixed(1)}%)
                                                </span>
                                            )}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500 flex-wrap">
                                    <span className="inline-flex items-center gap-1">
                                        <svg
                                            className="h-3 w-3"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <span className="font-medium text-gray-700">
                                            <UserName userId={h.by} />
                                        </span>
                                    </span>
                                    <span className="text-gray-300">•</span>
                                    <span className="inline-flex items-center gap-1">
                                        <svg
                                            className="h-3 w-3"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M6 2a1 1 0 011 1v1h6V3a1 1 0 112 0v1h1a2 2 0 012 2v11a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2h1V3a1 1 0 011-1zm11 6H3v9h14V8z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        {when
                                            ? formatRelative(when, new Date(), {
                                                  locale: fr,
                                              })
                                            : ''}
                                    </span>
                                    {h.dateFrom &&
                                        h.dateTo &&
                                        h.dateFrom !== h.dateTo && (
                                            <>
                                                <span className="text-gray-300">
                                                    •
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-gray-500">
                                                    Date ajustée
                                                </span>
                                            </>
                                        )}
                                </div>
                            </div>
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}

export default RentCostHistory
