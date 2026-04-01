/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { getBankImages, getLordImages } from '@/services/firebase/BankService'
import { useEffect, useState, useRef } from 'react'
import { PiCheckFatFill, PiThumbsDownFill } from 'react-icons/pi'
import GoogleMapApp from './Map'
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
    useEffect(() => {}, [bankId])

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
            <div className="flex gap-2 pt-6  space-y-6 rounded bg-white pl-1 mb-4 pr-1">
                <div className="w-full">
                    <Button
                        loading={pdf}
                        variant="solid"
                        className=" ml-4"
                        icon={<BiPrinter />}
                        onClick={() => {
                            print()
                        }}
                    >
                        {' '}
                    </Button>
                </div>
                <div>
                    <Checkbox
                        defaultChecked={false}
                        onChange={(e) => {
                            setPConfig(e)
                        }}
                    >
                        Outils
                    </Checkbox>
                </div>
                <div>
                    {bank && bank.step != 'bankSteps.needContract' && (
                        <Checkbox
                            defaultChecked={false}
                            onChange={(e) => {
                                setContrat(e)
                            }}
                        >
                            Contrat
                        </Checkbox>
                    )}
                </div>
                {pConfig && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4  rounded bg-white p-2 mb-6">
                        <Input
                            type="number"
                            value={h3}
                            placeholder="Margin Contrats"
                            onChange={(v: any) => {
                                setH3(v.target.value)
                            }}
                        />
                        <Input
                            type="number"
                            value={h}
                            placeholder="Margin Pictures"
                            onChange={(v: any) => {
                                setH(v.target.value)
                            }}
                        />
                        <Input
                            type="number"
                            value={h2}
                            placeholder="Margin Details"
                            onChange={(v: any) => {
                                setH2(v.target.value)
                            }}
                        />
                    </div>
                )}
            </div>

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
                {bank && (contrat || bank.step == 'bankSteps.needContract') && (
                    <LeaseContractForm bank={bank}></LeaseContractForm>
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
                    {bank && (
                        <GoogleMapApp position={bank.location}></GoogleMapApp>
                    )}
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

                {/* Action buttons */}
                {!pdf && (
                    <div className="flex justify-around items-center pt-6">
                        {bank &&
                            bank.step == 'bankSteps.needRenovation' &&
                            bank?.approve && (
                                <Button
                                    className="bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-1"
                                    onClick={() =>
                                        onChangeState(
                                            <Rejected
                                                bankId={bankId}
                                                userId={userId || ''}
                                                onSubmit={() => {
                                                    onRenovOk()
                                                }}
                                            />,
                                            'Approbation',
                                        )
                                    }
                                >
                                    <PiCheckFatFill /> Rénovation terminée
                                </Button>
                            )}

                        {canSignedContract() && (
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-1"
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
                                <PiCheckFatFill /> Contrat Signé
                            </Button>
                        )}

                        {canValidate() && (
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-1"
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
                                <PiCheckFatFill /> Validé
                            </Button>
                        )}

                        {canApprove() && (
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center gap-1"
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
                                <PiCheckFatFill /> Approuvé
                            </Button>
                        )}

                        <>
                            {canReject() && (
                                <Button
                                    className="bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center gap-1"
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
                                    <PiThumbsDownFill /> Rejeté
                                </Button>
                            )}

                            {canPending() && (
                                <Button
                                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full"
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
                                    Attente
                                </Button>
                            )}
                        </>
                    </div>
                )}
            </div>
        </>
    )
}

export default SubmissionReview
