/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from '@/components/ui/Button'
import React, { useState } from 'react'
import { MdOutlineDeleteOutline } from 'react-icons/md'
import UserName from './UserName'
import { TbPdf } from 'react-icons/tb'
import Dialog from '@/components/ui/Dialog'
import { useWindowSize } from '@/utils/hooks/useWindowSize'

export type LordImage = {
    id?: string
    lordId: string
    fileName: string
    imageUrl: string
    createdAt: any // could be Firebase Timestamp
    uploadedAt: any
    file_type: string
    file_size: number
    createBy: string
    updateBy: string
    typeDoc: string
}

interface ImageGalleryProps {
    images: LordImage[]
    userId: string
    onDelete?: (image: LordImage) => void
    canDelete?: boolean
    showPic?: boolean
}

const openPDF = (url: string) => {
    window.open(url, '_blank')
}

const ImageLordComp: React.FC<ImageGalleryProps> = ({
    images,
    onDelete = (i: any) => {},
    userId,
    canDelete = true,
    showPic = false,
}) => {
    const [image, setCImg] = useState() as any
    const [dialogIsOpen, setIsOpen] = useState(false)
    const { width, height } = useWindowSize()

    const openDialog = (image: any) => {
        if (!showPic) return
        setCImg(image)
        setIsOpen(true)
    }

    const onDialogClose = () => {
        setCImg(undefined)
        setIsOpen(false)
    }

    return (
        <div className="mt-6">
            {canDelete && (
                <h6 className="text-2xl font-semibold mb-4">
                    Documents des proprietaires
                </h6>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4">
                {images.map((image, index) => (
                    <div
                        key={image.id || index}
                        className="flex flex-col overflow-hidden rounded-xl shadow hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-900"
                    >
                        {image.file_type !== 'application/pdf' && (
                            <img
                                src={image.imageUrl}
                                alt={image.fileName}
                                className={
                                    !showPic
                                        ? 'w-full h-64 object-cover hover:scale-105 transition-transform duration-300'
                                        : 'w-full max-h-48 object-cover rounded'
                                }
                                onClick={() => {
                                    openDialog(image)
                                }}
                            />
                        )}

                        <div className="p-3 flex-1 flex flex-col justify-between">
                            <div className="mb-2">
                                <p className="truncate font-medium text-gray-800 dark:text-gray-200 mb-4">
                                    {image.fileName}
                                </p>
                                <p className="text-xs text-gray-500 mb-4">
                                    Type : {image.typeDoc}
                                </p>
                                <p className="text-xs text-gray-500 mb-4">
                                    Prise par :{' '}
                                    {image.createBy === userId ? (
                                        'moi'
                                    ) : (
                                        <UserName userId={image.createBy} />
                                    )}
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
                            {image.file_type === 'application/pdf' && (
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
                width={width * 0.9}
                height={height * 0.9}
                isOpen={dialogIsOpen}
                onClose={onDialogClose}
                onRequestClose={onDialogClose}
            >
                <h5 className="mb-4 font-semibold text-gray-800">
                    {image?.fileName}
                </h5>
                <div className="flex items-center justify-center w-full h-full overflow-auto p-2">
                    {image && (
                        <img
                            src={image.imageUrl}
                            alt={image.fileName}
                            className="max-w-full max-h-[75vh] object-contain rounded"
                        />
                    )}
                </div>
            </Dialog>
        </div>
    )
}

export default ImageLordComp
