/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, Form, Button, Radio, Card } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import {
    buildingConditionOptions,
    physicalAccessOptions,
    visibilityOptions,
    scoringMap,
    V2Scoring,
} from '@/views/Entity'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
    buildingCondition: z.enum(buildingConditionOptions),
    physicalAccess: z.enum(physicalAccessOptions),
    visibility: z.enum(visibilityOptions),
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

function ScoringConditionAccess({ nextStep, defaultValues }: Props) {
    const [isSubmitting, setSubmitting] = useState(false)
    const { t } = useTranslation()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            buildingCondition: defaultValues?.buildingCondition,
            physicalAccess: defaultValues?.physicalAccess,
            visibility: defaultValues?.visibility,
        },
    })

    const onSubmit = (data: FormValues) => {
        setSubmitting(true)
        nextStep(4, data)
        setTimeout(() => setSubmitting(false), 1000)
    }

    return (
        <div className="w-full">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6">
                    {/* Q6 — Building Condition */}
                    <Card bordered>
                        <div className="mb-2">
                            <h6 className="text-gray-900 dark:text-gray-100">
                                6. {t('scoring.buildingCondition.label')}
                            </h6>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {t('scoring.buildingCondition.hint')}
                            </p>
                        </div>
                        <FormItem
                            invalid={!!errors.buildingCondition}
                            errorMessage={errors.buildingCondition?.message}
                        >
                            <Controller
                                name="buildingCondition"
                                control={control}
                                render={({ field }) => (
                                    <Radio.Group
                                        vertical
                                        value={field.value}
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                    >
                                        {buildingConditionOptions.map(
                                            (opt) => (
                                                <Radio key={opt} value={opt}>
                                                    {t(`scoring.${opt}`)}
                                                    <ScoreTag value={opt} />
                                                </Radio>
                                            ),
                                        )}
                                    </Radio.Group>
                                )}
                            />
                        </FormItem>
                    </Card>

                    {/* Q7 — Physical Access */}
                    <Card bordered>
                        <div className="mb-2">
                            <h6 className="text-gray-900 dark:text-gray-100">
                                7. {t('scoring.physicalAccess.label')}
                            </h6>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {t('scoring.physicalAccess.hint')}
                            </p>
                        </div>
                        <FormItem
                            invalid={!!errors.physicalAccess}
                            errorMessage={errors.physicalAccess?.message}
                        >
                            <Controller
                                name="physicalAccess"
                                control={control}
                                render={({ field }) => (
                                    <Radio.Group
                                        vertical
                                        value={field.value}
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                    >
                                        {physicalAccessOptions.map((opt) => (
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

                    {/* Q8 — Visibility */}
                    <Card bordered>
                        <div className="mb-2">
                            <h6 className="text-gray-900 dark:text-gray-100">
                                8. {t('scoring.visibility.label')}
                            </h6>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {t('scoring.visibility.hint')}
                            </p>
                        </div>
                        <FormItem
                            invalid={!!errors.visibility}
                            errorMessage={errors.visibility?.message}
                        >
                            <Controller
                                name="visibility"
                                control={control}
                                render={({ field }) => (
                                    <Radio.Group
                                        vertical
                                        value={field.value}
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                    >
                                        {visibilityOptions.map((opt) => (
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

export default ScoringConditionAccess
