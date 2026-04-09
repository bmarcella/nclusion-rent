import { Bank } from '@/views/Entity'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BankDoc } from '@/services/Landlord'
import {
    DocumentData,
    getDocs,
    Query,
    query,
    Timestamp,
    where,
} from 'firebase/firestore'

export type RegionType = {
    id: number
    name: string
    capital: string
    label: string
    value: number | string
    cities: string[]
    isTest?: boolean
    accounts?: string[]
}
export const account = [
    'BUH OPS HTG-PAP55485',
    'BUH OPS USD-PAP55507',

    'BUH OPS HTG-CAP65103',
    'BUH OPS USD-CAP65111',

    'BUH OPS HTG-OUA81262',
    'BUH OPS USD-OUA81278',

    'BUH OPS HTG-CAY80521',
    'BUH OPS USD-CAY8053',

    'SAFEBOX',
    'OTHER',
] as const
export type DocType = Partial<RegionType>
export const DocTypeValues: DocType[] = [
    {
        id: 1,
        name: 'Carte NIN',
        label: 'Carte NIN',
        value: 'Carte NIN',
    },
    {
        id: 2,
        name: 'Permis de conduire',
        label: 'Permis de conduire',
        value: 'Permis de conduire',
    },
] as const
export const DocTypeLeasedValues: DocType[] = [
    {
        id: 1,
        name: 'Contrat de bail ',
        label: 'Contrat de bail signé',
        value: 'Contrat_de_bail',
    },
    {
        id: 1,
        name: 'Contrat de Renouvellement ',
        label: 'Contrat de renouvellement de bail signé',
        value: 'Contrat_de_renouvellement_bail',
    },
] as const
export const Regions: RegionType[] = [
    {
        id: 1,
        name: 'Artibonite',
        capital: 'Gonaives',
        label: 'Gonaives',
        value: 1,
        accounts: [],
        cities: [
            'Dessalines',
            'Desdunes',
            'Grande-Saline',
            "Petite Rivière de l'Artibonite",
            'Gonaïves',
            'Ennery',
            "L'Estère",
            'Gros-Morne',
            'Anse-Rouge',
            'Terre-Neuve',
            'Marmelade',
            "Saint-Michel-de-l'Atalaye",
            'Saint-Marc',
            'Les Arcadins',
            'La Chapelle',
            'Liancourt',
            'Verrettes',
            'Montrouis',
        ],
    },
    {
        id: 2,
        name: 'Centre',
        capital: 'Hinche',
        label: 'Hinche',
        value: 2,
        accounts: [
            'BUH OPS HTG-OUA81262',
            'BUH OPS USD-OUA81278',
            'SAFEBOX',
            'OTHER',
        ],
        cities: [
            'Cerca-la-Source',
            'Thomassique',
            'Hinche',
            'Cerca-Carvajal',
            'Maïssade',
            'Thomonde',
            'Lascahobas',
            'Baptiste',
            'Belladère',
            'Savanette',
            'Mirebalais',
            'Boucan-Carré',
            "Saut-d'Eau",
        ],
    },
    {
        id: 3,
        name: "Grand'Anse",
        capital: 'Jeremie',
        label: 'Jeremie',
        value: 3,
        accounts: [],
        cities: [
            "Anse-d'Hainault",
            'Dame-Marie',
            'Les Irois',
            'Beaumont',
            'Corail',
            'Pestel',
            'Roseaux',
            'Jérémie',
            'Abricots',
            'Bonbon',
            'Chambellan',
            'Marfranc',
            'Moron',
        ],
    },
    {
        id: 4,
        name: 'Nord',
        capital: 'Cap-Haïtien',
        label: 'Cap-Haïtien',
        value: 4,
        accounts: [
            'BUH OPS HTG-CAP65103',
            'BUH OPS USD-CAP65111',
            'SAFEBOX',
            'OTHER',
        ],
        cities: [
            'Acul-du-Nord',
            'Milot',
            'Plaine-du-Nord',
            'Borgne',
            'Port-Margot',
            'Cap-Haïtien',
            'Limonade',
            'Quartier-Morin',
            'Grande-Rivière-du-Nord',
            'Bahon',
            'Limbé',
            'Bas-Limbé',
            'Plaisance',
            'Pilate',
            'Saint-Raphaël',
            'Dondon',
            'La Victoire',
            'Pignon',
            'Ranquitte',
        ],
    },
    {
        id: 5,
        name: 'Nord-Est',
        capital: 'Ouanaminthe',
        label: 'Ouanaminthe',
        value: 5,
        accounts: [
            'BUH OPS HTG-OUA81262',
            'BUH OPS USD-OUA81278',
            'SAFEBOX',
            'OTHER',
        ],
        cities: [
            'Fort-Liberté',
            'Perches',
            'Ferrier',
            'Ouanaminthe',
            'Capotille',
            'Mont-Organisé',
            'Trou-du-Nord',
            'Caracol',
            'Sainte-Suzanne',
            'Grand-Bassin',
            'Terrier-Rouge',
            'Vallières',
            'Carice',
            'Mombin-Crochu',
        ],
    },
    {
        id: 6,
        name: 'Nord-Ouest',
        capital: 'Port-de-Paix',
        label: 'Port-de-Paix',
        value: 6,
        accounts: [
            'BUH OPS HTG-CAP65103',
            'BUH OPS USD-CAP65111',
            'SAFEBOX',
            'OTHER',
        ],
        cities: [
            'Môle-Saint-Nicolas',
            'Baie-de-Henne',
            'Bombardopolis',
            'Jean-Rabel',
            'Port-de-Paix',
            'Bassin-Bleu',
            'Chansolme',
            'Lapointe',
            'La Tortue',
            'Saint-Louis-du-Nord',
            'Anse-à-Foleur',
        ],
    },
    {
        id: 7,
        name: 'Ouest',
        capital: 'Port-au-Prince',
        label: 'Port-au-Prince',
        value: 7,
        accounts: [
            'BUH OPS HTG-PAP55485',
            'BUH OPS USD-PAP55507',
            'SAFEBOX',
            'OTHER',
        ],
        cities: [
            'Arcahaie',
            'Cabaret',
            'Croix-des-Bouquets',
            'Cornillon',
            'Fonds-Verrettes',
            'Ganthier',
            'Thomazeau',
            'Anse-à-Galets',
            'Pointe-à-Raquette',
            'Léogâne',
            'Grand-Goâve',
            'Petit-Goâve',
            'Port-au-Prince',
            'Carrefour',
            'Cité Soleil',
            'Delmas',
            'Gressier',
            'Kenscoff',
            'Pétion-Ville',
            'Tabarre',
        ],
    },
    {
        id: 8,
        name: 'Sud',
        capital: 'Les Cayes',
        label: 'Les Cayes',
        value: 8,
        accounts: [
            'BUH OPS HTG-CAY80521',
            'BUH OPS USD-CAY8053',
            'SAFEBOX',
            'OTHER',
        ],
        cities: [
            'Aquin',
            'Cavaillon',
            'Saint-Louis-du-Sud',
            'Fond des Blancs',
            'Les Cayes',
            'Camp-Perrin',
            'Chantal',
            'Île-à-Vache',
            'Maniche',
            'Torbeck',
            'Chardonnières',
            'Les Anglais',
            'Tiburon',
            'Côteaux',
            'Port-à-Piment',
            'Roche-à-Bateaux',
            'Port-Salut',
            'Arniquet',
            'Saint-Jean-du-Sud',
        ],
    },
    {
        id: 9,
        name: 'Sud-Est',
        capital: 'Jacmel',
        label: 'Jacmel',
        accounts: [
            'BUH OPS HTG-CAY80521',
            'BUH OPS USD-CAY8053',
            'SAFEBOX',
            'OTHER',
        ],
        value: 9,
        cities: [
            'Bainet',
            'Côtes-de-Fer',
            'Belle-Anse',
            'Anse-à-Pitres',
            'Grand-Gosier',
            'Thiotte',
            'Jacmel',
            'Cayes-Jacmel',
            'La Vallée',
            'Marigot',
        ],
    },
    {
        id: 11,
        name: 'Nippes',
        capital: 'Miragoâne',
        label: 'Miragoâne',
        accounts: [
            'BUH OPS HTG-CAY80531',
            'BUH OPS USD-CAY8054',
            'SAFEBOX',
            'OTHER',
        ],
        value: 11,
        cities: [
            'Miragoâne',
            'Anse-à-Veau',
            'Petit-Trou-de-Nippes',
            'Baradères',
            'Arnaud',
            'Plaisance-du-Sud',
            'Paillant',
            'Petit-Goâve (partie)',
            "L'Asile",
            'Fonds-des-Nègres',
        ],
    },
    {
        id: 10,
        name: 'Test',
        capital: 'For-test',
        label: 'Test',
        value: 10,
        isTest: true,
        accounts: [
            'BUH OPS HTG-CAY80521',
            'BUH OPS USD-CAY8053',
            'SAFEBOX',
            'OTHER',
        ],
        cities: ['Ville 1', 'Ville 2', 'Ville 3', 'Ville 4', 'Ville 5'],
    },
]

