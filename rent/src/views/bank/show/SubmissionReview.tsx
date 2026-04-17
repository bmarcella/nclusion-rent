/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from '@/components/ui/Button'
import { getBankImages, getLordImages } from '@/services/firebase/BankService'
import { useEffect, useState, useRef } from 'react'
import { PiCheckFatFill, PiThumbsDownFill } from 'react-icons/pi'
import CommentsBank from '../add/components/CommentsBank'
import ImageGallery, { BankImage } from './components/ImageGallery'
import ImageLordComp, { LordImage } from './components/ImageLord'
import BankInfo from './components/BankInfo'
import Rejected from './reject/Rejected'
import { Bank, ListBankStepsDetails } from '@/views/Entity'
import { useReactToPrint } from 'react-to-print'
import Input from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import { useSessionUser } from '@/store/authStore'
import LeaseContractForm from './components/LeaseContractForm'
import { Steps } from '@/components/ui/Steps'
import { useTranslation } from '@/utils/hooks/useTranslation'
import { BiPrinter } from 'react-icons/bi'
import AllTask from './components/AllTask'
import Tabs from '@/components/ui/Tabs'
import StepHistory from './components/StepHistory'
import GoogleMapApp from './Map'
import PrintableMap from './PrintableMap'
import GoogleMapAppV2 from './MapV2'
import DatePicker from '@/components/ui/DatePicker'
import { updateBankById } from '@/services/firebase/BankService'
import { Notification, toast } from '@/components/ui'

interface Props {
    bankId: string
    onRejectOk?: (data: any) => void
    onApproveOk: (data: any) => void
    onContratOk: () => void
    onPermitOk: () => void
    onRenovOk: () => void
    onChangeState: (component: React.ReactNode, name?: string) => void
    onPendingOk: (data: any) => void
    genTasks?: () => void
    bank?: Bank
    userId: string
    onBankUpdate?: (patch: Partial<Bank>) => void
}

