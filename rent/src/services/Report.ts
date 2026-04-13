/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    DocumentData,
    getDocs,
    Query,
    query,
    QueryConstraint,
    Timestamp,
    where,
} from 'firebase/firestore'
import { getRegionIds } from '@/views/Entity/Regions'

export interface ReportItem {
    name: string // creator ID or name
    steps: string[]
    values: number[]
}

export const getQueryFilters = (
    q: Query<DocumentData, DocumentData>,
    { regions, agents, start, end, steps, proprio, authority }: any,
) => {
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
            filters.push(where('createdAt', '<=', Timestamp.fromDate(endOfDay)))
        } else {
            filters.push(where('createdAt', '>=', Timestamp.fromDate(start)))
            filters.push(where('createdAt', '<=', Timestamp.fromDate(end)))
        }
    } else {
        if (start) {
            filters.push(where('createdAt', '>=', Timestamp.fromDate(start)))
        }
        if (end) {
            filters.push(where('createdAt', '<=', Timestamp.fromDate(end)))
        }
    }
    return filters.length > 0 ? query(q, ...filters) : q
}

export const getQueryFiltersDate = (
    q: Query<DocumentData, DocumentData>,
    { start, end }: any,
) => {
    const filters: QueryConstraint[] = []
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
            filters.push(where('createdAt', '<=', Timestamp.fromDate(endOfDay)))
        } else {
            filters.push(where('createdAt', '>=', Timestamp.fromDate(start)))
            filters.push(where('createdAt', '<=', Timestamp.fromDate(end)))
        }
    } else {
        if (start) {
            filters.push(where('createdAt', '>=', Timestamp.fromDate(start)))
        }
        if (end) {
            filters.push(where('createdAt', '<=', Timestamp.fromDate(end)))
        }
    }
    return filters.length > 0 ? query(q, ...filters) : q
}

// Coerce a Firestore Timestamp / Date / string into a JS Date.
const toJsDate = (value: any): Date | null => {
    if (!value) return null
    if (value instanceof Date) return value
    if (typeof value?.toDate === 'function') return value.toDate()
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
}

// Single-pass aggregation: fetch all matching banks once, then bucket by
// createdBy × step. Replaces the original O(creators × steps) query loop.
export const fetchReportPerCreator = async (
    ReportSteps: any[],
    q: Query<DocumentData>,
): Promise<ReportItem[]> => {
    const snapshot = await getDocs(q)
    const labels = ReportSteps.map((s: any) => s.label)
    const byCreator = new Map<string, number[]>()

    snapshot.forEach((doc) => {
        const data = doc.data()
        const creator = data.createdBy
        if (!creator) return

        let counts = byCreator.get(creator)
        if (!counts) {
            counts = new Array(ReportSteps.length).fill(0)
            byCreator.set(creator, counts)
        }

        ReportSteps.forEach((step: any, idx: number) => {
            if (step.key.includes(data.step)) {
                counts![idx]++
            }
        })
    })

    const report: ReportItem[] = []
    byCreator.forEach((values, name) => {
        if (values.some((v) => v > 0)) {
            report.push({ name, steps: labels, values })
        }
    })
    return report
}

// Single-pass aggregation: fetch banks within the global week range once,
// then bucket by createdBy × week × step. Replaces the original
// O(creators × weeks × steps) query loop.
export const fetchReportPerCreatorPerWeek = async (
    q: Query<DocumentData>,
    ReportSteps: any[],
    weeks: any[],
): Promise<ReportItem[]> => {
    if (weeks.length === 0) return []

    // Compute the union date range so we only pull banks once.
    const weekRanges = weeks.map((w: any) => ({
        start: toJsDate(w.start),
        end: toJsDate(w.end),
    }))
    const minStart = weekRanges.reduce<Date | null>(
        (min, w) => (w.start && (!min || w.start < min) ? w.start : min),
        null,
    )
    const maxEnd = weekRanges.reduce<Date | null>(
        (max, w) => (w.end && (!max || w.end > max) ? w.end : max),
        null,
    )

    const constraints: any[] = []
    if (minStart)
        constraints.push(
            where('createdAt', '>=', Timestamp.fromDate(minStart)),
        )
    if (maxEnd)
        constraints.push(where('createdAt', '<=', Timestamp.fromDate(maxEnd)))

    const dateQ = constraints.length ? query(q, ...constraints) : q
    const snapshot = await getDocs(dateQ)

    // creator -> (week index -> step counts)
    const byCreator = new Map<string, number[][]>()

    snapshot.forEach((doc) => {
        const data = doc.data()
        const creator = data.createdBy
        if (!creator) return

        const createdAt = toJsDate(data.createdAt)
        if (!createdAt) return

        const weekIdx = weekRanges.findIndex(
            (w) =>
                w.start != null &&
                w.end != null &&
                createdAt >= w.start &&
                createdAt <= w.end,
        )
        if (weekIdx === -1) return

        let matrix = byCreator.get(creator)
        if (!matrix) {
            matrix = weeks.map(() =>
                new Array(ReportSteps.length).fill(0),
            )
            byCreator.set(creator, matrix)
        }

        ReportSteps.forEach((step: any, stepIdx: number) => {
            if (step.key.includes(data.step)) {
                matrix![weekIdx][stepIdx]++
            }
        })
    })

    const report: ReportItem[] = []
    byCreator.forEach((matrix, name) => {
        const hasAny = matrix.some((row) => row.some((v) => v > 0))
        if (!hasAny) return

        // Preserve the original return shape:
        // steps = array of week objects
        // values = [week][step] of { label, value }
        const values: any = matrix.map((row) =>
            row.map((value, stepIdx) => ({
                label: ReportSteps[stepIdx].label,
                value,
            })),
        )
        report.push({
            name,
            steps: weeks as any,
            values,
        })
    })
    return report
}

export const getQueryFiltersWeek = (
    q: Query<DocumentData, DocumentData>,
    { regions, agents }: any,
) => {
    const filters: QueryConstraint[] = []

    if (regions && regions != 0) {
        filters.push(where('id_region', '==', regions))
    }

    if (agents) {
        filters.push(where('createdBy', '==', agents))
    }

    return filters.length > 0 ? query(q, ...filters) : q
}

export function getLast4Weeks(
    dateInput: Date | string,
    week: number = 4,
): { name: string; start: string; end: string }[] {
    const result = []
    const date = new Date(dateInput)
    // Go to end of current week (Saturday)
    const endOfWeek = new Date(date)
    const day = endOfWeek.getDay() // Sunday = 0
    endOfWeek.setDate(endOfWeek.getDate() - day + 6) // Saturday

    for (let i = 0; i < week; i++) {
        const end = new Date(endOfWeek)
        end.setHours(23, 59, 59, 999) // Set to 11:59:59 PM

        const start = new Date(end)
        start.setDate(end.getDate() - 6)
        start.setHours(0, 0, 0, 0) // Set to midnight

        result.push({
            name: `Week ${week - i}`,
            start: start,
            end: end,
        })

        // Go to previous Saturday
        endOfWeek.setDate(endOfWeek.getDate() - 7)
    }

    return result
}
