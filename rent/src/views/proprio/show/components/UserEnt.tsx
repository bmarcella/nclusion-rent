/* eslint-disable @typescript-eslint/no-explicit-any */
import { Proprio } from '@/views/Entity';
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
import UserNew from './UserNew';
import Switcher from '@/components/ui/Switcher';
import { updateUserPassword } from '@/services/AuthService';



interface Props {
    onChange: (payload: any) => void;
    lord: Proprio,
}



const validationSchema  = z
    .object({
        password: z.string({ required_error: 'Password Required' }),
        confirmPassword: z.string({
            required_error: 'Confirm Password Required',
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Password not match',
        path: ['confirmPassword'],
    })

type ProprioFormValues = z.infer<typeof validationSchema>

function UserEnt( { onChange , lord } : Props) {
  const [isSubmitting, setSubmitting] = useState(false);
  const [active, setActive] = useState(lord.active);
  const [message, setMessage] = useTimeOutMessage()
  const { t } = useTranslation();
  const { userId, authority } = useSessionUser((state) => state.user);
  const isAdmin = authority && authority[0] == "admin" ;
  const [alert, setAlert] = useState("success") as any;
  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ProprioFormValues>({
    resolver: zodResolver(validationSchema)
  })

  const onSubmit = async (data: any) => {
    setSubmitting(true)
    if (!lord.id_user) {
        setMessage("Please create a user account first")
        setAlert("danger")
        setSubmitting(false)
        return
    }
    try {
        await updateUserPassword(lord.id_user, data.password);
        reset();
        setMessage("User password updated successfully");
        setAlert("success");
      } catch (error) {
        console.error("Error adding document ", error);
        setMessage("User password updated failed");
        setAlert("danger")
    }
    setTimeout(() => setSubmitting(false), 1000) // simulate loading
  }

   const toggleActive = async (data: any) => {
      try {
          data.updatedBy = userId;
          const landlordRef = getLandlordDoc(lord.id);
          await updateDoc(landlordRef, data);
          setActive(data.active);
          onChange(data);
          setMessage("Entity updated successfully");
        } catch (error) {
          console.error("Error adding document: ", error);
          setMessage("Error adding landlord");
          setAlert("danger")
      }
    }


  return (
    <>
      <div className=" flex justify-center ">
      <div className="w-full max-w-2xl mt-6 bg-gray-50 dark:bg-gray-700 rounded-sm p-6 shadow">

      { message && (
                <Alert showIcon className="mb-4" type={alert}>
                    <span className="break-all">{message}</span>
                </Alert>
        )}

   { (isAdmin || (lord.id_user != userId && lord.createBy == userId)) && <div className="rounded-sm pt-6 ">
            <h6 className='mb-4'>Compte activation</h6>
            <div className="mb-4">
                      <Switcher defaultChecked={lord.active} switcherClass={ active ? "bg-green-500" : "bg-red-500" } onChange={(e)=> {
                        console.log("checked", e)
                        toggleActive({  active: e })
                      }} />
            </div> 
      </div> }
     { lord.id_user &&  <>
          <h6 className='mb-4'>Mot de passe</h6>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormItem
                    label="Mot de passe"
                    invalid={Boolean(errors.password)}
                    errorMessage={errors.password?.message}
                >
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder="Mot de passe"
                                {...field}
                            />
                        )}
                    />
            </FormItem>
             <FormItem
                    label="Mot de passe de confirmation"
                    invalid={Boolean(errors.confirmPassword)}
                    errorMessage={errors.confirmPassword?.message}
                >
                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="password"
                                autoComplete="off"
                                placeholder="Mot de passe de confirmation"
                                {...field}
                            />
                        )}
                    />
             </FormItem>
            </div>
            <div className="mt-6">
            <Button block loading={isSubmitting} type="submit" variant="solid">
              {isSubmitting ? 'Sauvegarde encours...' :  'Modifier' }
            </Button>
            </div>
          </Form>
       </> }
         { !lord.id_user && <> 
           <UserNew lord={lord} onChange={ (data) => {
              onChange(data);
            }
            } ></UserNew>
        </>}
        </div>
      </div>
    </>
  )
}

export default UserEnt
