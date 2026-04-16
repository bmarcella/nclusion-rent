import { TOKEN_TYPE, REQUEST_HEADER_AUTH_KEY } from '@/constants/api.constant'
import FirebaseAuth from '@/services/firebase/FirebaseAuth'
import type { InternalAxiosRequestConfig } from 'axios'

const AxiosRequestIntrceptorConfigCallback = async (
    config: InternalAxiosRequestConfig,
) => {
    const user = FirebaseAuth.currentUser
    if (user) {
        // getIdToken() returns the cached Firebase ID token and auto-refreshes
        // it if it is within ~5 minutes of its 1-hour expiry.
        const token = await user.getIdToken()
        config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${token}`
    }
    return config
}

export default AxiosRequestIntrceptorConfigCallback
