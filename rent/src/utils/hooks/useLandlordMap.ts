/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react'
import { getDocs, query, where } from 'firebase/firestore'
import { LandlordDoc } from '@/services/Landlord'

// Module-level cache shared across components and renders. Reports
// frequently re-mount on filter changes; caching here means the agent
// list is fetched at most once per page session.
let cachedMap: Map<string, any> | null = null
let inflight: Promise<Map<string, any>> | null = null

const fetchAgentMap = async (): Promise<Map<string, any>> => {
    if (cachedMap) return cachedMap
    if (inflight) return inflight

    inflight = (async () => {
        const q = query(
            LandlordDoc,
            where('type_person', '==', 'agent_immobilier'),
        )
        const snapshot = await getDocs(q)
        const map = new Map<string, any>()
        snapshot.forEach((doc) => {
            const data = doc.data() as any
            // Index by both id_user and doc id so callers can look up by
            // whichever identifier the report row exposes.
            if (data.id_user) map.set(data.id_user, { id: doc.id, ...data })
            map.set(doc.id, { id: doc.id, ...data })
        })
        cachedMap = map
        inflight = null
        return map
    })()

    return inflight
}

/**
 * Returns a memoized map of agent userId -> landlord doc, fetched once
 * and shared across components. Use this in report views to feed
 * pre-resolved landlord data into <UserName /> and avoid the per-row
 * Firestore lookup.
 */
export const useLandlordMap = (): Map<string, any> | null => {
    const [map, setMap] = useState<Map<string, any> | null>(cachedMap)
    const mounted = useRef(true)

    useEffect(() => {
        mounted.current = true
        if (cachedMap) {
            setMap(cachedMap)
            return
        }
        fetchAgentMap().then((m) => {
            if (mounted.current) setMap(m)
        })
        return () => {
            mounted.current = false
        }
    }, [])

    return map
}
