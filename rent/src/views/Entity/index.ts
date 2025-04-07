
import { USER_ROLE } from '@/constants/roles.constant';
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Document {
    id: string;
    name: string;
    type: string;
    url: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Person {
    id: string;
    fullName: string;
    nickName?: string;
    companyName?: string;
    id_user?: string; 
    nif: string;
    cin: string;
    address: string;
    phone: string;
    phone_b?: string;
    email?: string;
    website?: string;
    createdAt?: any;
    updatedAt?: Date;
    type_person: USER_ROLE; 
    regions?: number[];
    documents?: Document[];
    city?: string;
    active?: boolean ;
    createBy?: string;
    updateBy?: string;
}
export interface Proprio extends Person {
  tasks?: Tasks[]; 
  banks?: Bank[]; 
}

interface Tasks {
    id: string;
    Bank: string;
    date_debut: Date;
    date_fin: Date;
    montant_total: number;
    description: string;
    montant_initial: number;
    create_by: string;
    createdAt: Date;
}
export const internetProviders = ["internetProviders.natcom", "internetProviders.digicel", "internetProviders.none"] as const;
export const verifyOwners = [
  "verifyOwners.siblings",
  "verifyOwners.neighbors",
  "verifyOwners.parents",
  "verifyOwners.reference",
  "verifyOwners.tenant",
  "verifyOwners.current",
  "verifyOwners.other"
] as const;

export const whoReferreds = [
  "whoReferreds.owner",
  "whoReferreds.lotteryPlayers",
  "whoReferreds.vendors",
  "whoReferreds.businesses",
  "whoReferreds.formerAgent",
  "whoReferreds.competitors",
  "whoReferreds.peopleNearby"
] as const;

export const finalDecisionStatuses = [
  "finalDecisionStatuses.take",
  "finalDecisionStatuses.doNotTake",
  "finalDecisionStatuses.needMoreResearch"
] as const;

export const paymentMethods = ["paymentMethods.check", "paymentMethods.cash"] as const;

export const previousUses = [
  "previousUses.shop",
  "previousUses.lottery",
  "previousUses.commercial",
  "previousUses.moncash",
  "previousUses.none"
] as const;

export const nonRenewalReasons = [
  "nonRenewalReasons.badManagement",
  "nonRenewalReasons.other"
] as const;

export const lotteryCompetitions = [
  "lotteryCompetitions.2",
  "lotteryCompetitions.5",
  "lotteryCompetitions.10",
  "lotteryCompetitions.20Plus",
  "lotteryCompetitions.mobileAgents",
  "lotteryCompetitions.none",
  "lotteryCompetitions.other"
] as const;

export const clientVisibilities = [
  "clientVisibilities.streetView",
  "clientVisibilities.simpleEntrance",
  "clientVisibilities.wallAdSpace",
  "clientVisibilities.roofAdSpace"
] as const;

export const buildingStabilities = [
  "buildingStabilities.stable",
  "buildingStabilities.unstable",
  "buildingStabilities.sometimesStable"
] as const;

export const bankEntrances = [
  "bankEntrances.main",
  "bankEntrances.secondary",
  "bankEntrances.none"
] as const;

export const populationInAreas = [
  "populationInAreas.lessThan5k",
  "populationInAreas.5k",
  "populationInAreas.7k",
  "populationInAreas.10k",
  "populationInAreas.20k",
  "populationInAreas.50k",
  "populationInAreas.more"
] as const;

export const expectedRevenue = [
  "expectedRevenue.lessThan5k",
  "expectedRevenue.5k",
  "expectedRevenue.7k",
  "expectedRevenue.10k",
  "expectedRevenue.20k",
  "expectedRevenue.50kPlus"
] as const;

export const openHours = [
  "openHours.4am",
  "openHours.5am",
  "openHours.7am",
  "openHours.8am",
  "openHours.9amOrLater"
] as const;

export const closeHours = [
  "closeHours.4pm",
  "closeHours.5pm",
  "closeHours.6pm",
  "closeHours.8pmOrLater"
] as const;

export const currentSecurities = [
  "currentSecurities.padlock",
  "currentSecurities.concreteRoof",
  "currentSecurities.metalWindow",
  "currentSecurities.metalDoor"
] as const;

export const majorRenovations = [
  "majorRenovations.newMetalRoof",
  "majorRenovations.newConcreteRoof",
  "majorRenovations.structural",
  "majorRenovations.division",
  "majorRenovations.other"
] as const;

export const minorRenovations = [
  "minorRenovations.padlock",
  "minorRenovations.newDoor",
  "minorRenovations.doorRepair",
  "minorRenovations.windowRepair",
  "minorRenovations.wallAdSpace",
  "minorRenovations.roofAdSpace",
  "minorRenovations.other"
] as const;

export const paymentStructures = [
  "paymentStructures.full",
  "paymentStructures.advance",
  "paymentStructures.secondYear",
  "paymentStructures.other"
] as const;

export const locationTypes = [
  "locationTypes.lease",
  "locationTypes.sublease",
  "locationTypes.subleaseRealOwner",
  "locationTypes.subleaseCurrentOwner"
] as const;

export const locationAreas = [
  "locationAreas.residential",
  "locationAreas.market",
  "locationAreas.remote",
  "locationAreas.transport",
  "locationAreas.other"
] as const;

export const areaStabilities = [
  "areaStabilities.yes",
  "areaStabilities.no",
  "areaStabilities.sometimes",
  "areaStabilities.crime",
  "areaStabilities.other"
] as const;

export const bankSteps = [
  "bankSteps.rejected",
  "bankSteps.needApproval",
  "bankSteps.pending",
  "bankSteps.needApprobation",
  "bankSteps.needContract",
  "bankSteps.needRenovation",
  "bankSteps.readyToUse",
  "bankSteps.notProceeded"
] as const;
export type WhoReferred = typeof whoReferreds[number];
export type InternetProvider = typeof internetProviders[number];
export type FinalDecisionStatus = typeof finalDecisionStatuses[number];
export type PaymentMethod = typeof paymentMethods[number];
export type PaymentStructureType = typeof paymentStructures[number];
export type LocationType = typeof locationTypes[number];
export type LocationArea = typeof locationAreas[number];
export type AreaStability = typeof areaStabilities[number];
export type VerifyOwner = typeof verifyOwners[number];
export type BankStep = typeof bankSteps[number];
export type MinorRenovations = typeof minorRenovations[number];
export type MajorRenovation = typeof majorRenovations[number];
export type CurrentSecurity = typeof currentSecurities[number];
export type NeededSecurity = typeof currentSecurities[number];
export type CloseHour = typeof closeHours[number];
export type  PreviousUse = typeof previousUses[number];
export type OpenHour = typeof openHours[number];
export type ExpectedRevenue = typeof expectedRevenue[number];
export type PopulationInArea = typeof populationInAreas[number];
export type BankEntrance = typeof bankEntrances[number];
export type BuildingStability = typeof buildingStabilities[number];
export type ClientVisibility = typeof clientVisibilities[number];
export type LotteryCompetition = typeof lotteryCompetitions[number];
export type NonRenewalReason = typeof nonRenewalReasons[number];

export type HistoricDecision = {
  id?: string;
  bankId?: string;
  date?: Date;
  createdBy?: string;
  createdAt?: Date;
  status?: FinalDecisionStatus;
  reason_why?: string
};

export interface Bank {
    id?: string;
    bankName: string;
    city: string;
    id_region: number | string ;
    yearCount: number | string;
    date:  string;
    rentCost: number | string;
    addresse : string;
    landlord: string | any;
    reference?:  string;
    isrefSameAsLandlord: boolean;
    urgency: boolean;
    createdBy: string;
    createdAt?: Date;
    step : BankStep;
    reject: boolean;
    pending: boolean;
    approve: boolean;
    location: {
      lat: any,
      lng: any,
    },
    finalDecision? : {
        date?: Date;
        createdBy?: string;
        createdAt?: Date;
        status?: FinalDecisionStatus;
        reason_why?: string
    };

    rentDetails? : {
        paymentMethod?: PaymentMethod [];
        paymentStructure?: PaymentStructureType;
        locationType?: LocationType;
        verifyOwner?: VerifyOwner[];
        whoReferred?: WhoReferred[];
        locationArea?: LocationArea;
    }
   
    demoDetails? : {
        internetService?: InternetProvider []; //done
        previousUse?: PreviousUse [];
        nonRenewalReason?: NonRenewalReason;
        lotteryCompetition?: LotteryCompetition; // done
        bankEntrance?: BankEntrance[]; // done
        clientVisibility?: ClientVisibility[]; 
        populationInArea?: PopulationInArea; // d
        expectedRevenue?: ExpectedRevenue; // d
        buildingStability?: BuildingStability; // d
    }
   
    securityDetails? : {
        areaStability?: AreaStability;
        openHour?: OpenHour;
        closeHour?: CloseHour;
        currentSecurity?: CurrentSecurity[];
    }

    renovationDetails? : {
        neededSecurity?: NeededSecurity[];
        majorRenovation?: MajorRenovation[];
        minorRenovation?: MinorRenovations[];
    }
}

export interface Comments {
  bank: Bank
  createdBy?: string;
  createdAt?: Date;
  text?: string;
};

export const getEmptyPartialBank = () : any => {
  return {
    bankName: '',
    id_region: '',
    city: '',
    addresse: ' ',
    yearCount: '',
    date: new Date().toDateString(),
    rentCost: '',
    reference: '',
    landlord: '',
    isrefSameAsLandlord: false,
    urgency: false,
  };
}

export const getBlankBank  = (data: any, uuid: string, location: any): Bank => {
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
          reason_why: ''
        },
        rentDetails: {
          paymentMethod: [],
          paymentStructure: '',
          locationType: '',
          verifyOwner: [],
          whoReferred: [],
          locationArea: ''
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
          bankEntrance: []
        },
        securityDetails: {
          AreaStability: '',
          openHour: '',
          closeHour: '',
          currentSecurity: [],
        },
        renovationDetails: {
          neededSecurity: [],
          majorRenovation: [],
          minorRenovation: []
        },
        createdBy: uuid ,
        createdAt: new Date(),
      };
      
}