/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, Select, DatePicker, Form, Input, Button, Checkbox } from '@/components/ui';
import { BankDoc, Landlord } from '@/services/Landlord';
import { useSessionUser } from '@/store/authStore';
import {  Bank, getBlankBank, Proprio } from '@/views/Entity';
import { Regions } from '@/views/Entity/Regions';

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

      const fetchLandlords = async () => {
        try {
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
        } catch (err) {
          console.error("Error fetching landlords:", err);
        }
      };
  
  
      useEffect(() => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setLocation({ lat: latitude, lng: longitude });
            console.log("Location:", { lat: latitude, lng: longitude });
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
          yearCount: defaultValues?.yearCount,
          date: defaultValues?.date,
          rentCost: defaultValues?.rentCost,
          addresse: defaultValues?.addresse,
          id_region: defaultValues?.id_region,
          reference: defaultValues?.reference,
          landlord: (isEdit) ? defaultValues?.landlord.id : defaultValues?.landlord,
          isrefSameAsLandlord: defaultValues?.isrefSameAsLandlord,
          urgency: defaultValues?.urgency,
        },
      });
      const addNewBank = async (data: FormValuesInfo) => {
        try {
          const bank: Bank =  getBlankBank(data, userId || '', location || { lat: 0, lng: 0 });
          const docRef = await addDoc(BankDoc, bank);
          const snapshot = await getDoc(docRef);
          if (snapshot.exists()) {
           const data = snapshot.data();
           reset();
           const newBank = { ...data, id: docRef.id };
           await updateDoc(docRef, {id: docRef.id});
           nextStep(1, newBank);
         } else {
           onError("Document not found");
         }
        } catch (error: any) { onError(error) }
      }


      
      const onSubmitInfo = async (data: FormValuesInfo) => {
        setSubmitting(true)
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
          date: defaultValues?.date,
          rentCost: defaultValues?.rentCost,
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
       <div className="w-full max-w-4xl bg-gray-50 dark:bg-gray-700 rounded p-2 shadow">
        <Form onSubmit={handleSubmit(onSubmitInfo)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem label="Bank Name" invalid={!!errors.bankName} errorMessage={errors.bankName?.message}>
              <Controller name="bankName" control={control} render={({ field }) =>
               <Input {...field} />
            } />
            </FormItem>

            <FormItem label="Région" invalid={!!errors.id_region} errorMessage={errors.id_region?.message}>
              <Controller name="id_region" control={control} render={({ field }) => 
                <Select placeholder="Please Select" options={Regions}  value={Regions.find(option => Number(option.value) === Number(field.value)) || null}
                    onChange={(option) => { 
                      setTypeOptions(convertStringToSelectOptions(option?.cities || []));
                      field.onChange(Number(option?.value));
                    } } /> 
                } />
            </FormItem>

            {selectedRegion && ( <FormItem label="Ville" invalid={!!errors.city} errorMessage={errors.city?.message}>
              <Controller name="city" control={control} render={({ field }) => 
                <Select placeholder="Please Select" options={typeOptions}  value={typeOptions.find(option => option.value === field.value) || null}
                    onChange={(option) => field.onChange(option?.value)} /> 
                } />
            </FormItem>)}

            <FormItem label="Details de l'adresse" invalid={!!errors.addresse} errorMessage={errors.addresse?.message}>
              <Controller name="addresse" control={control} render={({ field }) =>
               <Input {...field} />
            } />
            </FormItem>

            <FormItem label="Proprietaire" invalid={!!errors.landlord} errorMessage={errors.landlord?.message as string}>
              <Controller name="landlord" control={control} render={({ field }) => 
                <Select placeholder="Please Select" options={landlordsOptions} 
                 value={refsOptions.find(option => {
                   console.log("Selected option:", option.value, field.value);
                   console.log("Selected Field:", field.value);
                  return option.value == field.value;
                 }) || null}
                 onChange={(option) => field.onChange(option?.value)}
                  /> 
                } />
            </FormItem>

            <FormItem label="Réference" invalid={!!errors.reference} errorMessage={errors.reference?.message}>
              <Controller name="reference" control={control} render={({ field }) => 
                <Input {...field} />
                } />
            </FormItem>

            <FormItem label="Nombre d'année" invalid={!!errors.yearCount} errorMessage={errors.yearCount?.message}>
              <Controller name="yearCount" control={control} render={({ field }) => 
                <Input type="number" {...field}
                     onChange={(e) => field.onChange(Number(e.target.value))}
                 />}
                 />
            </FormItem>

            <FormItem label="Prix du loyer" invalid={!!errors.rentCost} errorMessage={errors.rentCost?.message}>
              <Controller name="rentCost" control={control} render={({ field }) =>
                 <Input type="number" prefix="HTG" suffix=".00" {...field} 
                    onChange={(e) => field.onChange(Number(e.target.value))}
               />
                 } />
            </FormItem>

            <FormItem label="Date debut du bail" invalid={!!errors.date} errorMessage={errors.date?.message}>
              <Controller name="date" control={control} render={({ field }) =>
                 <DatePicker 
                   placeholder="Choisissez une date" 
                   value={field.value ? new Date(field.value) : null}
                   onChange={(date) => field.onChange(date ? date.toISOString() : "")} 
                 />
                 } />
            </FormItem>

            <FormItem label="Est-ce que c'est urgent?" invalid={!!errors.urgency} errorMessage={errors.urgency?.message}>
              <Controller
                name="urgency"
                control={control}
                render={({ field }) => (
                <Checkbox   checked={field.value} {...field}>
                </Checkbox>
                )}
              />
            </FormItem>

            {/* More fields follow the same structure — Add as needed */}

          </div>

          <div className="mt-6">
            <Button type="submit" variant="solid">{ isEdit ? "Modifier" : 'Suivant' }</Button>
          </div>
        </Form>
      </div>

    </>
  )
}

export default InfoBank