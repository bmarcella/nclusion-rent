/* eslint-disable @typescript-eslint/no-unused-vars */
 
/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/components/ui/Button";
import React, { useState } from "react";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { TbPdf } from "react-icons/tb";
import Dialog from "@/components/ui/Dialog";
import { useWindowSize } from "@/utils/hooks/useWindowSize";
import UserName from "@/views/bank/show/components/UserName";



export type ReqImage = {
  id?: string;
  reqId: string;
  fileName: string;
  imageUrl: string;
  createdAt: any; // could be Firebase Timestamp
  uploadedAt: any;
  file_type: string;
  file_size: number;
  createBy: string;
  updateBy: string;
  typeDoc: string;
};

interface ImageGalleryProps {
  images: ReqImage[];
  userId: string;
  onDelete?: (image: ReqImage) => void;
  canDelete?: boolean;
  showPic?: boolean;
}

const openPDF = (url: string ) => {
  window.open(url, '_blank');
};

const ImageReqComp : React.FC<ImageGalleryProps> = ({ images, onDelete=(i: any)=>{} , userId, canDelete = true, showPic=false}) => {
  const [ image, setCImg] = useState() as any;
  const [dialogIsOpen, setIsOpen] = useState(false)
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
    { canDelete && <h6 className="text-2xl font-semibold mb-4">Documents des proprietaires</h6> }
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4">
      {images.map((image, index) => (
  <div
    key={image.id || index}
    className="flex flex-col overflow-hidden rounded-xl shadow hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-900"
  >
    {image.file_type !== "application/pdf" && (
      <img
         onClick={() => {
          openDialog(image);
        }}
        src={image.imageUrl}
        alt={image.fileName}
        className={ !showPic ? "w-full h-64 object-cover hover:scale-105 transition-transform duration-300": "card-image"}
      />
    )}

    <div className="p-3 flex-1 flex flex-col justify-between">
      <div className="mb-2">
        <p className="truncate font-medium text-gray-800 dark:text-gray-200 mb-4">
          {image.fileName}
        </p>
        <p className="text-xs text-gray-500 mb-4">Type : {image.typeDoc}</p>
        <p className="text-xs text-gray-500 mb-4">
          Prise par :{" "}
          {image.createBy === userId ? "moi" : <UserName userId={image.createBy} />}
        </p>
      </div>
    </div>

    <div className="justify-end items-start gap-2 p-2">
      {canDelete && (
        <Button
          icon={<MdOutlineDeleteOutline />}
          className="text-sm text-red-600 hover:underline mr-4"
          onClick={() => onDelete(image)}
        />
      )}
      {image.file_type === "application/pdf" && (
        <Button
          icon={<TbPdf />}
          className="text-sm text-red-600 hover:underline"
          onClick={() => openPDF(image.imageUrl)}
        />
      )}
    </div>

  </div>
))}

      </div>
          <Dialog
                width={ width * 0.8 }
                height={height * 0.8}
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4">{ image?.fileName }</h5>
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-auto p-4">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  {image && (
                    <img
                      src={image.imageUrl}
                      alt={image.fileName}
                      className="card-image rounded"
                    />
                  )}
                </div>
               </div>
                
                
            </Dialog>
    </div>
  );
};

export default ImageReqComp;
