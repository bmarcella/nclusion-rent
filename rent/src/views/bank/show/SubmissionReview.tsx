/* eslint-disable @typescript-eslint/no-explicit-any */


import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {  getBankImages, getLordImages } from "@/services/firebase/BankService";
import { useEffect, useState } from "react";
import { PiCheckFatFill, PiThumbsDownFill } from "react-icons/pi";
import GoogleMapApp from "./Map";
import CommentsBank from "../add/components/CommentsBank";
import ImageGallery, { BankImage } from "./components/ImageGallery";
import ImageLordComp, { LordImage } from "./components/ImageLord";
import BankInfo from "./components/BankInfo";
import Rejected from "./reject/Rejected";
import { Bank } from "@/views/Entity";

interface Props {
    bankId: string;
    onRejectOk?: (data: any) => void
    onApproveOk: (data: any) => void 
    onChangeState: (component: React.ReactNode, name?: string) => void;
    onPendingOk: (data: any) => void
    bank?: Bank;
    userId: string
}
const SubmissionReview = ( { bankId,  onChangeState, onRejectOk, onPendingOk, onApproveOk, bank, userId } : Props) => {


    const [images, setImages] = useState<BankImage[]>([])
    const [lImages, setLImages] = useState<LordImage[]>([])

       useEffect(() => {
             getBankImages(bankId).then((imgs: BankImage[]) => {
                 console.log("Bank Images: ", imgs);
                 setImages(imgs);
             });
           }, [bankId]);

      useEffect(() => {
    
        if (bank)  getLordImages(bank.landlord).then((imgs: any[]) => {
            console.log("Bank Images: ", imgs);
            setLImages(imgs);
        });
      }, [bank]);

      useEffect(() => {
         
     }, [bankId]);
  return (
    <div className="p-6 space-y-6">
     <h2 className="text-2xl font-bold mb-2 text-pink-600">Bank Location</h2>
      {/* Map section */}
      <div className="w-full h-100 mb-6 rounded-lg shadow-lg overflow-hidden">
        { bank && <GoogleMapApp position={bank.location} ></GoogleMapApp> }
      </div>

      {/* Photos */}
      <div>
        <h2 className="text-2xl font-bold mb-2 text-pink-600">Photo</h2>
        <div className="grid grid-flow-row-dense grid-cols-3 grid-rows-2 gap-4">
            <div className="col-span-2 row-span-2 shadow-lg p-4 rounded-lg">
               <ImageGallery images={images} userId={userId || ''} canDelete={false} showPic={true} ></ImageGallery>
            </div>
      
            <div className="shadow-lg p-4 rounded-lg">
              <ImageLordComp images={lImages} userId={userId || ''} canDelete={false} showPic={true} ></ImageLordComp>
            </div>
        </div>
      </div>

      {/* Details */}
      <div>
        <h2 className="text-2xl font-bold mb-2 text-pink-600">Details</h2>
        <Card  className="p-2 rounded-lg">
         { bank && <BankInfo bank={bank} /> }
        </Card>
      </div>

      {/* Comments */}
      <div>
        <h2 className="text-2xl font-bold mb-2 text-pink-600">Commentaires</h2>
        <Card>
        { bank && bank.id && <CommentsBank  bankId={bank.id} userId={userId || ''} isEdit={true} nextStep={function (step: number, data: any): void {
                      throw new Error("Function not implemented.");
                  } }/> }
        </Card>
      </div>

      {/* Action buttons */}
        <div className="flex justify-around items-center pt-6">
        {  !bank?.approve &&   <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg rounded-full flex items-center gap-2"
         onClick={() => onChangeState(<Rejected bankId={bankId}  userId={userId || ''} onSubmit={ (data) => { onApproveOk(data) }} />, "Approbation")}
        >
          <PiCheckFatFill /> APPROVED
        </Button> }
      {  !bank?.reject && <Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-lg rounded-full flex items-center gap-2" 
          onClick={() => onChangeState(<Rejected bankId={bankId}  userId={userId || ''} onSubmit={onRejectOk} />)}
          >
          <PiThumbsDownFill/> REJECTED
        </Button> }
        {  !bank?.pending && <Button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 text-lg rounded-full" 
          onClick={() => onChangeState(<Rejected bankId={bankId}  userId={userId || ''} onSubmit={ (data) => { onPendingOk(data) }} />, "Consideration")}
          >
          Pending
        </Button> }
      </div> 
    </div>
  );
};

export default SubmissionReview;
