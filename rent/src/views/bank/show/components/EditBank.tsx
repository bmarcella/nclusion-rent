/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert } from '@/components/ui'
import { getBankDoc } from '@/services/Landlord'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import {
    Bank,
    BankFormVersion,
    V2Scoring,
    scoringMap,
    getPhysicalSecurityScore,
} from '@/views/Entity'
import { Timestamp, updateDoc } from 'firebase/firestore'
import DemoDetails from '../../add/components/DemoDetails'
import RenovationDetails from '../../add/components/RenovDetails'
import RentDetails from '../../add/components/RentDetails'
import SecurityDetails from '../../add/components/SecDetails'
import { useState } from 'react'
import InfoBank from '../../add/components/InfoBank'
import InfoBankV2 from '../../add/components/v2/InfoBankV2'
import ScoringDemographics from '../../add/components/v2/ScoringDemographics'
import ScoringSecurity from '../../add/components/v2/ScoringSecurity'
import ScoringConditionAccess from '../../add/components/v2/ScoringConditionAccess'

interface Props {
    docRef: Bank
    id: string
    onChangeBank: (payload: any, step: number) => void
    userId: string
}

function EditBank({ docRef, onChangeBank, id, userId }: Props) {
    const [message, setMessage] = useTimeOutMessage()
    const [alert, setAlert] = useState('success') as any
    // Local mirror so multi-step V2 scoring saves can compose without
    // depending on the parent re-rendering between submits.
    const [localBank, setLocalBank] = useState<Bank>(docRef)
    const isV2 = docRef.version === BankFormVersion.V2

    const update = async (data: any) => {
        return new Promise((resolve, reject) => {
            const docRefs = getBankDoc(id)
            updateDoc(docRefs, data)
                .then((d: any) => {
                    setMessage('Informations saved successfully.')
                    setAlert('success')
                    return resolve(d)
                })
                .catch((error) => {
                    setMessage(error.message)
                    setAlert('danger')
                    return reject(error)
                })
        })
    }

    type StepData = Record<string, any>

    const computeTotalScore = (scoring: V2Scoring): number => {
        let total = 0
        const stringScored: (keyof V2Scoring)[] = [
            'footTraffic',
            'trafficGenerator',
            'zoneStability',
            'buildingCondition',
            'physicalAccess',
            'visibility',
        ]
        for (const key of stringScored) {
            const v = scoring[key] as string | undefined
            if (v) total += scoringMap[v] ?? 0
        }
        if (scoring.physicalSecurity?.length) {
            total += getPhysicalSecurityScore(scoring.physicalSecurity)
        }
        return total
    }

    const nextStepV1 = async (step: number, data: StepData) => {
        let payload: StepData = {
            updateBy: userId,
            uploadedAt: Timestamp.now(),
        }
        try {
            switch (step) {
                case 1:
                    payload = {
                        bankName: data.bankName,
                        id_region: data.id_region,
                        city: data.city,
                        addresse: data.addresse,
                        yearCount: data.yearCount,
                        date: data.date,
                        superficie: data.superficie,
                        nombre_chambre: data.nombre_chambre,
                        rentCost: data.rentCost,
                        final_rentCost: data.final_rentCost,
                        reference: data.reference,
                        landlord: data.landlord,
                        isrefSameAsLandlord: data.isrefSameAsLandlord,
                        urgency: data.urgency,
                    }
                    break
                case 2:
                    payload = { rentDetails: data }
                    break
                case 3:
                    payload = { demoDetails: data }
                    break
                case 4:
                    payload = { securityDetails: data }
                    break
                case 5:
                    payload = { renovationDetails: data }
                    break

                default:
                    console.warn(`Unhandled step: ${step}`)
                    return
            }

            if (Object.keys(payload).length > 0) {
                await update(payload)
                onChangeBank(payload as any, step)
            }
        } catch (error: any) {
            setMessage(error.message)
            setAlert('danger')
        }
    }

    const nextStepV2 = async (step: number, data: StepData) => {
        try {
            let payload: StepData = {
                updateBy: userId,
                uploadedAt: Timestamp.now(),
            }
            let nextLocal: Bank = localBank

            switch (step) {
                case 1: {
                    // InfoBankV2 — top-level + V2 lease/payment fields
                    payload = {
                        ...payload,
                        bankName: data.bankName,
                        id_region: data.id_region,
                        city: data.city,
                        addresse: data.addresse,
                        yearCount: data.yearCount,
                        date: data.date,
                        rentCost: data.rentCost,
                        final_rentCost: data.rentCost,
                        reference: data.reference,
                        landlord: data.landlord,
                        ownerPhone: data.ownerPhone || '',
                        v2PaymentMethod: data.v2PaymentMethod || [],
                        v2PaymentStructure: data.v2PaymentStructure,
                        v2LocationType: data.v2LocationType,
                        v2InternetService: data.v2InternetService || [],
                        internetSpeed: data.internetSpeed || {},
                        v2VerifyOwner: data.v2VerifyOwner || [],
                        superficie: data.superficie,
                        nombre_chambre: data.nombre_chambre,
                        v2RoofType: data.v2RoofType,
                    }
                    nextLocal = { ...localBank, ...payload }
                    break
                }
                case 2: {
                    // ScoringDemographics — Q1, Q2, Q3
                    const newScoring: V2Scoring = {
                        ...(localBank.scoring || {}),
                        footTraffic: data.footTraffic,
                        trafficGenerator: data.trafficGenerator,
                        lotteryCompetitionV2: data.lotteryCompetitionV2,
                    }
                    newScoring.scoutTotalScore = computeTotalScore(newScoring)
                    payload = { ...payload, scoring: newScoring }
                    nextLocal = { ...localBank, scoring: newScoring }
                    break
                }
                case 3: {
                    // ScoringSecurity — Q4, Q5
                    const newScoring: V2Scoring = {
                        ...(localBank.scoring || {}),
                        physicalSecurity: data.physicalSecurity || [],
                        zoneStability: data.zoneStability,
                    }
                    newScoring.scoutTotalScore = computeTotalScore(newScoring)
                    payload = { ...payload, scoring: newScoring }
                    nextLocal = { ...localBank, scoring: newScoring }
                    break
                }
                case 4: {
                    // ScoringConditionAccess — Q6, Q7, Q8
                    const newScoring: V2Scoring = {
                        ...(localBank.scoring || {}),
                        buildingCondition: data.buildingCondition,
                        physicalAccess: data.physicalAccess,
                        visibility: data.visibility,
                    }
                    newScoring.scoutTotalScore = computeTotalScore(newScoring)
                    payload = { ...payload, scoring: newScoring }
                    nextLocal = { ...localBank, scoring: newScoring }
                    break
                }
                default:
                    console.warn(`Unhandled V2 step: ${step}`)
                    return
            }

            await update(payload)
            setLocalBank(nextLocal)
            onChangeBank(payload as any, step)
        } catch (error: any) {
            setMessage(error.message)
            setAlert('danger')
        }
    }

    const nextStep = isV2 ? nextStepV2 : nextStepV1

    const onError = (error: any) => {
        setMessage(error.message)
        setAlert('danger')
    }

    return (
        <>
            {message && (
                <Alert showIcon className="mb-4 mt-4" type={alert}>
                    <span className="break-all">{message}</span>
                </Alert>
            )}

            <div className="w-full">
                {isV2 ? (
                    <>
                        <InfoBankV2
                            nextStep={nextStep}
                            defaultValues={localBank}
                            isEdit={true}
                            userId={userId}
                            onError={onError}
                        />
                        <hr className="mb-4 mt-4" />
                        <ScoringDemographics
                            nextStep={nextStep}
                            defaultValues={localBank.scoring}
                        />
                        <hr className="mb-4 mt-4" />
                        <ScoringSecurity
                            nextStep={nextStep}
                            defaultValues={localBank.scoring}
                        />
                        <hr className="mb-4 mt-4" />
                        <ScoringConditionAccess
                            nextStep={nextStep}
                            defaultValues={localBank.scoring}
                        />
                        <hr className="mb-4 mt-4" />
                    </>
                ) : (
                    <>
                        <InfoBank
                            nextStep={nextStep}
                            defaultValues={docRef}
                            isEdit={true}
                            userId={userId}
                            onError={onError}
                        />
                        <hr className="mb-4 mt-4"></hr>
                        <RentDetails
                            nextStep={nextStep}
                            defaultValues={docRef.rentDetails}
                            isEdit={true}
                        />
                        <hr className="mb-4 mt-4"></hr>
                        <DemoDetails
                            nextStep={nextStep}
                            defaultValues={docRef.demoDetails}
                            isEdit={true}
                        />
                        <hr className="mb-4 mt-4"></hr>
                        <SecurityDetails
                            nextStep={nextStep}
                            defaultValues={docRef.securityDetails}
                            isEdit={true}
                        />
                        <hr className="mb-4 mt-4"></hr>
                        <RenovationDetails
                            nextStep={nextStep}
                            defaultValues={docRef.renovationDetails}
                            isEdit={true}
                        />
                        <hr className="mb-4 mt-4"></hr>
                    </>
                )}
            </div>
        </>
    )
}

export default EditBank
