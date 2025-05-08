/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Upload from '@/components/ui/Upload'
import Button from '@/components/ui/Button'
import { HiOutlineInboxIn } from 'react-icons/hi'
import { FcImageFile } from 'react-icons/fc'
import { addDoc,  deleteDoc,  Timestamp } from 'firebase/firestore'
import {  getLandlordPicturesRef, getReqPicturesRef, LandlordPicturesDoc } from '@/services/Landlord'
import {  useEffect, useState } from 'react';
import { deleteImageFromStorage, getReqImages, uploadImageToStorage } from '@/services/firebase/BankService';
import FormItem from '@/components/ui/Form/FormItem';
import Select from '@/components/ui/Select';
import { DocTypeValues } from '@/views/Entity/Regions';
import ImageReqComp, { ReqImage } from './ImageReqComp';

interface Props {
  nextStep: (step: number, data: any) => void;
  isEdit?: boolean,
  reqId: string,
  userId? : string
}

const ImageReq = ( { reqId, isEdit = false, nextStep, userId } : Props) => {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
    const [docFiles, setDocFiles] = useState<any[]>([])
    const [loading, setLoading] = useState(false);
    const [images, setImages] = useState<any[]>([]);
    const [typeDoc, setTypeDoc] = useState<any>();
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
   

    useEffect(() => {
        getReqImages(reqId).then((images) => {
            setImages(images);
        });
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
                    const { url , fileName } = await uploadImageToStorage(file, reqId, 'landlords');
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
                    await addDoc(LandlordPicturesDoc, doc );
                    return doc;
                })
        );
        setLoading(false)
        setDocFiles(pics);
        // was nextStep(6, pics);
        nextStep(0, pics);
        if (isEdit) {
            setUploadedFiles([]);
            getReqImages(reqId).then((images) => {
                setImages(images);
            }); 
        }
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
            <div  className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow" >
                <FormItem label="Type document" invalid={!!error.is} errorMessage={error.message}>
                    <Select placeholder="Please Select" options={DocTypeValues} 
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
                multiple={false}
                tip={<p className="text-xs text-gray-500 mt-2">Max file size: 2MB</p>}
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
            </div>
           { uploadedFiles.length>0 &&  (<div className="mt-6">
                `<Button  variant="solid" loading={loading} icon={<HiOutlineInboxIn />}  onClick={upload} >
                        { isEdit? "Ajouter" : 'Suivant' }
                </Button>`
            </div>) }
            { isEdit && images.length> 0 &&  ( <ImageReqComp images={images} userId={userId || ''} onDelete={OnDeleteImg} />  )}
        </div>
    )
}

export default ImageReq;