export const getRegionsById = (values: number): RegionType => {
    return Regions.find(
        (region: RegionType) => values == Number(region.value),
    ) as RegionType
}

export const getRegionsByValues = (values: number[]): RegionType[] => {
    return Regions.filter((region: RegionType) =>
        values.includes(Number(region.value)),
    )
}
export const getRegionIds = (): number[] => {
    return Regions.map((region) => region.id)
}

export const getRegionsIds = (Regions: RegionType[]): number[] => {
    return Regions.map((region) => region.id)
}

export const getRegionsLabelvalue = (Regions: any): number[] => {
    return Regions.map((region: any) => region.value)
}

export async function getBankCountsByRegion() {
    const snapshot = await getDocs(BankDoc)
    const counts: Record<string, number> = {}
    snapshot.forEach((doc) => {
        const data = doc.data()
        const id_region = data.id_region
        if (id_region) {
            counts[id_region] = (counts[id_region] || 0) + 1
        }
    })

    const regions: string[] = []
    const values: number[] = []

    for (const [id, count] of Object.entries(counts)) {
        const match = Regions.find((r) => r.value == id)
        if (match) {
            regions.push(match.label)
            values.push(count)
        }
    }

    return { regions, values }
}

interface ReportItem {
    name?: string
    steps?: string[]
    values?: number[]
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
// region × step. Replaces the original O(regions × steps) query loop.
export const fetchReportPerReport = async (
    ReportSteps: any[],
    hq: Query<DocumentData>,
) => {
    const snapshot = await getDocs(hq)
    const labels = ReportSteps.map((s: any) => s.label)

    // region id -> { counts per step, agents who created matching banks }
    const byRegion = new Map<
        number,
        { counts: number[]; agents: Set<string> }
    >()

    snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Bank
        const regionId = Number(data.id_region)
        if (!regionId) return

        let bucket = byRegion.get(regionId)
        if (!bucket) {
            bucket = {
                counts: new Array(ReportSteps.length).fill(0),
                agents: new Set<string>(),
            }
            byRegion.set(regionId, bucket)
        }

        let matched = false
        ReportSteps.forEach((step: any, idx: number) => {
            if (step.key.includes(data.step)) {
                bucket!.counts[idx]++
                matched = true
            }
        })
        if (matched && data.createdBy) {
            bucket.agents.add(data.createdBy)
        }
    })

    const report: ReportItem[] = []
    Regions.forEach((region) => {
        const bucket = byRegion.get(region.id)
        if (!bucket) return
        if (bucket.counts.every((v) => v === 0)) return

        report.push({
            name: region.label,
            steps: labels,
            values: bucket.counts,
            ...({
                agents: Array.from(bucket.agents),
                total_agents: bucket.agents.size,
            } as any),
        })
    })
    return report
}

