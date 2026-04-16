/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, Form, Button, Radio, Card } from '@/components/ui'
import useTranslation from '@/utils/hooks/useTranslation'
import {
    footTrafficOptions,
    trafficGeneratorOptions,
    lotteryCompetitionV2Options,
    scoringMap,
    V2Scoring,
} from '@/views/Entity'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
    footTraffic: z.enum(footTrafficOptions),
    trafficGenerator: z.enum(trafficGeneratorOptions),
    lotteryCompetitionV2: z.enum(lotteryCompetitionV2Options),
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

function ScoringDemographics({ nextStep, defaultValues }: Props) {
    const [isSubmitting, setSubmitting] = useState(false)
    const { t } = useTranslation()

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            footTraffic: defaultValues?.footTraffic,
            trafficGenerator: defaultValues?.trafficGenerator,
            lotteryCompetitionV2: defaultValues?.lotteryCompetitionV2,
        },
    })

    const onSubmit = (data: FormValues) => {
        setSubmitting(true)
        nextStep(2, data)
        setTimeout(() => setSubmitting(false), 1000)
    }

    return (
        <div className="w-full">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6">
                    {/* Q1 — Foot Traffic */}
                    <Card bordered>
                        <div className="mb-2">
                            <h6 className="text-gray-900 dark:text-gray-100">
                                1. {t('scoring.footTraffic.label')}
                            </h6>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {t('scoring.footTraffic.hint')}
                            </p>
                        </div>
                        <FormItem
                            invalid={!!errors.footTraffic}
                            errorMessage={errors.footTraffic?.message}
                        >
                            <Controller
                                name="footTraffic"
                                control={control}
                                render={({ field }) => (
                                    <Radio.Group
                                        vertical
                                        value={field.value}
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                    >
                                        {footTrafficOptions.map((opt) => (
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

                    {/* Q2 — Traffic Generator */}
                    <Card bordered>
                        <div className="mb-2">
                            <h6 className="text-gray-900 dark:text-gray-100">
                                2. {t('scoring.trafficGenerator.label')}
                            </h6>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {t('scoring.trafficGenerator.hint')}
                            </p>
                        </div>
                        <FormItem
                            invalid={!!errors.trafficGenerator}
                            errorMessage={errors.trafficGenerator?.message}
                        >
                            <Controller
                                name="trafficGenerator"
                                control={control}
                                render={({ field }) => (
                                    <Radio.Group
                                        vertical
                                        value={field.value}
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                    >
                                        {trafficGeneratorOptions.map((opt) => (
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

                    {/* Q3 — Lottery Competition (data only, not scored) */}
                    <Card bordered>
                        <div className="mb-2">
                            <h6 className="text-gray-900 dark:text-gray-100">
                                3. {t('scoring.lotteryCompetitionV2.label')}
                            </h6>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {t('scoring.lotteryCompetitionV2.hint')}
                            </p>
                            <span className="inline-block mt-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                                {t('scoring.dataOnly')}
                            </span>
                        </div>
                        <FormItem
                            invalid={!!errors.lotteryCompetitionV2}
                            errorMessage={errors.lotteryCompetitionV2?.message}
                        >
                            <Controller
                                name="lotteryCompetitionV2"
                                control={control}
                                render={({ field }) => (
                                    <Radio.Group
                                        vertical
                                        value={field.value}
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                    >
                                        {lotteryCompetitionV2Options.map(
                                            (opt) => (
                                                <Radio key={opt} value={opt}>
                                                    {t(`scoring.${opt}`)}
                                                </Radio>
                                            ),
                                        )}
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

export default ScoringDemographics
