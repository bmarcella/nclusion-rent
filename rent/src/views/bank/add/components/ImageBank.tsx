/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Upload from '@/components/ui/Upload'
import Button from '@/components/ui/Button'
import { HiOutlineCloudUpload, HiOutlineInboxIn } from 'react-icons/hi'
import { FcImageFile } from 'react-icons/fc'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage }  from '@/services/firebase/FirebaseStorage'
import { addDoc, CollectionReference, deleteDoc, getDocs, query, Timestamp, where } from 'firebase/firestore'
import { bankPicturesDoc, getBankPictureRef } from '@/services/Landlord'
import {  useEffect, useState } from 'react';
import ImageGallery, { BankImage } from '../../show/components/ImageGallery';
import { deleteImageFromStorage, getBankImages, uploadImageToStorage } from '@/services/firebase/BankService';
import useTranslation from '@/utils/hooks/useTranslation';

interface Props {
  nextStep: (step: number, data: any) => void;
  isEdit?: boolean,
  bankId: string,
  userId? : string
}

const UploadImgBank = ( { bankId, isEdit = false, nextStep, userId } : Props) => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [docFiles, setDocFiles] = useState<any[]>([])
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<any[]>([]);
    const { t } = useTranslation();
    const handleFileChange = (newFiles: File[], previousFiles: File[]) => {
      setUploadedFiles(newFiles);
    }
  
    const handleFileRemove = (remainingFiles: File[]) => {
      setUploadedFiles(remainingFiles)
    }
  
    const validateBeforeUpload = (fileList: FileList | null, current: File[]) => {
      if (fileList && fileList[0].size > 2 * 1024 * 1024) {
        return 'File too large (max 2MB)'
      }
      return true
    }
   

    useEffect(() => {
    getBankImages(bankId).then((images) => {
            setImages(images);
        });
    }, [bankId]);

    const upload = async () => {
        if (uploadedFiles.length === 0) {
            return
        }
        try {
        setLoading(true)    
        const pics  = await Promise.all(
             uploadedFiles.map(async (file) => {
                    const { url , fileName } = await uploadImageToStorage(file, bankId);
                    const doc : BankImage = {
                        id: '',
                        bankId,
                        fileName,
                        imageUrl: url,
                        createdAt: Timestamp.now(),
                        uploadedAt: Timestamp.now(),
                        createBy: userId || '',
                        updateBy: userId || ''
                    }
                    await addDoc(bankPicturesDoc, doc );
                    return doc;
                })
        );
        setLoading(false)
        setDocFiles(pics);
        nextStep(6, pics);

        if (isEdit) {
            setUploadedFiles([]);
            getBankImages(bankId).then((images) => {
                console.log("Bank Images: ", images);
                setImages(images);
            }); 
        }

        } catch (error){
            setLoading(false)
        }
    }
   
    const OnDeleteImg = async (img: any) => {
        try {
            const picturesRef = getBankPictureRef(img.id || '');
            await deleteDoc(picturesRef);
            await deleteImageFromStorage(img.imageUrl);
            setImages(prev => prev.filter(image => img.id !== image.id));
        } catch (error) {
            throw new Error('Error uploading image: ' + error);
        }  
    }

    return (
        <div>
        <div className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
          <Upload 
            multiple
            draggable
            fileList={uploadedFiles}
            beforeUpload={validateBeforeUpload}
            accept=".png,.jpg,.jpeg"
            tip={<p className="text-xs text-gray-500 mt-2">{t('upload.maxSize')}</p>}
            uploadLimit={5}
            onChange={handleFileChange}
            onFileRemove={handleFileRemove}
          >
            <div className="my-16 text-center">
              <div className="text-6xl mb-4 flex justify-center">
                <FcImageFile />
              </div>
              <p className="font-semibold">
                <span className="text-gray-800 dark:text-white">
                  {t('upload.dropHere')}{' '}
                </span>
                <span className="text-blue-500">{t('upload.browse')}</span>
              </p>
              <p className="mt-1 opacity-60 dark:text-white">
                {t('upload.supportedFormats')}
              </p>
            </div>
          </Upload>
        </div>
      
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <Button variant="solid" loading={loading} icon={<HiOutlineInboxIn />} onClick={upload}>
              {isEdit ? t('common.add') : t('common.next')}
            </Button>
          </div>
        )}
      
        {isEdit && images.length > 0 && (
          <ImageGallery images={images} userId={userId || ''} onDelete={OnDeleteImg} />
        )}
      </div>
      
    )
}

export default UploadImgBank;
