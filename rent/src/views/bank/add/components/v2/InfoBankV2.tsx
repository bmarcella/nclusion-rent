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
    Radio,
} from '@/components/ui'
import { manageAuth } from '@/constants/roles.constant'
import { BankDoc, Landlord } from '@/services/Landlord'
import { useSessionUser } from '@/store/authStore'
import { useTranslation } from '@/utils/hooks/useTranslation'
import { hasAuthorities } from '@/utils/RoleChecker'
import {
    Bank,
    BankFormVersion,
    getBlankBank,
    Proprio,
    paymentMethods,
    paymentStructures,
    locationTypes,
    internetProviders,
    verifyOwners,
} from '@/views/Entity'
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
import { z } from 'zod'
import { convertToSelectOptions, convertStringToSelectOptions } from '../InfoBank'

const schema = z.object({
    bankName: z.string().min(1, 'Required'),
    city: z.string().min(1, 'Required'),
    yearCount: z.number().min(1, 'Required').max(10, 'Max 10 years'),
    date: z.string(),
    rentCost: z.number(),
    addresse: z.string().optional(),
    id_region: z.number().min(1, 'Required'),
    landlord: z.string(),
    reference: z.string().optional(),
    ownerPhone: z.string().optional(),
    v2PaymentMethod: z.array(z.enum(paymentMethods)),
    v2PaymentStructure: z.enum(paymentStructures),
    v2LocationType: z.enum(locationTypes),
    v2InternetService: z.array(z.enum(internetProviders)),
    v2VerifyOwner: z.array(z.enum(verifyOwners)),
})

type FormValues = z.infer<typeof schema>

interface FormProps {
    nextStep: (step: number, data: any) => void
    onError: (data: any) => void
    defaultValues?: Partial<Bank>
    userId?: string
    isEdit?: boolean
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-4 pb-2 border-b border-gray-200 dark:border-gray-600">
            <h6 className="text-gray-900 dark:text-gray-100">{children}</h6>
        </div>
    )
}

