
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { IRequest } from "./IRequest";
import { billType, capexType } from "./TypeRequestData";



// eslint-disable-next-line @typescript-eslint/no-unused-vars

export interface RequestApprovalStatus {
  value: string,
  label: string,
  description?: string,
};

// Types
type TFunction = (key: string) => string;

export const REQUEST_STATUS_VALUES_ACTION = [
  'approved',
  'completed',
] as const;

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


export const requestStatusAction = (t: TFunction): StatusOption[] =>
  makeStatusOptions(t, [...REQUEST_STATUS_VALUES_ACTION]);

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

const STATUS_TRAIN_ORDER_2: RequestStatusValue[] = [
  'preApproval',
  'regionalApproval',
  'managerGlobalApproval',
  'approved',
  'completed',
];

const STATUS_TRAIN_ORDER_3: RequestStatusValue[] = [
  'preApproval',
  'accountantRegionalApproval',
  'managerGlobalApproval',
  'approved',
  'completed',
];

export const StatusTrain = (t: TFunction): StatusNode => {
  let next: StatusNode | undefined;
  const train  =  STATUS_TRAIN_ORDER;
  // Build the chain from the end to the start
  for (let i = train.length - 1; i >= 0; i--) {
    const value = train[i];
    const node: StatusNode = {
      value,
      label: t(`request.status.${value}`),
      ...(next && { next }),
    };
    next = node;
  }
  return next!;
};

export function getNextNode(
  current: RequestStatusValue,
  t: (key: string) => string,
): StatusNode | null {
  let node = StatusTrain(t) as any; // start at the first node in the chain
  while (node) {
    if (node.value === current) {
      return node.next ?? null;
    }
    node = node.next;
  }

  return null;
}

export function getNextNodeV2(
  current: RequestStatusValue,
  t: (key: string) => string,
  flow?: number
): StatusNode | null {
  let node = StatusTrainV2(t, flow) as any; // start at the first node in the chain
  while (node) {
    if (node.value === current) {
      return node.next ?? null;
    }
    node = node.next;
  }
  return null;
}


export const StatusTrainV2 = (t: TFunction, flow?: number): StatusNode => {
  const allTrain: Record<number, readonly string[]> = {
    1: STATUS_TRAIN_ORDER,
    2: STATUS_TRAIN_ORDER_2,
    3: STATUS_TRAIN_ORDER_3,
  } as const;

  const train = (flow && flow != null && allTrain[flow]) ? allTrain[flow] : STATUS_TRAIN_ORDER;

  let head: StatusNode | undefined;

  // Build the chain from the end to the start
  for (let i = train.length - 1; i >= 0; i--) {
    const value = train[i];
    head = {
      value,
      label: t(`request.status.${value}`),
      ...(head ? { next: head } : {}),
    };
  }
  if (!head) {
    throw new Error("StatusTrain: train is empty");
  }
  return head;
};




export interface AuthRequest {
  id?: string,
  region_id?: number,
  roles: string[],
  max_amount: number,
  status: string,
  reqType?: string[],
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
    type?: string[]
  },
  documentType: string[]
}

export const getRequestCategorieById = (t: any, tReq: string, catId: number): string => {
  const reqs = requestType(t);
  const req = reqs.find((r) => r.key == tReq);
  return req?.categories.find((c) => c.value == catId)?.label
}

export const getRequestCategorieTypeById = (t: any, tReq: string, catId: number): any => {
  const reqs = requestType(t);
  const req = reqs.find((r) => r.key == tReq);
  const cat = req?.categories.find((c: any) => c.value == catId) as any;
  return cat.type;
}

export const getRequestType = (t: any, tReq: string, catId: number, type: string): any => {
  if(!type) return '-';
  const atype = getRequestCategorieTypeById(t, tReq, catId) as any[];
  return atype.find((t) => t == type);
}

