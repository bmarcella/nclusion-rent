/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    FormItem,
    Select,
    DatePicker,
    Input,
    Button,
    Alert,
} from '@/components/ui'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from '@/utils/hooks/useTranslation'
import {
    addDoc,
    getDocs,
    updateDoc,
    doc,
    where,
    orderBy,
    query,
} from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { BankDoc, contractsDoc, Landlord } from '@/services/Landlord'
import { useSessionUser } from '@/store/authStore'
import { getRegionIds, getRegionsById } from '@/views/Entity/Regions'
import { Bank, Proprio, RenovStep } from '@/views/Entity'
import { convertToSelectOptions } from '../../bank/add/components/InfoBank'
import { formatRelative } from 'date-fns/formatRelative'
import { fr } from 'date-fns/locale'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import UserName from '@/views/bank/show/components/UserName'
import { useNavigate } from 'react-router-dom'
import { HiOutlineClipboardList, HiOutlineSearch } from 'react-icons/hi'
import { PiMinus, PiPlus } from 'react-icons/pi'

const schema = z.object({
    renovStep: z.string().min(1, 'Required'),
    assignee: z.string().min(1, 'Required'),
    montant_total: z.string().min(1, 'Required'),
    montant_initial: z.string().min(1, 'Required'),
    transport: z.string(),
    description: z.string().optional(),
    startDate: z.string().min(1, 'Required'),
    endDate: z.string().min(1, 'Required'),
})

type TaskForm = z.infer<typeof schema>

