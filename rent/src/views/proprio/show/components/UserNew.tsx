/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Proprio } from '@/views/demo/Entity';
import  { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z, ZodType } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Button from '@/components/ui/Button'
import { Form, FormItem } from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import {  updateDoc } from 'firebase/firestore'
import Alert from '@/components/ui/Alert'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useSessionUser } from '@/store/authStore'
import { useTranslation } from '@/utils/hooks/useTranslation'
import { useAuth } from '@/auth';
import { AuthResult } from '@/@types/auth';
import { getLandlordDoc } from '@/services/Landlord';


interface Props {
    onChange: (payload: any) => void;
    lord: Proprio,
}


type SignUpFormSchema = {
    fullName: string
    password: string
    email: string
    confirmPassword: string
}

const validationSchema: ZodType<SignUpFormSchema> = z
    .object({
        fullName: z.string({ required_error: 'Please enter your firstname' }),
        email: z.string({ required_error: 'Please enter your email' }),
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

function UserNew ( { lord , onChange } : Props) {
  const [isSubmitting, setSubmitting] = useState(false);
  const [message, setMessage] = useTimeOutMessage()
  const { userId } = useSessionUser((state) => state.user);
  const { t } = useTranslation();
  const [alert, setAlert] = useState("success") as any;
  const { signUpInside } = useAuth();
  const {
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<ProprioFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
        fullName: lord.fullName,
        email: lord.email,
        password: '',
    }
  })

  const onSignUp = async (values: SignUpFormSchema) : AuthResult => {
       const { fullName, password, email } = values
        const result = await signUpInside({ fullName,  password, email }, lord.type_person)
        if (result?.status === 'failed') { 
            setMessage(result.message);
            setAlert("danger")
        } else {
            setAlert("success");
            setMessage("Entity added successfully");
        }
        return result;
   }
  const onSubmit = async (data: any) => {
        if (isSubmitting) { return;}
        setSubmitting(true);
        try {
               const result =  await onSignUp(data);
               const payload = {
                 updatedBy : userId,
                 id_user: result.data.userId,              
                 email: result.data.email,
               };
               const landlordRef = getLandlordDoc(lord.id);
               await updateDoc(landlordRef, payload);
               onChange(payload);
               reset();
               setAlert("success");
               setMessage("Entity added successfully");
      } catch (error) {
        console.error("Error adding document: ", error);
        setMessage("Error adding landlord");
        setAlert("danger")
    }
    setTimeout(() => setSubmitting(false), 1000) // simulate loading
  }
  return (
    <>

         {message && (
                <Alert showIcon className="mb-4" type={alert}>
                    <span className="break-all">{message}</span>
                </Alert>
            )}
           
      <div className=" flex  justify-center ">
          <Form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
               <FormItem
                    label="Email"
                    invalid={Boolean(errors.email)}
                    errorMessage={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                type="email"
                                placeholder="Email"
                                autoComplete="off"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
            </div>
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
                                placeholder="Password"
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
                                placeholder="Confirm Password"
                                {...field}
                            />
                        )}
                    />
                </FormItem>
            </div>
            <div className="mt-6">
            <Button block loading={isSubmitting} type="submit" variant="solid">
              {isSubmitting ? 'Sauvegarde encours...' :  'Configurer utilisateur' }
            </Button>
            </div>
          </Form>
      </div>
    </>
  )
}

export default UserNew
