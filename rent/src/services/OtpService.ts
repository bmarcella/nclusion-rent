import endpointConfig from '@/configs/endpoint.config'
import ApiService from './ApiService'

export interface CreateOtpResponse {
    error: boolean
    message: string
    otpId?: string
    expiresAt?: string
}

export interface VerifyOtpResponse {
    error: boolean
    message: string
}

export const apiCreateOtpForRequest = (requestId: string) =>
    ApiService.fetchDataWithAxios<CreateOtpResponse>({
        url: endpointConfig.otpCreate,
        method: 'post',
        data: { request_id: requestId },
    })

export const apiVerifyOtpForRequest = (requestId: string, code: string) =>
    ApiService.fetchDataWithAxios<VerifyOtpResponse>({
        url: endpointConfig.otpVerify,
        method: 'post',
        data: { request_id: requestId, code },
    })
