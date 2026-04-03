/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from 'react'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import Alert from '@/components/ui/Alert'
import RentDetails from './RentDetails'
import { getBankDoc } from '@/services/Landlord'
import { Timestamp, updateDoc } from 'firebase/firestore'
import InfoBank from './InfoBank'
import DemoDetails from './DemoDetails'
import SecurityDetails from './SecDetails'
import {
    Bank,
    BankFormVersion,
    getEmptyPartialBank,
    scoringMap,
    getPhysicalSecurityScore,
} from '@/views/Entity'
import RenovationDetails from './RenovDetails'
import UploadImgBank from './ImageBank'
import { useSessionUser } from '@/store/authStore'
import CommentsBank from './CommentsBank'
import EndBank from './EndBank'
import useTranslation from '@/utils/hooks/useTranslation'
import InfoBankV2 from './v2/InfoBankV2'
import ScoringDemographics from './v2/ScoringDemographics'
import ScoringSecurity from './v2/ScoringSecurity'
import ScoringConditionAccess from './v2/ScoringConditionAccess'
import ScoreSummary from './v2/ScoreSummary'
import { Button } from '@/components/ui'

interface BankFormProps {
    version: BankFormVersion
    onBack: () => void
}

const v1StepKeys = [
    'bank',
    'bail',
    'demographie',
    'securite',
    'renovation',
    'images',
    'commentaires',
    'termine',
]

const v2StepKeys = [
    'bank',
    'scoring_demographics',
    'scoring_security',
    'scoring_condition',
    'score_summary',
    'images',
    'commentaires',
    'termine',
]

