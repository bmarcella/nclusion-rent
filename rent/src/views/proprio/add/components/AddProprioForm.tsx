/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import  { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@/components/ui/Button'
import { Form, FormItem } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import Steps from '@/components/ui/Steps'
import { addDoc, updateDoc } from 'firebase/firestore'
import { Landlord } from '@/services/Landlord'
import Alert from '@/components/ui/Alert'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import Select from '@/components/ui/Select'
import { manageAuth } from '@/constants/roles.constant'
import { convertStringToSelectOptions } from '@/views/bank/add/components/InfoBank'
import ImageLandlord from '@/views/bank/add/components/ImageLandlord'
import { useSessionUser } from '@/store/authStore'
import EndBank from '@/views/bank/add/components/EndBank'
import { useTranslation } from '@/utils/hooks/useTranslation'
import { HaitiCities } from '@/services/HaitiCities'
import { ProprioSchema } from '@/views/shared/schema'
// Zod Schema


type ProprioFormValues = z.infer<typeof ProprioSchema>
interface Props {
   done?: (data: any) => void;
}
function AddProprioForm( { done } : Props) {
  const [isSubmitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(0);
  const [ docRef, setDocRef] = useState() as any;
  const [lord, setLord] = useState() as any;
  const [message, setMessage] = useTimeOutMessage()
  const { t } = useTranslation();
  const [alert, setAlert] = useState("success") as any;
  const [ typeOptions, setTypeOptions] = useState([]) as any;
  const [ regions, setRegions] = useState([]) as any;
  const [hideReg, setHideReg] = useState(false);
  const { userId, authority, proprio } = useSessionUser((state) => state.user);
  const {
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<ProprioFormValues>({
    resolver: zodResolver(ProprioSchema),
    defaultValues: {
      id: '',
      fullName: '',
      nickName: '',
      city: '',
      companyName: '',
      type_person: "proprietaire",
      nif: '',
      cin: '',
      address: '',
      phone: '',
      phone_b: '',
      regions: [],
    },
  })

 

  useEffect(() => {
    if (!authority || authority.length === 0) return;
    const auth = authority[0];
    const manage = async () => {
    const { regions , roles } = await manageAuth(auth, proprio, t);
     setRegions(regions); // setRegions first
     if (regions.length === 1) {
       setValue("regions", [regions[0].value]); // safe to call here
       setHideReg(true);
     }
     setTypeOptions(roles);
    };
    manage();
  }, [authority]);

  const onSubmit = async (data: any) => {
    setSubmitting(true)
    try {
        data.createBy = userId;
        data.uploadedAt = new Date();
        data.active = true;
        data.createdAt = new Date();
        const docRef = await addDoc(Landlord, data);
        reset();
        setStep(1);
        await updateDoc(docRef, {id: docRef.id});
        data.id = docRef.id;
        setDocRef(docRef);
        setLord(data);
        if(done) done(data);
        console.log("Document written with ID: ", docRef.id);
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
      <Steps current={step}>
        <Steps.Item title={"Ajouter "+ ( !done? "entité" : "proprietaire")} />
      </Steps>

      <div className="flex w-full justify-center ">
      <div className="bg-gray-50 dark:bg-gray-700 rounded-sm p-6 shadow">
      {message && (
                <Alert showIcon className="mb-4" type={alert}>
                    <span className="break-all">{message}</span>
                </Alert>
            )}
           
            { step === 0 && (
             <>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              { !done && typeOptions.length > 0 && <FormItem label={ t('roles.label')} invalid={!!errors.type_person} errorMessage={errors.type_person?.message}>
                 <Controller name="type_person" control={control} render={({ field }) =>
                     <Select placeholder="Please Select" options={typeOptions}  value={typeOptions.find(option => option.value === field.value) || null}
                      onChange={(option) => field.onChange(option?.value)} /> 
                 } 
                 />
               </FormItem> }
                { !hideReg && <FormItem label="Région" invalid={!!errors.regions} errorMessage={errors.regions?.message}>
                              <Controller name="regions" control={control} render={({ field }) => 
                                <Select isMulti placeholder="Please Select" 
                                    options={regions}    
                                    onChange={(option) => { 
                                      field.onChange(option.map((opt: any) => opt.value));
                                    } } /> 
                                } />
                </FormItem> }
               
                <FormItem label="Nom complet" invalid={!!errors.fullName} errorMessage={errors.fullName?.message}>
                 <Controller name="fullName" control={control} render={({ field }) => <Input placeholder="Full Name" {...field} />} />
                </FormItem>
                <FormItem label="Nickname" invalid={!!errors.nickName} errorMessage={errors.nickName?.message}>
                <Controller name="nickName" control={control} render={({ field }) => <Input placeholder="Nickname" {...field} />} />
                </FormItem>
                <FormItem label="Entreprise" invalid={!!errors.companyName} errorMessage={errors.companyName?.message}>
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
                <FormItem label="Addresse" invalid={!!errors.address} errorMessage={errors.address?.message}>
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
              {isSubmitting ? 'Sauvegarde encours...' :  'Suivant' }
            </Button>
            </div>
          </Form>

            </>
          )}
        {step === 1 && (
            <div className="text-gray-700 dark:text-white">
             { lord && <ImageLandlord nextStep={ () => {
              
                 if(!done) {
                   setStep(2);
                  }
                  
              }} lordId={lord.id}  isEdit={true} userId={userId || ""} /> }
            </div>
        )}

       {step === 2 && (
            <div className="text-gray-700 dark:text-white">
             <EndBank message={t("entity.submitSuccess")} btnText="Nouvelle entité" onRestart={(): void => {
                setStep(0);
                setDocRef(null);
                reset();
                setLord(null);
              } } ></EndBank>
            </div>
        )}

        </div>
      </div>
    </>
  )
}

export default AddProprioForm
