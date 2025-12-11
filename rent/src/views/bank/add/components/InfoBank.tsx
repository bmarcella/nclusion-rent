/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, Select, DatePicker, Form, Input, Button, Checkbox } from '@/components/ui';
import { manageAuth } from '@/constants/roles.constant';
import { BankDoc, Landlord } from '@/services/Landlord';
import { useSessionUser } from '@/store/authStore';
import { useTranslation } from '@/utils/hooks/useTranslation';
import {  Bank, getBlankBank, Proprio } from '@/views/Entity';
import { Regions } from '@/views/Entity/Regions';
import AddProprioPopup from '@/views/proprio/add/AddProprioPopup';
import { zodResolver } from '@hookform/resolvers/zod';
import { query, where, getDocs, addDoc, getDoc, updateDoc } from 'firebase/firestore';
import {  useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z, ZodType } from 'zod';

export const convertToSelectOptions = (items: Proprio[]) => {
  return items.map((obj) => ({
    value: obj.id,
    label: obj.fullName,
  }))
}

export const convertStringToSelectOptions = (items: string[], t : any = undefined,  key: string = '') => {
  return items.map((obj) => ({
    value: obj,
    label: t ? t(`${key}.${obj}`) : obj,
  }))
}

const schema: ZodType<Partial<Bank>>  = z.object({
  bankName: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  yearCount: z.number().min(1, "Required").max(10, "Max 10 years"),
  date: z.string(),
  rentCost: z.number(),
  final_rentCost: z.number().optional(),
  superficie: z.number().optional(),
  nombre_chambre: z.number().optional(),
  addresse: z.string().optional(),
  id_region: z.number().min(1, "Required"),
  reference: z.string().optional(),
  landlord: z.string(),
  isrefSameAsLandlord: z.boolean(),
  urgency: z.boolean(),
})
export type FormValuesInfo = z.infer<typeof schema>;

interface FormProps {
  nextStep: (step: number,data: any) => void,
  onError: (data: any) => void,
  defaultValues?: Partial<FormValuesInfo>;
  isEdit?: boolean,
  userId? : string
}