const BankForm = ({ version, onBack }: BankFormProps) => {
    const isV2 = version === BankFormVersion.V2
    const stepKeys = isV2 ? v2StepKeys : v1StepKeys
    const maxStep = stepKeys.length - 1

    const [step, setStep] = useState(0)
    const [docRef, setDocRef] = useState<Bank>() as any
    const [message, setMessage] = useTimeOutMessage()
    const [alert, setAlert] = useState('success') as any
    const topRef = useRef<HTMLDivElement>(null)
    const { userId } = useSessionUser((state) => state.user)
    const [bankInfo, setBankInfo] = useState<Partial<Bank>>(
        getEmptyPartialBank(),
    )
    const { t } = useTranslation()

    // V2 scoring accumulator
    const [scores, setScores] = useState<Record<string, number>>({})

    if (!navigator.geolocation) {
        setMessage('Geolocation is not supported by your browser.')
        setAlert('danger')
        return
    }

    const scrollToTop = () => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const onRestart = () => {
        setStep(0)
        setDocRef(undefined)
        setBankInfo(getEmptyPartialBank())
        setScores({})
    }

    const onChange = (nextStep: number) => {
        if (nextStep < 0) {
            setStep(0)
        } else if (nextStep > maxStep) {
            setStep(maxStep)
        } else {
            setStep(nextStep)
        }
    }

    const onNext = () => onChange(step + 1)

    const update = async (data: any) => {
        return new Promise((resolve, reject) => {
            const docRefs = getBankDoc(docRef.id) as any
            updateDoc(docRefs, data)
                .then((d: any) => {
                    setMessage('Informations saved successfully.')
                    setAlert('success')
                    scrollToTop()
                    return resolve(d)
                })
                .catch((error) => {
                    console.error('Error updating document:', error)
                    setMessage(error.message)
                    setAlert('danger')
                    return reject(error)
                })
        })
    }

    const onError = (error: any) => {
        console.error('Error:', error)
        setMessage(error.message)
        setAlert('danger')
    }

    // ── V1 step handler (unchanged logic) ──
    const nextStepV1 = async (step: number, data: any) => {
        let payload: any = { updateBy: userId, uploadedAt: Timestamp.now() }
        scrollToTop()
        try {
            switch (step) {
                case 1:
                    await setDocRef(data)
                    break
                case 2:
                    payload = { rentDetails: data, ...payload }
                    break
                case 3:
                    payload = { demoDetails: data, ...payload }
                    break
                case 4:
                    payload = { securityDetails: data, ...payload }
                    break
                case 5:
                    payload = { renovationDetails: data, ...payload }
                    break
                case 6:
                    setMessage('Images saved successfully.')
                    setAlert('success')
                    break
                case 7:
                    setMessage('Comment saved successfully.')
                    setAlert('success')
                    break
                default:
                    console.warn(`Unhandled step: ${step}`)
                    return
            }

            if (Object.keys(payload).length > 0 && step != 1) {
                await update(payload)
                setDocRef((prev: any) => ({ ...prev, ...payload }))
            }
            onNext()
        } catch (error: any) {
            setMessage(error.message)
            setAlert('danger')
        }
    }

    // ── V2 step handler ──
    const nextStepV2 = async (step: number, data: any) => {
        let payload: any = { updateBy: userId, uploadedAt: Timestamp.now() }
        scrollToTop()
        try {
            switch (step) {
                case 1:
                    // InfoBankV2 creates the doc
                    await setDocRef(data)
                    break
                case 2: {
                    // Scoring: demographics (Q1-Q3)
                    const newScores = { ...scores }
                    if (data.footTraffic)
                        newScores.footTraffic =
                            scoringMap[data.footTraffic] ?? 0
                    if (data.trafficGenerator)
                        newScores.trafficGenerator =
                            scoringMap[data.trafficGenerator] ?? 0
                    setScores(newScores)
                    payload = {
                        scoring: {
                            ...docRef?.scoring,
                            footTraffic: data.footTraffic,
                            trafficGenerator: data.trafficGenerator,
                            lotteryCompetitionV2: data.lotteryCompetitionV2,
                        },
                        ...payload,
                    }
                    break
                }
                case 3: {
                    // Scoring: security (Q4-Q5)
                    const newScores = { ...scores }
                    newScores.physicalSecurity = getPhysicalSecurityScore(
                        data.physicalSecurity || [],
                    )
                    if (data.zoneStability)
                        newScores.zoneStability =
                            scoringMap[data.zoneStability] ?? 0
                    setScores(newScores)
                    payload = {
                        scoring: {
                            ...docRef?.scoring,
                            physicalSecurity: data.physicalSecurity,
                            zoneStability: data.zoneStability,
                        },
                        ...payload,
                    }
                    break
                }
                case 4: {
                    // Scoring: condition/access (Q6-Q8)
                    const newScores = { ...scores }
                    if (data.buildingCondition)
                        newScores.buildingCondition =
                            scoringMap[data.buildingCondition] ?? 0
                    if (data.physicalAccess)
                        newScores.physicalAccess =
                            scoringMap[data.physicalAccess] ?? 0
                    if (data.visibility)
                        newScores.visibility =
                            scoringMap[data.visibility] ?? 0
                    setScores(newScores)

                    const totalScore = Object.values(newScores).reduce(
                        (sum, v) => sum + v,
                        0,
                    )

                    payload = {
                        scoring: {
                            ...docRef?.scoring,
                            buildingCondition: data.buildingCondition,
                            physicalAccess: data.physicalAccess,
                            visibility: data.visibility,
                            scoutTotalScore: totalScore,
                        },
                        ...payload,
                    }
                    break
                }
                case 5:
                    // Score summary — just proceed, no new data
                    break
                case 6:
                    setMessage('Images saved successfully.')
                    setAlert('success')
                    break
                case 7:
                    setMessage('Comment saved successfully.')
                    setAlert('success')
                    break
                default:
                    console.warn(`Unhandled step: ${step}`)
                    return
            }

            if (Object.keys(payload).length > 2 && step !== 1) {
                await update(payload)
                setDocRef((prev: any) => ({ ...prev, ...payload }))
            }
            onNext()
        } catch (error: any) {
            setMessage(error.message)
            setAlert('danger')
        }
    }

    const nextStep = isV2 ? nextStepV2 : nextStepV1

    // ── V2 step indices ──
    // 0: InfoBankV2, 1: ScoringDemographics, 2: ScoringSecurity,
    // 3: ScoringConditionAccess, 4: ScoreSummary, 5: Images, 6: Comments, 7: End

    // ── V1 step indices ──
    // 0: InfoBank, 1: RentDetails, 2: DemoDetails, 3: SecurityDetails,
    // 4: RenovationDetails, 5: Images, 6: Comments, 7: End

    const imagesStep = isV2 ? 5 : 5
    const commentsStep = isV2 ? 6 : 6
    const endStep = isV2 ? 7 : 7

    return (
        <>
            <div ref={topRef} className="justify-center rounded p-4">
                {/* Steps Header */}
                <div className="grid grid-flow-row auto-rows-max gap-4 mb-2 pl-4 pb-2 pr-4">
                    <div className="flex items-center gap-4">
                        <Button
                            size="sm"
                            variant="plain"
                            onClick={() => {
                                if (step === 0) {
                                    onBack()
                                } else {
                                    onChange(step - 1)
                                }
                            }}
                        >
                            &larr; {step === 0 ? t('common.back') : t('common.previous')}
                        </Button>
                        <h5
                            className="w-full"
                            title={t(`steps.${stepKeys[step]}`)}
                        >
                            {t(`common.addBank`)} - {t(`steps.stepName`)}{' '}
                            {step + 1} - {t(`steps.${stepKeys[step]}`)}{' '}
                            {isV2 && (
                                <span className="text-xs font-normal bg-primary-subtle text-primary px-2 py-0.5 rounded ml-2">
                                    V2
                                </span>
                            )}
                        </h5>
                    </div>
                    {message && (
                        <Alert
                            showIcon
                            className="mt-6 w-full block"
                            type={alert}
                        >
                            <span className="break-all">{message}</span>
                        </Alert>
                    )}
                </div>

                {/* Main Content */}
                <div className="pr-4 pl-4">
                    {/* ── V1 Steps ── */}
                    {!isV2 && (
                        <>
                            {step === 0 && (
                                <InfoBank
                                    nextStep={nextStep}
                                    defaultValues={bankInfo}
                                    userId={userId || ''}
                                    onError={onError}
                                />
                            )}
                            {step === 1 && (
                                <RentDetails
                                    nextStep={nextStep}
                                    defaultValues={docRef?.rentDetails}
                                />
                            )}
                            {step === 2 && (
                                <DemoDetails
                                    nextStep={nextStep}
                                    defaultValues={docRef?.demoDetails}
                                />
                            )}
                            {step === 3 && (
                                <SecurityDetails
                                    nextStep={nextStep}
                                    defaultValues={docRef?.securityDetails}
                                />
                            )}
                            {step === 4 && (
                                <RenovationDetails
                                    nextStep={nextStep}
                                    defaultValues={docRef?.renovationDetails}
                                />
                            )}
                        </>
                    )}

                    {/* ── V2 Steps ── */}
                    {isV2 && (
                        <>
                            {step === 0 && (
                                <InfoBankV2
                                    nextStep={nextStep}
                                    defaultValues={bankInfo}
                                    userId={userId || ''}
                                    onError={onError}
                                />
                            )}
                            {step === 1 && (
                                <ScoringDemographics
                                    nextStep={nextStep}
                                    defaultValues={docRef?.scoring}
                                />
                            )}
                            {step === 2 && (
                                <ScoringSecurity
                                    nextStep={nextStep}
                                    defaultValues={docRef?.scoring}
                                />
                            )}
                            {step === 3 && (
                                <ScoringConditionAccess
                                    nextStep={nextStep}
                                    defaultValues={docRef?.scoring}
                                />
                            )}
                            {step === 4 && (
                                <ScoreSummary
                                    scores={scores}
                                    scoring={docRef?.scoring}
                                    nextStep={nextStep}
                                />
                            )}
                        </>
                    )}

                    {/* ── Shared Steps ── */}
                    {step === imagesStep && docRef?.id && (
                        <UploadImgBank
                            bankId={docRef.id}
                            nextStep={nextStep}
                            userId={userId || ''}
                        />
                    )}
                    {step === commentsStep && docRef?.id && (
                        <CommentsBank
                            bankId={docRef.id}
                            nextStep={nextStep}
                            userId={userId || ''}
                        />
                    )}
                    {step === endStep && docRef?.id && (
                        <EndBank onRestart={onRestart} />
                    )}
                </div>
            </div>
        </>
    )
}

export default BankForm