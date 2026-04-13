/* eslint-disable @typescript-eslint/no-explicit-any */
import { USER_ROLE } from '../shared/schema'
import { Timestamp } from 'firebase/firestore'

export interface Document {
    id: string
    name: string
    type: string
    url: string
    createdAt: Date
    updatedAt: Date
}
export interface Person {
    id: string
    fullName: string
    fullName_lower: string
    nickName?: string
    companyName?: string
    id_user?: string
    nif?: string
    cin?: string
    address: string
    phone: string
    phone_b?: string
    email?: string
    website?: string
    createdAt?: any
    updatedAt?: Date
    type_person: USER_ROLE
    regions?: number[]
    documents?: Document[]
    city?: string
    active?: boolean
    createBy?: string
    updateBy?: string
}

export interface Proprio extends Person {
    tasks?: Tasks[]
    banks?: Bank[]
}

export type TaskState = 'pending' | 'in-progress' | 'completed'
interface Tasks {
    id: string
    taskName: string
    assignee: string
    startDate: string
    endDate: string
    state: TaskState
    montant_total: number
    description: string
    montant_initial: number
    create_by: string
    createdAt: Date
}
export const internetProviders = [
    'internetProviders.natcom',
    'internetProviders.digicel',
    'internetProviders.none',
] as const

export const roofTypes = [
    'roof.sheetMetal', // Tôle
    'roof.concrete', // Béton
    'roof.tile', // Tuile
    'roof.thatch', // Chaume
    'roof.metalTiles', // Tuiles métalliques
    // "roof.fibrocement",      // Fibrociment
    // "roof.zinc",             // Zinc
    'roof.wood', // Bois
    'roof.plastic', // Plastique
    'roof.galvanizedSteel', // Tôle galvanisée
    'roof.corrugatedSteel', // Tôle ondulée
    'roof.asphalt', // Asphalte / Bitume
    'roof.elastomer', // Membrane élastomère
    'roof.slate', // Ardoise
] as const

export const verifyOwners = [
    'verifyOwners.siblings',
    'verifyOwners.neighbors',
    'verifyOwners.parents',
    'verifyOwners.reference',
    'verifyOwners.tenant',
    'verifyOwners.current',
    'verifyOwners.other',
] as const

export const whoReferreds = [
    'whoReferreds.owner',
    'whoReferreds.lotteryPlayers',
    'whoReferreds.vendors',
    'whoReferreds.businesses',
    'whoReferreds.formerAgent',
    'whoReferreds.competitors',
    'whoReferreds.peopleNearby',
] as const

export const finalDecisionStatuses = [
    'finalDecisionStatuses.take',
    'finalDecisionStatuses.doNotTake',
    'finalDecisionStatuses.needMoreResearch',
] as const

export const paymentMethods = [
    'paymentMethods.check',
    'paymentMethods.cash',
] as const

export const previousUses = [
    'previousUses.shop',
    'previousUses.lottery',
    'previousUses.commercial',
    'previousUses.moncash',
    'previousUses.none',
] as const

export const nonRenewalReasons = [
    'nonRenewalReasons.badManagement',
    'nonRenewalReasons.other',
] as const

export const lotteryCompetitions = [
    'lotteryCompetitions.2',
    'lotteryCompetitions.5',
    'lotteryCompetitions.10',
    'lotteryCompetitions.20Plus',
    'lotteryCompetitions.mobileAgents',
    'lotteryCompetitions.none',
    'lotteryCompetitions.other',
] as const

export const clientVisibilities = [
    'clientVisibilities.streetView',
    'clientVisibilities.simpleEntrance',
    'clientVisibilities.wallAdSpace',
    'clientVisibilities.roofAdSpace',
] as const

export const buildingStabilities = [
    'buildingStabilities.stable',
    'buildingStabilities.unstable',
    'buildingStabilities.sometimesStable',
] as const

export const bankEntrances = [
    'bankEntrances.main',
    'bankEntrances.secondary',
    'bankEntrances.none',
] as const

export const populationInAreas = [
    'populationInAreas.lessThan5k',
    'populationInAreas.5k',
    'populationInAreas.7k',
    'populationInAreas.10k',
    'populationInAreas.20k',
    'populationInAreas.50k',
    'populationInAreas.more',
] as const

