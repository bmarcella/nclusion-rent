/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Upload from '@/components/ui/Upload'
import Button from '@/components/ui/Button'
import { HiOutlineCloudUpload, HiOutlineInboxIn } from 'react-icons/hi'
import { FcImageFile } from 'react-icons/fc'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage }  from '@/services/firebase/FirebaseStorage'
import { addDoc, CollectionReference, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore'
import { bankCommentsDoc, bankPicturesDoc } from '@/services/Landlord'
import {  useEffect, useState } from 'react';
import { Form, FormItem } from '@/components/ui/Form';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import CommentList, { BankComment } from '../../show/components/CommentList';
import AddComment from './AddComment';
import { useTranslation } from '@/utils/hooks/useTranslation';

const schema = z.object({
  comment: z.string().optional(),
});

export type FormValuesInfo = z.infer<typeof schema>;

interface Props {
  nextStep: (step: number, data: any) => void;
  isEdit?: boolean,
  bankId: string,
  userId: string,
  only?: boolean
}

const CommentsBank = ( { bankId, isEdit = false, nextStep, userId, only=false } : Props) => {
   const [comments, setComments] = useState<any[]>([]);
   const { t } = useTranslation
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

      const onSubmit = async  (data: any) => {
        if(!data.text) { nextStep(7, undefined); return; }
        setLoading(true)
        try {
            nextStep(7, data);
            getBankComments(bankId).then((comments) => {
              setComments(comments);
            });
            setTimeout(() => setLoading(false), 1000)
        } catch (error){
            console.log("File error:", error);
            setLoading(false)
        }

    };

     const getBankComments = async (bankId: string) => {
            const commentsRef = bankCommentsDoc as CollectionReference<BankComment>;
            const q = query(commentsRef, where('bankId', '==', bankId),  orderBy("createdAt", "desc") );
            const querySnapshot = await getDocs(q);
            const comments = querySnapshot.docs.map(doc => {
                const id = doc.id;
                const comBank = {
                    id,
                ...doc.data(),
                } as BankComment;
                comBank.id = id;
                return comBank;
            });
            return comments; 
          };
    
        useEffect(() => {
            getBankComments(bankId).then((comments) => {
                console.log("Bank comments: ", comments);
                setComments(comments);
            });
        }, [bankId]);
    return (
        <div>
          <div className='w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow'>

          { !only && <AddComment onSubmitAfter={onSubmit} bankId={bankId} userId={userId} /> }
            <div className="mt-6">
               <CommentList  userId={userId} comments={comments} />
            </div>
          </div>
        
        </div>
    )
}

export default CommentsBank;
