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
    limit,
    doc,
} from 'firebase/firestore'
import AsyncSelect from 'react-select/async'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { HiChevronDown, HiRefresh, HiEye, HiMap } from 'react-icons/hi'
import GoogleMapApp, { useStreetViewAvailable } from '@/views/bank/show/Map'
import { useJsApiLoader } from '@react-google-maps/api'
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

export const loadLandlordOptions = async (inputValue: string, new_options:  { value: string; label: string }[]=[]) => {
    try {
        const search = inputValue.toLowerCase().trim()
        console.log('loadLandlordOptions input:', inputValue, 'normalized:', search)

        let q
        if (search) {
            q = query(
                Landlord,
                where('type_person', '==', 'proprietaire'),
                where('fullName_lower', '>=', search),
                where('fullName_lower', '<=', search + '\uf8ff'),
                limit(20),
            )
        } else {
            q = query(
                Landlord,
                where('type_person', '==', 'proprietaire'),
                limit(20),
            )
        }

        const snapshot = await getDocs(q);

        const options: { value: string; label: string }[] = []
        snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Proprio
            options.push({
                value: docSnap.id,
                label: data.fullName,
            })
        })
        
        if(new_options.length==0) return options;
        const merged = [...options, ...new_options]
        const unique = merged.filter(
            (opt, index, arr) =>
                arr.findIndex((x) => x.value === opt.value) === index,
        )
       return unique
    } catch (error) {
        console.error('loadLandlordOptions error:', error)
        return []
    }
}

export const loadSingleLandlord = async (landlordId: string) => {
    const snapshot = await getDoc(doc(Landlord, landlordId))
    if (snapshot.exists()) {
        const data = snapshot.data() as Proprio
        return { value: snapshot.id, label: data.fullName }
    }
    return null
}


// crypto.getRandomValues is limited to 65536 bytes per call — fill in chunks.
const fillRandom = (buf: Uint8Array): Uint8Array => {
    const MAX = 65536
    for (let i = 0; i < buf.length; i += MAX) {
        crypto.getRandomValues(buf.subarray(i, Math.min(i + MAX, buf.length)))
    }
    return buf
}

const round2 = (n: number) => Math.round(n * 100) / 100

export const runSpeedTest = async (
    onProgress?: (phase: 'download' | 'upload') => void,
): Promise<{ download: number; upload: number }> => {
    const DL_WINDOW_MS = 5000
    const DL_PARALLEL = 4
    const DL_CHUNK_BYTES = 50_000_000 // request is large; we abort early via time window
    const UL_WINDOW_MS = 4000
    const UL_PARALLEL = 2
    const UL_CHUNK_BYTES = 2_000_000 // each POST body; we POST repeatedly until the window closes

    // ---------------- Download ----------------
    onProgress?.('download')

    // Warmup so TLS/TCP slow-start doesn't pollute the measurement.
    try {
        const warm = await fetch(
            `https://speed.cloudflare.com/__down?bytes=1000000&cachebust=${Date.now()}`,
        )
        await warm.arrayBuffer()
    } catch {
        /* ignore */
    }

    const dlAbort = new AbortController()
    const dlStart = performance.now()
    let dlBytes = 0

    const dlWorkers = Array.from({ length: DL_PARALLEL }, async () => {
        try {
            const res = await fetch(
                `https://speed.cloudflare.com/__down?bytes=${DL_CHUNK_BYTES}&cachebust=${Date.now()}-${Math.random()}`,
                { signal: dlAbort.signal },
            )
            const reader = res.body?.getReader()
            if (!reader) {
                // Streaming not available — fall back to full-buffer read.
                const buf = await res.arrayBuffer()
                dlBytes += buf.byteLength
                return
            }
            while (performance.now() - dlStart < DL_WINDOW_MS) {
                const { value, done } = await reader.read()
                if (done) break
                if (value) dlBytes += value.byteLength
            }
            try {
                await reader.cancel()
            } catch {
                /* ignore */
            }
        } catch {
            /* aborted or network error */
        }
    })

    const dlTimer = setTimeout(() => dlAbort.abort(), DL_WINDOW_MS + 300)
    await Promise.all(dlWorkers)
    clearTimeout(dlTimer)

    const dlSeconds = Math.max((performance.now() - dlStart) / 1000, 0.001)
    const downloadMbps = round2((dlBytes * 8) / dlSeconds / 1_000_000)

    // ---------------- Upload ----------------
    onProgress?.('upload')

    // Fill with random bytes so the path can't compress zeros on the wire.
    const payload = fillRandom(new Uint8Array(UL_CHUNK_BYTES))

    // Warmup the upload path too.
    try {
        await fetch('https://speed.cloudflare.com/__up', {
            method: 'POST',
            body: fillRandom(new Uint8Array(500_000)) as BodyInit,
        })
    } catch {
        /* ignore */
    }

    const ulAbort = new AbortController()
    const ulStart = performance.now()
    let ulBytes = 0

    const ulWorkers = Array.from({ length: UL_PARALLEL }, async () => {
        while (performance.now() - ulStart < UL_WINDOW_MS) {
            try {
                await fetch('https://speed.cloudflare.com/__up', {
                    method: 'POST',
                    body: payload as BodyInit,
                    signal: ulAbort.signal,
                })
                ulBytes += payload.byteLength
            } catch {
                break
            }
        }
    })

    const ulTimer = setTimeout(() => ulAbort.abort(), UL_WINDOW_MS + 500)
    await Promise.all(ulWorkers)
    clearTimeout(ulTimer)

    const ulSeconds = Math.max((performance.now() - ulStart) / 1000, 0.001)
    const uploadMbps = round2((ulBytes * 8) / ulSeconds / 1_000_000)

    return { download: downloadMbps, upload: uploadMbps }
}