export const expectedRevenue = [
    'expectedRevenue.lessThan5k',
    'expectedRevenue.5k',
    'expectedRevenue.7k',
    'expectedRevenue.10k',
    'expectedRevenue.20k',
    'expectedRevenue.50kPlus',
] as const

export const openHours = [
    'openHours.4am',
    'openHours.5am',
    'openHours.7am',
    'openHours.8am',
    'openHours.9amOrLater',
] as const

export const closeHours = [
    'closeHours.4pm',
    'closeHours.5pm',
    'closeHours.6pm',
    'closeHours.8pmOrLater',
] as const

export const currentSecurities = [
    'currentSecurities.padlock',
    'currentSecurities.concreteRoof',
    'currentSecurities.metalWindow',
    'currentSecurities.metalDoor',
] as const

export const majorRenovations = [
    'majorRenovations.newMetalRoof',
    'majorRenovations.newConcreteRoof',
    'majorRenovations.structural',
    'majorRenovations.division',
    'majorRenovations.other',
] as const

export const minorRenovations = [
    'minorRenovations.padlock',
    'minorRenovations.newDoor',
    'minorRenovations.doorRepair',
    'minorRenovations.windowRepair',
    'minorRenovations.wallAdSpace',
    'minorRenovations.roofAdSpace',
    'minorRenovations.other',
] as const

export const paymentStructures = [
    'paymentStructures.full',
    'paymentStructures.advance',
    'paymentStructures.secondYear',
    'paymentStructures.other',
] as const

export const locationTypes = [
    'locationTypes.lease',
    'locationTypes.sublease',
    'locationTypes.subleaseRealOwner',
    'locationTypes.subleaseCurrentOwner',
] as const

export const locationAreas = [
    'locationAreas.residential',
    'locationAreas.market',
    'locationAreas.remote',
    'locationAreas.transport',
    'locationAreas.other',
] as const

export const areaStabilities = [
    'areaStabilities.yes',
    'areaStabilities.no',
    'areaStabilities.sometimes',
    'areaStabilities.crime',
    'areaStabilities.other',
] as const

export const bankSteps = [
    'bankSteps.rejected',
    'bankSteps.needApproval',
    'bankSteps.pending',
    'bankSteps.needApprobation',
    'bankSteps.needContract',
    'bankSteps.needRenovation',
    'bankSteps.readyToUse',
    'bankSteps.notProceeded',
] as const

export type WhoReferred = (typeof whoReferreds)[number]
export type InternetProvider = (typeof internetProviders)[number]
export type FinalDecisionStatus = (typeof finalDecisionStatuses)[number]
export type PaymentMethod = (typeof paymentMethods)[number]
export type PaymentStructureType = (typeof paymentStructures)[number]
export type LocationType = (typeof locationTypes)[number]
export type LocationArea = (typeof locationAreas)[number]
export type AreaStability = (typeof areaStabilities)[number]
export type VerifyOwner = (typeof verifyOwners)[number]
export type BankStep = (typeof bankSteps)[number]
export type MinorRenovations = (typeof minorRenovations)[number]
export type MajorRenovation = (typeof majorRenovations)[number]
export type CurrentSecurity = (typeof currentSecurities)[number]
export type NeededSecurity = (typeof currentSecurities)[number]
export type CloseHour = (typeof closeHours)[number]
export type PreviousUse = (typeof previousUses)[number]
export type OpenHour = (typeof openHours)[number]
export type ExpectedRevenue = (typeof expectedRevenue)[number]
export type PopulationInArea = (typeof populationInAreas)[number]
export type BankEntrance = (typeof bankEntrances)[number]
export type BuildingStability = (typeof buildingStabilities)[number]
export type ClientVisibility = (typeof clientVisibilities)[number]
export type LotteryCompetition = (typeof lotteryCompetitions)[number]
export type NonRenewalReason = (typeof nonRenewalReasons)[number]
export type RoofType = (typeof roofTypes)[number]
export const renovSteps = [
    'renovSteps.construction',
    'renovSteps.comptoire',
    'renovSteps.peinture',
    'renovSteps.in_process',
    'renovSteps.completed',
] as const
export type RenovStep = (typeof renovSteps)[number]

export const ContratTypes = ['contract.simple', 'contract.full'] as const

export type ContratType = (typeof ContratTypes)[number]

