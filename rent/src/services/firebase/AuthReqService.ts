import { updateDoc } from 'firebase/firestore'
import { getAuthRequestRef } from '../Landlord'
import { AuthRequest } from '@/views/request/entities/AuthRequest'

export const updateAuthReqById = async (authId: string, data: unknown) => {
    try {
        const docRefs = getAuthRequestRef(authId)
        await updateDoc(docRefs, data as Partial<AuthRequest>)
        return true
    } catch (error) {
        console.error('Error updating document: ', error)
        throw new Error('Error updating document: ' + error)
        return false
    }
}
