/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// eslint-disable-next-line @typescript-eslint/no-unused-vars

export interface RequestApprovalStatus {
   value: string,
   label: string,
   description?: string,
}
// Completed  // Cancel // Pre-approval // Regional Approval // Accountant Approval (regional) // Manager Approval (Global) // Reject Approval // 
export const requestStatus = (t: any) => [
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
   create_at: Date
}

export interface RequestType {
   value: number,
   name?: string,
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
      label: t('request.type.1.label'),
      description: t('request.type.1.description'),
   },
   {
      value: 2,
      label: t('request.type.2.label'),
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
      label: t('request.type.3.label'),
      description: t('request.type.3.description'),
   },
   {
      value: 4,
      label: t('request.type.4.label'),
      description: t('request.type.4.description'),
   },
   {
      value: 5,
      label: t('request.type.5.label'),
      description: t('request.type.5.description'),
   },
   {
      value: 6,
      label: t('request.type.6.label'),
      description: t('request.type.6.description'),
   },
    {
      value: 7,
      label: t('request.type.7.legal'),
      description: t('request.type.7.description'),
   },
];