const SubmissionReview = ({
    bankId,
    genTasks,
    onChangeState,
    onRenovOk,
    onRejectOk,
    onPendingOk,
    onApproveOk,
    onPermitOk,
    onContratOk,
    bank,
    userId,
    onBankUpdate,
}: Props) => {
    const contentRef = useRef<HTMLDivElement>(null)
    const reactToPrintFn = useReactToPrint({ contentRef })
    const [images, setImages] = useState<BankImage[]>([])
    const [lImages, setLImages] = useState<LordImage[]>([])
    const [pdf, setPdf] = useState(false)
    const [contrat, setContrat] = useState(false)
    const [h, setH] = useState(null)
    const [h2, setH2] = useState(null)
    const [h3, setH3] = useState(null)
    const [pConfig, setPConfig] = useState(false)
    const [activeTab, setActiveTab] = useState('comments')
    const [contractVersion, setContractVersion] = useState<'v1' | 'v2'>('v2')
    const [headerSize, setHeaderSize] = useState<number>(14.8)
    const [descSize, setDescSize] = useState<number>(13.5)
    const { authority } = useSessionUser((state) => state.user)
    const { t } = useTranslation()
    const role = authority?.[0] || null
    useEffect(() => {
        getBankImages(bankId).then((imgs: BankImage[]) => {
            console.log('Bank Images: ', imgs)
            setImages(imgs)
        })
    }, [bankId])

    useEffect(() => {
        if (bank)
            getLordImages(bank.landlord).then((imgs: any[]) => {
                console.log('Bank Images: ', imgs)
                setLImages(imgs)
            })
    }, [bank])


    const print = async () => {
        setPdf(true)
        setTimeout(async () => {
            await reactToPrintFn()
            setPdf(false)
        }, 2000)
    }

    const canApprove = () => {
        if (
            bank?.approve &&
            bank?.step === 'bankSteps.needApprobation' &&
            (role == 'assist_coordonator' ||
                role == 'coordonator' ||
                role == 'admin' ||
                role == 'super_manager' ||
                role == 'manager' ||
                role == 'asssit_manager')
        ) {
            return true
        }
        return false
    }

    const canValidate = () => {
        if (
            !bank?.approve &&
            bank?.step === 'bankSteps.needApproval' &&
            (role == 'assist_coordonator' ||
                role == 'coordonator_agent_immobilier' ||
                role == 'admin')
        ) {
            return true
        }
        return false
    }
    const canReject = () => {
        const role = authority?.[0] || null
        if (
            role == 'coordonator_agent_immobilier' &&
            bank?.step != 'bankSteps.needApproval'
        ) {
            return false
        }
        if (
            (!bank?.reject &&
                bank?.step != 'bankSteps.needContract' &&
                bank?.step != 'bankSteps.needRenovation' &&
                bank?.step != 'bankSteps.readyToUse') ||
            role == 'admin'
        ) {
            return true
        }
        return false
    }
    const canPending = () => {
        if (
            role == 'coordonator_agent_immobilier' &&
            bank?.step != 'bankSteps.needApproval'
        ) {
            return false
        }

        if (
            (!bank?.pending &&
                bank?.step != 'bankSteps.needContract' &&
                bank?.step != 'bankSteps.needRenovation' &&
                bank?.step != 'bankSteps.readyToUse') ||
            role == 'admin'
        ) {
            return true
        }
        return false
    }
    const canEditContractTerms =
        bank?.step === 'bankSteps.needContract' &&
        (role === 'assist_coordonator' ||
            role === 'coordonator' ||
            role === 'admin')

    const [editedFinalRent, setEditedFinalRent] = useState<string>('')
    const [editedDate, setEditedDate] = useState<Date | null>(null)
    const [savingTerms, setSavingTerms] = useState(false)

    useEffect(() => {
        if (bank) {
            setEditedFinalRent(
                bank.final_rentCost != null ? String(bank.final_rentCost) : '',
            )
            setEditedDate(bank.date ? new Date(bank.date) : null)
        }
    }, [bank?.id, bank?.final_rentCost, bank?.date])

    const saveContractTerms = async () => {
        if (!bank?.id) return
        const parsedRent = Number(editedFinalRent)
        if (!editedFinalRent || Number.isNaN(parsedRent) || parsedRent < 0) {
            toast.push(
                <Notification type="danger" title="Valeur invalide">
                    Le montant final doit être un nombre positif.
                </Notification>,
            )
            return
        }
        if (!editedDate) {
            toast.push(
                <Notification type="danger" title="Date requise">
                    Veuillez choisir une date.
                </Notification>,
            )
            return
        }
        const patch: Partial<Bank> = {
            final_rentCost: parsedRent,
            date: editedDate.toISOString(),
        }
        setSavingTerms(true)
        try {
            await updateBankById(bank.id, patch)
            onBankUpdate?.(patch)
            toast.push(
                <Notification type="success" title="Enregistré">
                    Les termes du contrat ont été mis à jour.
                </Notification>,
            )
        } catch (err: any) {
            toast.push(
                <Notification type="danger" title="Erreur">
                    {err?.message || 'Impossible de sauvegarder.'}
                </Notification>,
            )
        } finally {
            setSavingTerms(false)
        }
    }

    const canSignedContract = () => {
        if (
            bank &&
            bank?.approve &&
            bank.step == 'bankSteps.needContract' &&
            (role == 'coordonator' ||
                role == 'assist_coordonator' ||
                role == 'admin')
        ) {
            return true
        }
        return false
    }

    return (
        <>
            <div className="flex items-center gap-4 pt-6 rounded bg-white pl-1 mb-4 pr-1">
                <div className="flex-shrink-0">
                    <Button
                        loading={pdf}
                        variant="solid"
                        className="ml-4 mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center gap-1"
                        icon={<BiPrinter />}
                        onClick={() => {
                            print()
                        }}
                    >
                        {' '}
                    </Button>
                </div>
                <div className="flex items-center ml-auto">
                    <Checkbox
                        defaultChecked={false}
                        onChange={(e) => {
                            setPConfig(e)
                        }}
                    >
                        Outils
                    </Checkbox>
                </div>
                {bank && bank.step != 'bankSteps.needContract' && (
                    <div className="flex items-center">
                        <Checkbox
                            defaultChecked={false}
                            onChange={(e) => {
                                setContrat(e)
                            }}
                        >
                            Contrat
                        </Checkbox>
                    </div>
                )}
                {(contrat || bank?.step == 'bankSteps.needContract') && (
                    <div className="flex items-center gap-2">
                        <label
                            htmlFor="contractVersion"
                            className="text-sm font-medium text-gray-700"
                        >
                            Version
                        </label>
                        <select
                            id="contractVersion"
                            value={contractVersion}
                            onChange={(e) =>
                                setContractVersion(
                                    e.target.value as 'v1' | 'v2',
                                )
                            }
                            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                        >
                            <option value="v1">Contrat V1</option>
                            <option value="v2">Contrat V2</option>
                        </select>
                    </div>
                )}
            </div>

            {pConfig && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded bg-white p-4 mb-6 border border-gray-200">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Margin Contrats
                        </label>
                        <Input
                            type="number"
                            value={h3 ?? ''}
                            placeholder="Margin Contrats"
                            onChange={(v: any) => {
                                setH3(v.target.value)
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Margin Pictures
                        </label>
                        <Input
                            type="number"
                            value={h ?? ''}
                            placeholder="Margin Pictures"
                            onChange={(v: any) => {
                                setH(v.target.value)
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Margin Details
                        </label>
                        <Input
                            type="number"
                            value={h2 ?? ''}
                            placeholder="Margin Details"
                            onChange={(v: any) => {
                                setH2(v.target.value)
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Taille des articles (px)
                        </label>
                        <Input
                            type="number"
                            value={headerSize}
                            placeholder="Taille des articles"
                            onChange={(v: any) => {
                                setHeaderSize(Number(v.target.value) || 0)
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Taille des descriptions (px)
                        </label>
                        <Input
                            type="number"
                            value={descSize}
                            placeholder="Taille des descriptions"
                            onChange={(v: any) => {
                                setDescSize(Number(v.target.value) || 0)
                            }}
                        />
                    </div>
                </div>
            )}

            {ListBankStepsDetails.findIndex((step) => step.key == bank?.step) !=
                -1 && (
                <div className="w-full overflow-x-auto  rounded-lg bg-white dark:bg-gray-800 mb-6 p-1 pt-6">
                    <Steps
                        current={ListBankStepsDetails.findIndex(
                            (step) => step.key == bank?.step,
                        )}
                        className="w-full mb-6"
                    >
                        {ListBankStepsDetails.map((step, index) => (
                            <Steps.Item
                                key={index}
                                title={t('bank.' + step.key)}
                            />
                        ))}
                    </Steps>
                </div>
            )}

            <div ref={contentRef} className="p-6 space-y-6">

                {canEditContractTerms && !pdf && (
                    <div className="rounded-2xl bg-white border border-pink-200 p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-bold text-pink-600">
                                Termes du contrat
                            </h3>
                            <span className="text-xs text-gray-500">
                                (modifiables à l'étape {t('bank.bankSteps.needContract')})
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loyer final (HTG)
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={editedFinalRent}
                                    onChange={(e: any) =>
                                        setEditedFinalRent(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date
                                </label>
                                <DatePicker
                                    value={editedDate}
                                    onChange={(d) => setEditedDate(d)}
                                />
                            </div>
                            <div>
                                <Button
                                    variant="solid"
                                    loading={savingTerms}
                                    onClick={saveContractTerms}
                                >
                                    Enregistrer
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {bank && (contrat || bank.step == 'bankSteps.needContract') && (
                    <LeaseContractForm
                        bank={bank}
                        pdf={pdf}
                        version={contractVersion}
                        headerSize={headerSize}
                        descSize={descSize}
                    />
                )}

                {bank &&
                    bank.id &&
                    bank.step == 'bankSteps.needRenovation' &&
                    !pdf && (
                        <div>
                            <h2 className="text-2xl font-bold mb-2 text-pink-600">
                                Rénovation
                            </h2>
                            <AllTask
                                bankId={bank.id}
                                genTasks={genTasks}
                            ></AllTask>
                        </div>
                    )}

                {(pdf || pConfig) && (
                    <div
                        className={pConfig && !pdf ? 'w-full border' : 'w-full'}
                        style={{ height: h3 + 'px' }}
                    ></div>
                )}

                <h2 className="text-2xl font-bold mb-2 text-pink-600">
                    Bank Location
                </h2>
                {/* Map section */}
                <div className="w-full h-100 mb-6 rounded-lg shadow-lg overflow-hidden">
                    { bank && <GoogleMapAppV2 position={bank.location} /> }
                </div>

                {/* Photos */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-2xl font-bold text-pink-600">
                            Photo
                        </h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                            {images.length + lImages.length} fichiers
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Bank Images */}
                        <div className="lg:col-span-2">
                            <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-5  border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        Images des banks
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {images.length} photo
                                        {images.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <ImageGallery
                                    images={images}
                                    userId={userId || ''}
                                    canDelete={false}
                                    showPic={true}
                                />
                            </div>
                        </div>

                        {/* Landlord Documents */}
                        <div className="lg:col-span-1">
                            <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-5 border border-indigo-100 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                        Documents propriétaire
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {lImages.length} doc
                                        {lImages.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <ImageLordComp
                                    images={lImages}
                                    userId={userId || ''}
                                    canDelete={false}
                                    showPic={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {(pdf || pConfig) && (
                    <div
                        className={pConfig && !pdf ? 'w-full border' : 'w-full'}
                        style={{ height: h + 'px' }}
                    ></div>
                )}

                {/* Details & Comments side by side */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Details - 2/3 width */}
                    <div className="lg:col-span-2">
                        <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold text-pink-600">
                                        Details
                                    </h2>
                                    {bank?.step && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700">
                                            {t('bank.' + bank.step)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="p-4">
                                {bank && <BankInfo bank={bank} />}
                            </div>
                        </div>
                    </div>

                    {/* Comments & Timeline - 1/3 width */}
                    <div className="lg:col-span-1">
                        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border border-indigo-100 dark:border-gray-700 overflow-hidden h-full flex flex-col">
                            <Tabs
                                defaultValue="comments"
                                onChange={(val) => setActiveTab(val as string)}
                            >
                                <Tabs.TabList className="px-4 pt-3 border-b border-indigo-100 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60">
                                    <Tabs.TabNav value="comments">
                                        Commentaires
                                    </Tabs.TabNav>
                                    <Tabs.TabNav value="timeline">
                                        Timeline
                                    </Tabs.TabNav>
                                </Tabs.TabList>
                            </Tabs>
                            <div className="p-4 flex-1 overflow-y-auto max-h-[700px]">
                                {activeTab === 'comments' &&
                                    bank &&
                                    bank.id && (
                                        <CommentsBank
                                            bankId={bank.id}
                                            userId={userId || ''}
                                            isEdit={true}
                                            nextStep={function (
                                                step: number,
                                                data: any,
                                            ): void {
                                                throw new Error(
                                                    'Function not implemented.',
                                                )
                                            }}
                                            only={pdf}
                                        />
                                    )}
                                {activeTab === 'timeline' &&
                                    bank &&
                                    bank.id && <StepHistory bankId={bank.id} />}
                            </div>
                        </div>
                    </div>
                </div>

                {(pdf || pConfig) && (
                    <div
                        className={pConfig && !pdf ? 'w-full border' : 'w-full'}
                        style={{ height: h2 + 'px' }}
                    ></div>
                )}

                {/* Action footer */}
                {!pdf && (
                    <div className="sticky bottom-4 mt-8 z-10">
                        <div className="rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-md shadow-lg px-5 py-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                {/* Status / context label */}
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-pink-500 animate-pulse" />
                                    <div className="flex flex-col">
                                        <span className="text-xs uppercase tracking-wide text-gray-500">
                                            Étape actuelle
                                        </span>
                                        <span className="text-sm font-semibold text-gray-800">
                                            {bank?.step
                                                ? t('bank.' + bank.step)
                                                : '—'}
                                        </span>
                                    </div>
                                </div>

                                {/* Destructive / secondary actions */}
                                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                                    {canReject() && (
                                        <Button
                                            className="bg-white hover:bg-red-50 text-red-600 border border-red-300 rounded-full flex items-center gap-1 px-4"
                                            onClick={() =>
                                                onChangeState(
                                                    <Rejected
                                                        bankId={bankId}
                                                        userId={userId || ''}
                                                        onSubmit={onRejectOk}
                                                    />,
                                                )
                                            }
                                        >
                                            <PiThumbsDownFill className="text-red-500" />
                                            Rejeté
                                        </Button>
                                    )}

                                    {canPending() && (
                                        <Button
                                            className="bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 rounded-full flex items-center gap-1 px-4"
                                            onClick={() =>
                                                onChangeState(
                                                    <Rejected
                                                        bankId={bankId}
                                                        userId={userId || ''}
                                                        onSubmit={(data) => {
                                                            onPendingOk(data)
                                                        }}
                                                    />,
                                                    'Consideration',
                                                )
                                            }
                                        >
                                            <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
                                            Attente
                                        </Button>
                                    )}

                                    {/* Primary action — only one is ever visible at a time per flow */}
                                    {bank &&
                                        bank.step ==
                                            'bankSteps.needRenovation' &&
                                        bank?.approve && (
                                            <Button
                                                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full flex items-center gap-2 px-5 shadow-sm"
                                                onClick={() =>
                                                    onChangeState(
                                                        <Rejected
                                                            bankId={bankId}
                                                            userId={
                                                                userId || ''
                                                            }
                                                            onSubmit={() => {
                                                                onRenovOk()
                                                            }}
                                                        />,
                                                        'Approbation',
                                                    )
                                                }
                                            >
                                                <PiCheckFatFill />
                                                Rénovation terminée
                                            </Button>
                                        )}

                                    {canSignedContract() && (
                                        <Button
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full flex items-center gap-2 px-5 shadow-sm"
                                            onClick={() =>
                                                onChangeState(
                                                    <Rejected
                                                        bankId={bankId}
                                                        userId={userId || ''}
                                                        onSubmit={() => {
                                                            onContratOk()
                                                        }}
                                                    />,
                                                    'Approbation',
                                                )
                                            }
                                        >
                                            <PiCheckFatFill />
                                            Contrat Signé
                                        </Button>
                                    )}

                                    {canValidate() && (
                                        <Button
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full flex items-center gap-2 px-5 shadow-sm"
                                            onClick={() =>
                                                onChangeState(
                                                    <Rejected
                                                        bankId={bankId}
                                                        userId={userId || ''}
                                                        onSubmit={(data) => {
                                                            onApproveOk(data)
                                                        }}
                                                    />,
                                                    'Approbation',
                                                )
                                            }
                                        >
                                            <PiCheckFatFill />
                                            Validé
                                        </Button>
                                    )}

                                    {canApprove() && (
                                        <Button
                                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full flex items-center gap-2 px-5 shadow-sm"
                                            onClick={() =>
                                                onChangeState(
                                                    <Rejected
                                                        bankId={bankId}
                                                        userId={userId || ''}
                                                        onSubmit={() => {
                                                            onPermitOk()
                                                        }}
                                                    />,
                                                    'Approbation',
                                                )
                                            }
                                        >
                                            <PiCheckFatFill />
                                            Approuvé
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default SubmissionReview