export type StepDecision = {
    id?: string
    bankId?: string
    createdBy?: string
    createdAt?: Date
    step?: BankStep
}
export type BankLease = {
    id?: string
    bankId?: string
    date_debut?: Date
    date_fin?: Date
    montant_total?: number
    createdBy?: string
    createdAt?: Date
    structure_payment?: PaymentStructureType
    payment_method?: PaymentMethod[]
}
export type HistoricDecision = {
    id?: string
    bankId?: string
    date?: Date
    createdBy?: string
    createdAt?: Date
    status?: FinalDecisionStatus
    reason_why?: string
}

export const FrenchNumber = ({ number }: { number: number }) => {
    const formatted = new Intl.NumberFormat('fr-FR').format(number)
    return formatted
}

export enum BankFormVersion {
    V1 = 'v1',
    V2 = 'v2',
}

// ── V2 Scoring Enums ──

export const footTrafficOptions = [
    'footTraffic.constant',
    'footTraffic.moderate',
    'footTraffic.occasional',
    'footTraffic.rare',
] as const
export type FootTraffic = (typeof footTrafficOptions)[number]

export const trafficGeneratorOptions = [
    'trafficGenerator.rightNextTo',
    'trafficGenerator.closeBy',
    'trafficGenerator.notReliable',
    'trafficGenerator.nothing',
] as const
export type TrafficGenerator = (typeof trafficGeneratorOptions)[number]

export const lotteryCompetitionV2Options = [
    'lotteryCompetitionV2.none',
    'lotteryCompetitionV2.oneToThree',
    'lotteryCompetitionV2.fourOrMore',
] as const
export type LotteryCompetitionV2 = (typeof lotteryCompetitionV2Options)[number]

export const physicalSecurityItems = [
    'physicalSecurity.metalDoor',
    'physicalSecurity.barredWindows',
    'physicalSecurity.securedRoof',
    'physicalSecurity.padlock',
] as const
export type PhysicalSecurityItem = (typeof physicalSecurityItems)[number]

export const zoneStabilityOptions = [
    'zoneStability.stable',
    'zoneStability.generallyStable',
    'zoneStability.sometimesUnstable',
    'zoneStability.knownBanditry',
] as const
export type ZoneStability = (typeof zoneStabilityOptions)[number]

export const buildingConditionOptions = [
    'buildingCondition.good',
    'buildingCondition.minorFixes',
    'buildingCondition.poorCondition',
] as const
export type BuildingCondition = (typeof buildingConditionOptions)[number]

export const physicalAccessOptions = [
    'physicalAccess.flatDirect',
    'physicalAccess.typicalBarriers',
    'physicalAccess.difficult',
    'physicalAccess.impassable',
] as const
export type PhysicalAccess = (typeof physicalAccessOptions)[number]

export const visibilityOptions = [
    'visibility.fullyVisible',
    'visibility.partiallyVisible',
    'visibility.setBack',
    'visibility.notVisible',
] as const
export type Visibility = (typeof visibilityOptions)[number]

// Score mapping per option (points)
export const scoringMap: Record<string, number> = {
    'footTraffic.constant': 3,
    'footTraffic.moderate': 2,
    'footTraffic.occasional': 1,
    'footTraffic.rare': 0,
    'trafficGenerator.rightNextTo': 3,
    'trafficGenerator.closeBy': 2,
    'trafficGenerator.notReliable': 1,
    'trafficGenerator.nothing': 0,
    'zoneStability.stable': 3,
    'zoneStability.generallyStable': 2,
    'zoneStability.sometimesUnstable': 1,
    'zoneStability.knownBanditry': 0,
    'buildingCondition.good': 3,
    'buildingCondition.minorFixes': 2,
    'buildingCondition.poorCondition': 0,
    'physicalAccess.flatDirect': 3,
    'physicalAccess.typicalBarriers': 2,
    'physicalAccess.difficult': 1,
    'physicalAccess.impassable': 0,
    'visibility.fullyVisible': 3,
    'visibility.partiallyVisible': 2,
    'visibility.setBack': 1,
    'visibility.notVisible': 0,
}

// Physical security score: based on count of selected items
export const getPhysicalSecurityScore = (items: PhysicalSecurityItem[]): number => {
    const count = items.length
    if (count >= 3) return 3
    return count // 2→2, 1→1, 0→0
}

