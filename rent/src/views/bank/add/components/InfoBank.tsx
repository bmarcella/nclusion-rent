/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    FormItem,
    Select,
    DatePicker,
    Form,
    Input,
    Button,
    Checkbox,
    Card,
} from '@/components/ui'
import { manageAuth } from '@/constants/roles.constant'
import { BankDoc, Landlord } from '@/services/Landlord'
import { useSessionUser } from '@/store/authStore'
import { useTranslation } from '@/utils/hooks/useTranslation'
import { hasAuthorities, hasAuthority } from '@/utils/RoleChecker'
import { Bank, getBlankBank, Proprio } from '@/views/Entity'
import { Regions } from '@/views/Entity/Regions'
import AddProprioPopup from '@/views/proprio/add/AddProprioPopup'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    query,
    where,
    getDocs,
    addDoc,
    getDoc,
    updateDoc,
} from 'firebase/firestore'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z, ZodType } from 'zod'

export const convertToSelectOptions = (items: Proprio[]) => {
    return items.map((obj) => ({
        value: obj.id,
        label: obj.fullName,
    }))
}

export const convertStringToSelectOptions = (
    items: string[],
    t: any = undefined,
    key: string = '',
) => {
    return items.map((obj) => ({
        value: obj,
        label: t ? t(`${key}.${obj}`) : obj,
    }))
}

const schema: ZodType<Partial<Bank>> = z.object({
    bankName: z.string().min(1, 'Required'),
    city: z.string().min(1, 'Required'),
    yearCount: z.number().min(1, 'Required').max(10, 'Max 10 years'),
    date: z.string(),
    rentCost: z.number(),
    final_rentCost: z.number().optional(),
    superficie: z.number().optional(),
    nombre_chambre: z.number().optional(),
    addresse: z.string().optional(),
    id_region: z.number().min(1, 'Required'),
    reference: z.string().optional(),
    landlord: z.string(),
    isrefSameAsLandlord: z.boolean(),
    urgency: z.boolean(),
})
export type FormValuesInfo = z.infer<typeof schema>

interface FormProps {
    nextStep: (step: number, data: any) => void
    onError: (data: any) => void
    defaultValues?: Partial<FormValuesInfo>
    isEdit?: boolean
    userId?: string
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
            <h6 className="text-gray-900 dark:text-gray-100">{children}</h6>
        </div>
    )
}

