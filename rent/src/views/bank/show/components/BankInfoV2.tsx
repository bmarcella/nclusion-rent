import React from 'react'
import { Bank, getPhysicalSecurityScore, scoringMap } from '@/views/Entity'
import { useTranslation } from 'react-i18next'
import UserName from './UserName'
import { formatRelative } from 'date-fns/formatRelative'
import { fr } from 'date-fns/locale/fr'
import {
    FaUniversity,
    FaMapMarkerAlt,
    FaUser,
    FaCalendarAlt,
    FaMoneyBillWave,
    FaShieldAlt,
    FaExclamationCircle,
    FaInfoCircle,
    FaPhone,
    FaChartBar,
} from 'react-icons/fa'

interface BankInfoV2Props {
    bank: Bank
}

const SCORING_FACTORS: {
    key: keyof NonNullable<Bank['scoring']>
    label: string
    max: number
}[] = [
    { key: 'footTraffic', label: 'scoring.footTraffic.label', max: 3 },
    { key: 'trafficGenerator', label: 'scoring.trafficGenerator.label', max: 3 },
    { key: 'physicalSecurity', label: 'scoring.physicalSecurity.label', max: 3 },
    { key: 'zoneStability', label: 'scoring.zoneStability.label', max: 3 },
    { key: 'buildingCondition', label: 'scoring.buildingCondition.label', max: 3 },
    { key: 'physicalAccess', label: 'scoring.physicalAccess.label', max: 3 },
    { key: 'visibility', label: 'scoring.visibility.label', max: 3 },
]

