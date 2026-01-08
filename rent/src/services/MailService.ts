import endpointConfig from "@/configs/endpoint.config";
import ApiService from "./ApiService";

export async function ApiSendMail<T>(data: any) {
    return ApiService.fetchDataWithAxios<T>({
        url: endpointConfig.mail,
        method: 'post',
        data,
    })
}