export const getCategorieName = (t: any, row: IRequest) => {
  const cat = (id: number) => getRequestCategorieById(t, row.requestType, id)

  switch (row.requestType) {
    case 'bill':
      return row?.bill?.categorie != null ? cat(row.bill.categorie) : ''

    case 'capex':
      return row?.capex?.categorie != null ? cat(row.capex.categorie) : ''

    case 'locomotif':
      return row?.locomotif?.categorie != null ? cat(row.locomotif.categorie) : ''

    case 'telecom':
      return row?.telecom?.categorie != null ? cat(row.telecom.categorie) : ''

    case 'opex':
      return row?.opex?.categorie != null ? cat(row.opex.categorie) : ''

    case 'transport_logistique':
      return row?.transport_logistique?.categorie != null
        ? cat(row.transport_logistique.categorie)
        : ''

    case 'bank_renovation':
      return row?.bank_renovation?.categorie != null
        ? cat(row.bank_renovation.categorie)
        : ''

    case 'lease_payment':
      return row?.lease_payment?.categorie != null
        ? cat(row.lease_payment.categorie)
        : ''

    default:
      return ''
  }
}

export const requestType = (t: any, type: boolean = false) => [
  {
    id: 1,
    value: type ? 1 : RequestTypeEnum.transport_logistique,
    key: RequestTypeEnum.transport_logistique,
    label: t("request.type.1.label"),
    description: t("request.type.1.description"),
    documentType: [],
    categories: [
      { value: 1, label: t("request.type.1.categories.1") },
      { value: 2, label: t("request.type.1.categories.2") },
      { value: 3, label: t("request.type.1.categories.3") },
      { value: 4, label: t("request.type.1.categories.4") },
    ],
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
      { value: 0, label: t("request.type.2.categories.0") },
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
    categories: [
      { value: 1, label: t("request.type.3.categories.1") },
      { value: 2, label: t("request.type.3.categories.2") },
      { value: 3, label: t("request.type.3.categories.3") },
      { value: 4, label: t("request.type.3.categories.4") },
      { value: 5, label: t("request.type.3.categories.5") },
    ],
  },
  {
    id: 4,
    value: type ? 4 : RequestTypeEnum.locomotif,
    key: RequestTypeEnum.locomotif,
    label: t("request.type.4.label"),
    description: t("request.type.4.description"),
    documentType: [],
    categories: [
      { value: 1, label: t("request.type.4.categories.1") },
      { value: 2, label: t("request.type.4.categories.2") },
      { value: 3, label: t("request.type.4.categories.3") },
      { value: 0, label: t("request.type.4.categories.0") },
    ],
  },

  {
    id: 5,
    value: type ? 5 : RequestTypeEnum.capex,
    key: RequestTypeEnum.capex,
    label: t("request.type.5.label"),
    description: t("request.type.5.description"),
    documentType: [],
    categories: [
      {
        value: 1,
        label: t("request.type.5.categories.1"),
        type: capexType[1]
      },
      {
        value: 2,
        label: t("request.type.5.categories.2"),
        type: capexType[2]
      },
    ],
  },


  // {
  //   id: 7,
  //   value: type ? 7 : RequestTypeEnum.legal,
  //   key: RequestTypeEnum.legal,
  //   label: t("request.type.7.label"),
  //   description: t("request.type.7.description"),
  //   documentType: [],
  // },

  {
    id: 8,
    value: type ? 8 : RequestTypeEnum.lease_payment,
    key: RequestTypeEnum.lease_payment,
    label: t("request.type.8.label"),
    description: t("request.type.8.description"),
    documentType: [],
    categories: [
      { value: 1, label: t("request.type.8.categories.1") },
    ],
  },

  {
    id: 9,
    value: type ? 9 : RequestTypeEnum.bank_renovation,
    key: RequestTypeEnum.bank_renovation,
    label: t("request.type.9.label"),
    description: t("request.type.9.description"),
    documentType: [],
    categories: [
      { value: 1, label: t("request.type.9.categories.1") },
      { value: 2, label: t("request.type.9.categories.2") },
    ],
  },
  {
    id: 6,
    value: type ? 6 : RequestTypeEnum.bill,
    key: RequestTypeEnum.bill,
    label: t("request.type.6.label"),
    description: t("request.type.6.description"),
    documentType: [],
    categories: [
      {
        value: 1,
        label: t("request.type.6.categories.1"),
        type: billType[1]
      },
      {
        value: 2,
        label: t("request.type.6.categories.2"),
        type: billType[2]
      },
    ],
  },

];
