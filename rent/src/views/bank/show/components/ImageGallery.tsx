/* eslint-disable @typescript-eslint/no-unused-vars */
 
/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/components/ui/Button";
import React, { useState } from "react";
import { MdOutlineDeleteOutline } from "react-icons/md";
import UserName from "./UserName";
import Dialog from "@/components/ui/Dialog";
import { useWindowSize } from "@/utils/hooks/useWindowSize";

export type BankImage = {
  id?: string;
  bankId: string;
  fileName: string;
  imageUrl: string;
  createdAt: any; // could be Firebase Timestamp
  uploadedAt: any;
  createBy: string;
  updateBy: string;
};



interface ImageGalleryProps {
  images: BankImage[];
  userId: string;
  onDelete?: (image: BankImage) => void;
  canDelete?: boolean;
  showPic?: boolean;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onDelete=(i: any)=>{} , userId, canDelete = true,  showPic=false}) => {
    const [ image, setCImg] = useState() as any;
    const [dialogIsOpen, setIsOpen] = useState(false);
    const { width, height } = useWindowSize();
  
      const openDialog = (image: any) => {
         if (!showPic) return;
          setCImg(image);
          setIsOpen(true)
      }
  
      const onDialogClose = () => {
        setCImg(undefined);
        setIsOpen(false)
    }
  return (
    <div className="mt-6">
     { canDelete && <h6 className="text-2xl font-semibold mb-4">Images des banks</h6> }
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="flex flex-col overflow-hidden rounded-xl shadow hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-900"
          >
            <img
             onClick={() => {
              openDialog(image);
            }}
              src={image.imageUrl}
              alt={image.fileName}
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div className="mb-2">
                <p className="truncate font-medium text-gray-800 dark:text-gray-200">
                  {image.fileName}
                </p>
                <p className="text-xs text-gray-500">Prise par { (image.createBy==userId) ? 'moi' : <UserName userId={image.createBy} /> }</p>
              </div>
             { canDelete && <Button
                icon={<MdOutlineDeleteOutline />}
                className="mt-auto text-sm text-red-600 hover:underline self-start" 
                onClick={() => onDelete(image)}
              >
              </Button> }
            </div>
          </div>
        ))}
      </div>
       <Dialog
                      isOpen={dialogIsOpen}
                      onClose={onDialogClose}
                      onRequestClose={onDialogClose}
                      width={ width * 0.8 }
                      height={height * 0.8}
                  >
  
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto p-4">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  {image && (
                    <img
                      src={image.imageUrl}
                      alt={image.fileName}
                      className="w-auto h-auto max-w-full max-h-screen rounded"
                    />
                  )}
                </div>
               </div>
                      
        </Dialog>
    </div>
  );
};

export default ImageGallery;