const BankInfoV2: React.FC<BankInfoV2Props> = ({ bank }) => {
    const { t } = useTranslation()

    if (!bank) {
        return (
            <h4 className="text-2xl font-bold mb-4 text-red-600 flex items-center gap-2">
                <FaExclamationCircle />
                {t('bank_not_found') || 'Banque non trouvée'}
            </h4>
        )
    }

    const getText = (value?: string | number | null) =>
        value ?? t('non_mentionne')

    // Translates a key like `paymentMethods.check` against the `bank.*` namespace.
    const renderTranslated = (key?: string) =>
        key ? t(`bank.${key}`) : t('non_mentionne')

    const renderTranslatedArray = (array?: string[]) =>
        array?.length
            ? array.map((key) => t(`bank.${key}`)).join(', ')
            : t('non_mentionne')

    const scoring = bank.scoring
    const scoreFor = (key: string): number | null => {
        if (!scoring) return null
        const value = (scoring as any)[key]
        if (value == null) return null
        if (key === 'physicalSecurity' && Array.isArray(value)) {
            return getPhysicalSecurityScore(value)
        }
        if (typeof value === 'string') {
            return scoringMap[value] ?? 0
        }
        return null
    }

    const totalScore =
        scoring?.scoutTotalScore ??
        SCORING_FACTORS.reduce((sum, f) => sum + (scoreFor(f.key) ?? 0), 0)
    const maxTotal = 21
    const pct = Math.round((totalScore / maxTotal) * 100)

    const decisionTextColor =
        pct >= 66
            ? 'text-emerald-600'
            : pct >= 33
              ? 'text-amber-600'
              : 'text-red-600'
    const decisionBgColor =
        pct >= 66
            ? 'bg-emerald-50 border-emerald-200'
            : pct >= 33
              ? 'bg-amber-50 border-amber-200'
              : 'bg-red-50 border-red-200'
    const barColor = (score: number, max: number) => {
        const p = (score / max) * 100
        return p >= 66 ? 'bg-emerald-500' : p >= 33 ? 'bg-amber-500' : 'bg-red-500'
    }

    return (
        <div className="p-6 space-y-6 bg-white rounded shadow">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-3xl font-bold flex items-center gap-2 text-blue-700">
                    <FaUniversity />
                    {getText(bank.bankName)}
                </h2>
                <span className="text-xs font-semibold bg-primary-subtle text-primary px-2 py-1 rounded">
                    V2
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                <div className="space-y-2">
                    <p className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-500" />
                        <strong>{t('bank.city')}: </strong> {getText(bank.city)}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-gray-500" />
                        <strong>{t('bank.addresse')}: </strong>{' '}
                        {getText(bank.addresse)}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaUser className="text-gray-500" />
                        <strong>{t('bank.landlord')}: </strong>
                        <UserName userId={bank.landlord} keyName="id" />
                    </p>
                    {bank.ownerPhone && (
                        <p className="flex items-center gap-2">
                            <FaPhone className="text-gray-500" />
                            <strong>{t('bank.ownerPhone')}: </strong>
                            {bank.ownerPhone}
                        </p>
                    )}
                    <p>
                        <strong>{t('bank.reference')}: </strong>
                        {getText(bank.reference)}
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="flex items-center gap-2">
                        <FaUser className="text-gray-500" />
                        <strong>{t('bank.createdBy')}: </strong>
                        <UserName userId={bank.createdBy} />
                    </p>
                    <p className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-500" />
                        <strong>{t('bank.date')}: </strong>
                        {bank.createdAt
                            ? formatRelative(
                                  (bank.createdAt as any).toDate?.() ||
                                      bank.createdAt,
                                  new Date(),
                                  { locale: fr },
                              )
                            : t('non_mentionne')}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaMoneyBillWave className="text-green-600" />
                        <strong>{t('bank.rentCost')}: </strong> HTG{' '}
                        {new Intl.NumberFormat('fr-FR').format(
                            Number(bank.rentCost),
                        )}
                    </p>
                    <p className="flex items-center gap-2">
                        <FaShieldAlt className="text-indigo-600" />
                        <strong>{t('bank.urgency')}: </strong>{' '}
                        {bank.urgency ? t('yes') : t('no')}
                    </p>
                </div>
            </div>

            <hr className="my-4" />

            {/* V2 lease & payment block */}
            <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <FaInfoCircle /> {t('bank.rent')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p>
                        <strong>{t('bank.paymentMethods.label')}: </strong>
                        {renderTranslatedArray(bank.v2PaymentMethod)}
                    </p>
                    <p>
                        <strong>{t('bank.paymentStructures.label')}: </strong>
                        {renderTranslated(bank.v2PaymentStructure)}
                    </p>
                    <p>
                        <strong>{t('bank.locationTypes.label')}: </strong>
                        {renderTranslated(bank.v2LocationType)}
                    </p>
                    <p>
                        <strong>{t('bank.internetProviders.label')}: </strong>
                        {renderTranslatedArray(bank.v2InternetService)}
                    </p>
                    {bank.internetSpeed?.natcom && (
                        <p>
                            <strong>Natcom: </strong>
                            {bank.internetSpeed.natcom.download ?? '—'} Mbps ↓ / {bank.internetSpeed.natcom.upload ?? '—'} Mbps ↑
                        </p>
                    )}
                    {bank.internetSpeed?.digicel && (
                        <p>
                            <strong>Digicel: </strong>
                            {bank.internetSpeed.digicel.download ?? '—'} Mbps ↓ / {bank.internetSpeed.digicel.upload ?? '—'} Mbps ↑
                        </p>
                    )}
                    <p className="md:col-span-2">
                        <strong>{t('bank.verifyOwners.label')}: </strong>
                        {renderTranslatedArray(bank.v2VerifyOwner)}
                    </p>
                </div>
            </div>

            <hr className="my-4" />

            {/* V2 scoring block */}
            <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <FaChartBar /> {t('scoring.scoutTotalScore')}
                </h3>

                <div
                    className={`p-4 rounded-lg border ${decisionBgColor} mb-4`}
                >
                    <div className="text-center">
                        <h4
                            className={`text-3xl font-bold ${decisionTextColor}`}
                        >
                            {totalScore} / {maxTotal}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('scoring.scoutTotalScore')} ({pct}%)
                        </p>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {SCORING_FACTORS.map(({ key, label, max }) => {
                        const score = scoreFor(key)
                        const rawValue = (scoring as any)?.[key]
                        return (
                            <div key={key}>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-700">
                                        <strong>{t(label)}</strong>
                                        {typeof rawValue === 'string' && (
                                            <span className="ml-2 text-gray-500">
                                                — {t(`scoring.${rawValue}`)}
                                            </span>
                                        )}
                                        {Array.isArray(rawValue) &&
                                            rawValue.length > 0 && (
                                                <span className="ml-2 text-gray-500">
                                                    —{' '}
                                                    {rawValue
                                                        .map((v) =>
                                                            t(`scoring.${v}`),
                                                        )
                                                        .join(', ')}
                                                </span>
                                            )}
                                    </span>
                                    <span className="text-sm font-semibold w-12 text-right">
                                        {score ?? 0}/{max}
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${barColor(
                                            score ?? 0,
                                            max,
                                        )} rounded-full transition-all`}
                                        style={{
                                            width: `${
                                                ((score ?? 0) / max) * 100
                                            }%`,
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>

                {scoring?.lotteryCompetitionV2 && (
                    <div className="mt-4 p-3 rounded bg-gray-50 border border-gray-200">
                        <p className="text-sm">
                            <strong>
                                {t('scoring.lotteryCompetitionV2.label')}:{' '}
                            </strong>
                            <span className="inline-block text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded mr-2">
                                {t('scoring.dataOnly')}
                            </span>
                            {t(`scoring.${scoring.lotteryCompetitionV2}`)}
                        </p>
                    </div>
                )}
            </div>

            {bank.finalDecision && (
                <>
                    <hr className="my-4" />
                    <div>
                        <h3 className="text-xl font-semibold mb-2">
                            {t('bank.finalDecisionStatuses.label')}
                        </h3>
                        <p>
                            <strong>
                                {t('bank.finalDecisionStatuses.label')}:{' '}
                            </strong>
                            {bank.finalDecision.status
                                ? t(
                                      `bank.${bank.finalDecision.status}`,
                                  )
                                : t('non_mentionne')}
                        </p>
                        <p>
                            <strong>{t('bank.reason_why')}: </strong>
                            {getText(bank.finalDecision.reason_why)}
                        </p>
                    </div>
                </>
            )}
        </div>
    )
}

export default BankInfoV2
