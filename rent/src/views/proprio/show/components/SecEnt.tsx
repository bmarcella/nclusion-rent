/* eslint-disable @typescript-eslint/no-explicit-any */
import { Proprio } from '@/views/Entity';
import  { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@/components/ui/Button'
import { Form, FormItem } from '@/components/ui/Form'
import {  updateDoc } from 'firebase/firestore'
import { getLandlordDoc } from '@/services/Landlord'
import Alert from '@/components/ui/Alert'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import Select from '@/components/ui/Select'
import { manageAuth } from '@/constants/roles.constant'
import { useSessionUser } from '@/store/authStore'
import { useTranslation } from '@/utils/hooks/useTranslation'
import { RoleSchema } from '@/views/shared/schema';


interface Props {
    onChange: (payload: any) => void;
    lord: Proprio,
}

 
/* eslint-disable @typescript-eslint/no-explicit-any */
// Zod Schema

type ProprioFormValues = z.infer<typeof RoleSchema>

function SecEnt( { lord , onChange} : Props) {
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useTimeOutMessage()
  const { userId, authority, proprio } = useSessionUser((state) => state.user);
  const { t } = useTranslation();
  const [ typeOptions, setTypeOptions] = useState([]) as any;
  const [ regions, setRegions] = useState([]) as any;
  const [hideReg, setHideReg] = useState(false);
   
  const [alert, setAlert] = useState("success") as any;
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<ProprioFormValues>({
    resolver: zodResolver(RoleSchema),
    defaultValues: {
      type_person: lord.type_person,
      regions: lord.regions,
    },
  })

  const onSubmit = async (data: any) => {
    setSubmitting(true)
    console.log('Renovation Details:', data);
    try {
         data.updatedBy = userId;
         const landlordRef = getLandlordDoc(lord.id);
         await updateDoc(landlordRef, data);
         onChange(data);
         setAlert("success");
         setMessage("Entity added successfully");
      } catch (error) {
        console.error("Error adding document: ", error);
        setMessage("Error adding landlord");
        setAlert("danger")
    }
    setTimeout(() => setSubmitting(false), 1000) // simulate loading
  }

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


  return (
    <>

      <div className=" flex justify-center ">
      <div className="w-full max-w-2xl mt-6 bg-gray-50 dark:bg-gray-700 rounded-sm p-6 shadow">
      {message && (
                <Alert showIcon className="mb-4" type={alert}>
                    <span className="break-all">{message}</span>
                </Alert>
            )}
           
         
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormItem label={ t('roles.label')} invalid={!!errors.type_person} errorMessage={errors.type_person?.message}>
                 <Controller name="type_person" control={control} render={({ field }) =>
                     <Select placeholder="Please Select" options={typeOptions} 
                      value={typeOptions.find(option => option.value === field.value) || null}
                      onChange={(option) => field.onChange(option?.value)} /> 
                 } 
                 />
               </FormItem>
               <FormItem label="Région" invalid={!!errors.regions} errorMessage={errors.regions?.message}>
                  <Controller
                    name="regions"
                    control={control}
                    render={({ field }) => {
                    const selectedOptions = regions.filter(r => field.value?.includes(Number(r.value)));
                      
                      return (
                        <Select
                          isMulti
                          placeholder="Please Select"
                          options={regions}
                          value={selectedOptions}
                          onChange={(option) => {
                            const values = option.map((opt: any) => opt.value);
                            field.onChange(values);
                          }}
                        />
                      );
                    }}
                  />
                </FormItem>
            </div>
                <div className="mt-6">
                <Button  loading={isSubmitting} type="submit" variant="solid">
                  {isSubmitting ? 'Sauvegarde encours...' :  'Modifier' }
                </Button>
                </div>
          </Form>

         



     
       

  
        </div>
      </div>
    </>
  )
}

export default SecEnt