function TaskManagerPopup() {
    const { t } = useTranslation()
    const [banks, setBanks] = useState<any[]>([])
    const [filter, setFilter] = useState<'all' | TaskForm['state']>('all')
    const [isSubmitting, setSubmitting] = useState(false)
    const { userId, proprio, authority } = useSessionUser((state) => state.user)
    const [landlordsOptions, setLandlordsOptions] = useState<any[]>([])
    const [selectedtasks, setSelectedTasks] = useState<any[]>([])
    const [message, setMessage] = useTimeOutMessage()
    const [alert, setAlert] = useState('success') as any
    const [bankSearch, setBankSearch] = useState('')
    const [selectedStep, setSelectedStep] = useState<any>()
    const navigate = useNavigate()

    // For filtering dropdowns
    const [regions, setRegions] = useState<number>(0)
    const [agents, setAgents] = useState<string>()
    const [start, setStart] = useState<Date>()
    const [end, setEnd] = useState<Date>()
    const [steps, setSteps] = useState<string>()
    const [states, setStates] = useState<string>()

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<TaskForm>({
        resolver: zodResolver(schema),
        defaultValues: {
            assignee: '',
            description: '',
            startDate: '',
            endDate: '',
        },
    })
    const renovStep = watch('renovStep')
    const ids =
        proprio?.regions?.length == 0 && authority && authority[0] == 'admin'
            ? getRegionIds()
            : proprio
              ? proprio.regions
              : []
    const fetchLandlords = async () => {
        try {
            let q = null
            q = query(
                Landlord,
                orderBy('createdAt', 'desc'),
                where('regions', 'array-contains-any', ids),
                where('type_person', '==', 'vendeur'),
            )
            const snapshot = await getDocs(q)
            const landlords: Proprio[] = snapshot.docs.map(
                (doc) => ({ id: doc.id, ...doc.data() }) as Proprio,
            )
            const persons = await convertToSelectOptions(landlords)
            setLandlordsOptions(persons)
        } catch (err) {
            console.error('Error fetching landlords:', err)
        }
    }

    const fetchBanks = async (step: RenovStep) => {
        const q = query(
            BankDoc,
            orderBy('createdAt', 'desc'),
            where('step', '==', 'bankSteps.needRenovation'),
            where('id_region', 'in', ids),
            where('renovStep', '==', step),
        )
        const snapshot = await getDocs(q)
        const banks: Bank[] = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() }) as Bank,
        )
        // Update state
        setBanks(banks)
    }

    const onSubmitContrat = async (data: TaskForm) => {
        if (parseInt(data.montant_total) < parseInt(data.montant_initial)) {
            setAlert('danger')
            setMessage(
                'Montant versé doit être inférieur ou egal au montant total',
            )
            return
        }

        if (selectedtasks.length <= 0) {
            setAlert('danger')
            setMessage('Vous devez ajouter au moins un bank.')
            return
        }
        try {
            setSubmitting(true)
            const banksId = selectedtasks.map((task) => task.id)
            let regionsId = selectedtasks.map((task) => task.id_region)
            regionsId = [...new Set(regionsId)]
            const contrat = {
                createdBy: userId,
                createdAt: new Date(),
                completed: false,
                completedAt: null,
                validated: false,
                validatedAt: null,
                regionsId,
                banksId,
                ...data,
            }
            const docRef = await addDoc(contractsDoc, contrat)
            await updateDoc(docRef, { id: docRef.id })
            await updateBanks(banksId, docRef.id, data.renovStep)
            setAlert('success')
            setMessage('Contrat crée avec succes')
            setSelectedTasks([])
            fetchBanks(data.renovStep as RenovStep)
            reset()
            navigate('/contrat/' + docRef.id)
        } catch (err) {
            console.error(err)
            setAlert('danger')
            setMessage('Error adding landlord')
        } finally {
            setSubmitting(false)
        }
    }

    async function updateBanks(
        banksId: any[],
        contractId: string,
        renovStep: string,
    ) {
        try {
            const data =
                renovStep == ('renovSteps.comptoire' as RenovStep)
                    ? ({
                          comptoireContratId: contractId,
                          renovStep: 'renovSteps.peinture' as RenovStep,
                          updatedAt: new Date(),
                      } as Partial<Bank>)
                    : ({
                          peintureContratId: contractId,
                          renovStep: 'renovSteps.in_process' as RenovStep,
                          updatedAt: new Date(),
                      } as Partial<Bank>)
            const updatePromises = banksId.map((bankId) => {
                const bankRef = doc(BankDoc, bankId)
                return updateDoc(bankRef, data)
            })
            await Promise.all(updatePromises)
        } catch (error) {
            throw new Error('Failed to update banks')
        }
    }

    const handleAdd = async (task: Bank) => {
        setSelectedTasks((prev) => [...prev, task])
        setBanks((prev) => prev.filter((t) => t.id !== task.id))
    }

    const handleRemove = async (task: Bank) => {
        setSelectedTasks((prev) => prev.filter((t) => t.id !== task.id))
        setBanks((prev) => [...prev, task])
    }

    useEffect(() => {
        fetchLandlords()
        if (selectedStep) fetchBanks(selectedStep)
    }, [selectedStep])

    return (
        <>
            {message && (
                <Alert showIcon className="mb-4" type={alert}>
                    <span className="break-all">{message}</span>
                </Alert>
            )}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                {/* Left - Form card */}
                <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center">
                                <HiOutlineClipboardList className="text-xl" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-gray-500">
                                    Nouveau contrat
                                </p>
                                <h5 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Détails du contrat
                                </h5>
                            </div>
                        </div>
                    </div>
                    <form
                        onSubmit={handleSubmit(onSubmitContrat)}
                        className="p-5"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <FormItem
                                label="Type Rénovation"
                                invalid={!!errors.renovStep}
                                errorMessage={errors.renovStep?.message}
                            >
                                <Controller
                                    name="renovStep"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            placeholder="Selectionner Type Rénovation"
                                            options={[
                                                {
                                                    value: 'renovSteps.comptoire',
                                                    label: t(
                                                        'bank.renovSteps.comptoire',
                                                    ),
                                                },
                                                {
                                                    value: 'renovSteps.peinture',
                                                    label: t(
                                                        'bank.renovSteps.peinture',
                                                    ),
                                                },
                                            ]}
                                            onChange={(option) => {
                                                field.onChange(option?.value)
                                                setSelectedTasks([])
                                                if (option?.value)
                                                    setSelectedStep(
                                                        option?.value,
                                                    )
                                                else setBanks([])
                                            }}
                                        />
                                    )}
                                />
                            </FormItem>

                            {renovStep && (
                                <>
                                    <FormItem
                                        label="Assignee"
                                        invalid={!!errors.assignee}
                                        errorMessage={errors.assignee?.message}
                                    >
                                        <Controller
                                            name="assignee"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    placeholder="Select assignee"
                                                    options={landlordsOptions}
                                                    onChange={(option) => {
                                                        field.onChange(
                                                            option?.value,
                                                        )
                                                    }}
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="Montant Total"
                                        invalid={!!errors.montant_total}
                                        errorMessage={
                                            errors.montant_total?.message
                                        }
                                    >
                                        <Controller
                                            name="montant_total"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    placeholder="Montant total"
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="Montant versé"
                                        invalid={!!errors.montant_initial}
                                        errorMessage={
                                            errors.montant_initial?.message
                                        }
                                    >
                                        <Controller
                                            name="montant_initial"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    placeholder="Montant versé"
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="Frais de transport"
                                        invalid={!!errors.transport}
                                        errorMessage={errors.transport?.message}
                                    >
                                        <Controller
                                            name="transport"
                                            control={control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    {...field}
                                                    placeholder="Frais de transport"
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="Start Date"
                                        invalid={!!errors.startDate}
                                        errorMessage={errors.startDate?.message}
                                    >
                                        <Controller
                                            name="startDate"
                                            control={control}
                                            render={({ field }) => (
                                                <DatePicker
                                                    placeholder="Choose start date"
                                                    value={
                                                        field.value
                                                            ? new Date(
                                                                  field.value,
                                                              )
                                                            : null
                                                    }
                                                    onChange={(date) =>
                                                        field.onChange(
                                                            date
                                                                ? date.toISOString()
                                                                : '',
                                                        )
                                                    }
                                                />
                                            )}
                                        />
                                    </FormItem>

                                    <FormItem
                                        label="End Date"
                                        invalid={!!errors.endDate}
                                        errorMessage={errors.endDate?.message}
                                    >
                                        <Controller
                                            name="endDate"
                                            control={control}
                                            render={({ field }) => (
                                                <DatePicker
                                                    placeholder="Choose end date"
                                                    value={
                                                        field.value
                                                            ? new Date(
                                                                  field.value,
                                                              )
                                                            : null
                                                    }
                                                    onChange={(date) =>
                                                        field.onChange(
                                                            date
                                                                ? date.toISOString()
                                                                : '',
                                                        )
                                                    }
                                                />
                                            )}
                                        />
                                    </FormItem>
                                </>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <FormItem
                                label="Description"
                                invalid={!!errors.description}
                                errorMessage={errors.description?.message}
                            >
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <textarea
                                            className="w-full bg-gray-100"
                                            {...field}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                        <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500">
                                {selectedtasks.length === 0 ? (
                                    <span className="text-amber-600">
                                        Sélectionnez au moins une bank
                                    </span>
                                ) : (
                                    <span>
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                                            {selectedtasks.length}
                                        </span>{' '}
                                        bank
                                        {selectedtasks.length > 1 ? 's' : ''}{' '}
                                        sélectionnée
                                        {selectedtasks.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            <Button
                                title={
                                    selectedtasks.length == 0
                                        ? 'Selectionner au moins une bank'
                                        : 'Ajouter une bank'
                                }
                                type="submit"
                                variant="solid"
                                disabled={selectedtasks.length == 0}
                                loading={isSubmitting}
                            >
                                {t('common.add') || 'Submit'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Right - Two bank panels */}
                {renovStep && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Selected banks */}
                        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    <h6 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        Sélectionnées
                                    </h6>
                                </div>
                                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-emerald-500 text-white text-xs font-semibold">
                                    {selectedtasks.length}
                                </span>
                            </div>
                            <p className="px-4 pt-2 text-xs text-gray-500">
                                Pour {t('bank.' + selectedStep)}
                            </p>
                            <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
                                {selectedtasks.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                            <HiOutlineClipboardList className="text-xl" />
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">
                                            Aucune bank sélectionnée
                                        </p>
                                    </div>
                                )}
                                {selectedtasks.map((bank) => (
                                    <div
                                        key={bank.id}
                                        className="group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 hover:border-emerald-300 hover:shadow-sm transition-all"
                                    >
                                        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-emerald-500" />
                                        <div className="flex items-start justify-between gap-3 pl-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                                    {bank.bankName}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Agent :{' '}
                                                    <UserName
                                                        userId={bank.createdBy}
                                                    />
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Propriétaire :{' '}
                                                    <UserName
                                                        userId={bank.landlord}
                                                        keyName="id"
                                                    />
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Créé{' '}
                                                    {formatRelative(
                                                        bank.createdAt.toDate?.() ||
                                                            bank.createdAt,
                                                        new Date(),
                                                        { locale: fr },
                                                    )}
                                                </p>
                                            </div>
                                            <button
                                                disabled={isSubmitting}
                                                className="shrink-0 h-8 w-8 rounded-full bg-white hover:bg-red-50 text-red-500 border border-red-200 flex items-center justify-center transition-colors disabled:opacity-50"
                                                title="Retirer"
                                                onClick={() =>
                                                    handleRemove(bank)
                                                }
                                            >
                                                <PiMinus />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Available banks */}
                        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-indigo-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500" />
                                    <h6 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        Disponibles
                                    </h6>
                                </div>
                                <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-indigo-500 text-white text-xs font-semibold">
                                    {
                                        banks.filter((bank) =>
                                            bank.bankName
                                                ?.toLowerCase()
                                                .includes(
                                                    bankSearch.toLowerCase(),
                                                ),
                                        ).length
                                    }
                                </span>
                            </div>
                            <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                                <div className="relative">
                                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Rechercher une bank..."
                                        className="pl-9 text-sm"
                                        value={bankSearch}
                                        onChange={(e) =>
                                            setBankSearch(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
                                {banks.filter((bank) =>
                                    bank.bankName
                                        ?.toLowerCase()
                                        .includes(bankSearch.toLowerCase()),
                                ).length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                            <HiOutlineSearch className="text-xl" />
                                        </div>
                                        <p className="mt-2 text-xs text-gray-500">
                                            Aucune bank disponible
                                        </p>
                                    </div>
                                )}
                                {banks
                                    .filter((bank) =>
                                        bank.bankName
                                            ?.toLowerCase()
                                            .includes(bankSearch.toLowerCase()),
                                    )
                                    .map((bank) => (
                                        <div
                                            key={bank.id}
                                            className="group relative rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 hover:border-indigo-300 hover:shadow-sm transition-all"
                                        >
                                            <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-indigo-400" />
                                            <div className="flex items-start justify-between gap-3 pl-2">
                                                <div className="flex-1 min-w-0">
                                                    <h6 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                                                        {bank.bankName}
                                                    </h6>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        Agent :{' '}
                                                        <UserName
                                                            userId={
                                                                bank.createdBy
                                                            }
                                                        />
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Prop. :{' '}
                                                        <UserName
                                                            userId={
                                                                bank.landlord
                                                            }
                                                            keyName="id"
                                                        />
                                                    </p>
                                                    {bank.id_region && (
                                                        <p className="text-xs text-gray-500">
                                                            Région :{' '}
                                                            {
                                                                getRegionsById(
                                                                    bank.id_region,
                                                                )?.label
                                                            }
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Créé{' '}
                                                        {formatRelative(
                                                            bank.createdAt.toDate?.() ||
                                                                bank.createdAt,
                                                            new Date(),
                                                            { locale: fr },
                                                        )}
                                                    </p>
                                                </div>
                                                <button
                                                    disabled={isSubmitting}
                                                    className="shrink-0 h-8 w-8 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-sm transition-colors disabled:opacity-50"
                                                    title="Ajouter"
                                                    onClick={() =>
                                                        handleAdd(bank)
                                                    }
                                                >
                                                    <PiPlus />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default TaskManagerPopup
