
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// eslint-disable-next-line @typescript-eslint/no-unused-vars

export interface RequestApprovalStatus {
   value: string,
   label: string,
   description?: string,
};

// Types
type TFunction = (key: string) => string;

export const REQUEST_STATUS_VALUES = [
  'preApproval',
  'regionalApproval',
  'accountantRegionalApproval',
  'managerGlobalApproval',
  'approved',
  'completed',
  'rejected',
  'cancelled',
] as const;

export type RequestStatusValue = (typeof REQUEST_STATUS_VALUES)[number];

export type StatusOption = {
  value: RequestStatusValue;
  label: string;
};

// Helper to build options from a list of status values
const makeStatusOptions = (t: TFunction, keys: RequestStatusValue[]): StatusOption[] =>
  keys.map((value) => ({
    value,
    label: t(`request.status.${value}`),
  }));

// ---- Public option helpers --------------------------------------------------
export const requestStatus = (t: TFunction): StatusOption[] =>
  makeStatusOptions(t, [
    'regionalApproval',
    'accountantRegionalApproval',
    'managerGlobalApproval',
  ]);

export const requestStatusAll = (t: TFunction): StatusOption[] =>
  makeStatusOptions(t, [...REQUEST_STATUS_VALUES]);

// ---- StatusTrain (linked list style) ---------------------------------------
export interface StatusNode {
  value: RequestStatusValue;
  label: string;
  next?: StatusNode;
}

const STATUS_TRAIN_ORDER: RequestStatusValue[] = [
  'preApproval',
  'regionalApproval',
  'accountantRegionalApproval',
  'managerGlobalApproval',
  'approved',
  'completed',
];

export const StatusTrain = (t: TFunction): StatusNode => {
  let next: StatusNode | undefined;

  // Build the chain from the end to the start
  for (let i = STATUS_TRAIN_ORDER.length - 1; i >= 0; i--) {
    const value = STATUS_TRAIN_ORDER[i];
    const node: StatusNode = {
      value,
      label: t(`request.status.${value}`),
      ...(next && { next }),
    };
    next = node;
  }

  // STATUS_TRAIN_ORDER is non-empty, so next is defined here
  return next!;
};

export function getNextNode(
  current: RequestStatusValue,
  t: (key: string) => string
): StatusNode | null {
  let node = StatusTrain(t) as any; // start at the first node in the chain
  while (node) {
    if (node.value === current) {
      return node.next ?? null;
    }
    node = node.next ;
  }

  return null;
}



export interface AuthRequest {
   id?: string ,
   region_id?: number,
   roles: string[],
   max_amount: number,
   status: string,
   reqType?: string [],
   canApprove: boolean,
   // 
   created_at?: Date,
   created_by?: string,
   updated_at?: Date,
   updated_by?: string,
}

export enum RequestTypeEnum {
  legal = "legal",
  bill = "bill",
  capex = "capex",
  locomotif = "locomotif",
  telecom = "telecom",
  opex = "opex",
  transport_logistique = "transport_logistique",
  bank_renovation = "bank_renovation",
  lease_payment = "lease_payment"
}

export interface RequestType {
   id: number
   value: number | string,
   name?: string,
   key: RequestTypeEnum,
   label: string,
   description: string,
   categories?: {
      value: number,
      label: string,
   },
   documentType : string []
}

export const requestType = (t: any, type: boolean = false) => [
  {
    id: 1,
    value: type ? 1 : RequestTypeEnum.transport_logistique,
    key: RequestTypeEnum.transport_logistique,
    label: t("request.type.1.label"),
    description: t("request.type.1.description"),
    documentType: [],
  },

  {
    id: 2,
    value: type ? 2 : RequestTypeEnum.opex,
    key: RequestTypeEnum.opex,
    label: t("request.type.2.label"),
    description: t("request.type.2.description"),
    categories: [
      { value: 1, label: t("request.type.2.categories.1") },
      { value: 2, label: t("request.type.2.categories.2") },
      { value: 3, label: t("request.type.2.categories.3") },
    ],
    documentType: [],
  },

  {
    id: 3,
    value: type ? 3 : RequestTypeEnum.telecom,
    key: RequestTypeEnum.telecom,
    label: t("request.type.3.label"),
    description: t("request.type.3.description"),
    documentType: [],
  },

  {
    id: 4,
    value: type ? 4 : RequestTypeEnum.locomotif,
    key: RequestTypeEnum.locomotif,
    label: t("request.type.4.label"),
    description: t("request.type.4.description"),
    documentType: [],
  },

  {
    id: 5,
    value: type ? 5 : RequestTypeEnum.capex,
    key: RequestTypeEnum.capex,
    label: t("request.type.5.label"),
    description: t("request.type.5.description"),
    documentType: [],
  },

  {
    id: 6,
    value: type ? 6 : RequestTypeEnum.bill,
    key: RequestTypeEnum.bill,
    label: t("request.type.6.label"),
    description: t("request.type.6.description"),
    documentType: [],
  },

  {
    id: 7,
    value: type ? 7 : RequestTypeEnum.legal,
    key: RequestTypeEnum.legal,
    label: t("request.type.7.label"),
    description: t("request.type.7.description"),
    documentType: [],
  },

  {
    id: 8,
    value: type ? 8 : RequestTypeEnum.lease_payment,
    key: RequestTypeEnum.lease_payment,
    label: t("request.type.8.label"),
    description: t("request.type.8.description"),
    documentType: [],
  },

  {
    id: 9,
    value: type ? 9 : RequestTypeEnum.bank_renovation,
    key: RequestTypeEnum.bank_renovation,
    label: t("request.type.9.label"),
    description: t("request.type.9.description"),
    documentType: [],
  },
];