function InfoBank({ nextStep, onError, defaultValues, isEdit = false, userId } : FormProps) {
    const [data, setData] = useState<Proprio[]>([]);
    const [landlordsOptions, setLandlordsOptions] = useState<any  []>([]);
    const [refsOptions, setRefsOptions] = useState<any  []>([]);
    const [typeOptions, setTypeOptions] = useState<any  []>(Regions[0].cities);
    const [isSubmitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(false)
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [ regions, setRegions] = useState([]) as any;
    const [hideReg, setHideReg] = useState(false);
    const { authority, proprio } = useSessionUser((state) => state.user);
    const [ploading, setPloading] = useState(false);
    const { t } = useTranslation();
    const fetchLandlords = async () => {
        
        try {
          setPloading(true);
          setLoading(true);
          const q = query(
            Landlord,
            where("type_person", "==", "proprietaire")
          );
          const snapshot = await getDocs(q);
          const landlords: Proprio[] = [];
  
          snapshot.forEach((doc) => {
            const data = doc.data() as Proprio;
            data.id = doc.id;
            landlords.push(data);
          });
          const persons = await convertToSelectOptions(landlords);
          setLandlordsOptions(persons);
          setRefsOptions(persons);
          setData(landlords);
          setLoading(false);
          setPloading(false);
        } catch (err) {
          console.error("Error fetching landlords:", err);
          setLoading(false);
          setPloading(false);
        }
      };
  
      const addNewProprio = async (new_data: Proprio) => {
          await fetchLandlords();
          setValue("landlord", new_data.id);
      }

      useEffect(() => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });
          },
          (err) => {
            onError(`Error: ${err.message}`);
          }
        );
        if (landlordsOptions.length === 0) {
           fetchLandlords();
        }
        if (isEdit){
          const region = Regions.find(option => Number(option.value) === Number(defaultValues?.id_region)) || null;
          if (region) {
            setTypeOptions(convertStringToSelectOptions(region.cities || []));
          }
        }
      } , []);

      useEffect(() => {
            if (!authority || authority.length === 0) return;
            const auth = authority[0];
            const manage = async () => {
            const { regions  } = await manageAuth(auth, proprio, t);
            setRegions(regions); // setRegions first
            if (regions.length === 1) {
              setValue("id_region", regions[0].value); // safe to call here
              setTypeOptions(convertStringToSelectOptions(regions[0].cities || []));
              setHideReg(true);
            }
            };
            manage();
          }, [authority]);
      
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
          landlord: (isEdit) ? (defaultValues?.landlord?.id ) ? defaultValues?.landlord.id : undefined : defaultValues?.landlord,
          isrefSameAsLandlord: defaultValues?.isrefSameAsLandlord,
          urgency: defaultValues?.urgency,
        },
      });
      const addNewBank = async (data: FormValuesInfo) => {
        try {
          setSubmitting(true)
          const bank: Bank =  getBlankBank(data, userId || '', location || { lat: 0, lng: 0 });
          bank.final_rentCost = data.rentCost || 0;
          const docRef = await addDoc(BankDoc, bank);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
           const data = snapshot.data();
           reset();
           const newBank = { ...data, id: docRef.id };
           await updateDoc(docRef, {id: docRef.id});
           nextStep(1, newBank);
           setSubmitting(false)
         } else {
          setTimeout(() => setSubmitting(false), 1000)
           onError("Document not found");
         }
        } catch (error: any) { 
          onError(error);
          setTimeout(() => setSubmitting(false), 1000)}
      }


      
      const onSubmitInfo = async (data: FormValuesInfo) => {
        setSubmitting(true);
        
        setValue("bank", data);
          if (isEdit) {
             nextStep(1, data);
           } else {
            addNewBank(data);
          }
        setTimeout(() => setSubmitting(false), 1000) // simulate loading
     };
      

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
          landlord: (isEdit)  ? defaultValues?.landlord?.id as any : defaultValues?.landlord,
          isrefSameAsLandlord: defaultValues?.isrefSameAsLandlord,
          urgency: defaultValues?.urgency,
      });
    }, [defaultValues, reset]);
    
    const selectedRegion = watch('id_region'); 
  return (
    <>
 <div className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
  <Form onSubmit={handleSubmit(onSubmitInfo)}>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormItem label={t('bank.bankName')} invalid={!!errors.bankName} errorMessage={errors.bankName?.message}>
        <Controller name="bankName" control={control} render={({ field }) =>
          <Input {...field} />
        } />
      </FormItem>

      { !hideReg && <FormItem label={t('bank.id_region')} invalid={!!errors.id_region} errorMessage={errors.id_region?.message}>
        <Controller name="id_region" control={control} render={({ field }) =>
          <Select placeholder="Please Select" options={regions}
            value={regions.find(option => Number(option.value) === Number(field.value)) || null}
            onChange={(option) => {
              setTypeOptions(convertStringToSelectOptions(option?.cities || []));
              field.onChange(Number(option?.value));
            }} />
        } />
      </FormItem> }

      {selectedRegion && (
        <FormItem label={t('bank.city')} invalid={!!errors.city} errorMessage={errors.city?.message}>
          <Controller name="city" control={control} render={({ field }) =>
            <Select placeholder="Please Select" options={typeOptions}
              value={typeOptions.find(option => option.value === field.value) || null}
              onChange={(option) => field.onChange(option?.value)} />
          } />
        </FormItem>
      )}

      <FormItem label={t('bank.addresse')} invalid={!!errors.addresse} errorMessage={errors.addresse?.message}>
        <Controller name="addresse" control={control} render={({ field }) =>
          <Input {...field} />
        } />
      </FormItem>

      <FormItem
      className="w-full"
      label={t('bank.landlord')}
      invalid={!!errors.landlord}
      errorMessage={errors.landlord?.message as string}
      >
      <Controller
        name="landlord"
        control={control}
        render={({ field }) => {
          return (
            <div className="flex items-center gap-2">
              <Select
                isLoading={ploading}
                className='w-full'
                placeholder="Please Select"
                options={landlordsOptions}
                value={refsOptions.find(option => option.value == field.value) || null}
                onChange={(option) => field.onChange(option?.value)}
              />
              <AddProprioPopup done={addNewProprio} />
            </div>
          );
        }}
      />
      </FormItem>

           
 

     


      <FormItem label={t('bank.reference')} invalid={!!errors.reference} errorMessage={errors.reference?.message}>
        <Controller name="reference" control={control} render={({ field }) =>
          <Input {...field} />
        } />
      </FormItem>

      <FormItem label={t('bank.yearCount')} invalid={!!errors.yearCount} errorMessage={errors.yearCount?.message}>
        <Controller name="yearCount" control={control} render={({ field }) =>
          <Input type="number" {...field}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        } />
      </FormItem>
      <FormItem label={t('bank.superficie')} invalid={!!errors.superficie} errorMessage={errors.superficie?.message}>
        <Controller name="superficie" control={control} render={({ field }) =>
          <Input type="number" {...field}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        } />
      </FormItem>
      <FormItem label={t('bank.nombre_chambre')} invalid={!!errors.nombre_chambre} errorMessage={errors.nombre_chambre?.message}>
        <Controller name="nombre_chambre" control={control} render={({ field }) =>
          <Input type="number" {...field}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        } />
      </FormItem>

      <FormItem label={t('bank.rentCost')} invalid={!!errors.rentCost} errorMessage={errors.rentCost?.message}>
        <Controller name="rentCost" control={control} render={({ field }) =>
          <Input type="number" prefix="HTG" suffix=".00" {...field}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        } />
      </FormItem>

    {  isEdit && <FormItem label={t('bank.final_rentCost')} invalid={!!errors.final_rentCost} errorMessage={errors.final_rentCost?.message}>
        <Controller name="final_rentCost" control={control} render={({ field }) =>
          <Input type="number" prefix="HTG" suffix=".00" {...field}
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
        } />
      </FormItem> }

      <FormItem label={t('bank.date')} invalid={!!errors.date} errorMessage={errors.date?.message}>
        <Controller name="date" control={control} render={({ field }) =>
          <DatePicker
            placeholder="Choisissez une date"
            value={field.value ? new Date(field.value) : null}
            onChange={(date) => field.onChange(date ? date.toISOString() : "")}
          />
        } />
      </FormItem>

      <FormItem label={t('bank.urgency')} invalid={!!errors.urgency} errorMessage={errors.urgency?.message}>
        <Controller
          name="urgency"
          control={control}
          render={({ field }) => (
            <Checkbox checked={field.value} {...field}>
            </Checkbox>
          )}
        />
      </FormItem>

      {/* More fields follow the same structure — Add as needed */}
    </div>

    <div className="mt-6">
      <Button type="submit" variant="solid"
       loading={isSubmitting}
      >{isEdit ? t('common.update') : t('common.next')}</Button>
    </div>
  </Form>
</div>


    </>
  )
}

export default InfoBank