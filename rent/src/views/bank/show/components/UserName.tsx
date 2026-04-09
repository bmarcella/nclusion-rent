/* eslint-disable @typescript-eslint/no-explicit-any */
import { LandlordDoc } from '@/services/Landlord'
import useTranslation from '@/utils/hooks/useTranslation'
import { getDocs, query, where } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'

interface ImageGalleryProps {
    userId: string
    keyName?: string
    sub_str?: number
    // Optional pre-resolved landlord. When provided, no Firestore lookup
    // is performed — used by report components that pre-fetch in bulk to
    // avoid the N+1 query pattern.
    landlord?: any
}

const UserName: React.FC<ImageGalleryProps> = ({
    userId,
    keyName = 'id_user',
    sub_str = -1,
    landlord,
}) => {
    const [lord, setLord] = useState<any>(landlord)
    const { t } = useTranslation()
    const getLandlordByUserId = async (userId: string) => {
        const q = query(LandlordDoc, where(keyName, '==', userId))
        const querySnapshot = await getDocs(q)
        if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0]
            return { id: doc.id, ...doc.data() } // return first match
        } else {
            return null // No match found
        }
    }
    useEffect(() => {
        // Pre-resolved landlord wins — skip the per-row fetch entirely.
        if (landlord) {
            setLord(landlord)
            return
        }
        getLandlordByUserId(userId).then((lord: any) => {
            setLord(lord)
        })
    }, [userId, landlord])
    return (
        <>
            {lord && sub_str == -1 && (
                <i className=" font-semibold " title={t(lord.type_person)}>
                    {lord.fullName}
                </i>
            )}
            {lord && sub_str == 0 && (
                <i className=" font-semibold " title={t(lord.type_person)}>
                    {lord.fullName.charAt(sub_str)}
                </i>
            )}
        </>
    )
}

export default UserName
