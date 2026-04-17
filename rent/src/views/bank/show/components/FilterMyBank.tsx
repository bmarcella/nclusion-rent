/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, DatePicker, Input } from '@/components/ui'
import { Select } from '@/components/ui/Select'
import { bankSteps, Proprio } from '@/views/Entity'
import { RegionType } from '@/views/Entity/Regions'
import { useEffect, useRef, useState } from 'react'

interface OptionType {
    label: string
    value: string | number
}

interface Props {
    onChangeDate?: (start?: Date, end?: Date) => void
    onChangeStep: (d: string) => void
    inBankSteps?: string[]
    t: (key: string) => string
    all: boolean

    onChangeName?: (d: string) => void

    initialStart?: Date
    initialEnd?: Date
    initialName?: string
    initialStep?: string
    onReset?: () => void
}

export const convertToSelectOptionsRegion = (items: RegionType[]) => {
    return items.map((obj) => ({
        value: obj.value,
        label: obj.name,
    }))
}

export const convertToSelectOptionsProprio = (items: Proprio[]) => {
    return items.map((obj) => ({
        value: obj.id,
        label: obj.fullName,
    }))
}

export const convertToSelectOptionsSteps = (items: string[], t: any) => {
    const a = items.map((obj) => ({
        value: obj,
        label: t('bank.' + obj),
    }))
    a.unshift({ label: 'Tout', value: undefined })
    return a
}

function FilterMyBank({
    onChangeDate,
    onChangeStep,
    t,
    all,
    inBankSteps,
    onChangeName,
    initialStart,
    initialEnd,
    initialName,
    initialStep,
    onReset,
}: Props) {
    const bs = inBankSteps ? inBankSteps : bankSteps
    const [start, setStart] = useState<Date | undefined>(initialStart)
    const [end, setEnd] = useState<Date | undefined>(initialEnd)
    const [name, setName] = useState<string>(initialName ?? '')
    const [stepValue, setStepValue] = useState<string | undefined>(initialStep)
    const [steps] = useState<OptionType[]>(convertToSelectOptionsSteps(bs, t))

    // Sync when parent-provided initial values change (e.g. after reset).
    useEffect(() => {
        setStart(initialStart)
    }, [initialStart?.getTime()])
    useEffect(() => {
        setEnd(initialEnd)
    }, [initialEnd?.getTime()])
    useEffect(() => {
        setName(initialName ?? '')
    }, [initialName])
    useEffect(() => {
        setStepValue(initialStep)
    }, [initialStep])

    // Skip first run so we don't clobber persisted dates with undefined on mount.
    const dateInit = useRef(false)
    useEffect(() => {
        if (!dateInit.current) {
            dateInit.current = true
            return
        }
        if (onChangeDate) onChangeDate(start, end)
    }, [start, end])

    const stepOptionValue =
        steps.find((s) => s.value === stepValue) || null

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded">
            {steps.length > 1 && onChangeStep && (
                <Select
                    placeholder="Etape"
                    options={steps}
                    value={stepOptionValue}
                    onChange={(options: OptionType) => {
                        if (!options) {
                            setStepValue(undefined)
                            onChangeStep(undefined as any)
                            return
                        }
                        setStepValue(options.value as string)
                        onChangeStep(options.value as string)
                    }}
                />
            )}
            {onChangeName && (
                <Input
                    type="text"
                    placeholder={t('bank.search')}
                    className="border p-2 rounded w-full"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                        onChangeName(e.target.value)
                    }}
                />
            )}
            {!all && (
                <>
                    <DatePicker
                        placeholder="Date debut"
                        value={start ?? null}
                        onChange={(date) => {
                            setStart(date ? new Date(date) : undefined)
                        }}
                    />

                    <DatePicker
                        placeholder="Date fin"
                        value={end ?? null}
                        onChange={(date) => {
                            setEnd(date ? new Date(date) : undefined)
                        }}
                    />
                </>
            )}
            {onReset && (
                <div>
                    <Button size="sm" variant="plain" onClick={onReset}>
                        {t('common.reset') || 'Reset'}
                    </Button>
                </div>
            )}
        </div>
    )
}

export default FilterMyBank
