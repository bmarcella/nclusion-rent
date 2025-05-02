import { Proprio } from '@/views/demo/Entity';
import  { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@/components/ui/Button'
import { Form, FormItem } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { updateDoc } from 'firebase/firestore'
import { getLandlordDoc } from '@/services/Landlord'
import Alert from '@/components/ui/Alert'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useSessionUser } from '@/store/authStore'
import { useTranslation } from '@/utils/hooks/useTranslation'
import Select from '@/components/ui/Select';
import { convertStringToSelectOptions } from '@/views/bank/add/components/InfoBank';
import { HaitiCities } from '@/services/HaitiCities';


interface Props {
    onChange: (payload: any) => void;
    lord: Proprio,
}

export const personSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  nickName: z.string().optional(),
  companyName: z.string().optional(),
  nif: z.string().min(1, 'NIF is required'),
  cin: z.string().min(1, 'CIN is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  phone_b: z.string().optional(),
  website: z.string().optional(),
  city: z.string().optional(),
})

type ProprioFormValues = z.infer<typeof personSchema>

function EntEntForm( { lord , onChange} : Props) {
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useTimeOutMessage()
  const { userId } = useSessionUser((state) => state.user);
  const { t } = useTranslation();
   
  const [alert, setAlert] = useState("success") as any;
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ProprioFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: {
        fullName: lord?.fullName || '',
        nickName: lord?.nickName || '',
        companyName: lord?.companyName || '',
        nif: lord?.nif || '',
        cin: lord?.cin || '',
        address: lord?.address || '',
        city: lord?.city || '',
        phone: lord?.phone || '',
        phone_b: lord?.phone_b || '',
      },
  })

  const onSubmit = async (data: any) => {
    setSubmitting(true)
    try {
        data.updatedBy = userId;
        const landlordRef = getLandlordDoc(lord.id);
        await updateDoc(landlordRef, data);
        onChange(data);
        setMessage("Landlord added successfully");
      } catch (error) {
        console.error("Error adding document: ", error);
        setMessage("Error adding landlord");
        setAlert("danger")
    }
    setTimeout(() => setSubmitting(false), 1000) // simulate loading
  }

 const cityOptions = convertStringToSelectOptions(HaitiCities);
  return (
    <>
      <div className="flex  justify-center ">
      <div className="w-full max-w-2xl bg-gray-50 dark:bg-gray-700 rounded-sm p-6 shadow">
      {message && (
                <Alert showIcon className="mb-4" type={alert}>
                    <span className="break-all">{message}</span>
                </Alert>
            )}
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormItem label="Full Name" invalid={!!errors.fullName} errorMessage={errors.fullName?.message}>
                 <Controller name="fullName" control={control} render={({ field }) => <Input placeholder="Full Name" {...field} />} />
                </FormItem>
                <FormItem label="Nickname" invalid={!!errors.nickName} errorMessage={errors.nickName?.message}>
                <Controller name="nickName" control={control} render={({ field }) => <Input placeholder="Nickname" {...field} />} />
                </FormItem>
                <FormItem label="Company Name" invalid={!!errors.companyName} errorMessage={errors.companyName?.message}>
                <Controller name="companyName" control={control} render={({ field }) => <Input placeholder="Company Name" {...field} />} />
                </FormItem>
                <FormItem label="NIF" invalid={!!errors.nif} errorMessage={errors.nif?.message}>
                   <Controller name="nif" control={control} render={({ field }) => <Input placeholder="NIF" {...field} />} />
                </FormItem>
                <FormItem label="CIN" invalid={!!errors.cin} errorMessage={errors.cin?.message}>
                  <Controller name="cin" control={control} render={({ field }) => <Input placeholder="CIN" {...field} />} />
                </FormItem>
                <FormItem label="Ville" invalid={!!errors.city} errorMessage={errors.city?.message}>
                  <Controller name="city" control={control} render={({ field }) => 
                    <Select placeholder="Please Select" options={cityOptions}  value={cityOptions.find(option => option.value === field.value) || null}
                        onChange={(option) => field.onChange(option?.value)} /> 
                    } />
                </FormItem>
                <FormItem label="Address" invalid={!!errors.address} errorMessage={errors.address?.message}>
                  <Controller name="address" control={control} render={({ field }) => <Input placeholder="Address" {...field} />} />
                </FormItem>
                <FormItem label="Phone" invalid={!!errors.phone} errorMessage={errors.phone?.message}>
                  <Controller name="phone" control={control} render={({ field }) => <Input placeholder="Phone" {...field} />} />
                </FormItem>
                <FormItem label="Phone (Backup)" invalid={!!errors.phone_b} errorMessage={errors.phone_b?.message}>
                  <Controller name="phone_b" control={control} render={({ field }) => <Input placeholder="Backup Phone" {...field} />} />
                </FormItem>
            </div>
            <div className="mt-6">
            <Button block loading={isSubmitting} type="submit" variant="solid">
              {isSubmitting ? 'Sauvegarde encours...' :  'Modifier' }
            </Button>
            </div>
          </Form>

           
    
        </div>
      </div>
    </>
  )
}

export default EntEntForm
