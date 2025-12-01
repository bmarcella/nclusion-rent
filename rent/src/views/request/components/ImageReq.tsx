/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Upload from '@/components/ui/Upload'
import Button from '@/components/ui/Button'
import { HiOutlineInboxIn } from 'react-icons/hi'
import { FcImageFile } from 'react-icons/fc'
import { addDoc,  deleteDoc,  Timestamp } from 'firebase/firestore'
import {  getReqPicturesRef, LandlordPicturesDoc, ReqPicturesDoc } from '@/services/Landlord'
import {  useEffect, useState } from 'react';
import { deleteImageFromStorage, getReqImages, uploadImageToStorage } from '@/services/firebase/BankService';
import FormItem from '@/components/ui/Form/FormItem';
import Select from '@/components/ui/Select';
import ImageReqComp, { ReqImage } from './ImageReqComp';
import { support_docs } from '@/views/Entity/Request'
import { useTranslation } from 'react-i18next'

interface Props {
  nextStep?: (step: number, data: any) => void;
  isEdit?: boolean,
  reqId: string,
  userId? : string
  owner? : boolean,
  end?: boolean
}

const ImageReq = ( { reqId, isEdit = false, nextStep, userId, owner = false, end = false } : Props) => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [docFiles, setDocFiles] = useState<any[]>([])
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<any[]>([]);
    const [typeDoc, setTypeDoc] = useState<any>();
    const { t } = useTranslation();
    const [error, setError] = useState<any>({
        is: false,
        message: ''
    });

    const handleFileChange = (newFiles: File[], previousFiles: File[]) => {
      setUploadedFiles(newFiles);
    }
  
    const handleFileRemove = (remainingFiles: File[]) => {
      setUploadedFiles(remainingFiles)
    }
  
    const validateBeforeUpload = (fileList: FileList | null, current: File[]) => {
      if (fileList && fileList[0].size > 50 * 1024 * 1024) {
        return 'File too large (max 2MB)'
      }
      return true
    }
   
    const getImages = ()=>{
          getReqImages(reqId).then((images) => {
            console.log(images);
            setImages(images);
        });
    }
    useEffect(() => {
      getImages();
    }, [reqId]);

    const upload = async () => {
        if (uploadedFiles.length === 0) {
            return
        }
        if (!typeDoc) {
            setError({ is: true, message: 'Please select a document type' });
            return
        }

        try {
        setLoading(true)    
        const pics  = await Promise.all(
             uploadedFiles.map(async (file) => {
                    const { url , fileName } = await uploadImageToStorage(file, reqId, 'requests');
                    const doc : ReqImage = {
                        id: '',
                        reqId,
                        typeDoc: typeDoc,
                        fileName,
                        file_type: file.type,
                        file_size: file.size,
                        imageUrl: url,
                        createdAt: Timestamp.now(),
                        uploadedAt: Timestamp.now(),
                        createBy: userId || '',
                        updateBy: userId || ''
                    }
                    await addDoc(ReqPicturesDoc, doc);
                    return doc;
                })
        );
        setLoading(false)
        setDocFiles(pics);
        setUploadedFiles([]);
         getImages();
        } catch (error){
            setLoading(false)
        }
    }
   
    const OnDeleteImg = async (img: any) => {
        try {
            const picturesRef = getReqPicturesRef(img.id || '');
            await deleteDoc(picturesRef);
            await deleteImageFromStorage(img.imageUrl);
            setImages(prev => prev.filter(image => img.id !== image.id));
         } catch (error) {
            throw new Error('Error uploading image: ' + error);
        }  
    }

  

    return (
        <div>
           { (!isEdit || owner)  && !end && (<div  className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow mb-4 mt-4" >
                <FormItem label="Type document" invalid={!!error.is} errorMessage={error.message}>
                    <Select placeholder="Please Select" options={ support_docs.map((doc) => ({ label: t(doc), value: doc }))} 
                        onChange={(option) => { 
                        setError({ is: false, message: '' });
                        setTypeDoc(option?.value);
                        } } /> 
                </FormItem>
                <Upload 
                draggable
                fileList={uploadedFiles}
                beforeUpload={validateBeforeUpload}
                accept=".png,.jpg,.jpeg,.pdf"
                multiple={true}
                tip={<p className="text-xs text-gray-500 mt-2">Max file size: 50MB</p>}
                uploadLimit={1}
                onChange={handleFileChange}
                onFileRemove={handleFileRemove}>
                    <div className="my-16 text-center">
                        <div className="text-6xl mb-4 flex justify-center">
                            <FcImageFile />
                        </div>
                        <p className="font-semibold">
                            <span className="text-gray-800 dark:text-white">
                                Drop your image here, or{' '}
                            </span>
                            <span className="text-blue-500">browse</span>
                        </p>
                        <p className="mt-1 opacity-60 dark:text-white">
                            Support: jpeg, png, gif, pdf
                        </p>
                    </div>
               </Upload>
            { uploadedFiles.length>0 &&  (
            <div className="mt-6">
                `<Button  variant="solid" loading={loading} icon={<HiOutlineInboxIn />}  onClick={upload} >
                        { isEdit? "Ajouter" : 'Ajouter' }
                </Button>`
            </div>) }
            </div>) }
           { !isEdit  && nextStep && !end &&  (
            <div className="mt-6 right">
                `<Button  variant="solid" onClick={()=>{
                    nextStep(2, undefined);
                }} >
                        { isEdit? "Ajouter" : 'Suivant' }
                </Button>`
            </div>) }
            { isEdit || images.length> 0 &&  ( <ImageReqComp images={images} userId={userId || ''} onDelete={OnDeleteImg} end={end} />  ) }
        </div>
    )
}

export default ImageReq;
