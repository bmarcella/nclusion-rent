/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, Form, Button, Radio, Checkbox, Card } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import {
    physicalSecurityItems,
    zoneStabilityOptions,
    scoringMap,
    getPhysicalSecurityScore,
    V2Scoring,
    PhysicalSecurityItem,
} from '@/views/Entity'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
    physicalSecurity: z.array(z.enum(physicalSecurityItems)),
    zoneStability: z.enum(zoneStabilityOptions),
})

type FormValues = z.infer<typeof schema>

interface Props {
    nextStep: (step: number, data: any) => void
    defaultValues?: Partial<V2Scoring>
}

function ScoreTag({ value }: { value: string }) {
    const pts = scoringMap[value]
    if (pts === undefined) return null
    return (
        <span className="ml-2 text-xs font-semibold bg-primary-subtle text-primary px-1.5 py-0.5 rounded">
            {pts} pt{pts !== 1 ? 's' : ''}
        </span>
    )
}

function SecurityScoreBadge({ items }: { items: PhysicalSecurityItem[] }) {
    const score = getPhysicalSecurityScore(items)
    return (
        <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-600 rounded inline-block">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Score: {score}/3
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({items.length} feature{items.length !== 1 ? 's' : ''})
            </span>
        </div>
    )
}

function ScoringSecurity({ nextStep, defaultValues }: Props) {
    const [isSubmitting, setSubmitting] = useState(false)
    const { t } = useTranslation()

    const {
        control,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            physicalSecurity: defaultValues?.physicalSecurity || [],
            zoneStability: defaultValues?.zoneStability,
        },
    })

    const selectedSecurity = watch('physicalSecurity') || []

    const onSubmit = (data: FormValues) => {
        setSubmitting(true)
        nextStep(3, data)
        setTimeout(() => setSubmitting(false), 1000)
    }

    return (
        <div className="w-full">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6">
                    {/* Q4 — Physical Security (checkbox, score by count) */}
                    <Card bordered>
                        <div className="mb-2">
                            <h6 className="text-gray-900 dark:text-gray-100">
                                4. {t('scoring.physicalSecurity.label')}
                            </h6>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {t('scoring.physicalSecurity.hint')}
                            </p>
                        </div>
                        <FormItem
                            invalid={!!errors.physicalSecurity}
                            errorMessage={errors.physicalSecurity?.message}
                        >
                            <Controller
                                name="physicalSecurity"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox.Group
                                        vertical
                                        value={field.value ?? []}
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                    >
                                        {physicalSecurityItems.map((opt) => (
                                            <Checkbox key={opt} value={opt}>
                                                {t(`scoring.${opt}`)}
                                            </Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                )}
                            />
                        </FormItem>
                        <SecurityScoreBadge items={selectedSecurity} />
                    </Card>

                    {/* Q5 — Zone Stability */}
                    <Card bordered>
                        <div className="mb-2">
                            <h6 className="text-gray-900 dark:text-gray-100">
                                5. {t('scoring.zoneStability.label')}
                            </h6>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {t('scoring.zoneStability.hint')}
                            </p>
                        </div>
                        <FormItem
                            invalid={!!errors.zoneStability}
                            errorMessage={errors.zoneStability?.message}
                        >
                            <Controller
                                name="zoneStability"
                                control={control}
                                render={({ field }) => (
                                    <Radio.Group
                                        vertical
                                        value={field.value}
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                    >
                                        {zoneStabilityOptions.map((opt) => (
                                            <Radio key={opt} value={opt}>
                                                {t(`scoring.${opt}`)}
                                                <ScoreTag value={opt} />
                                            </Radio>
                                        ))}
                                    </Radio.Group>
                                )}
                            />
                        </FormItem>
                    </Card>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            variant="solid"
                            loading={isSubmitting}
                        >
                            {t('common.next')}
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
    )
}

export default ScoringSecurity