function InfoBank({
    nextStep,
    onError,
    defaultValues,
    isEdit = false,
    userId,
}: FormProps) {
    const [data, setData] = useState<Proprio[]>([])
    const [landlordsOptions, setLandlordsOptions] = useState<any[]>([])
    const [refsOptions, setRefsOptions] = useState<any[]>([])
    const [typeOptions, setTypeOptions] = useState<any[]>(Regions[0].cities)
    const [isSubmitting, setSubmitting] = useState(false)
    const [loading, setLoading] = useState(false)
    const [location, setLocation] = useState<{
        lat: number
        lng: number
    } | null>(null)
    const [regions, setRegions] = useState([]) as any
    const [hideReg, setHideReg] = useState(false)
    const { authority, proprio } = useSessionUser((state) => state.user)
    const [ploading, setPloading] = useState(false)
    const { t } = useTranslation()
    const fetchLandlords = async () => {
        try {
            setPloading(true)
            setLoading(true)
            const q = query(
                Landlord,
                where('type_person', '==', 'proprietaire'),
            )
            const snapshot = await getDocs(q)
            const landlords: Proprio[] = []

            snapshot.forEach((doc) => {
                const data = doc.data() as Proprio
                data.id = doc.id
                landlords.push(data)
            })
            const persons = await convertToSelectOptions(landlords)
            setLandlordsOptions(persons)
            setRefsOptions(persons)
            setData(landlords)
            setLoading(false)
            setPloading(false)
        } catch (err) {
            console.error('Error fetching landlords:', err)
            setLoading(false)
            setPloading(false)
        }
    }

    const addNewProprio = async (new_data: Proprio) => {
        await fetchLandlords()
        setValue('landlord', new_data.id)
    }

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                setLocation({ lat: latitude, lng: longitude })
            },
            (err) => {
                onError(`Error: ${err.message}`)
            },
        )
        if (landlordsOptions.length === 0) {
            fetchLandlords()
        }
        if (isEdit) {
            const region =
                Regions.find(
                    (option) =>
                        Number(option.value) ===
                        Number(defaultValues?.id_region),
                ) || null
            if (region) {
                setTypeOptions(
                    convertStringToSelectOptions(region.cities || []),
                )
            }
        }
    }, [])

    useEffect(() => {
        if (!authority || authority.length === 0) return
        const auth = authority[0]
        const manage = async () => {
            const { regions } = await manageAuth(auth, proprio, t)
            setRegions(regions)
            if (regions.length === 1) {
                setValue('id_region', regions[0].value)
                setTypeOptions(
                    convertStringToSelectOptions(regions[0].cities || []),
                )
                setHideReg(true)
            }
        }
        manage()
    }, [authority])

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm<FormValuesInfo>({
        resolver: zodResolver(schema),
        defaultValues: {
            bankName: defaultValues?.bankName,
            city: defaultValues?.city,
            superficie: defaultValues?.superficie,
            nombre_chambre: defaultValues?.nombre_chambre,
            yearCount: defaultValues?.yearCount,
            date: defaultValues?.date,
            rentCost: defaultValues?.rentCost,
            final_rentCost: defaultValues?.final_rentCost,
            addresse: defaultValues?.addresse,
            id_region: defaultValues?.id_region,
            reference: defaultValues?.reference,
            landlord: isEdit
                ? defaultValues?.landlord?.id
                    ? defaultValues?.landlord.id
                    : undefined
                : defaultValues?.landlord,
            isrefSameAsLandlord: defaultValues?.isrefSameAsLandlord,
            urgency: defaultValues?.urgency,
        },
    })
    const addNewBank = async (data: FormValuesInfo) => {
        try {
            setSubmitting(true)
            const bank: Bank = getBlankBank(
                data,
                userId || '',
                location || { lat: 0, lng: 0 },
            )
            bank.final_rentCost = data.rentCost || 0
            const docRef = await addDoc(BankDoc, bank)
            const snapshot = await getDoc(docRef)
            if (snapshot.exists()) {
                const data = snapshot.data()
                reset()
                const newBank = { ...data, id: docRef.id }
                await updateDoc(docRef, { id: docRef.id })
                nextStep(1, newBank)
                setSubmitting(false)
            } else {
                setTimeout(() => setSubmitting(false), 1000)
                onError('Document not found')
            }
        } catch (error: any) {
            onError(error)
            setTimeout(() => setSubmitting(false), 1000)
        }
    }

    const onSubmitInfo = async (data: FormValuesInfo) => {
        setSubmitting(true)

        setValue('bank', data)
        if (isEdit) {
            nextStep(1, data)
        } else {
            addNewBank(data)
        }
        setTimeout(() => setSubmitting(false), 1000)
    }

    useEffect(() => {
        reset({
            bankName: defaultValues?.bankName,
            city: defaultValues?.city,
            yearCount: defaultValues?.yearCount,
            superficie: defaultValues?.superficie,
            nombre_chambre: defaultValues?.nombre_chambre,
            date: defaultValues?.date,
            rentCost: defaultValues?.rentCost,
            final_rentCost: defaultValues?.final_rentCost,
            addresse: defaultValues?.addresse,
            id_region: defaultValues?.id_region,
            reference: defaultValues?.reference,
            landlord: isEdit
                ? (defaultValues?.landlord?.id as any)
                : defaultValues?.landlord,
            isrefSameAsLandlord: defaultValues?.isrefSameAsLandlord,
            urgency: defaultValues?.urgency,
        })
    }, [defaultValues, reset])

    const selectedRegion = watch('id_region')
    const hasRole = useMemo(
        () => hasAuthorities(authority, ['admin', 'coordonator', 'assist_coordonator']),
        [authority],
    )

    return (
        <Form onSubmit={handleSubmit(onSubmitInfo)}>
            <div className="flex flex-col gap-6">
                {/* Section 1: Property Identification */}
                <Card bordered>
                    <SectionTitle>
                        {t('bank.bankName')}
                    </SectionTitle>
                    <FormItem
                        label={t('bank.bankName')}
                        asterisk
                        invalid={!!errors.bankName}
                        errorMessage={errors.bankName?.message}
                    >
                        <Controller
                            name="bankName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    placeholder={t('bank.bankName')}
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                </Card>

                {/* Section 2: Location */}
                <Card bordered>
                    <SectionTitle>
                        {t('bank.addresse')}
                    </SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        {!hideReg && (
                            <FormItem
                                label={t('bank.id_region')}
                                asterisk
                                invalid={!!errors.id_region}
                                errorMessage={errors.id_region?.message}
                            >
                                <Controller
                                    name="id_region"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            placeholder={t('common.select')}
                                            options={regions}
                                            value={
                                                regions.find(
                                                    (option: any) =>
                                                        Number(option.value) ===
                                                        Number(field.value),
                                                ) || null
                                            }
                                            onChange={(option: any) => {
                                                setTypeOptions(
                                                    convertStringToSelectOptions(
                                                        option?.cities || [],
                                                    ),
                                                )
                                                field.onChange(
                                                    Number(option?.value),
                                                )
                                            }}
                                        />
                                    )}
                                />
                            </FormItem>
                        )}

                        {selectedRegion && (
                            <FormItem
                                label={t('bank.city')}
                                asterisk
                                invalid={!!errors.city}
                                errorMessage={errors.city?.message}
                            >
                                <Controller
                                    name="city"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            placeholder={t('common.select')}
                                            options={typeOptions}
                                            value={
                                                typeOptions.find(
                                                    (option: any) =>
                                                        option.value ===
                                                        field.value,
                                                ) || null
                                            }
                                            onChange={(option: any) =>
                                                field.onChange(option?.value)
                                            }
                                        />
                                    )}
                                />
                            </FormItem>
                        )}

                        <FormItem
                            label={t('bank.addresse')}
                            invalid={!!errors.addresse}
                            errorMessage={errors.addresse?.message}
                        >
                            <Controller
                                name="addresse"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        placeholder={t('bank.addresse')}
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>
                    </div>
                </Card>

                {/* Section 3: Landlord */}
                <Card bordered>
                    <SectionTitle>
                        {t('bank.landlord')}
                    </SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <FormItem
                            label={t('bank.landlord')}
                            asterisk
                            invalid={!!errors.landlord}
                            errorMessage={errors.landlord?.message as string}
                        >
                            <Controller
                                name="landlord"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center gap-2">
                                        <Select
                                            isLoading={ploading}
                                            className="w-full"
                                            placeholder={t('common.select')}
                                            options={landlordsOptions}
                                            value={
                                                refsOptions.find(
                                                    (option: any) =>
                                                        option.value ==
                                                        field.value,
                                                ) || null
                                            }
                                            onChange={(option: any) =>
                                                field.onChange(option?.value)
                                            }
                                        />
                                        <AddProprioPopup
                                            done={addNewProprio}
                                        />
                                    </div>
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label={t('bank.reference')}
                            invalid={!!errors.reference}
                            errorMessage={errors.reference?.message}
                        >
                            <Controller
                                name="reference"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        placeholder={t('bank.reference')}
                                        {...field}
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label={t('bank.isrefSameAsLandlord')}
                            invalid={!!errors.isrefSameAsLandlord}
                            errorMessage={
                                errors.isrefSameAsLandlord?.message
                            }
                        >
                            <Controller
                                name="isrefSameAsLandlord"
                                control={control}
                                render={({ field }) => (
                                    <div className="mt-2">
                                        <Checkbox
                                            {...field}
                                            checked={!!field.value}
                                        />
                                    </div>
                                )}
                            />
                        </FormItem>
                    </div>
                </Card>

                {/* Section 4: Property Details */}
                <Card bordered>
                    <SectionTitle>
                        {t('bank.superficie')}
                    </SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        <FormItem
                            label={t('bank.superficie')}
                            invalid={!!errors.superficie}
                            errorMessage={errors.superficie?.message}
                        >
                            <Controller
                                name="superficie"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        suffix="m&sup2;"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label={t('bank.nombre_chambre')}
                            invalid={!!errors.nombre_chambre}
                            errorMessage={errors.nombre_chambre?.message}
                        >
                            <Controller
                                name="nombre_chambre"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label={t('bank.yearCount')}
                            asterisk
                            invalid={!!errors.yearCount}
                            errorMessage={errors.yearCount?.message}
                        >
                            <Controller
                                name="yearCount"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        placeholder="1"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                )}
                            />
                        </FormItem>
                    </div>
                </Card>

                {/* Section 5: Financials & Date */}
                <Card bordered>
                    <SectionTitle>
                        {t('bank.rent')}
                    </SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                        <FormItem
                            label={t('bank.rentCost')}
                            asterisk
                            invalid={!!errors.rentCost}
                            errorMessage={errors.rentCost?.message}
                        >
                            <Controller
                                name="rentCost"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        prefix="HTG"
                                        suffix=".00"
                                        {...field}
                                        onChange={(e) =>
                                            field.onChange(
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                )}
                            />
                        </FormItem>

                        {isEdit && (
                            <FormItem
                                label={t('bank.final_rentCost')}
                                invalid={!!errors.final_rentCost}
                                errorMessage={errors.final_rentCost?.message}
                            >
                                <Controller
                                    name="final_rentCost"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            prefix="HTG"
                                            suffix=".00"
                                            {...field}
                                            onChange={(e) =>
                                                field.onChange(
                                                    Number(e.target.value),
                                                )
                                            }
                                        />
                                    )}
                                />
                            </FormItem>
                        )}

                        <FormItem
                            label={t('bank.date')}
                            asterisk
                            invalid={!!errors.date}
                            errorMessage={errors.date?.message}
                        >
                            <Controller
                                name="date"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        placeholder="Choisissez une date"
                                        value={
                                            field.value
                                                ? new Date(field.value)
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
                    </div>
                </Card>

                {/* Urgency flag */}
                <Card bordered>
                    <div className="flex items-center gap-3">
                        <Controller
                            name="urgency"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    {...field}
                                    checked={!!field.value}
                                />
                            )}
                        />
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {t('bank.urgency')}
                        </span>
                    </div>
                </Card>

                {/* Submit */}
                {(!isEdit || hasRole ||
                    [
                        'bankSteps.needApproval',
                        'bankSteps.needApprobation',
                    ].includes(defaultValues?.step as any)) && (
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            variant="solid"
                            loading={isSubmitting}
                            size="lg"
                        >
                            {isEdit
                                ? t('common.update')
                                : t('common.next')}
                        </Button>
                    </div>
                )}
            </div>
        </Form>
    )
}

export default InfoBank