function InfoBankV2({
    nextStep,
    onError,
    defaultValues,
    userId,
    isEdit = false,
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
        if (isEdit && defaultValues?.id_region != null) {
            const region = Regions.find(
                (option) =>
                    Number(option.value) === Number(defaultValues?.id_region),
            )
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
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            bankName: defaultValues?.bankName,
            city: defaultValues?.city,
            yearCount: Number(defaultValues?.yearCount) || undefined,
            date: defaultValues?.date,
            rentCost: Number(defaultValues?.rentCost) || undefined,
            addresse: defaultValues?.addresse,
            id_region: Number(defaultValues?.id_region) || undefined,
            landlord: isEdit
                ? (defaultValues?.landlord as any)?.id ||
                  (defaultValues?.landlord as any)
                : defaultValues?.landlord,
            reference: defaultValues?.reference,
            ownerPhone: defaultValues?.ownerPhone || '',
            v2PaymentMethod: defaultValues?.v2PaymentMethod || [],
            v2PaymentStructure: defaultValues?.v2PaymentStructure,
            v2LocationType: defaultValues?.v2LocationType,
            v2InternetService: defaultValues?.v2InternetService || [],
            v2VerifyOwner: defaultValues?.v2VerifyOwner || [],
        },
    })

    const addNewBank = async (data: FormValues) => {
        try {
            setSubmitting(true)
            const bank: Bank = getBlankBank(
                data,
                userId || '',
                location || { lat: 0, lng: 0 },
            )
            bank.version = BankFormVersion.V2
            bank.final_rentCost = data.rentCost || 0
            bank.ownerPhone = data.ownerPhone
            bank.v2PaymentMethod = data.v2PaymentMethod
            bank.v2PaymentStructure = data.v2PaymentStructure
            bank.v2LocationType = data.v2LocationType
            bank.v2InternetService = data.v2InternetService
            bank.v2VerifyOwner = data.v2VerifyOwner
            const docRef = await addDoc(BankDoc, bank)
            const snapshot = await getDoc(docRef)
            if (snapshot.exists()) {
                const docData = snapshot.data()
                reset()
                const newBank = { ...docData, id: docRef.id }
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

    const onSubmitInfo = async (data: FormValues) => {
        setSubmitting(true)
        if (isEdit) {
            nextStep(1, data)
        } else {
            addNewBank(data)
        }
        setTimeout(() => setSubmitting(false), 1000)
    }

    const selectedRegion = watch('id_region')

    return (
        <Form onSubmit={handleSubmit(onSubmitInfo) as any}>
            <div className="flex flex-col gap-6">
                {/* Location Name */}
                <Card bordered>
                    <SectionTitle>{t('bank.bankName')}</SectionTitle>
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

                {/* Location */}
                <Card bordered>
                    <SectionTitle>{t('bank.addresse')}</SectionTitle>
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

                {/* Owner */}
                <Card bordered>
                    <SectionTitle>{t('bank.landlord')}</SectionTitle>
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
                            label={t('bank.ownerPhone')}
                            invalid={!!errors.ownerPhone}
                            errorMessage={errors.ownerPhone?.message}
                        >
                            <Controller
                                name="ownerPhone"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        placeholder={t('bank.ownerPhone')}
                                        {...field}
                                    />
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
                    </div>
                </Card>

                {/* Lease & Payment */}
                <Card bordered>
                    <SectionTitle>{t('bank.rent')}</SectionTitle>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                        <FormItem
                            label={t('bank.paymentMethods.label')}
                            invalid={!!errors.v2PaymentMethod}
                            errorMessage={errors.v2PaymentMethod?.message}
                        >
                            <Controller
                                name="v2PaymentMethod"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox.Group
                                        value={field.value}
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                    >
                                        {paymentMethods.map((obj, key) => (
                                            <Checkbox key={key} value={obj}>
                                                {t(`bank.${obj}`)}
                                            </Checkbox>
                                        ))}
                                    </Checkbox.Group>
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label={t('bank.paymentStructures.label')}
                            invalid={!!errors.v2PaymentStructure}
                            errorMessage={errors.v2PaymentStructure?.message}
                        >
                            <Controller
                                name="v2PaymentStructure"
                                control={control}
                                render={({ field }) => (
                                    <Radio.Group
                                        vertical
                                        value={field.value}
                                        onChange={(value) =>
                                            field.onChange(value)
                                        }
                                    >
                                        {paymentStructures.map((obj, key) => (
                                            <Radio key={key} value={obj}>
                                                {t(`bank.${obj}`)}
                                            </Radio>
                                        ))}
                                    </Radio.Group>
                                )}
                            />
                        </FormItem>
                    </div>
                </Card>

                {/* Type of Rental */}
                <Card bordered>
                    <SectionTitle>{t('bank.locationTypes.label')}</SectionTitle>
                    <FormItem
                        invalid={!!errors.v2LocationType}
                        errorMessage={errors.v2LocationType?.message}
                    >
                        <Controller
                            name="v2LocationType"
                            control={control}
                            render={({ field }) => (
                                <Radio.Group
                                    vertical
                                    value={field.value}
                                    onChange={(value) => field.onChange(value)}
                                >
                                    {locationTypes.map((obj, key) => (
                                        <Radio key={key} value={obj}>
                                            {t(`bank.${obj}`)}
                                        </Radio>
                                    ))}
                                </Radio.Group>
                            )}
                        />
                    </FormItem>
                </Card>

                {/* Internet */}
                <Card bordered>
                    <SectionTitle>
                        {t('bank.internetProviders.label')}
                    </SectionTitle>
                    <FormItem
                        invalid={!!errors.v2InternetService}
                        errorMessage={errors.v2InternetService?.message}
                    >
                        <Controller
                            name="v2InternetService"
                            control={control}
                            render={({ field }) => (
                                <Checkbox.Group
                                    value={field.value}
                                    onChange={(value) => field.onChange(value)}
                                >
                                    {internetProviders.map((obj, key) => (
                                        <Checkbox key={key} value={obj}>
                                            {t(`bank.${obj}`)}
                                        </Checkbox>
                                    ))}
                                </Checkbox.Group>
                            )}
                        />
                    </FormItem>
                </Card>

                {/* Verify Owner */}
                <Card bordered>
                    <SectionTitle>{t('bank.verifyOwners.label')}</SectionTitle>
                    <FormItem
                        invalid={!!errors.v2VerifyOwner}
                        errorMessage={errors.v2VerifyOwner?.message}
                    >
                        <Controller
                            name="v2VerifyOwner"
                            control={control}
                            render={({ field }) => (
                                <Checkbox.Group
                                    vertical
                                    value={field.value}
                                    onChange={(value) => field.onChange(value)}
                                >
                                    {verifyOwners.map((obj, key) => (
                                        <Checkbox key={key} value={obj}>
                                            {t(`bank.${obj}`)}
                                        </Checkbox>
                                    ))}
                                </Checkbox.Group>
                            )}
                        />
                    </FormItem>
                </Card>

                {/* Submit */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        variant="solid"
                        loading={isSubmitting}
                        size="lg"
                    >
                        {t('common.next')}
                    </Button>
                </div>
            </div>
        </Form>
    )
}

export default InfoBankV2
