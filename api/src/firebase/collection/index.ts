export enum IRequestOtpStatus {
    PENDING = 'PENDING',
    USED = 'USED',
    EXPIRED = 'EXPIRED'
}



export interface IRequestOtp {
    id?: string;
    request_id: string;
    id_user: string;
    email: string;
    code: string;
    expires_at: Date;
    created_at: Date;
    status: IRequestOtpStatus;
}

export const COLLECTIONS = {
    LANDLORD: 'landlord',
    EXPENSE_REQUEST: 'ExpenseRequest',
    REQUEST_OTP: 'RequestOtp',
} as const;


interface PushNotificatioSubscriber {
          id_user: string;
}