export interface V2Scoring {
    footTraffic?: FootTraffic
    trafficGenerator?: TrafficGenerator
    lotteryCompetitionV2?: LotteryCompetitionV2
    physicalSecurity?: PhysicalSecurityItem[]
    zoneStability?: ZoneStability
    buildingCondition?: BuildingCondition
    physicalAccess?: PhysicalAccess
    visibility?: Visibility
    scoutTotalScore?: number
}

export interface SupervisorReview {
    supervisorId?: string
    supervisorScore?: number
    decision?: 'proceed' | 'reject' | 'review'
    notes?: string
    reviewedAt?: Date
}

export interface Bank {
    version?: BankFormVersion
    id?: string
    bankName: string
    city: string
    id_region: number | string
    yearCount: number | string
    date: string
    rentCost?: number | string
    final_rentCost: number | string
    superficie?: number | string
    nombre_chambre?: number | string
    addresse: string
    comptoireContratId?: string
    peintureContratId?: string
    landlord: string | any
    reference?: string
    renovStep?: RenovStep // new add
    isrefSameAsLandlord: boolean
    urgency: boolean
    createdBy: string
    createdAt?: Date
    step: BankStep
    reject: boolean
    pending: boolean
    approve: boolean
    paintedAt?: Date
    comptoireBuildedAt?: Date
    images: any[]
    first_approval?: string
    internetSpeed?: {
        natcom ?: {
         upload: number,
         download: number
        },
        digicel?: {
         upload: number,
         download: number  
        }
    }
    location: {
        lat: any
        lng: any
    }
    finalDecision?: {
        date?: Date
        createdBy?: string
        createdAt?: Date
        status?: FinalDecisionStatus
        reason_why?: string
    }
    // ── V1 fields ──
    rentDetails?: {
        paymentMethod?: PaymentMethod[]
        paymentStructure?: PaymentStructureType
        locationType?: LocationType
        verifyOwner?: VerifyOwner[]
        whoReferred?: WhoReferred[]
        locationArea?: LocationArea
    }
    demoDetails?: {
        internetService?: InternetProvider[]
        previousUse?: PreviousUse[]
        nonRenewalReason?: NonRenewalReason
        lotteryCompetition?: LotteryCompetition
        bankEntrance?: BankEntrance[]
        clientVisibility?: ClientVisibility[]
        populationInArea?: PopulationInArea
        expectedRevenue?: ExpectedRevenue
        buildingStability?: BuildingStability
        toilet?: boolean
        water?: boolean
        electricity?: boolean
        airConditioning?: boolean
    }
    securityDetails?: {
        areaStability?: AreaStability
        openHour?: OpenHour
        closeHour?: CloseHour
        currentSecurity?: CurrentSecurity[]
        roof?: RoofType
    }
    renovationDetails?: {
        neededSecurity?: NeededSecurity[]
        majorRenovation?: MajorRenovation[]
        minorRenovation?: MinorRenovations[]
    }
    // ── V2 fields ──
    ownerPhone?: string
    v2PaymentMethod?: PaymentMethod[]
    v2PaymentStructure?: PaymentStructureType
    v2LocationType?: LocationType
    v2InternetService?: InternetProvider[]
    v2VerifyOwner?: VerifyOwner[]
    v2RoofType?: RoofType
    scoring?: V2Scoring
    supervisorReview?: SupervisorReview
}


export const add7DaysToExpirationDate = (expDate?: Date | Timestamp): Date => {
    const baseDate = !expDate
        ? new Date()
        : expDate instanceof Date
          ? new Date(expDate)
          : expDate.toDate()

    if (Number.isNaN(baseDate.getTime())) {
        throw new Error('Invalid expiration date')
    }
    baseDate.setDate(baseDate.getDate() + 7)
    return baseDate
}

export const toDateSafe = (value?: Date | Timestamp | null): Date | null => {
    if (!value) return null

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : new Date(value)
    }

    const date = value.toDate()
    return Number.isNaN(date.getTime()) ? null : date
}

export const isBeforeToday = (value?: Date | Timestamp | null): boolean => {
    const input = toDateSafe(value)
    if (!input) return true

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    input.setHours(0, 0, 0, 0)
    return today < input
}