// Single-pass aggregation: fetch banks within the global week range once,
// then bucket by week × step. Replaces the original O(weeks × steps) query
// loop. Also preserves the original `step.sub` matching semantics where
// sub-steps filter on `renovStep` instead of `step`.
export const fetchReportPerReportWeek = async (
    weeks: any[],
    ReportSteps: any[],
    q: Query<DocumentData>,
) => {
    if (weeks.length === 0) return []

    const labels = ReportSteps.map((s: any) => s.label)
    const weekRanges = weeks.map((w: any) => ({
        start: toJsDate(w.start),
        end: toJsDate(w.end),
    }))

    // Compute the union date range so we only pull banks once.
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

    // week index -> { counts per step, agents who created matching banks }
    const buckets = weeks.map(() => ({
        counts: new Array(ReportSteps.length).fill(0),
        agents: new Set<string>(),
    }))

    snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Bank
        const createdAt = toJsDate((data as any).createdAt)
        if (!createdAt) return

        const weekIdx = weekRanges.findIndex(
            (w) =>
                w.start != null &&
                w.end != null &&
                createdAt >= w.start &&
                createdAt <= w.end,
        )
        if (weekIdx === -1) return

        const bucket = buckets[weekIdx]
        let matched = false
        ReportSteps.forEach((step: any, stepIdx: number) => {
            const isMatch = !step.sub
                ? step.key.includes(data.step)
                : step.subKey.includes((data as any).renovStep)
            if (isMatch) {
                bucket.counts[stepIdx]++
                matched = true
            }
        })
        if (matched && data.createdBy) {
            bucket.agents.add(data.createdBy)
        }
    })

    const report: ReportItem[] = []
    weeks.forEach((week, idx) => {
        const bucket = buckets[idx]
        if (bucket.counts.every((v: number) => v === 0)) return
        report.push({
            ...({
                week,
                steps: labels,
                values: bucket.counts,
                agents: Array.from(bucket.agents),
                total_agents: bucket.agents.size,
                index: idx,
            } as any),
        })
    })
    return report
}
