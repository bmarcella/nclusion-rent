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
  price: number;
  description: string;
  target_date: Date;
}

export interface ICapex {
  type: CapexType;
  quantity: number;
  price: number;
  provider: string;
  beneficiary: string;
  target_date: Date;
  decripstion: string; // spelling kept from schema
}

export interface ILocomotif {
  spent_type: LocomotifSpentType;
  type_locomotif: LocomotifType;
  plaquea?: string;
  provider: string;
  price: number;
  description: string;
}

export interface ITelecomPlan {
  beneficiary: string;
  provider: ProviderTelecom;
  plan_type: string;
  start_date: Date;
  end_date: Date;
  price: number;
  id_card: string;
}

export interface ITelecom {
  plans: ITelecomPlan[];
  description: string;
  total_price: number;
}

export interface IOpexItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface IOpex {
  categorie: OpexCategorie;
  other_categorie?: string;
  items: IOpexItem[];
  amount: number;
  description: string;
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

export interface ITransport {
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
  Bank: IBankRenovationBank[];
  type_renovation: RenovationType;
  start_date: Date;
  end_date: Date;
  vendor_id: string;
  vendor_name: string;
  total_amount: number;
  contract_id: string;
  description: string;
}

export interface ILeasePayment {
  id_bank: string;
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
  id: string ,
  general?: IGeneral;
  BankInfo?: IBankInfo | null ;
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
  historicApproval : {
             status_to : string,
             status_from: string,
             by_who: string ,
             createdAt: Date,
   } [],
  createdBy: string,
  createdAt: Date ,
  updatedBy: string,
  updatedAt: Date,
  status:  string,
  requestType: string,
  amount: number,
}
