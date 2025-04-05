/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Form, FormItem, Input } from '@/components/ui';
import { bankCommentsDoc } from '@/services/Landlord';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, Timestamp } from 'firebase/firestore';
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
const schema = z.object({
  comment: z.string().optional(),

});

 type FormValuesInfo = z.infer<typeof schema>;

interface Props {
  onSubmitAfter: ( data: any) => void;
  bankId: string;
  isEdit?: boolean;
  userId: string;
  btnText?: string;
}

function AddComment( { onSubmitAfter, bankId, isEdit= false, userId , btnText='Suivant'} : Props) {
    const [loading, setLoading] = useState(false);
    const {
            control,
            reset,
            handleSubmit,
            formState: { errors },
          } = useForm<FormValuesInfo>({
            resolver: zodResolver(schema),
            defaultValues: {
              comment: '',
            },
          });

           const onSubmit = async  (data: FormValuesInfo) => {
            if(!data.comment) { onSubmitAfter(false); return; }
                  setLoading(true)
                  try {
                      const doc = {
                          bankId,
                          text: data.comment || '',
                          createBy: userId,
                          createdAt: Timestamp.now(),
                          uploadedAt: Timestamp.now(),
                          updateBy: userId,
                      }         
                      console.log("Submitted data:", doc)
                      await addDoc(bankCommentsDoc, doc );
                      reset();
                      onSubmitAfter(doc);
                      setTimeout(() => setLoading(false), 1000)
                  } catch (error){
                      console.log("File error:", error);
                      setLoading(false)
                  }
          
              };
    
  return (
    <div>
         <Form onSubmit={handleSubmit(onSubmit)}>
                <FormItem label="Commentaires" invalid={!!errors.comment} errorMessage={errors.comment?.message}>
                 <Controller name="comment" control={control} render={({ field }) =>
                <Input {...field} textArea  />
                } />
                </FormItem>
                <Button type="submit" variant="solid" loading={loading}   >
                        { isEdit? "Ajouter" : btnText }
                </Button>
        </Form>
    </div>
  )
}

export default AddComment