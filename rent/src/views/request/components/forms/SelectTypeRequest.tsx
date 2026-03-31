/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { requestType, RequestTypeEnum } from '../../entities/AuthRequest'
import Steps from '@/components/ui/Steps'
import useTranslation from '@/utils/hooks/useTranslation'
import {
    HiOutlineTruck,
    HiOutlineCube,
    HiOutlineWifi,
    HiOutlineKey,
    HiOutlineShoppingCart,
    HiOutlineHome,
    HiOutlineWrench,
    HiOutlineDocumentText,
    HiOutlineSparkles,
    HiOutlineScale,
} from 'react-icons/hi2'

const TYPE_CONFIG: Record<
    string,
    { icon: any; gradient: string; iconBg: string }
> = {
    [RequestTypeEnum.transport_logistique]: {
        icon: HiOutlineTruck,
        gradient: 'from-blue-500 to-blue-600',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
    },
    [RequestTypeEnum.opex]: {
        icon: HiOutlineCube,
        gradient: 'from-emerald-500 to-emerald-600',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
    },
    [RequestTypeEnum.telecom]: {
        icon: HiOutlineWifi,
        gradient: 'from-violet-500 to-violet-600',
        iconBg: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600',
    },
    [RequestTypeEnum.locomotif]: {
        icon: HiOutlineKey,
        gradient: 'from-orange-500 to-orange-600',
        iconBg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
    },
    [RequestTypeEnum.capex]: {
        icon: HiOutlineShoppingCart,
        gradient: 'from-pink-500 to-pink-600',
        iconBg: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600',
    },
    [RequestTypeEnum.lease_payment]: {
        icon: HiOutlineHome,
        gradient: 'from-cyan-500 to-cyan-600',
        iconBg: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600',
    },
    [RequestTypeEnum.bank_renovation]: {
        icon: HiOutlineWrench,
        gradient: 'from-amber-500 to-amber-600',
        iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
    },
    [RequestTypeEnum.bill]: {
        icon: HiOutlineDocumentText,
        gradient: 'from-indigo-500 to-indigo-600',
        iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
    },
    [RequestTypeEnum.divers]: {
        icon: HiOutlineSparkles,
        gradient: 'from-teal-500 to-teal-600',
        iconBg: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600',
    },
    [RequestTypeEnum.legal]: {
        icon: HiOutlineScale,
        gradient: 'from-red-500 to-red-600',
        iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    },
}

const DEFAULT_CONFIG = {
    icon: HiOutlineDocumentText,
    gradient: 'from-gray-500 to-gray-600',
    iconBg: 'bg-gray-100 dark:bg-gray-900/30 text-gray-600',
}

interface Props {
    GetSelected: (tq: any) => void
}

function SelectTypeRequest({ GetSelected }: Props) {
    const { t } = useTranslation()
    const [typeReq] = useState(requestType(t))
    const [hovered, setHovered] = useState<string | null>(null)

    return (
        <div className="space-y-6">
            <Steps current={0}>
                <Steps.Item
                    title={
                        t('request.step1') || 'Selectionner le type de requête'
                    }
                />
                <Steps.Item title={t('request.step2') || 'Ajouter requête'} />
            </Steps>

            <div className="text-center mb-2">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Quel type de requête souhaitez-vous créer ?
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                    Sélectionnez une catégorie pour commencer
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {typeReq.map((tq: any) => {
                    const config = TYPE_CONFIG[tq.key] || DEFAULT_CONFIG
                    const Icon = config.icon
                    const isHovered = hovered === tq.key
                    return (
                        <div
                            key={tq.value}
                            className={`
                                group relative rounded-2xl border-2 cursor-pointer
                                transition-all duration-200 ease-in-out overflow-hidden
                                ${
                                    isHovered
                                        ? 'border-transparent shadow-lg scale-[1.02]'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-transparent hover:shadow-lg hover:scale-[1.02]'
                                }
                            `}
                            onMouseEnter={() => setHovered(tq.key)}
                            onMouseLeave={() => setHovered(null)}
                            onClick={() => GetSelected(tq)}
                        >
                            {/* Gradient top bar */}
                            <div
                                className={`h-1.5 bg-gradient-to-r ${config.gradient} transition-all duration-200 ${isHovered ? 'h-2' : ''}`}
                            />

                            <div className="p-5">
                                {/* Icon + Categories count */}
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className={`w-12 h-12 rounded-xl ${config.iconBg} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}
                                    >
                                        <Icon className="text-2xl" />
                                    </div>
                                    {tq.categories &&
                                        tq.categories.length > 0 && (
                                            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                                {tq.categories.length} cat.
                                            </span>
                                        )}
                                </div>

                                {/* Label */}
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 leading-tight">
                                    {tq.label}
                                </h4>

                                {/* Description */}
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                    {tq.description}
                                </p>

                                {/* Action hint */}
                                <div
                                    className={`mt-4 flex items-center gap-1 text-sm font-medium transition-all duration-200 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
                                >
                                    <span
                                        className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
                                    >
                                        Démarrer
                                    </span>
                                    <svg
                                        className="w-4 h-4"
                                        style={{ color: 'currentColor' }}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default SelectTypeRequest