export const getEmptyPartialBank = (): any => {
    return {
        bankName: '',
        id_region: '',
        comptoireContratId: '',
        peintureContratId: '',
        renovStep: '' as RenovStep,
        city: '',
        addresse: ' ',
        superficie: '',
        nombre_chambre: '',
        yearCount: '',
        date: new Date().toDateString(),
        rentCost: '',
        reference: '',
        landlord: '',
        isrefSameAsLandlord: false,
        urgency: false,
        paintedAt: '',
        comptoireBuildedAt: '',
    }
}

export const getBlankBank = (data: any, uuid: string, location: any): Bank => {
    return {
        id: '',
        step: 'bankSteps.needApproval' as BankStep,
        reject: false,
        pending: false,
        approve: false,
        ...data,
        location: {
            lat: location.lat,
            lng: location.lng,
        },
        finalDecision: {
            date: new Date(),
            createdBy: '',
            createdAt: new Date(),
            status: '',
            reason_why: '',
        },
        rentDetails: {
            paymentMethod: [],
            paymentStructure: '',
            locationType: '',
            verifyOwner: [],
            whoReferred: [],
            locationArea: '',
        },
        demoDetails: {
            internetService: [],
            previousUse: [],
            nonRenewalReason: '',
            lotteryCompetition: '',
            clientVisibility: [],
            populationInArea: '',
            expectedRevenue: '',
            buildingStability: '',
            bankEntrance: [],
            toilet: false,
            water: false,
            electricity: false,
            airConditioning: false,
        },
        securityDetails: {
            AreaStability: '',
            openHour: '',
            closeHour: '',
            currentSecurity: [],
            roof: '',
        },
        renovationDetails: {
            neededSecurity: [],
            majorRenovation: [],
            minorRenovation: [],
        },
        createdBy: uuid,
        createdAt: new Date(),
    }
}

export const ListIBankSteps = [
    {
        key: 'bankSteps.pending',
        label: 'Considération',
        title: 'Banque en attente',
        description: "La banque est en attente d'approbation.",
        authority: [],
    },
    {
        key: 'bankSteps.rejected',
        label: 'Rejeté',
        title: 'Banque rejetée',
        description: 'La banque a été rejetée et nécessite une approbation.',
        authority: [],
    },
    {
        key: 'bankSteps.notProceeded',
        label: 'Non traité',
        title: 'Banque non traitée',
        description: "La banque n'a pas encore été traitée dans le système.",
        authority: [],
    },
]

export const ListABankSteps = [
    {
        key: 'bankSteps.needApproval',
        label: 'Validation',
        title: 'Validation requise',
        description:
            "La banque nécessite une validation avant de passer à l'étape suivante.",
        authority: [],
    },
    {
        key: 'bankSteps.needApprobation',
        label: 'Approbation',
        title: 'Approbation requise',
        description: 'La banque attend une approbation officielle.',
        authority: [],
    },
    {
        key: 'bankSteps.needContract',
        label: 'Contrat',
        title: 'Contrat requis',
        description:
            'La banque a besoin de signer un contrat pour continuer le processus.',
        authority: [],
    },
    {
        key: 'bankSteps.needRenovation',
        label: 'Rénovation',
        title: 'Rénovation requise',
        description:
            'La banque nécessite des rénovations avant d’être opérationnelle.',
        authority: [],
    },
    {
        key: 'bankSteps.readyToUse',
        label: 'Disponible',
        title: 'Banque prête',
        description: 'La banque est prête à être utilisée.',
    },
]

export const ListBankSteps = ListABankSteps.concat(ListIBankSteps)

export const ReportStepsSimple = [
    {
        key: ['bankSteps.rejected'],
        label: 'Rejeté',
    },
    {
        key: [
            'bankSteps.needApprobation',
            'bankSteps.needContract',
            'bankSteps.pending',
            'bankSteps.notProceeded',
            'bankSteps.needRenovation',
        ],
        label: 'Approuvée',
    },
    {
        key: ['bankSteps.needApproval'],
        label: 'Non-Vues',
    },
]

export const ReportSteps = [
    {
        key: ['bankSteps.rejected'],
        label: 'Rejeté',
    },
    {
        key: ['bankSteps.needApproval'],
        label: 'Non-Vues',
    },
    {
        key: [
            'bankSteps.needApprobation',
            'bankSteps.needContract',
            'bankSteps.pending',
            'bankSteps.notProceeded',
        ],
        label: 'Approbation',
    },
    {
        key: ['bankSteps.needRenovation'],
        label: 'Rénovation',
    },
    {
        key: ['bankSteps.readyToUse'],
        label: 'Disponible',
    },
]

