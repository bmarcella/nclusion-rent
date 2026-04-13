/* eslint-disable @typescript-eslint/no-explicit-any */
import Skeleton from '@/components/ui/Skeleton'

// Locale-aware number formatter for report figures. Reports show counts
// up to a few thousand — thousands separators make them scannable.
const numberFormatter = new Intl.NumberFormat('fr-FR')
export const formatNumber = (n: number | string | undefined | null): string => {
    const v = Number(n ?? 0)
    if (!isFinite(v)) return '0'
    return numberFormatter.format(v)
}

// Skeleton row mimicking a typical report table row.
export function ReportSkeleton({
    rows = 6,
    cols = 8,
}: {
    rows?: number
    cols?: number
}) {
    return (
        <div className="space-y-2 p-4">
            <Skeleton height={28} width="40%" />
            <div className="space-y-2 mt-4">
                {Array.from({ length: rows }).map((_, r) => (
                    <div
                        key={r}
                        className="grid gap-2"
                        style={{
                            gridTemplateColumns: `2fr ${'1fr '.repeat(cols - 1)}`,
                        }}
                    >
                        {Array.from({ length: cols }).map((_, c) => (
                            <Skeleton key={c} height={18} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

// Simple empty state shown when filters return no rows.
export function ReportEmpty({
    title = 'Aucune donnée',
    message = 'Aucun résultat ne correspond aux filtres sélectionnés.',
}: {
    title?: string
    message?: string
}) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    className="text-gray-400"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Zm4 3h10M7 14h6"
                    />
                </svg>
            </div>
            <h6 className="text-gray-900 dark:text-gray-100 font-semibold">
                {title}
            </h6>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">{message}</p>
        </div>
    )
}

// Shared className helpers so all 3 report tables look consistent.
export const reportTableClasses = {
    wrapper:
        'overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700',
    table: 'min-w-full text-sm text-gray-700 dark:text-gray-200',
    thead:
        'sticky top-0 z-10 bg-gray-50 dark:bg-gray-800 text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300',
    th: 'px-3 py-3 text-center font-semibold whitespace-nowrap',
    thLeft: 'px-3 py-3 text-left font-semibold whitespace-nowrap',
    row: 'border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
    totalRow:
        'border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 font-semibold',
    td: 'px-3 py-2 text-center',
    tdLeft: 'px-3 py-2 text-left',
}
