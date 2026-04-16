import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BankFilterBucketKey = 'all' | 'mine' | string

export interface BankFilterValues {
    regions?: number
    agents?: string
    start?: string
    end?: string
    name?: string
    steps?: string
}

interface BankFilterState {
    all: BankFilterValues
    mine: BankFilterValues
    byStep: Record<string, BankFilterValues>
}

interface BankFilterActions {
    setFilter: (
        bucket: BankFilterBucketKey,
        patch: Partial<BankFilterValues>,
    ) => void
    clearFilter: (bucket: BankFilterBucketKey) => void
    getFilter: (bucket: BankFilterBucketKey) => BankFilterValues
}

const EMPTY: BankFilterValues = {}

const initialState: BankFilterState = {
    all: {},
    mine: {},
    byStep: {},
}

export const useBankFilterStore = create<
    BankFilterState & BankFilterActions
>()(
    persist(
        (set, get) => ({
            ...initialState,
            setFilter: (bucket, patch) =>
                set((state) => {
                    if (bucket === 'all' || bucket === 'mine') {
                        return {
                            [bucket]: { ...state[bucket], ...patch },
                        } as Partial<BankFilterState>
                    }
                    return {
                        byStep: {
                            ...state.byStep,
                            [bucket]: { ...(state.byStep[bucket] || {}), ...patch },
                        },
                    }
                }),
            clearFilter: (bucket) =>
                set((state) => {
                    if (bucket === 'all' || bucket === 'mine') {
                        return { [bucket]: {} } as Partial<BankFilterState>
                    }
                    const next = { ...state.byStep }
                    delete next[bucket]
                    return { byStep: next }
                }),
            getFilter: (bucket) => {
                const state = get()
                if (bucket === 'all' || bucket === 'mine') return state[bucket]
                return state.byStep[bucket] || EMPTY
            },
        }),
        {
            name: 'bankFilter',
        },
    ),
)

export const pickBucket = (step?: string, all?: boolean): BankFilterBucketKey =>
    step ? step : all ? 'all' : 'mine'

export const toDate = (iso?: string): Date | undefined =>
    iso ? new Date(iso) : undefined

export const toIso = (d?: Date): string | undefined =>
    d ? d.toISOString() : undefined
