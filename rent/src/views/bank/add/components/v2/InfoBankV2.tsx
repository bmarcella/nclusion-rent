/* eslint-disable react/no-unknown-property */
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
import { BankDoc } from '@/services/Landlord'
import { useSessionUser } from '@/store/authStore'
import { useTranslation } from '@/utils/hooks/useTranslation'
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
    roofTypes,
} from '@/views/Entity'
import { Regions } from '@/views/Entity/Regions'
import AddProprioPopup from '@/views/proprio/add/AddProprioPopup'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDoc, getDoc, updateDoc } from 'firebase/firestore'
import AsyncSelect from 'react-select/async'
import { motion } from 'framer-motion'
import { useEffect, useState, useCallback } from 'react'
import { HiChevronDown, HiRefresh, HiEye, HiMap } from 'react-icons/hi'
import GoogleMapApp, { useStreetViewAvailable } from '@/views/bank/show/Map'
import { useJsApiLoader } from '@react-google-maps/api'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
    convertStringToSelectOptions,
    loadLandlordOptions,
    loadSingleLandlord,
    getPrecisePosition,
    runSpeedTest,
} from '../InfoBank'

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
    internetSpeed: z.object({
        natcom: z.object({
            upload: z.number().optional(),
            download: z.number().optional(),
        }).optional(),
        digicel: z.object({
            upload: z.number().optional(),
            download: z.number().optional(),
        }).optional(),
    }).optional(),
    v2VerifyOwner: z.array(z.enum(verifyOwners)),
    superficie: z.number().optional(),
    nombre_chambre: z.number().optional(),
    v2RoofType: z.enum(roofTypes).optional(),
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
    const [selectedLandlord, setSelectedLandlord] = useState<{
        value: string
        label: string
    } | null>(null)
    const [typeOptions, setTypeOptions] = useState<any[]>(Regions[0].cities)
    const [isSubmitting, setSubmitting] = useState(false)
    const [location, setLocation] = useState<{
        lat: number
        lng: number
    } | null>(null)
    const [regions, setRegions] = useState([]) as any
    const [hideReg, setHideReg] = useState(false)
    const { authority, proprio } = useSessionUser((state) => state.user)
    const { t } = useTranslation()
    const [selectKey, setSelectKey] = useState(0)
    const [extraLandlords, setExtraLandlords] = useState<{ value: string; label: string }[]>([])
    const [mapOpen, setMapOpen] = useState(false)
    const [recapturing, setRecapturing] = useState(false)
    const [streetView, setStreetView] = useState(false)
    const { isLoaded: mapsLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_APIKEY,
        mapIds: [import.meta.env.VITE_GOOGLE_MAP_ID],
    })
    const streetViewAvailable = useStreetViewAvailable(location, mapsLoaded)
    const [speedTesting, setSpeedTesting] = useState<'natcom' | 'digicel' | null>(null)
    const [speedPhase, setSpeedPhase] = useState<'download' | 'upload' | null>(null)

    const addNewProprio = async (newData: Proprio) => {
        const option = {
            value: newData.id,
            label: newData.fullName,
        }
        setValue('landlord', newData.id, { shouldValidate: true })
        setSelectedLandlord(option)
        setExtraLandlords((prev) => [option, ...prev])
        setSelectKey((prev) => prev + 1)
    }

    const recapturePosition = () => {
        setRecapturing(true)
        getPrecisePosition().then((position) => {
            const { latitude, longitude } = position.coords
            setLocation({ lat: latitude, lng: longitude })
            setRecapturing(false)
        }).catch((err) => {
            onError(`Error: ${err.message}`)
            setRecapturing(false)
        })
    }

    useEffect(() => {
        getPrecisePosition().then((position) => {
            const { latitude, longitude } = position.coords
            setLocation({ lat: latitude, lng: longitude })
        }).catch((err) => {
            onError(`Error: ${err.message}`)
        })


        const landlordId = isEdit
            ? (defaultValues?.landlord as any)?.id || defaultValues?.landlord
            : defaultValues?.landlord
        if (landlordId && typeof landlordId === 'string') {
            loadSingleLandlord(landlordId).then((opt) => {
                if (opt) setSelectedLandlord(opt)
            })
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
            internetSpeed: defaultValues?.internetSpeed || {},
            v2VerifyOwner: defaultValues?.v2VerifyOwner || [],
            superficie: Number(defaultValues?.superficie) || undefined,
            nombre_chambre: Number(defaultValues?.nombre_chambre) || undefined,
            v2RoofType: defaultValues?.v2RoofType,
        },
    })

    const handleLoadOptions = useCallback(
        (inputValue: string) => loadLandlordOptions(inputValue, extraLandlords),
        [],
    )

    const handleSpeedTest = async (carrier: 'natcom' | 'digicel') => {
        setSpeedTesting(carrier)
        try {
            const result = await runSpeedTest((phase) => setSpeedPhase(phase))
            const current = watch('internetSpeed') || {}
            setValue('internetSpeed', {
                ...current,
                [carrier]: {
                    download: result.download,
                    upload: result.upload,
                },
            }, { shouldDirty: true })
        } catch (err) {
            onError(t('bank.internetSpeed.error') || 'Speed test failed')
        } finally {
            setSpeedTesting(null)
            setSpeedPhase(null)
        }
    }

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
            bank.internetSpeed = data.internetSpeed
            bank.v2VerifyOwner = data.v2VerifyOwner
            bank.superficie = data.superficie
            bank.nombre_chambre = data.nombre_chambre
            bank.v2RoofType = data.v2RoofType
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
        if (!location) {
            onError(t('bank.locationRequired') || 'La position GPS est requise')
            setMapOpen(true)
            return
        }
        setSubmitting(true)
        if (isEdit) {
            nextStep(1, data)
        } else {
            addNewBank(data)
        }
        setTimeout(() => setSubmitting(false), 1000)
    }

    const selectedRegion = watch('id_region')
    const selectedProviders = watch('v2InternetService') || []
    const hasNatcom = selectedProviders.includes('internetProviders.natcom')
    const hasDigicel = selectedProviders.includes('internetProviders.digicel')

    return (
        <Form onSubmit={handleSubmit(onSubmitInfo) as any}>
            <div className="flex flex-col gap-6">
                {/* GPS Location Map */}
                <Card bordered>
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setMapOpen(!mapOpen)}
                    >
                        <h6  className="text-gray-900 dark:text-gray-100">
                            {t('bank.location')} {'*'} {location ? `(${location.lat.toFixed(5)}, ${location.lng.toFixed(5)})` : ''}
                        </h6>
                        <motion.span
                            animate={{ rotate: mapOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <HiChevronDown className="text-lg" />
                        </motion.span>
                    </div>
                    {mapOpen && (
                        <div className="mt-4">
                            {location ? (
                                <GoogleMapApp position={location} streetView={streetView} />
                            ) : (
                                <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-700 rounded">
                                    <span className="text-gray-400">
                                        {t('bank.capturingPosition') || 'Capturing position...'}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-end gap-2 mt-3">
                                {streetViewAvailable && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="plain"
                                        icon={streetView ? <HiMap /> : <HiEye />}
                                        onClick={() => setStreetView(!streetView)}
                                    >
                                        {streetView
                                            ? (t('bank.mapView') || 'Carte')
                                            : (t('bank.streetView') || 'Street View')}
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="plain"
                                    loading={recapturing}
                                    icon={<HiRefresh />}
                                    onClick={recapturePosition}
                                >
                                    {t('bank.recapturePosition') || 'Recapturer la position'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

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
                                        <div className="w-full">
                                            <AsyncSelect
                                                key={selectKey}
                                                classNamePrefix="react-select"
                                                placeholder={t('common.select')}
                                                defaultOptions
                                                cacheOptions={false}
                                                loadOptions={handleLoadOptions}
                                                value={selectedLandlord}
                                                onChange={(option: any) => {
                                                    field.onChange(option?.value || '')
                                                    setSelectedLandlord(option)
                                                }}
                                            />
                                        </div>
                                        <AddProprioPopup done={addNewProprio} />
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
                                        suffix="m²"
                                        {...field}
                                        value={field.value ?? ''}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ''
                                                    ? undefined
                                                    : Number(e.target.value),
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
                                        value={field.value ?? ''}
                                        onChange={(e) =>
                                            field.onChange(
                                                e.target.value === ''
                                                    ? undefined
                                                    : Number(e.target.value),
                                            )
                                        }
                                    />
                                )}
                            />
                        </FormItem>

                        <FormItem
                            label={t('bank.roof.label')}
                            invalid={!!errors.v2RoofType}
                            errorMessage={errors.v2RoofType?.message}
                        >
                            <Controller
                                name="v2RoofType"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        placeholder={t('common.select')}
                                        options={roofTypes.map((r) => ({
                                            value: r,
                                            label: t(`bank.${r}`),
                                        }))}
                                        value={
                                            field.value
                                                ? {
                                                      value: field.value,
                                                      label: t(
                                                          `bank.${field.value}`,
                                                      ),
                                                  }
                                                : null
                                        }
                                        onChange={(option: any) =>
                                            field.onChange(option?.value)
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

                    {/* Natcom Speed */}
                    {hasNatcom && <div className="mt-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Natcom</h6>
                            <Button
                                type="button"
                                size="xs"
                                variant="solid"
                                loading={speedTesting === 'natcom'}
                                disabled={speedTesting !== null}
                                onClick={() => handleSpeedTest('natcom')}
                            >
                                {speedTesting === 'natcom'
                                    ? (speedPhase === 'download'
                                        ? (t('bank.internetSpeed.testingDownload') || 'Test download...')
                                        : (t('bank.internetSpeed.testingUpload') || 'Test upload...'))
                                    : (t('bank.internetSpeed.runTest') || 'Tester la vitesse')}
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4">
                            <FormItem label="Download">
                                <Controller
                                    name="internetSpeed.natcom.download"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            suffix="Mbps"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ''
                                                        ? undefined
                                                        : Number(e.target.value),
                                                )
                                            }
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem label="Upload">
                                <Controller
                                    name="internetSpeed.natcom.upload"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            suffix="Mbps"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ''
                                                        ? undefined
                                                        : Number(e.target.value),
                                                )
                                            }
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </div>}

                    {/* Digicel Speed */}
                    {hasDigicel && <div className="mt-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Digicel</h6>
                            <Button
                                type="button"
                                size="xs"
                                variant="solid"
                                loading={speedTesting === 'digicel'}
                                disabled={speedTesting !== null}
                                onClick={() => handleSpeedTest('digicel')}
                            >
                                {speedTesting === 'digicel'
                                    ? (speedPhase === 'download'
                                        ? (t('bank.internetSpeed.testingDownload') || 'Test download...')
                                        : (t('bank.internetSpeed.testingUpload') || 'Test upload...'))
                                    : (t('bank.internetSpeed.runTest') || 'Tester la vitesse')}
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4">
                            <FormItem label="Download">
                                <Controller
                                    name="internetSpeed.digicel.download"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            suffix="Mbps"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ''
                                                        ? undefined
                                                        : Number(e.target.value),
                                                )
                                            }
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem label="Upload">
                                <Controller
                                    name="internetSpeed.digicel.upload"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            suffix="Mbps"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) =>
                                                field.onChange(
                                                    e.target.value === ''
                                                        ? undefined
                                                        : Number(e.target.value),
                                                )
                                            }
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    </div>}
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
