/* eslint-disable @typescript-eslint/no-explicit-any */
// ---- Primitive / enum-like types ----
export type OnBehalfApprove = "pending" | "approve" | "reject";
export type PaymentMethod = "bank_transfer" | "cash" | "check";
export type Currency = "HTG" | "USD" | "PESOS";
export type TypePayment = "partial" | "full";
export type DocumentType = "proformat" | "invoice" | "id_card" | "contract";

export type RequestType =
  | "legal"
  | "bill"
  | "capex"
  | "locomotif"
  | "telecom"
  | "opex"
  | "transport_logistique"
  | "bank_renovation"
  | "lease_payment";

export type CapexType = "Moto" | "Generatrice" | "Ordinateur" | "autre";
export type LocomotifSpentType = "Carburant" | "Maintenance";
export type LocomotifType = "Vehicule" | "Moto";
export type ProviderTelecom = "Natcom" | "Digicel";
export type RenovationType = "painting" | "counter";

export type OpexCategorie =
  | "Matériaux de construction"
  | "Énergie (kits solaires, batteries, câbles, etc.)"
  | "Fournitures de bureau"
  | "autre";

// ---- Nested interfaces ----

export interface IGeneral {
  type_request: RequestType;
  id_region_user: number;
  is_for_other?: boolean;
  on_behalf_user_id?: string;
  on_behalf_approve?: OnBehalfApprove;
  paymentMethod: PaymentMethod;
  currency: Currency;
  beneficiaryName?: string;
  typePayment: TypePayment;
  approvalFlow?: number,
}

export interface IDocument {
  type: DocumentType;
}

export interface IBankInfo {
  BankName: string;
  AccountName: string;
  AccountNumber: number;
  SWIFT?: string;
}

export interface ILegal {
  beneficiary: string;
  price: number;
  description: string;
  target_date: Date;
}

export interface IBill {
  categorie: number;
  type?: string;
  price: number;
  description: string;
  target_date: Date;
}

export interface ICapex {
  categorie: number;
  type?: string;
  quantity: number;
  unit_price: number;
  price: number;
  provider: string;
  target_date: Date;
  decripstion: string; // spelling kept from schema
}

export interface ILocomotif {
  categorie: number;
  type_locomotif: LocomotifType;
  plaque?: string;
  provider: string;
  price: number;
  description: string;
}

export interface ITelecomPlan {
  beneficiary: string;
  provider: ProviderTelecom;
  plan_type?: string;
  start_date: Date;
  end_date: Date;
  price: number | null;
  id_card?: string;
}

export interface ITelecom {
  categorie: number;
  plans: ITelecomPlan[];
  description?: string;
  total_price: number;
}

export interface IOpexItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface IOpex {
  categorie: number;
  other_categorie?: string;
  items: IOpexItem[];
  amount: number;
  description?: string;
  masterbankId?: string;
}

export interface ITransportItem {
  name: string;
  quantity: number;
}

export interface ITransportAddress {
  region: number;
  city: string;
  street?: string;
}

export const getTypeRequestTagClasses = (typeRequest?: string) => {
  switch ((typeRequest ?? "").trim().toLowerCase()) {
    case "bill":
      return "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-50";

    case "capex":
      return "bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-900/40 text-purple-900 dark:text-purple-50";

    case "locomotif":
      return "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-50";

    case "telecom":
      return "bg-cyan-100 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-900/40 text-cyan-900 dark:text-cyan-50";

    case "opex":
      return "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-50";

    case "transport_logistique":
      return "bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-900/40 text-orange-900 dark:text-orange-50";

    case "bank_renovation":
      return "bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-900/40 text-pink-900 dark:text-pink-50";

    case "lease_payment":
      return "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-50";

    case "legal":
      return "bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-900/40 text-red-900 dark:text-red-50";

    default:
      return "bg-gray-100 dark:bg-gray-700 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-gray-50";
  }
};


export interface ITransport {
  categorie: number;
  transport_date: Date;
  From: ITransportAddress;
  To: ITransportAddress;
  purpose?: string;
  donebyAnEmployee: boolean;
  amount: number;
  items: ITransportItem[];
}

export interface IBankRenovationBank {
  bankName: string;
  amount: number;
}

export interface IBankRenovation {
  categorie: number;
  type?: string;
  start_date: Date;
  end_date: Date;
  vendor_id: string;
  vendor_name: string;
  total_amount: number;
  contract_id: string;
  description?: string;
}

export interface ILeasePayment {
  id_bank: string;
  categorie: number;
  type?: string;
  bankName: string;
  id_landlord: string;
  landlordName: string;
  start_date: Date;
  end_date: Date;
  yearNumber: number;
  rentCost: number;
  description?: string;
  renovationByTheLandlord: boolean;
  whoApproveTheBank: string;
  create_by: string;
}

// ---- Main interface matching MoneyRequestSchema ----

export interface IRequest {
  id: string,
  general?: IGeneral;
  BankInfo?: IBankInfo | null;
  bill?: IBill | null;
  capex?: ICapex | null;
  locomotif?: ILocomotif | null;
  telecom?: ITelecom | null;
  opex?: IOpex | null;
  transport_logistique?: ITransport | null;
  bank_renovation?: IBankRenovation | null;
  lease_payment?: ILeasePayment | null;
  legal?: ILegal | null;
  regionalApproved_by: string,
  preApproval_by: string,
  accountantApproval: string,
  managerGlobalApproval: string,
 comments?: {
    by_who: string,
    status: string,
    text : string , 
    createdAt: Date,
  } [];
  historicApproval: {
    status_to: string,
    status_from: string,
    by_who: string,
    createdAt: Date,
  }[],
  createdBy: string,
  createdAt: Date,
  updatedBy: string,
  updatedAt: Date,
  status: string,
  requestType: string,
  amount: number,
}