export const ReportStepsWeek = [
    {
        key: ['bankSteps.rejected'],
        label: 'Rejeté',
    },
    {
        key: ['bankSteps.needApproval'],
        label: 'Non-Vues',
    },
    {
        key: [
            'bankSteps.needApprobation',
            'bankSteps.needContract',
            'bankSteps.pending',
            'bankSteps.notProceeded',
            'bankSteps.needRenovation',
            'bankSteps.readyToUse',
        ],
        label: 'Approbation',
    },
]

export const ReportStepsFull = [
    {
        key: ['bankSteps.rejected'],
        label: 'Rejeté',
    },
    {
        key: ['bankSteps.needApproval'],
        label: 'Non-Vues',
    },
    {
        key: ['bankSteps.needApprobation'],
        label: 'Approbation',
    },
    {
        key: ['bankSteps.needContract'],
        label: 'Contrats',
    },
    {
        key: ['bankSteps.needRenovation'],
        label: 'Rénovation',
    },
    {
        key: ['bankSteps.readyToUse'],
        label: 'Disponible',
    },
    {
        key: ['bankSteps.pending'],
        label: 'Attente',
    },
    {
        key: ['bankSteps.notProceeded'],
        label: 'Non traité',
    },
]

export const ReportStepsFullX = [
    {
        key: ['bankSteps.rejected'],
        label: 'Rejeté',
        sub: false,
    },
    {
        key: ['bankSteps.needApproval'],
        label: 'Non-Vues',
        sub: false,
    },
    {
        key: ['bankSteps.needApprobation', 'bankSteps.needContract'],
        label: 'Approuvée',
        sub: false,
    },
    {
        key: ['bankSteps.needRenovation'],
        label: 'Comptoire',
        sub: true,
        subKey: ['renovSteps.comptoire'],
    },
    {
        key: ['bankSteps.needRenovation'],
        label: 'Peinture',
        sub: true,
        subKey: ['bankSteps.needRenovation'],
    },
    {
        key: ['bankSteps.readyToUse'],
        label: 'Disponible',
        sub: false,
    },
    {
        key: ['bankSteps.notProceeded', 'bankSteps.pending'],
        label: 'Non traité',
        sub: false,
    },
]

export const ListBankStepsDetails = [
    {
        key: 'bankSteps.needApproval',
        label: 'Validation',
        title: 'Validation requise',
        description:
            "La banque nécessite une validation avant de passer à l'étape suivante.",
        authority: [],
    },
    {
        key: 'bankSteps.needApprobation',
        label: 'Approbation',
        title: 'Approbation requise',
        description: 'La banque attend une approbation officielle.',
        authority: [],
    },
    {
        key: 'bankSteps.needContract',
        label: 'Contrat',
        title: 'Contrat requis',
        description:
            'La banque a besoin de signer un contrat pour continuer le processus.',
        authority: [],
    },
    {
        key: 'bankSteps.needRenovation',
        label: 'Rénovation',
        title: 'Rénovation requise',
        description:
            'La banque nécessite des rénovations avant d’être opérationnelle.',
        authority: [],
    },
    {
        key: 'bankSteps.readyToUse',
        label: 'Disponible',
        title: 'Banque prête',
        description: 'La banque est prête à être utilisée.',
    },
]

export const getEndDateYear = (date: string, y: any) => {
    const newDate = new Date(date)
    newDate.setFullYear(newDate.getFullYear() + y)
    return newDate as Date
}

export interface BankTask {
    id: string
    taskName: RenovStep
    bankId: string
    state: string
    id_region: number | string
    description: string
    index?: any
    done: boolean
    createdBy: string
    createdAt: Date
    contratId?: string
}

export interface RenovContract {
    id: string
    transport: number
    renovStep: RenovStep
    assignee: string
    createdBy: string
    regionsId: number[]
    createdAt: Date
    montant_total: number
    montant_initial: number
    description?: string
    endDate: Date
    startDate: Date
    completed: boolean
    completedAt?: Date
    validated: boolean
    validatedAt?: Date
    banksId: string[]
    updatedAt: Date
    updatedBy: string
    completedBy: string
}
