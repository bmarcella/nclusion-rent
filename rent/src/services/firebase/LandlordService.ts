import { getDoc } from 'firebase/firestore'
import { getLandlordDoc } from '../Landlord'

export const getLandlordById = async (id: string) => {
    const ref = getLandlordDoc(id)
    const docSnap = await getDoc(ref)
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
    } else {
        return null
    }
}
