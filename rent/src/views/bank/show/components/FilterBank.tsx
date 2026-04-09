/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DatePicker } from '@/components/ui'
import Checkbox from '@/components/ui/Checkbox/Checkbox'
import { Select } from '@/components/ui/Select'
import { manageAuth } from '@/constants/roles.constant'
import { Landlord } from '@/services/Landlord'
import { Proprio } from '@/views/Entity'
import { RegionType } from '@/views/Entity/Regions'
import {
    query,
    where,
    getDocs,
    orderBy,
} from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'

// Module-level cache so the agent list is fetched at most once per page
// session, even if the filter component re-mounts.
let agentCache: Proprio[] | null = null
let agentInflight: Promise<Proprio[]> | null = null

const fetchAllAgents = async (): Promise<Proprio[]> => {
    if (agentCache) return agentCache
    if (agentInflight) return agentInflight

    agentInflight = (async () => {
        const q = query(
            Landlord,
            orderBy('fullName'),
            where('type_person', '==', 'agent_immobilier'),
        )
        const snapshot = await getDocs(q)
        const landlords: Proprio[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Proprio[]
        agentCache = landlords
        agentInflight = null
        return landlords
    })()
    return agentInflight
}

interface OptionType {
    label: string
    value: string | number
}

export const convertToSelectOptionsRegion = (items: RegionType[]) => {
    return items.map((obj) => ({
        value: obj.value,
        label: obj.name,
    }))
}

export const convertToSelectOptionsProprio = (items: Proprio[]) => {
    return items.map((obj) => ({
        value: obj.id_user,
        label: obj.fullName,
    }))
}

interface Props {
    authority: string[]
    proprio: any
    t: (key: string) => string
    onChangeRegion: (id: number) => void
    onChangeAgent?: (d: string) => void
    onChangeDate?: (start: Date, end?: Date) => void
    onChangeMap?: (value: boolean) => void
    isMap?: boolean
}

function FilterBank({
    authority,
    proprio,
    t,
    onChangeRegion,
    onChangeAgent,
    onChangeDate,
    isMap,
    onChangeMap = (value: any) => {},
}: Props) {
    const [regions, setRegions] = useState<OptionType[]>([])
    const [allAgents, setAllAgents] = useState<Proprio[]>([])

    const [selectedRegions, setSelectedRegions] = useState<number>()
    const [selectedAgents, setSelectedAgents] = useState<string>()
    const [start, setStart] = useState<Date>()
    const [end, setEnd] = useState<Date>()

    useEffect(() => {
        if (!authority?.length) return
        const fetchData = async () => {
            const { regions } = await manageAuth(authority[0], proprio, t)
            const regs = convertToSelectOptionsRegion(regions)
            regs.unshift({ label: 'All', value: 0 })
            setRegions(regs)
            if (onChangeAgent) {
                const list = await fetchAllAgents()
                setAllAgents(list)
            }
        }
        fetchData()
    }, [authority, proprio, t])

    useEffect(() => {
        onChangeDate?.(start!, end)
    }, [start, end])

    // Was previously triggering on `setSelectedAgents` (a stable setter),
    // so the parent never received agent updates. Track the value instead.
    useEffect(() => {
        if (selectedAgents && onChangeAgent) onChangeAgent(selectedAgents)
    }, [selectedAgents])

    // Filter the cached agent list client-side instead of re-querying
    // Firestore on every region change.
    const agents = useMemo<OptionType[]>(() => {
        if (!onChangeAgent) return []
        const filtered =
            !selectedRegions || selectedRegions === 0
                ? allAgents
                : allAgents.filter((a: any) =>
                      Array.isArray(a.regions)
                          ? a.regions.includes(selectedRegions)
                          : false,
                  )
        const opts = convertToSelectOptionsProprio(filtered)
        opts.unshift({ label: 'All', value: undefined as any })
        return opts
    }, [allAgents, selectedRegions, onChangeAgent])

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded">
            {isMap && (
                <Checkbox
                    onChange={(options: any) => {
                        onChangeMap(options)
                    }}
                >
                    Show on Map
                </Checkbox>
            )}
            {regions.length > 1 && (
                <Select
                    placeholder="Region"
                    options={regions}
                    onChange={(options: OptionType) => {
                        if (!options) {
                            setSelectedRegions(0)
                            onChangeRegion(0)
                            return
                        }
                        if (onChangeAgent) onChangeAgent(undefined)
                        setSelectedRegions(options.value as number)
                        onChangeRegion(options.value as number)
                    }}
                />
            )}
            {agents.length > 0 && onChangeAgent && (
                <Select
                    placeholder="Agent"
                    options={agents}
                    onChange={(options: OptionType) => {
                        if (!options || options.value == undefined) {
                            setSelectedAgents(undefined)
                            onChangeAgent(undefined)
                            return
                        }
                        setSelectedAgents(options.value)
                        onChangeAgent(options.value.toString())
                    }}
                />
            )}

            {onChangeDate && (
                <>
                    <DatePicker
                        placeholder="Date debut"
                        onChange={(date) => {
                            setStart(undefined)
                            if (!date) {
                                setStart(undefined)
                                return
                            }
                            setStart(new Date(date))
                        }}
                    />

                    <DatePicker
                        placeholder="Date fin"
                        onChange={(date) => {
                            setEnd(undefined)
                            if (!date) {
                                setEnd(undefined)
                                return
                            }
                            setEnd(new Date(date))
                        }}
                    />
                </>
            )}
        </div>
    )
}

export default FilterBank
