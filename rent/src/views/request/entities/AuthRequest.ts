/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// eslint-disable-next-line @typescript-eslint/no-unused-vars

export interface RequestApprovalStatus {
   value: string,
   label: string,
   description?: string,
}

export const requestStatus = (t: any) => [
   { value: 'regionalApproval', label: t('request.status.regionalApproval') },
   { value: 'accountantRegionalApproval', label: t('request.status.accountantRegionalApproval') },
   { value: 'managerGlobalApproval', label: t('request.status.managerGlobalApproval') },
];

export const requestStatusAll = (t: any) => [
   { value: 'cancelled', label: t('request.status.cancelled') },
   { value: 'preApproval', label: t('request.status.preApproval') },
   { value: 'regionalApproval', label: t('request.status.regionalApproval') },
   { value: 'accountantRegionalApproval', label: t('request.status.accountantRegionalApproval') },
   { value: 'managerGlobalApproval', label: t('request.status.managerGlobalApproval') },
   { value: 'rejected', label: t('request.status.rejected') },
   { value: 'completed', label: t('request.status.completed') },
   { value: 'approved', label: t('request.status.approved') },
];


export interface AuthRequest {
   id?:string ,
   region_id?: number,
   roles: string[],
   max_amount: number,
   status: string,
   reqType?: number [],
   canApprove: boolean,
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
  lease_payment = "lease_payment",
}

export interface RequestType {
   value: number,
   name?: string,
   key: RequestTypeEnum,
   label: string,
   description: string,
   categories?: {
      value: number,
      label: string,
   }
}



export const requestType = (t: any) => [
   {
      value: 1,
      key:"transport_logistique",
      label: t('request.type.1.label'),
      description: t('request.type.1.description'),
   },
   {
      value: 2,
      label: t('request.type.2.label'),
      key:'opex',
      description: t('request.type.2.description'),
      categories: [
         {
            value: 1,
            label: t('request.type.2.categories.1'),
         },
         {
            value: 2,
            label: t('request.type.2.categories.2'),
         },
         {
            value: 3,
            label: t('request.type.2.categories.3'),
         },
      ],
   },
   {
      value: 3,
      key: "telecom",
      label: t('request.type.3.label'),
      description: t('request.type.3.description'),
   },
   {
      value: 4,
      key: "locomotif",
      label: t('request.type.4.label'),
      description: t('request.type.4.description'),
   },
   {
      value: 5,
       key: "capex",
      label: t('request.type.5.label'),
      description: t('request.type.5.description'),
   },
   {
      value: 6,
       key: "bill",
      label: t('request.type.6.label'),
      description: t('request.type.6.description'),
   },
    {
      value: 7,
       key: "legal",
      label: t('request.type.7.label'),
      description: t('request.type.7.description'),
   },

    {
      value: 8,
      key: "lease_payment",
      label: t('request.type.8.label'),
      description: t('request.type.8.description'),
   },
   {
      value: 9,
      key: "bank_renovation",
      label: t('request.type.9.label'),
      description: t('request.type.9.description'),
   },
];