export const getPrecisePosition = (
    targetAccuracy = 10,
    maxTimeoutMs = 30000,
    minDurationMs = 8000,
    stableSamples = 3,
): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'))
            return
        }

        let bestPosition: GeolocationPosition | null = null
        let goodSampleCount = 0
        let settled = false
        const startedAt = Date.now()

        const finish = (
            outcome: 'resolve' | 'reject',
            payload: GeolocationPosition | Error,
        ) => {
            if (settled) return
            settled = true
            navigator.geolocation.clearWatch(watchId)
            clearTimeout(hardTimeout)
            if (outcome === 'resolve') resolve(payload as GeolocationPosition)
            else reject(payload as Error)
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const acc = position.coords.accuracy
                if (!bestPosition || acc < bestPosition.coords.accuracy) {
                    bestPosition = position
                }

                if (acc <= targetAccuracy) {
                    goodSampleCount += 1
                } else {
                    goodSampleCount = 0
                }

                const elapsed = Date.now() - startedAt
                // Only resolve once we've sampled long enough AND have consecutive
                // good readings — first GPS fixes are often optimistic.
                if (
                    goodSampleCount >= stableSamples &&
                    elapsed >= minDurationMs &&
                    bestPosition
                ) {
                    finish('resolve', bestPosition)
                }
            },
            (error) => {
                // Permission denied / unavailable are fatal; transient errors are
                // ignored so the watcher can keep trying until maxTimeoutMs.
                if (
                    error.code === error.PERMISSION_DENIED ||
                    error.code === error.POSITION_UNAVAILABLE
                ) {
                    finish('reject', error)
                }
            },
            {
                enableHighAccuracy: true,
                timeout: maxTimeoutMs,
                maximumAge: 0,
            },
        )

        const hardTimeout = setTimeout(() => {
            if (bestPosition) finish('resolve', bestPosition)
            else finish('reject', new Error('Could not get location'))
        }, maxTimeoutMs)
    })
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
    const [tilt3d, setTilt3d] = useState(false)
    const { isLoaded: mapsLoaded } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_APIKEY,
        mapIds: [import.meta.env.VITE_GOOGLE_MAP_ID],
    })
    const streetViewAvailable = useStreetViewAvailable(location, mapsLoaded)


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
        });

        const landlordId = isEdit
            ? defaultValues?.landlord?.id || defaultValues?.landlord
            : defaultValues?.landlord
        if (landlordId && typeof landlordId === 'string') {
            loadSingleLandlord(landlordId).then((opt) => {
                if (opt) setSelectedLandlord(opt)
            })
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

    
    const handleLoadOptions = useCallback(
        (inputValue: string) => loadLandlordOptions(inputValue, extraLandlords),
        [],
    )

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
        if (!location) {
            onError(t('bank.locationRequired') || 'La position GPS est requise')
            setMapOpen(true)
            return
        }
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
                {/* GPS Location Map */}
                <Card bordered>
                    <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setMapOpen(!mapOpen)}
                    >
                        <h6 className="text-gray-900 dark:text-gray-100">
                            {t('bank.location')} {location ? `(${location.lat.toFixed(5)}, ${location.lng.toFixed(5)})` : ''}
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
                                <GoogleMapApp position={location} streetView={streetView} tilt3d={tilt3d} />
                            ) : (
                                <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-700 rounded">
                                    <span className="text-gray-400">
                                        {t('bank.capturingPosition') || 'Capturing position...'}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-end gap-3 mt-3">
                                <label className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                                    <Checkbox
                                        checked={tilt3d}
                                        onChange={(checked) => setTilt3d(checked)}
                                    />
                                    3D
                                </label>
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
                                        <div className="w-full">
                                            <AsyncSelect
                                                key={selectKey}
                                                classNamePrefix="react-select"
                                                placeholder={t('common.select')}
                                                defaultOptions
                                                cacheOptions = {false}
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
